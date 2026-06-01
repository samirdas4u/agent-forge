import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  sessions, scenarios, users,
  agentEvents as agentEventsTable,
  coachingNudges as coachingNudgesTable,
  learningPaths as learningPathsTable,
  difficultyAdjustments as difficultyAdjustmentsTable,
} from "../../drizzle/schema";
import { desc, eq, gte, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentStatus = "active" | "idle" | "error";

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  events24h: number;
  status: AgentStatus;
}

export interface AgentEvent {
  id: number;
  agentId: string;
  agentName: string;
  eventType: string;
  description: string;
  userId?: number;
  createdAt: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAgentHealth() {
  const db = await getDb();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentSessions = await db!
    .select({ c: count() })
    .from(sessions)
    .where(gte(sessions.startedAt, since24h));

  const total24h = recentSessions[0]?.c ?? 0;

  return [
    { id: "simulation",   name: "Simulation Agent",  description: "Drives adaptive AI conversations",    events24h: total24h, status: (total24h > 0 ? "active" : "idle") as AgentStatus },
    { id: "coaching",     name: "Coaching Agent",     description: "Generates personalised nudges",       events24h: 0,        status: "idle" as AgentStatus },
    { id: "evaluation",   name: "Evaluation Agent",   description: "Scores sessions and tracks readiness",events24h: total24h, status: (total24h > 0 ? "active" : "idle") as AgentStatus },
    { id: "planning",     name: "Planning Agent",     description: "Builds adaptive learning paths",      events24h: 0,        status: "idle" as AgentStatus },
    { id: "orchestrator", name: "Orchestrator",       description: "Coordinates all agents",              events24h: total24h, status: (total24h > 0 ? "active" : "idle") as AgentStatus },
  ];
}

async function getActivityMetrics() {
  const db = await getDb();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentSessions = await db!
    .select({ c: count() })
    .from(sessions)
    .where(gte(sessions.startedAt, since24h));

  const totalScenarios = await db!.select({ c: count() }).from(scenarios);

  const nudgeCount = await db!.select({ c: count() }).from(coachingNudgesTable);
  const pathCount = await db!.select({ c: count() }).from(learningPathsTable);
  const adjCount = await db!.select({ c: count() }).from(difficultyAdjustmentsTable);
  const agentEventCount = await db!.select({ c: count() }).from(agentEventsTable).where(gte(agentEventsTable.createdAt, since24h));

  return {
    events24h: (recentSessions[0]?.c ?? 0) + (agentEventCount[0]?.c ?? 0),
    learningPaths: pathCount[0]?.c ?? 0,
    predictions: 0,
    coachingNudges: nudgeCount[0]?.c ?? 0,
    difficultyAdjustments: adjCount[0]?.c ?? 0,
    totalScenarios: totalScenarios[0]?.c ?? 0,
  };
}

async function getAtRiskLearners() {
  const db = await getDb();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const allUsers = await db!.select({ id: users.id, name: users.name }).from(users).limit(50);

  const atRisk: { userId: number; userName: string; riskReason: string; lastSessionDaysAgo: number; avgScore: number }[] = [];
  for (const u of allUsers) {
    const lastSession = await db!
      .select({ startedAt: sessions.startedAt, score: sessions.overallScore })
      .from(sessions)
      .where(eq(sessions.userId, u.id))
      .orderBy(desc(sessions.startedAt))
      .limit(1);

    if (lastSession.length > 0 && lastSession[0].startedAt < sevenDaysAgo) {
      const daysAgo = Math.floor((Date.now() - lastSession[0].startedAt.getTime()) / (24 * 60 * 60 * 1000));
      atRisk.push({
        userId: u.id,
        userName: u.name ?? "Unknown",
        riskReason: `No practice in ${daysAgo} days`,
        lastSessionDaysAgo: daysAgo,
        avgScore: lastSession[0].score ?? 0,
      });
    }
  }
  return atRisk.slice(0, 5);
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const agenticRouter = router({

  agentHealth: protectedProcedure.query(async () => {
    return getAgentHealth();
  }),

  activityMetrics: protectedProcedure.query(async () => {
    return getActivityMetrics();
  }),

  agentEvents: protectedProcedure
    .input(z.object({ window: z.enum(["24h", "7d", "30d", "all"]).default("7d") }))
    .query(async ({ input }) => {
      const db = await getDb();
      let since: Date | null = null;
      if (input.window === "24h") since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      else if (input.window === "7d") since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      else if (input.window === "30d") since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const rows = await db!
        .select({
          id: sessions.id,
          userId: sessions.userId,
          overallScore: sessions.overallScore,
          startedAt: sessions.startedAt,
        })
        .from(sessions)
        .where(since ? gte(sessions.startedAt, since) : undefined)
        .orderBy(desc(sessions.startedAt))
        .limit(50);

      return rows.map((s): AgentEvent => ({
        id: s.id,
        agentId: "simulation",
        agentName: "Simulation Agent",
        eventType: "session_completed",
        description: `Training session completed — score ${s.overallScore ?? "N/A"}`,
        userId: s.userId,
        createdAt: s.startedAt.getTime(),
      }));
    }),

  learningPaths: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        id: 1,
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Learner",
        title: "Foundation Building: Your First Steps to Excellence",
        scenariosTotal: 4,
        scenariosCompleted: 0,
        status: "active" as const,
      },
    ];
  }),

  coachingEffectiveness: protectedProcedure.query(async () => {
    return { totalNudges: 0, viewedRate: 0, helpfulRate: 0 };
  }),

  atRiskLearners: adminProcedure.query(async () => {
    return getAtRiskLearners();
  }),

  eventDistribution: protectedProcedure
    .input(z.object({ window: z.enum(["24h", "7d", "30d", "all"]).default("7d") }))
    .query(async ({ input }) => {
      const db = await getDb();
      let since: Date | null = null;
      if (input.window === "24h") since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      else if (input.window === "7d") since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      else if (input.window === "30d") since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const rows = await db!
        .select({ startedAt: sessions.startedAt })
        .from(sessions)
        .where(since ? gte(sessions.startedAt, since) : undefined)
        .orderBy(desc(sessions.startedAt))
        .limit(200);

      const byDay: Record<string, number> = {};
      for (const s of rows) {
        const day = s.startedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
        byDay[day] = (byDay[day] ?? 0) + 1;
      }

      return Object.entries(byDay)
        .map(([date, count]) => ({ date, count }))
        .reverse();
    }),

  // ─── Readiness Predictions ────────────────────────────────────────────────

  myReadiness: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const rows = await db!
      .select({ overallScore: sessions.overallScore, startedAt: sessions.startedAt })
      .from(sessions)
      .where(eq(sessions.userId, ctx.user.id))
      .orderBy(desc(sessions.startedAt))
      .limit(20);

    if (rows.length < 2) {
      return { ready: false, reason: "insufficient_data", sessions: rows.length };
    }

    const scores = rows.map((s) => s.overallScore ?? 0).filter((s) => s > 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    const trend = scores.length >= 2 ? scores[0] - scores[scores.length - 1] : 0;

    return {
      ready: true,
      avgScore: Math.round(avgScore),
      trend,
      sessions: rows.length,
      lastSessionAt: rows[0]?.startedAt?.getTime() ?? null,
    };
  }),

  predictReadiness: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    const rows = await db!
      .select({ overallScore: sessions.overallScore, startedAt: sessions.startedAt })
      .from(sessions)
      .where(eq(sessions.userId, ctx.user.id))
      .orderBy(desc(sessions.startedAt))
      .limit(20);

    if (rows.length < 2) {
      throw new Error("Complete at least 2 training sessions before requesting a readiness prediction.");
    }

    const scores = rows.map((s) => s.overallScore ?? 0).filter((s) => s > 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    const trend = scores.length >= 2 ? scores[0] - scores[scores.length - 1] : 0;
    const daysSinceFirst = Math.floor(
      (Date.now() - (rows[rows.length - 1].startedAt?.getTime() ?? Date.now())) / (24 * 60 * 60 * 1000)
    );

    const prompt = `You are an AI Evaluation Agent for a professional training platform called Agent Forge.

A learner has completed ${rows.length} training sessions over ${daysSinceFirst} days.
Their average score is ${Math.round(avgScore)}/100.
Score trend (recent vs earliest): ${trend > 0 ? "+" : ""}${Math.round(trend)} points.
Recent scores: ${scores.slice(0, 5).join(", ")}

Predict their production readiness and return a JSON object.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an AI Evaluation Agent. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "readiness_prediction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              readinessScore: { type: "number" },
              readinessLabel: { type: "string" },
              estimatedDaysToReady: { type: "number" },
              riskFactors: { type: "array", items: { type: "string" } },
              interventions: { type: "array", items: { type: "string" } },
              summary: { type: "string" },
            },
            required: ["readinessScore", "readinessLabel", "estimatedDaysToReady", "riskFactors", "interventions", "summary"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));

    return {
      ...parsed,
      avgScore: Math.round(avgScore),
      sessions: rows.length,
      generatedAt: Date.now(),
    };
  }),

  teamReadiness: adminProcedure.query(async () => {
    const db = await getDb();
    const allUsers = await db!.select({ id: users.id, name: users.name }).from(users).limit(50);

    const results = [];
    for (const u of allUsers) {
      const userSessions = await db!
        .select({ overallScore: sessions.overallScore })
        .from(sessions)
        .where(eq(sessions.userId, u.id))
        .orderBy(desc(sessions.startedAt))
        .limit(10);

      if (userSessions.length >= 2) {
        const scores = userSessions.map((s) => s.overallScore ?? 0).filter((s) => s > 0);
        const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
        results.push({
          userId: u.id,
          userName: u.name ?? "Unknown",
          avgScore: Math.round(avg),
          sessions: userSessions.length,
          readinessLabel:
            avg >= 80 ? "Production Ready" :
            avg >= 65 ? "Nearly Ready" :
            avg >= 50 ? "Developing" : "Not Ready",
        });
      }
    }
    return results;
  }),
});
