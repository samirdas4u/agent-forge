import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sandboxInstances, featureFlags, testRuns, personas, sandboxEvents } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { invokeLLM } from "../_core/llm";
import type { TestScript, TestResult } from "../../drizzle/schema";

// Helper to log sandbox event
async function logEvent(sandboxId: number, eventType: string, payload: Record<string, unknown>, userId?: number, severity: "info" | "warning" | "error" | "debug" = "info") {
  const db = await getDb();
  if (!db) return;
  await db.insert(sandboxEvents).values({ sandboxId, eventType, payload, userId, severity });
}

export const sandboxRouter = router({
  // ─── Sandbox Instances ───────────────────────────────────────────────────────
  instances: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(sandboxInstances)
        .where(eq(sandboxInstances.ownerId, (ctx.user?.id ?? 0)))
        .orderBy(desc(sandboxInstances.updatedAt));
    }),

    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(sandboxInstances)
        .where(and(eq(sandboxInstances.id, input.id), eq(sandboxInstances.ownerId, (ctx.user?.id ?? 0))))
        .limit(1);
      return rows[0] ?? null;
    }),

    getByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(sandboxInstances)
        .where(eq(sandboxInstances.shareToken, input.token))
        .limit(1);
      return rows[0] ?? null;
    }),

    create: publicProcedure.input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      baseTemplate: z.enum(["blank", "sales", "customer_service", "onboarding"]).default("blank"),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const shareToken = nanoid(32);
      const [result] = await db.insert(sandboxInstances).values({
        ownerId: (ctx.user?.id ?? 0),
        name: input.name,
        description: input.description,
        baseTemplate: input.baseTemplate,
        shareToken,
        status: "active",
      });
      const id = (result as any).insertId;
      await logEvent(id, "sandbox.created", { name: input.name, template: input.baseTemplate }, (ctx.user?.id ?? 0));
      return { id, shareToken };
    }),

    update: publicProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      status: z.enum(["active", "paused", "archived"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, ...updates } = input;
      await db.update(sandboxInstances).set(updates).where(and(eq(sandboxInstances.id, id), eq(sandboxInstances.ownerId, (ctx.user?.id ?? 0))));
      await logEvent(id, "sandbox.updated", updates as Record<string, unknown>, (ctx.user?.id ?? 0));
      return { success: true };
    }),

    clone: publicProcedure.input(z.object({ id: z.number(), newName: z.string().min(1) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const rows = await db.select().from(sandboxInstances)
        .where(and(eq(sandboxInstances.id, input.id), eq(sandboxInstances.ownerId, (ctx.user?.id ?? 0))))
        .limit(1);
      if (!rows[0]) throw new Error("Sandbox not found");
      const source = rows[0];
      const shareToken = nanoid(32);
      const [result] = await db.insert(sandboxInstances).values({
        ownerId: (ctx.user?.id ?? 0),
        name: input.newName,
        description: `Cloned from: ${source.name}`,
        baseTemplate: source.baseTemplate,
        shareToken,
        snapshotData: source.snapshotData,
        status: "active",
      });
      const newId = (result as any).insertId;
      // Clone feature flags
      const flags = await db.select().from(featureFlags).where(eq(featureFlags.sandboxId, input.id));
      for (const flag of flags) {
        await db.insert(featureFlags).values({ ...flag, id: undefined as any, sandboxId: newId } as any);
      }
      await logEvent(newId, "sandbox.cloned", { sourceId: input.id, sourceName: source.name }, (ctx.user?.id ?? 0));
      return { id: newId, shareToken };
    }),

    snapshot: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const flags = await db.select().from(featureFlags).where(eq(featureFlags.sandboxId, input.id));
      const runs = await db.select().from(testRuns).where(eq(testRuns.sandboxId, input.id));
      const snapshotData = { flags, runs, snapshotAt: new Date().toISOString() };
      await db.update(sandboxInstances).set({ snapshotData }).where(eq(sandboxInstances.id, input.id));
      await logEvent(input.id, "sandbox.snapshot", { flagCount: flags.length, runCount: runs.length }, (ctx.user?.id ?? 0));
      return { success: true, snapshotAt: snapshotData.snapshotAt };
    }),

    reset: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Delete all flags and test runs for this sandbox
      await db.delete(featureFlags).where(eq(featureFlags.sandboxId, input.id));
      await db.delete(testRuns).where(eq(testRuns.sandboxId, input.id));
      await db.delete(sandboxEvents).where(eq(sandboxEvents.sandboxId, input.id));
      await logEvent(input.id, "sandbox.reset", {}, (ctx.user?.id ?? 0), "warning");
      return { success: true };
    }),

    regenerateToken: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const shareToken = nanoid(32);
      await db.update(sandboxInstances).set({ shareToken }).where(and(eq(sandboxInstances.id, input.id), eq(sandboxInstances.ownerId, (ctx.user?.id ?? 0))));
      return { shareToken };
    }),
  }),

  // ─── Feature Flags ───────────────────────────────────────────────────────────
  flags: router({
    list: publicProcedure.input(z.object({ sandboxId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(featureFlags)
        .where(eq(featureFlags.sandboxId, input.sandboxId))
        .orderBy(desc(featureFlags.createdAt));
    }),

    create: publicProcedure.input(z.object({
      sandboxId: z.number(),
      flagKey: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, hyphens, underscores"),
      description: z.string().optional(),
      enabled: z.boolean().default(false),
      rolloutPct: z.number().min(0).max(100).default(0),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [result] = await db.insert(featureFlags).values(input);
      const id = (result as any).insertId;
      await logEvent(input.sandboxId, "flag.created", { flagKey: input.flagKey }, (ctx.user?.id ?? 0));
      return { id };
    }),

    update: publicProcedure.input(z.object({
      id: z.number(),
      sandboxId: z.number(),
      enabled: z.boolean().optional(),
      rolloutPct: z.number().min(0).max(100).optional(),
      killSwitch: z.boolean().optional(),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, sandboxId, ...updates } = input;
      await db.update(featureFlags).set(updates).where(eq(featureFlags.id, id));
      const flag = await db.select().from(featureFlags).where(eq(featureFlags.id, id)).limit(1);
      await logEvent(sandboxId, "flag.updated", { flagKey: flag[0]?.flagKey, ...updates }, (ctx.user?.id ?? 0));
      return { success: true };
    }),

    delete: publicProcedure.input(z.object({ id: z.number(), sandboxId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const flag = await db.select().from(featureFlags).where(eq(featureFlags.id, input.id)).limit(1);
      await db.delete(featureFlags).where(eq(featureFlags.id, input.id));
      await logEvent(input.sandboxId, "flag.deleted", { flagKey: flag[0]?.flagKey }, (ctx.user?.id ?? 0), "warning");
      return { success: true };
    }),
  }),

  // ─── Test Runner ─────────────────────────────────────────────────────────────
  tests: router({
    list: publicProcedure.input(z.object({ sandboxId: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(testRuns)
        .where(eq(testRuns.sandboxId, input.sandboxId))
        .orderBy(desc(testRuns.createdAt));
    }),

    create: publicProcedure.input(z.object({
      sandboxId: z.number(),
      name: z.string().min(1),
      script: z.object({
        turns: z.array(z.object({
          userMessage: z.string(),
          assertions: z.array(z.object({
            type: z.enum(["contains", "score_gte", "score_lte", "not_contains"]),
            value: z.union([z.string(), z.number()]),
          })),
        })),
      }),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [result] = await db.insert(testRuns).values({
        sandboxId: input.sandboxId,
        name: input.name,
        script: input.script as TestScript,
        status: "pending",
      });
      const id = (result as any).insertId;
      await logEvent(input.sandboxId, "test.created", { name: input.name, turns: input.script.turns.length }, (ctx.user?.id ?? 0));
      return { id };
    }),

    run: publicProcedure.input(z.object({ id: z.number(), sandboxId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const rows = await db.select().from(testRuns).where(eq(testRuns.id, input.id)).limit(1);
      if (!rows[0]) throw new Error("Test run not found");
      const run = rows[0];
      await db.update(testRuns).set({ status: "running" }).where(eq(testRuns.id, input.id));

      const results: TestResult[] = [];
      let passCount = 0;
      let failCount = 0;
      const startTime = Date.now();
      const conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

      try {
        for (let i = 0; i < run.script.turns.length; i++) {
          const turn = run.script.turns[i];
          conversationHistory.push({ role: "user", content: turn.userMessage });

          const turnStart = Date.now();
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a realistic AI persona being tested in a simulation. Respond naturally and professionally. After your response, on a new line starting with 'SCORE:', provide a number 0-100 rating the quality of the conversation so far.",
              },
              ...conversationHistory,
            ],
          });
          const latencyMs = Date.now() - turnStart;
          const rawContentRaw = response.choices[0]?.message?.content ?? "";
          const rawContent = typeof rawContentRaw === "string" ? rawContentRaw : "";
          const scoreMatch = rawContent.match(/SCORE:\s*(\d+)/);
          const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
          const aiResponse = rawContent.replace(/[\s\S]*SCORE:\s*\d+[\s\S]*$/, "").replace(/\nSCORE:\s*\d+[^]*$/, "").trim() || rawContent.split("\nSCORE:")[0].trim();
          conversationHistory.push({ role: "assistant", content: aiResponse });

          const tokenUsage = {
            prompt: response.usage?.prompt_tokens ?? 0,
            completion: response.usage?.completion_tokens ?? 0,
            total: response.usage?.total_tokens ?? 0,
          };

          const assertionResults = turn.assertions.map(assertion => {
            let passed = false;
            let actual: string | number = "";
            if (assertion.type === "contains") {
              actual = aiResponse.toLowerCase().includes(String(assertion.value).toLowerCase()) ? "found" : "not found";
              passed = actual === "found";
            } else if (assertion.type === "not_contains") {
              actual = aiResponse.toLowerCase().includes(String(assertion.value).toLowerCase()) ? "found" : "not found";
              passed = actual === "not found";
            } else if (assertion.type === "score_gte") {
              actual = score;
              passed = score >= Number(assertion.value);
            } else if (assertion.type === "score_lte") {
              actual = score;
              passed = score <= Number(assertion.value);
            }
            if (passed) passCount++; else failCount++;
            return { type: assertion.type, value: assertion.value, passed, actual };
          });

          results.push({ turnIndex: i, userMessage: turn.userMessage, aiResponse, score, assertions: assertionResults, latencyMs, tokenUsage });
        }

        const durationMs = Date.now() - startTime;
        const finalStatus = failCount === 0 ? "passed" : "failed";
        await db.update(testRuns).set({ status: finalStatus, results, passCount, failCount, durationMs, completedAt: new Date() }).where(eq(testRuns.id, input.id));
        await logEvent(input.sandboxId, "test.completed", { name: run.name, status: finalStatus, passCount, failCount }, (ctx.user?.id ?? 0), failCount > 0 ? "warning" : "info");
        return { status: finalStatus, passCount, failCount, durationMs, results };
      } catch (err) {
        await db.update(testRuns).set({ status: "error" }).where(eq(testRuns.id, input.id));
        await logEvent(input.sandboxId, "test.error", { name: run.name, error: String(err) }, (ctx.user?.id ?? 0), "error");
        throw err;
      }
    }),

    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(testRuns).where(eq(testRuns.id, input.id));
      return { success: true };
    }),
  }),

  // ─── Persona Lab ─────────────────────────────────────────────────────────────
  personas: router({
    list: publicProcedure.input(z.object({ sandboxId: z.number().optional() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.sandboxId) {
        return db.select().from(personas)
          .where(and(eq(personas.ownerId, (ctx.user?.id ?? 0)), eq(personas.sandboxId, input.sandboxId)))
          .orderBy(desc(personas.updatedAt));
      }
      return db.select().from(personas)
        .where(eq(personas.ownerId, (ctx.user?.id ?? 0)))
        .orderBy(desc(personas.updatedAt));
    }),

    create: publicProcedure.input(z.object({
      sandboxId: z.number().optional(),
      name: z.string().min(1).max(255),
      role: z.string().optional(),
      tone: z.enum(["professional", "friendly", "aggressive", "skeptical", "neutral", "enthusiastic"]).default("professional"),
      systemPrompt: z.string().min(1),
      temperature: z.number().min(0).max(2).default(0.7),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [result] = await db.insert(personas).values({ ...input, ownerId: (ctx.user?.id ?? 0) });
      const id = (result as any).insertId;
      if (input.sandboxId) await logEvent(input.sandboxId, "persona.created", { name: input.name }, (ctx.user?.id ?? 0));
      return { id };
    }),

    update: publicProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      role: z.string().optional(),
      tone: z.enum(["professional", "friendly", "aggressive", "skeptical", "neutral", "enthusiastic"]).optional(),
      systemPrompt: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      isPublished: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, ...updates } = input;
      await db.update(personas).set({ ...updates, version: undefined }).where(eq(personas.id, id));
      return { success: true };
    }),

    preview: publicProcedure.input(z.object({
      personaId: z.number(),
      message: z.string(),
      history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([]),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const rows = await db.select().from(personas).where(eq(personas.id, input.personaId)).limit(1);
      if (!rows[0]) throw new Error("Persona not found");
      const persona = rows[0];
      const start = Date.now();
      const response = await invokeLLM({
        messages: [
          { role: "system", content: persona.systemPrompt },
          ...input.history,
          { role: "user", content: input.message },
        ],
      });
      const latencyMs = Date.now() - start;
      const rawResp = response.choices[0]?.message?.content ?? "";
      const content = typeof rawResp === "string" ? rawResp : "";
      return {
        content,
        latencyMs,
        tokenUsage: response.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
    }),

    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(personas).where(eq(personas.id, input.id));
      return { success: true };
    }),
  }),

  // ─── AI Behaviour Tester ─────────────────────────────────────────────────────
  aiTester: router({
    run: publicProcedure.input(z.object({
      sandboxId: z.number(),
      systemPrompt: z.string(),
      userMessage: z.string(),
      history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([]),
      temperature: z.number().min(0).max(2).default(0.7),
    })).mutation(async ({ ctx, input }) => {
      const start = Date.now();
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: input.systemPrompt },
        ...input.history,
        { role: "user", content: input.userMessage },
      ];
      const response = await invokeLLM({ messages });
      const latencyMs = Date.now() - start;
      const rawContent2 = response.choices[0]?.message?.content ?? "";
      const content = typeof rawContent2 === "string" ? rawContent2 : "";

      // Score the response
      const scoreResponse = await invokeLLM({
        messages: [
          { role: "system", content: "You are a scoring engine. Evaluate the AI response quality on a scale of 0-100 across these dimensions: clarity (0-100), relevance (0-100), professionalism (0-100), helpfulness (0-100). Respond with JSON only." },
          { role: "user", content: `System prompt: ${input.systemPrompt}\n\nUser: ${input.userMessage}\n\nAI Response: ${content}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "score_breakdown",
            strict: true,
            schema: {
              type: "object",
              properties: {
                clarity: { type: "number" },
                relevance: { type: "number" },
                professionalism: { type: "number" },
                helpfulness: { type: "number" },
                overall: { type: "number" },
                reasoning: { type: "string" },
              },
              required: ["clarity", "relevance", "professionalism", "helpfulness", "overall", "reasoning"],
              additionalProperties: false,
            },
          },
        },
      });

      let scores = { clarity: 75, relevance: 75, professionalism: 75, helpfulness: 75, overall: 75, reasoning: "" };
      try {
        const scoreRaw = scoreResponse.choices[0]?.message?.content ?? "{}";
        scores = JSON.parse(typeof scoreRaw === "string" ? scoreRaw : "{}");
      } catch {}

      await logEvent(input.sandboxId, "ai_tester.run", { latencyMs, overall: scores.overall }, (ctx.user?.id ?? 0), "debug");

      return {
        response: content,
        latencyMs,
        tokenUsage: response.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        scores,
        rawPrompt: messages,
        model: "default",
      };
    }),
  }),

  // ─── Event Log ───────────────────────────────────────────────────────────────
  events: router({
    list: publicProcedure.input(z.object({
      sandboxId: z.number(),
      limit: z.number().min(1).max(200).default(50),
      severity: z.enum(["info", "warning", "error", "debug"]).optional(),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(sandboxEvents.sandboxId, input.sandboxId)];
      if (input.severity) conditions.push(eq(sandboxEvents.severity, input.severity));
      return db.select().from(sandboxEvents)
        .where(and(...conditions))
        .orderBy(desc(sandboxEvents.createdAt))
        .limit(input.limit);
    }),

    clear: publicProcedure.input(z.object({ sandboxId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(sandboxEvents).where(eq(sandboxEvents.sandboxId, input.sandboxId));
      return { success: true };
    }),
  }),
});
