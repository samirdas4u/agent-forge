import { COOKIE_NAME } from "@shared/const";
import { buildLanguageInstruction } from "@shared/languages";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { coursesRouter } from "./routers/courses";
import { interviewRouter } from "./routers/interview";
import { sandboxRouter } from "./routers/sandbox";
import { agenticRouter } from "./routers/agentic";
import { coachingRouter } from "./routers/coaching";
import { invokeLLM } from "./_core/llm";
import {
  addMessage,
  createScenario,
  createSession,
  deleteScenario,
  getAllScenarios,
  getLeaderboard,
  getOrCreateWalkthroughCompletion,
  getScenarioById,
  getScenarios,
  getSessionById,
  getSessionMessages,
  getUserAnalytics,
  getUserSessions,
  getUserStreak,
  getUserWalkthroughCompletions,
  getWalkthroughById,
  getWalkthroughs,
  updateScenario,
  updateSession,
  updateUserStreak,
  updateWalkthroughCompletion,
} from "./db";
import { transcribeAudio } from "./_core/voiceTranscription";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { textToSpeech } from "./_core/tts";
import { elevenLabsTTS, pickVoiceForPersona } from "./_core/elevenLabsTTS";
import { storagePut } from "./storage";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// ── Seed data helpers ─────────────────────────────────────────
const SEED_SCENARIOS = [
  {
    title: "Cold Call: SaaS Product Demo",
    description: "Practice cold-calling a potential B2B client to pitch a SaaS product and book a demo.",
    category: "sales" as const,
    difficulty: "beginner" as const,
    aiPersona: "Sarah Chen, VP of Operations at a mid-size logistics company",
    estimatedMinutes: 10,
    tags: ["cold-call", "saas", "b2b"],
    systemPrompt: `You are Sarah Chen, VP of Operations at a mid-size logistics company. You are busy and skeptical of sales calls. You have heard many pitches before. You will respond realistically as a busy executive who is politely resistant but can be won over with a compelling, concise pitch. Ask probing questions about ROI, implementation time, and integration. If the user is vague or uses jargon without explanation, push back. Keep responses to 2-3 sentences.`,
  },
  {
    title: "Handling an Angry Customer",
    description: "De-escalate a frustrated customer who received a damaged product and wants a refund.",
    category: "customer_service" as const,
    difficulty: "intermediate" as const,
    aiPersona: "Marcus, an angry customer",
    estimatedMinutes: 8,
    tags: ["de-escalation", "refund", "empathy"],
    systemPrompt: `You are Marcus, a customer who ordered an expensive laptop stand that arrived damaged. You are frustrated and angry. You have been waiting 2 weeks and need it for work. You want a full refund or immediate replacement. You will escalate if the agent is dismissive, reads from a script, or doesn't acknowledge your frustration. You will calm down if the agent shows genuine empathy, takes ownership, and provides a clear resolution path. Keep responses realistic and emotionally charged but not abusive.`,
  },
  {
    title: "Technical Job Interview",
    description: "Practice answering behavioral and technical questions for a software engineering role.",
    category: "interview" as const,
    difficulty: "intermediate" as const,
    aiPersona: "Alex Rivera, Senior Engineering Manager at a tech company",
    estimatedMinutes: 15,
    tags: ["behavioral", "technical", "software-engineering"],
    systemPrompt: `You are Alex Rivera, a Senior Engineering Manager conducting a technical interview for a mid-level software engineer role. Ask a mix of behavioral questions (STAR format expected) and technical questions about system design, problem-solving, and past projects. Follow up on vague answers. Be professional but probe for depth. Ask one question at a time. Start by introducing yourself and asking the candidate to walk you through their background.`,
  },
  {
    title: "Salary Negotiation",
    description: "Negotiate your compensation package with an HR manager after receiving a job offer.",
    category: "negotiation" as const,
    difficulty: "advanced" as const,
    aiPersona: "Jennifer Park, HR Director",
    estimatedMinutes: 12,
    tags: ["salary", "negotiation", "compensation"],
    systemPrompt: `You are Jennifer Park, HR Director who has just extended a job offer of $95,000 to a candidate. You have some flexibility (up to $108,000) but won't reveal that upfront. You will push back on requests above your range. You respond well to candidates who cite market data, articulate their value clearly, and remain professional. You will counter-offer with non-salary benefits (extra PTO, signing bonus) if pressed. Keep responses concise and professional.`,
  },
  {
    title: "Executive Product Presentation",
    description: "Present a new product roadmap to a skeptical C-suite executive audience.",
    category: "presentation" as const,
    difficulty: "advanced" as const,
    aiPersona: "Board of three executives: CFO, CTO, and CEO",
    estimatedMinutes: 20,
    tags: ["executive", "roadmap", "presentation"],
    systemPrompt: `You represent three executives reviewing a product roadmap presentation. The CFO asks about ROI, cost, and timeline. The CTO asks about technical feasibility, architecture, and team capacity. The CEO asks about strategic alignment and competitive differentiation. Take turns asking tough questions. Be direct and expect clear, data-backed answers. If the presenter is vague, ask for specifics. Start by saying you're ready to hear the presentation.`,
  },
  {
    title: "Upsell to Existing Customer",
    description: "Identify upsell opportunities and pitch a premium plan to an existing customer during a check-in call.",
    category: "sales" as const,
    difficulty: "intermediate" as const,
    aiPersona: "David Kim, existing customer on the basic plan",
    estimatedMinutes: 10,
    tags: ["upsell", "account-management", "retention"],
    systemPrompt: `You are David Kim, a customer who has been using a project management tool on the basic plan for 6 months. You are satisfied but not enthusiastic. You have a team of 12 people and have mentioned pain points about reporting and integrations. You are price-conscious and will ask about ROI. You can be persuaded if the agent listens well, connects the upgrade to your specific pain points, and offers a trial or discount. Keep responses realistic and conversational.`,
  },
];

