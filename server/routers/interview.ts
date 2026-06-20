import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const TAVUS_API_KEY = process.env.TAVUS_API_KEY!;
const TAVUS_BASE = "https://tavusapi.com/v2";

// UK interview personas (created via Tavus API)
export const UK_INTERVIEW_PERSONAS = [
  {
    id: "p00105f03c2f",
    name: "UK Graduate Interview Coach",
    role: "HR Interviewer",
    company: "Graduate Employer",
    replicaName: "Anna",
    description: "Competency-based interview for UK graduate schemes. Covers STAR method, teamwork, leadership, and commercial awareness.",
    category: "graduate",
    difficulty: "intermediate",
    avatar: "https://ui-avatars.com/api/?name=Anna&background=6366f1&color=fff&size=128",
  },
  {
    id: "p5c154ab23bf",
    name: "UK Tech Interview Coach",
    role: "Engineering Manager",
    company: "UK Tech Company",
    replicaName: "Benjamin",
    description: "Technical and behavioural interview for software engineers, data scientists, and product managers.",
    category: "tech",
    difficulty: "advanced",
    avatar: "https://ui-avatars.com/api/?name=Benjamin&background=0ea5e9&color=fff&size=128",
  },
  {
    id: "p39b2c0123f2",
    name: "NHS Interview Coach",
    role: "NHS Panel Interviewer",
    company: "NHS",
    replicaName: "Mary",
    description: "Values-based interview aligned to NHS Constitution. Covers patient care, compassion, and NHS values.",
    category: "healthcare",
    difficulty: "intermediate",
    avatar: "https://ui-avatars.com/api/?name=Mary&background=10b981&color=fff&size=128",
  },
  {
    id: "pdac61133ac5",
    name: "General Interviewer",
    role: "Senior HR Manager",
    company: "Leading UK Employer",
    replicaName: "Anna",
    description: "Structured screening interview covering motivation, strengths, weaknesses, and career goals.",
    category: "general",
    difficulty: "beginner",
    avatar: "https://ui-avatars.com/api/?name=HR&background=f59e0b&color=fff&size=128",
  },
];

async function tavusFetch(path: string, method: string, body?: object) {
  const res = await fetch(`${TAVUS_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": TAVUS_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Tavus API error: ${err}` });
  }
  return res.json();
}

export const interviewRouter = router({
  // List available UK interview personas
  listPersonas: publicProcedure.query(async () => {
    return UK_INTERVIEW_PERSONAS;
  }),

  // Create a Tavus CVI conversation session
  createSession: publicProcedure
    .input(
      z.object({
        personaId: z.string(),
        candidateName: z.string().optional(),
        jobTitle: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const persona = UK_INTERVIEW_PERSONAS.find((p) => p.id === input.personaId);
      const conversationName = `Interview - ${input.candidateName ?? "Candidate"} - ${persona?.name ?? "Coach"}`;

      const data = await tavusFetch("/conversations", "POST", {
        persona_id: input.personaId,
        conversation_name: conversationName,
        conversational_context: input.jobTitle
          ? `The candidate is applying for the role of: ${input.jobTitle}. Tailor your questions accordingly.`
          : undefined,
        properties: {
          max_call_duration: 1800, // 30 minutes max
          enable_recording: false,
          apply_greenscreen: false,
          language: "english",
        },
      });

      return {
        conversationId: data.conversation_id as string,
        conversationUrl: data.conversation_url as string,
        status: data.status as string,
      };
    }),

  // End a Tavus CVI conversation session
  endSession: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ input }) => {
      await tavusFetch(`/conversations/${input.conversationId}/end`, "POST");
      return { success: true };
    }),

  // Get conversation status
  getStatus: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input }) => {
      const data = await tavusFetch(`/conversations/${input.conversationId}`, "GET");
      return {
        status: data.status as string,
        conversationUrl: data.conversation_url as string,
      };
    }),

  // Generate AI feedback report for a completed interview
  generateFeedback: publicProcedure
    .input(
      z.object({
        personaId: z.string(),
        jobTitle: z.string().optional(),
        candidateName: z.string().optional(),
        durationSeconds: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { invokeLLM } = await import("../_core/llm");
      const persona = UK_INTERVIEW_PERSONAS.find((p) => p.id === input.personaId);
      const personaDesc = persona?.description ?? "a general UK job interview";
      const role = input.jobTitle ?? persona?.role ?? "the applied role";
      const candidate = input.candidateName ?? "the candidate";
      const durationMins = Math.max(1, Math.round(input.durationSeconds / 60));

      const prompt = `You are an expert UK interview coach. A candidate just completed a ${durationMins}-minute AI video interview for "${role}" with ${persona?.name ?? "an AI interviewer"}. The interview context was: "${personaDesc}".

Generate a detailed, constructive post-interview feedback report for ${candidate}. Include all required fields. Be specific and actionable. Respond in JSON only.`;

      const result = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert UK interview coach. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "interview_feedback",
            strict: true,
            schema: {
              type: "object",
              properties: {
                overallScore: { type: "number" },
                starScore: { type: "number" },
                starFeedback: { type: "string" },
                clarityScore: { type: "number" },
                clarityFeedback: { type: "string" },
                competencyScore: { type: "number" },
                competencyFeedback: { type: "string" },
                confidenceScore: { type: "number" },
                confidenceFeedback: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                sampleAnswer: { type: "string" },
                summary: { type: "string" },
              },
              required: ["overallScore","starScore","starFeedback","clarityScore","clarityFeedback","competencyScore","competencyFeedback","confidenceScore","confidenceFeedback","strengths","improvements","sampleAnswer","summary"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = result.choices?.[0]?.message?.content;
      const feedback = typeof content === "string" ? JSON.parse(content) : content;
      return {
        ...feedback,
        personaName: persona?.name ?? "AI Interviewer",
        role,
        candidateName: candidate,
        durationMins,
      };
    }),
});
