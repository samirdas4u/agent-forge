import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
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
  createSession: protectedProcedure
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
  endSession: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ input }) => {
      await tavusFetch(`/conversations/${input.conversationId}/end`, "POST");
      return { success: true };
    }),

  // Get conversation status
  getStatus: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input }) => {
      const data = await tavusFetch(`/conversations/${input.conversationId}`, "GET");
      return {
        status: data.status as string,
        conversationUrl: data.conversation_url as string,
      };
    }),
});