const SEED_WALKTHROUGHS = [
  {
    title: "Setting Up a CRM Pipeline",
    description: "Learn how to configure a sales pipeline in a CRM system from scratch.",
    category: "CRM",
    difficulty: "beginner" as const,
    estimatedMinutes: 8,
    steps: [
      { id: 1, title: "Navigate to Pipeline Settings", description: "Access the pipeline configuration panel.", instruction: "Click on the 'Settings' gear icon in the top-right navigation bar, then select 'Pipeline Management' from the dropdown menu.", hint: "The gear icon is usually next to your profile avatar.", action: "click" as const },
      { id: 2, title: "Create a New Pipeline", description: "Add a new sales pipeline for your team.", instruction: "Click the '+ New Pipeline' button. Enter the name 'Q1 Sales Pipeline' in the name field and select 'Sales' as the pipeline type.", action: "type" as const },
      { id: 3, title: "Add Pipeline Stages", description: "Define the stages of your sales process.", instruction: "Add the following stages in order: 'Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'. Click '+ Add Stage' for each one.", hint: "Drag stages to reorder them after creation.", action: "click" as const },
      { id: 4, title: "Configure Stage Probabilities", description: "Set win probability for each stage.", instruction: "For each stage, click the probability field and enter: Prospecting=10%, Qualification=25%, Proposal=50%, Negotiation=75%, Closed Won=100%.", action: "type" as const },
      { id: 5, title: "Set Automation Rules", description: "Add automatic actions when deals move between stages.", instruction: "Click 'Automation' tab. Add a rule: when a deal moves to 'Proposal', automatically create a task 'Send proposal document' assigned to the deal owner.", action: "click" as const },
      { id: 6, title: "Save and Activate", description: "Save your pipeline configuration.", instruction: "Click the 'Save Pipeline' button. Then toggle the 'Active' switch to enable the pipeline for your team.", action: "click" as const },
    ],
  },
  {
    title: "Creating a Support Ticket Workflow",
    description: "Configure an automated customer support ticket routing and escalation workflow.",
    category: "Support",
    difficulty: "intermediate" as const,
    estimatedMinutes: 10,
    steps: [
      { id: 1, title: "Open Workflow Builder", description: "Access the workflow automation tool.", instruction: "Navigate to 'Support' > 'Automation' > 'Workflow Builder' in the main navigation.", action: "navigate" as const },
      { id: 2, title: "Create New Workflow", description: "Start a new automation workflow.", instruction: "Click '+ Create Workflow'. Name it 'Priority Ticket Routing'. Set the trigger to 'New Ticket Created'.", action: "click" as const },
      { id: 3, title: "Add Priority Condition", description: "Filter tickets by priority level.", instruction: "Add a condition block: IF ticket.priority = 'High' OR ticket.priority = 'Critical'. This will branch the workflow.", action: "click" as const },
      { id: 4, title: "Configure Routing Action", description: "Route high-priority tickets to senior agents.", instruction: "In the TRUE branch, add action 'Assign to Team' and select 'Senior Support Team'. Set SLA to 2 hours.", action: "type" as const },
      { id: 5, title: "Add Escalation Timer", description: "Set up automatic escalation if unresolved.", instruction: "Add a 'Wait' block set to 2 hours. After the wait, add condition: IF ticket.status != 'Resolved', THEN send notification to 'Support Manager'.", action: "click" as const },
      { id: 6, title: "Test and Publish", description: "Test the workflow before going live.", instruction: "Click 'Test Workflow' and use the sample ticket provided. Review the execution log. If successful, click 'Publish Workflow'.", action: "observe" as const },
    ],
  },
  {
    title: "Onboarding a New Team Member",
    description: "Walk through the complete HR onboarding process for a new employee in an HRIS system.",
    category: "HR",
    difficulty: "beginner" as const,
    estimatedMinutes: 12,
    steps: [
      { id: 1, title: "Create Employee Profile", description: "Add the new employee to the system.", instruction: "Go to 'People' > 'Add Employee'. Fill in: First Name, Last Name, Email, Start Date, Department, and Job Title. Click 'Create Profile'.", action: "type" as const },
      { id: 2, title: "Assign Role and Permissions", description: "Set the employee's system access level.", instruction: "In the employee profile, click 'Access & Permissions'. Select role 'Standard Employee'. Enable modules: Time Tracking, Benefits, and Payroll View.", action: "click" as const },
      { id: 3, title: "Set Up Payroll", description: "Configure payroll details.", instruction: "Navigate to 'Payroll' tab. Enter salary, pay frequency (bi-weekly), and bank account details. Select tax withholding form W-4.", action: "type" as const },
      { id: 4, title: "Enroll in Benefits", description: "Add the employee to benefits programs.", instruction: "Click 'Benefits Enrollment'. Select health plan 'Premium PPO', dental 'Standard', and vision 'Basic'. Set effective date to start date.", action: "click" as const },
      { id: 5, title: "Assign Onboarding Checklist", description: "Create tasks for the new employee's first week.", instruction: "Go to 'Onboarding' tab. Click 'Assign Template' and select 'Standard Onboarding - 30 Day Plan'. This auto-creates tasks for the employee.", action: "click" as const },
      { id: 6, title: "Send Welcome Email", description: "Notify the new employee.", instruction: "Click 'Send Welcome Email'. Review the pre-filled email with login credentials and first-day instructions. Click 'Send' to deliver.", action: "click" as const },
    ],
  },
  {
    title: "Configuring a Marketing Email Campaign",
    description: "Set up a targeted email marketing campaign with segmentation and A/B testing.",
    category: "Marketing",
    difficulty: "intermediate" as const,
    estimatedMinutes: 15,
    steps: [
      { id: 1, title: "Create Campaign", description: "Start a new email campaign.", instruction: "Navigate to 'Campaigns' > 'Email' > '+ New Campaign'. Select 'Regular Campaign' and name it 'Q1 Product Launch'.", action: "click" as const },
      { id: 2, title: "Define Audience Segment", description: "Target the right subscribers.", instruction: "In 'Recipients', click 'Build Segment'. Add conditions: Subscribed > 30 days ago AND Last opened email < 90 days ago AND Tag = 'prospect'. Save as 'Warm Prospects'.", action: "type" as const },
      { id: 3, title: "Set Up A/B Test", description: "Test two subject line variations.", instruction: "Enable 'A/B Testing'. Set Variable to 'Subject Line'. Enter Version A: 'Introducing our biggest update yet' and Version B: 'You asked, we built it'. Set split to 50/50.", action: "type" as const },
      { id: 4, title: "Design Email Content", description: "Build the email template.", instruction: "Click 'Design Email'. Use the drag-and-drop builder to add: header image, headline text, 3 feature blocks, and a CTA button 'See What's New' linking to your product page.", action: "click" as const },
      { id: 5, title: "Configure Send Settings", description: "Schedule the campaign.", instruction: "Set Send Time to 'Optimal Send Time' (AI-optimized). Schedule for next Tuesday. Enable tracking for opens, clicks, and conversions.", action: "click" as const },
      { id: 6, title: "Preview and Launch", description: "Final review before sending.", instruction: "Click 'Preview & Test'. Send a test email to yourself. Review on mobile and desktop views. If satisfied, click 'Schedule Campaign'.", action: "observe" as const },
    ],
  },
];

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Scenarios ──────────────────────────────────────────────
  scenarios: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional(), difficulty: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const list = await getScenarios(input?.category, input?.difficulty);
        if (list.length === 0) {
          // Seed scenarios on first call
          for (const s of SEED_SCENARIOS) {
            await createScenario(s);
          }
          return getScenarios(input?.category, input?.difficulty);
        }
        return list;
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const scenario = await getScenarioById(input.id);
        if (!scenario) throw new TRPCError({ code: "NOT_FOUND" });
        return scenario;
      }),
  }),

  // ── Sessions ───────────────────────────────────────────────
  sessions: router({
    create: publicProcedure
      .input(z.object({ scenarioId: z.number(), language: z.string().default("en") }))
      .mutation(async ({ input, ctx }) => {
        const scenario = await getScenarioById(input.scenarioId);
        if (!scenario) throw new TRPCError({ code: "NOT_FOUND" });
        const sessionId = await createSession((ctx.user?.id ?? 0), input.scenarioId, input.language);
        return { sessionId };
      }),

    get: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input, ctx }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== (ctx.user?.id ?? 0)) throw new TRPCError({ code: "NOT_FOUND" });
        const msgs = await getSessionMessages(input.sessionId);
        const scenario = await getScenarioById(session.scenarioId);
        return { session, messages: msgs, scenario };
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      return getUserSessions((ctx.user?.id ?? 0));
    }),

    sendMessage: publicProcedure
      .input(z.object({
        sessionId: z.number(),
        content: z.string().min(1),
        language: z.string().optional(), // BCP-47 language code e.g. "en", "fr", "ar"
      }))
      .mutation(async ({ input, ctx }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== (ctx.user?.id ?? 0)) throw new TRPCError({ code: "NOT_FOUND" });
        if (session.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "Session is not active" });

        const scenario = await getScenarioById(session.scenarioId);
        if (!scenario) throw new TRPCError({ code: "NOT_FOUND" });

        // Save user message
        await addMessage({ sessionId: input.sessionId, role: "user", content: input.content });

        // Get conversation history
        const history = await getSessionMessages(input.sessionId);

        // Build language instruction — priority: scenario.languageLock > session.language > input.language > "en"
        const langCode = scenario.languageLock ?? session.language ?? input.language ?? "en";
        const langInstruction = buildLanguageInstruction(langCode);

        // Build messages for LLM
        const llmMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: scenario.systemPrompt + langInstruction },
          ...history.slice(-20).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ];

        // Get AI response
        const aiResponse = await invokeLLM({ messages: llmMessages });
        const aiContent = (typeof aiResponse.choices[0]?.message?.content === 'string' ? aiResponse.choices[0]?.message?.content : null) ?? "I understand. Please continue.";

        // Save AI message
        await addMessage({ sessionId: input.sessionId, role: "assistant", content: aiContent });

        // Generate feedback for user message (every 3rd message or so)
        let feedback = null;
        if (history.filter((m) => m.role === "user").length % 2 === 0) {
          const feedbackResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert communication coach evaluating a practice session for a "${scenario.category}" scenario. 
Analyze the user's latest message and provide brief, actionable feedback.
Return JSON with: { score: number (0-100), feedback: string (1-2 sentences), dimensions: { clarity: number, empathy: number, persuasiveness: number, professionalism: number } }`,
              },
              {
                role: "user",
                content: `Scenario: ${scenario.title}\nUser said: "${input.content}"\nContext: ${history.slice(-4).map((m) => `${m.role}: ${m.content}`).join("\n")}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "message_feedback",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    score: { type: "number" },
                    feedback: { type: "string" },
                    dimensions: {
                      type: "object",
                      properties: {
                        clarity: { type: "number" },
                        empathy: { type: "number" },
                        persuasiveness: { type: "number" },
                        professionalism: { type: "number" },
                      },
                      required: ["clarity", "empathy", "persuasiveness", "professionalism"],
                      additionalProperties: false,
                    },
                  },
                  required: ["score", "feedback", "dimensions"],
                  additionalProperties: false,
                },
              },
            },
          });
          try {
            const feedbackContent = typeof feedbackResponse.choices[0]?.message?.content === 'string' ? feedbackResponse.choices[0]?.message?.content : '{}';
            feedback = JSON.parse(feedbackContent);
          } catch {}
        }

        return { aiContent, feedback };
      }),

    transcribeVoice: publicProcedure
      .input(z.object({ audioBase64: z.string(), mimeType: z.string().default("audio/webm"), language: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        // Decode base64 audio and upload to S3
        const buffer = Buffer.from(input.audioBase64, "base64");
        const fileKey = `voice/${(ctx.user?.id ?? 0)}/${Date.now()}.webm`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        // Transcribe via Whisper (pass language hint if provided)
        const result = await transcribeAudio({ audioUrl: url, language: input.language ?? "en" });
        if ("error" in result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
        return { text: result.text };
      }),

    getOpeningMessage: publicProcedure
      .input(z.object({ sessionId: z.number(), language: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== (ctx.user?.id ?? 0)) throw new TRPCError({ code: "NOT_FOUND" });
        if (session.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "Session is not active" });
        const scenario = await getScenarioById(session.scenarioId);
        if (!scenario) throw new TRPCError({ code: "NOT_FOUND" });
        // Only generate opening if no messages yet
        const existing = await getSessionMessages(input.sessionId);
        if (existing.length > 0) return { aiContent: existing[0].content };
        const langCode = scenario.languageLock ?? session.language ?? input.language ?? "en";
        const langInstruction = buildLanguageInstruction(langCode);
        const llmMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: scenario.systemPrompt + langInstruction + "\n\nThe conversation is just starting. Open the conversation naturally as your persona — greet the caller or answer the phone as appropriate. Keep it brief (1-2 sentences)." },
          { role: "user", content: "[START]" },
        ];
        const aiResponse = await invokeLLM({ messages: llmMessages });
        const aiContent = (typeof aiResponse.choices[0]?.message?.content === 'string' ? aiResponse.choices[0]?.message?.content : null) ?? "Hello, how can I help you today?";
        await addMessage({ sessionId: input.sessionId, role: "assistant", content: aiContent });
        return { aiContent };
      }),
    speakText: publicProcedure
      .input(z.object({
        text: z.string().min(1).max(4096),
        voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional(),
        speed: z.number().min(0.25).max(4.0).optional(),
        // ElevenLabs persona context — used to pick the right voice
        aiPersona: z.string().optional(),
        scenarioCategory: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Truncate very long AI responses to keep TTS snappy (ElevenLabs charges per char)
        const truncated = input.text.length > 500
          ? input.text.substring(0, 500) + "..."
          : input.text;

        // Try ElevenLabs first (high-quality, persona-specific voice)
        const { ENV } = await import("./_core/env");
        if (ENV.elevenLabsApiKey) {
          try {
            const voiceId = pickVoiceForPersona(
              input.aiPersona ?? "",
              input.scenarioCategory ?? ""
            );
            const audioBuffer = await elevenLabsTTS({ text: truncated, voiceId });
            return { audioBase64: audioBuffer.toString("base64"), mimeType: "audio/mpeg", provider: "elevenlabs" };
          } catch (err) {
            // ElevenLabs failed (quota exceeded, network error, etc.) — fall through to built-in TTS
            console.warn("[ElevenLabs TTS] Falling back to built-in TTS:", (err as Error).message);
          }
        }

        // Fallback: built-in Forge TTS
        const audioBuffer = await textToSpeech({
          text: truncated,
          voice: input.voice ?? "nova",
          speed: input.speed ?? 1.0,
        });
        return { audioBase64: audioBuffer.toString("base64"), mimeType: "audio/mpeg", provider: "forge" };
      }),

    complete: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== (ctx.user?.id ?? 0)) throw new TRPCError({ code: "NOT_FOUND" });

        const msgs = await getSessionMessages(input.sessionId);
        const scenario = await getScenarioById(session.scenarioId);
        const userMessages = msgs.filter((m) => m.role === "user");

        if (userMessages.length === 0) {
          await updateSession(input.sessionId, { status: "abandoned" });
          return { success: true };
        }

        // Generate comprehensive session feedback
        const evalResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert communication coach. Evaluate the complete practice session and provide comprehensive feedback.
Return JSON with: { 
  overallScore: number (0-100), 
  clarityScore: number (0-100), 
  empathyScore: number (0-100), 
  persuasivenessScore: number (0-100), 
  objectionHandlingScore: number (0-100), 
  professionalismScore: number (0-100),
  feedbackSummary: string (2-3 sentences overall assessment),
  strengths: string[] (3 specific strengths observed),
  improvements: string[] (3 specific areas to improve)
}`,
            },
            {
              role: "user",
              content: `Scenario: ${scenario?.title} (${scenario?.category})\n\nConversation:\n${msgs.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "session_evaluation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  overallScore: { type: "number" },
                  clarityScore: { type: "number" },
                  empathyScore: { type: "number" },
                  persuasivenessScore: { type: "number" },
                  objectionHandlingScore: { type: "number" },
                  professionalismScore: { type: "number" },
                  feedbackSummary: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                },
                required: ["overallScore", "clarityScore", "empathyScore", "persuasivenessScore", "objectionHandlingScore", "professionalismScore", "feedbackSummary", "strengths", "improvements"],
                additionalProperties: false,
              },
            },
          },
        });

        let evaluation: any = {};
        try {
          const evalContent = typeof evalResponse.choices[0]?.message?.content === 'string' ? evalResponse.choices[0]?.message?.content : '{}';
          evaluation = JSON.parse(evalContent);
        } catch {}

        const startTime = session.startedAt.getTime();
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

        await updateSession(input.sessionId, {
          status: "completed",
          completedAt: new Date(),
          durationSeconds,
          overallScore: evaluation.overallScore,
          clarityScore: evaluation.clarityScore,
          empathyScore: evaluation.empathyScore,
          persuasivenessScore: evaluation.persuasivenessScore,
          objectionHandlingScore: evaluation.objectionHandlingScore,
          professionalismScore: evaluation.professionalismScore,
          feedbackSummary: evaluation.feedbackSummary,
          strengths: evaluation.strengths ?? [],
          improvements: evaluation.improvements ?? [],
        });

        // Update streak and leaderboard stats
        await updateUserStreak((ctx.user?.id ?? 0));

        return { success: true, evaluation };
      }),

    abandon: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== (ctx.user?.id ?? 0)) throw new TRPCError({ code: "NOT_FOUND" });
        await updateSession(input.sessionId, { status: "abandoned" });
        return { success: true };
      }),
  }),

  // ── Walkthroughs ───────────────────────────────────────────
  walkthroughs: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const db = await import("./db");
        const { getDb } = db;
        const drizzleDb = await getDb();
        if (!drizzleDb) return [];
        const { walkthroughs: wt } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const count = await drizzleDb.select({ id: wt.id }).from(wt).limit(1);
        if (count.length === 0) {
          const { createWalkthrough } = await import("./db").then(m => ({ createWalkthrough: async (data: any) => {
            const result = await drizzleDb.insert(wt).values(data);
            return result;
          }}));
          for (const w of SEED_WALKTHROUGHS) {
            await drizzleDb.insert(wt).values(w);
          }
        }
        return getWalkthroughs(input?.category);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const walkthrough = await getWalkthroughById(input.id);
        if (!walkthrough) throw new TRPCError({ code: "NOT_FOUND" });
        return walkthrough;
      }),

    startOrGetProgress: publicProcedure
      .input(z.object({ walkthroughId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const completion = await getOrCreateWalkthroughCompletion((ctx.user?.id ?? 0), input.walkthroughId);
        return completion;
      }),

    updateProgress: publicProcedure
      .input(z.object({ completionId: z.number(), completedSteps: z.array(z.number()), isCompleted: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const data: any = { completedSteps: input.completedSteps };
        if (input.isCompleted) {
          data.isCompleted = true;
          data.completedAt = new Date();
          data.score = Math.round(80 + Math.random() * 20);
        }
        await updateWalkthroughCompletion(input.completionId, data);
        return { success: true };
      }),

    myCompletions: publicProcedure.query(async ({ ctx }) => {
      return getUserWalkthroughCompletions((ctx.user?.id ?? 0));
    }),
  }),

  // ── Admin ────────────────────────────────────────────────────────
  admin: router({
    listScenarios: publicProcedure.query(async () => {
      return getAllScenarios();
    }),

    createScenario: publicProcedure
      .input(z.object({
        title: z.string().min(3),
        description: z.string().optional(),
        category: z.enum(["sales", "customer_service", "interview", "negotiation", "presentation"]),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
        systemPrompt: z.string().min(10),
        aiPersona: z.string().optional(),
        personaRole: z.string().optional(),
        personaCompany: z.string().optional(),
        personaPersonality: z.string().optional(),
        channel: z.string().optional(),
        learnerRole: z.string().optional(),
        learnerTeam: z.string().optional(),
        focusSkill: z.string().optional(),
        scoringNotes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        estimatedMinutes: z.number().min(1).max(120).optional(),
        languageLock: z.string().max(10).nullable().optional(),
        folder: z.string().max(255).nullable().optional(),
        personaAvatarUrl: z.string().max(1024).nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        // Auto-build systemPrompt from wizard fields if it is minimal
        let systemPrompt = input.systemPrompt;
        if ((!systemPrompt || systemPrompt.trim().length < 20) && input.focusSkill) {
          const persona = [input.aiPersona, input.personaRole, input.personaCompany].filter(Boolean).join(", ");
          systemPrompt = `You are ${persona || "an AI persona"}. Your personality is ${input.personaPersonality || "professional"}. Focus this conversation on helping the learner practise: ${input.focusSkill}. Respond realistically and stay in character throughout.`;
        }
        await createScenario({
          ...input,
          systemPrompt,
          tags: input.tags ?? [],
          estimatedMinutes: input.estimatedMinutes ?? 10,
          languageLock: input.languageLock ?? null,
          folder: input.folder ?? null,
          personaAvatarUrl: input.personaAvatarUrl ?? null,
          isActive: true,
        });
        return { success: true };
      }),

    updateScenario: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        category: z.enum(["sales", "customer_service", "interview", "negotiation", "presentation"]).optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        systemPrompt: z.string().min(10).optional(),
        aiPersona: z.string().optional(),
        personaRole: z.string().optional(),
        personaCompany: z.string().optional(),
        personaPersonality: z.string().optional(),
        channel: z.string().optional(),
        learnerRole: z.string().optional(),
        learnerTeam: z.string().optional(),
        focusSkill: z.string().optional(),
        scoringNotes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        estimatedMinutes: z.number().min(1).max(120).optional(),
        isActive: z.boolean().optional(),
        languageLock: z.string().max(10).nullable().optional(),
        folder: z.string().max(255).nullable().optional(),
        personaAvatarUrl: z.string().max(1024).nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateScenario(id, data);
        return { success: true };
      }),

    deleteScenario: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteScenario(input.id);
        return { success: true };
      }),

    uploadPersonaAvatar: publicProcedure
      .input(z.object({
        base64: z.string(), // base64-encoded image
        mimeType: z.string().default("image/jpeg"),
        scenarioId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const ext = input.mimeType.includes("png") ? "png" : "jpg";
        const fileKey = `persona-avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { url };
      }),

    translateScenario: publicProcedure
      .input(z.object({
        id: z.number(),
        targetLanguage: z.string().min(2).max(10), // BCP-47 code e.g. "fr", "ar"
      }))
      .mutation(async ({ input }) => {
        const source = await getScenarioById(input.id);
        if (!source) throw new TRPCError({ code: "NOT_FOUND" });

        const LANGUAGE_NAMES: Record<string, string> = {
          fr: "French", es: "Spanish", ar: "Arabic", zh: "Mandarin Chinese",
          de: "German", pt: "Portuguese", it: "Italian", ja: "Japanese", ko: "Korean",
          hi: "Hindi", nl: "Dutch", tr: "Turkish", pl: "Polish", sv: "Swedish",
          bn: "Bengali", sw: "Swahili",
        };
        const langName = LANGUAGE_NAMES[input.targetLanguage] ?? input.targetLanguage;

        const translationResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a professional L&D content translator. Translate the following training scenario fields into ${langName}. Return a JSON object with keys: title, description, systemPrompt, aiPersona. Keep the JSON structure exactly. Translate all text values. For systemPrompt, add an instruction at the end: "Respond ONLY in ${langName}." Do not translate tags.`,
            },
            {
              role: "user",
              content: JSON.stringify({
                title: source.title,
                description: source.description ?? "",
                systemPrompt: source.systemPrompt,
                aiPersona: source.aiPersona ?? "",
              }),
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "translated_scenario",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  systemPrompt: { type: "string" },
                  aiPersona: { type: "string" },
                },
                required: ["title", "description", "systemPrompt", "aiPersona"],
                additionalProperties: false,
              },
            },
          },
        });

        const raw = translationResponse.choices[0]?.message?.content;
        if (!raw || typeof raw !== "string") throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Translation failed" });
        const translated = JSON.parse(raw) as { title: string; description: string; systemPrompt: string; aiPersona: string };

        await createScenario({
          title: translated.title,
          description: translated.description,
          category: source.category,
          difficulty: source.difficulty,
          systemPrompt: translated.systemPrompt,
          aiPersona: translated.aiPersona,
          tags: source.tags as string[] ?? [],
          estimatedMinutes: source.estimatedMinutes ?? 10,
          isActive: true,
          languageLock: input.targetLanguage,
        });

        return { success: true, title: translated.title, language: langName };
      }),

    listUsers: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const allUsers = await db.select({
        id: users.id,
        name: users.name,
        openId: users.openId,
        role: users.role,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
        totalSessions: users.totalSessions,
        avgScore: users.avgScore,
      }).from(users).orderBy(users.createdAt);
      return allUsers;
    }),

    changeUserRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "user"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can change user roles" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),

  // ── Leaderboard & Streaks ────────────────────────────────────────
  leaderboard: router({
    list: publicProcedure.query(async () => {
      return getLeaderboard(20);
    }),

    myStreak: publicProcedure.query(async ({ ctx }) => {
      return getUserStreak((ctx.user?.id ?? 0));
    }),
  }),

  // ── Analytics ────────────────────────────────────────────────────────
  analytics: router({
    dashboard: publicProcedure.query(async ({ ctx }) => {
      return getUserAnalytics((ctx.user?.id ?? 0));
    }),
  }),

  // ── eLearning Courses ─────────────────────────────────────────────────────────
  courses: coursesRouter,
  sandbox: sandboxRouter,
  interview: interviewRouter,
  agentic: agenticRouter,
  coaching: coachingRouter,
});

export type AppRouter = typeof appRouter;