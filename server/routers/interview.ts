import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { INTERVIEW_AGENTS, TAVUS_TO_DID_MAP } from "../../shared/didAgents";

const DID_API_KEY = process.env.DID_API_KEY!;
const DID_BASE = "https://api.d-id.com";

async function didFetch(path: string, method: string, body?: object) {
  const res = await fetch(`${DID_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${DID_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `D-ID API error: ${err}` });
  }
  return res.json();
}

// UK interview personas — kept for display metadata (name, description, category, difficulty)
export const UK_INTERVIEW_PERSONAS = [
  {
    id: "anna_graduate",
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
    id: "benjamin_tech",
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
    id: "mary_nhs",
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
    id: "general",
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

export const interviewRouter = router({
  // List available UK interview personas
  listPersonas: publicProcedure.query(async () => {
    return UK_INTERVIEW_PERSONAS;
  }),

  // Create a D-ID agent chat session for a video interview
  createSession: protectedProcedure
    .input(
      z.object({
        personaId: z.string(),
        candidateName: z.string().optional(),
        jobTitle: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Resolve D-ID agent ID — accept both new D-ID agent keys and legacy Tavus persona IDs
      let agentId: string;
      let agentConfig: typeof INTERVIEW_AGENTS[string] | undefined;

      if (INTERVIEW_AGENTS[input.personaId]) {
        // Direct D-ID agent key (e.g. "benjamin_tech")
        agentConfig = INTERVIEW_AGENTS[input.personaId];
        agentId = agentConfig.agentId;
      } else if (TAVUS_TO_DID_MAP[input.personaId]) {
        // Legacy Tavus persona ID — map to D-ID agent
        agentId = TAVUS_TO_DID_MAP[input.personaId];
        agentConfig = Object.values(INTERVIEW_AGENTS).find((a) => a.agentId === agentId);
      } else {
        // Unknown persona — fall back to general interviewer
        agentConfig = INTERVIEW_AGENTS.general;
        agentId = agentConfig.agentId;
      }

      // Create a D-ID agent chat session
      const data = await didFetch(`/agents/${agentId}/chat`, "POST", {
        name: `Interview - ${input.candidateName ?? "Candidate"} - ${agentConfig?.name ?? "Coach"}`,
      });

      return {
        conversationId: data.id as string,
        agentId: agentId as string,
        agentName: agentConfig?.name ?? "AI Interviewer",
        // conversationUrl is no longer used (D-ID uses SDK, not iframe)
        conversationUrl: "",
        status: "created",
      };
    }),

  // End a D-ID agent chat session (soft delete / close)
  endSession: protectedProcedure
    .input(z.object({ conversationId: z.string(), agentId: z.string().optional() }))
    .mutation(async ({ input }) => {
      // D-ID chat sessions close automatically; no explicit end API needed.
      // We keep this procedure for compatibility with the frontend.
      return { success: true };
    }),

  // Get session status (no-op for D-ID — sessions are stateless)
  getStatus: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async () => {
      return { status: "active", conversationUrl: "" };
    }),

  // Generate AI feedback report for a completed interview
  // Now accepts an optional real transcript from the D-ID SDK for accurate scoring
  generateFeedback: protectedProcedure
    .input(
      z.object({
        personaId: z.string(),
        jobTitle: z.string().optional(),
        candidateName: z.string().optional(),
        durationSeconds: z.number(),
        transcript: z
          .array(z.object({ role: z.enum(["agent", "user"]), content: z.string() }))
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { invokeLLM } = await import("../_core/llm");

      // Resolve persona metadata — support both new D-ID keys and legacy Tavus IDs
      const persona = UK_INTERVIEW_PERSONAS.find(
        (p) => p.id === input.personaId || TAVUS_TO_DID_MAP[input.personaId]
      );
      const personaDesc = persona?.description ?? "a general UK job interview";
      const role = input.jobTitle ?? persona?.role ?? "the applied role";
      const candidate = input.candidateName ?? (ctx.user as any).name ?? "the candidate";
      const durationMins = Math.round(input.durationSeconds / 60);

      // Guard: session too short — no real content possible
      if (input.durationSeconds < 30) {
        return {
          overallScore: 0,
          starScore: 0,
          starFeedback: "No responses were recorded — the session ended before any answers could be given.",
          clarityScore: 0,
          clarityFeedback: "No speech was detected during this session.",
          competencyScore: 0,
          competencyFeedback: "No competency evidence was provided.",
          confidenceScore: 0,
          confidenceFeedback: "No verbal content was available to assess confidence.",
          strengths: [],
          improvements: [
            "Complete a full interview session to receive meaningful feedback.",
            "Ensure your microphone is enabled before starting.",
            "Try to answer each question in full before ending the session.",
          ],
          sampleAnswer: "Please complete a full interview session to see an example of a strong answer.",
          summary: `No content was recorded for this session. The interview ended after less than 30 seconds. Please try again and ensure your microphone is active.`,
          noContent: true,
          personaName: persona?.name ?? "AI Interviewer",
          role,
          candidateName: candidate,
          durationMins,
          hasTranscript: false,
        };
      }

      // Build feedback prompt — use real transcript if available
      const hasTranscript = !!(input.transcript && input.transcript.length > 2);
      const transcriptText = hasTranscript
        ? input.transcript!
            .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
            .join("\n")
        : null;

      const prompt = hasTranscript
        ? `You are an expert UK interview coach reviewing a completed AI video interview session.
Candidate: ${candidate}
Role practised: ${role}
Interview type: ${personaDesc}
Session duration: ${durationMins} minute(s)

FULL TRANSCRIPT:
${transcriptText}

Based on the transcript above, provide detailed, accurate, and constructive feedback. Score each dimension honestly from 0-100 based on actual performance shown in the transcript. Be specific — reference what the candidate actually said. Provide a strong sample answer for the most important question asked.
Respond in JSON only.`
        : `You are an expert UK interview coach reviewing a completed AI video interview session.
IMPORTANT CONSTRAINT: You do NOT have access to the actual transcript or recording of this interview. You only know:
- Candidate name: ${candidate}
- Role being practised: ${role}
- Interview type: ${personaDesc}
- Session duration: ${durationMins} minute(s)

Because you have no transcript, you MUST:
1. Set all dimension scores (starScore, clarityScore, competencyScore, confidenceScore) to between 0 and 40 — reflecting that performance cannot be verified
2. Set overallScore to between 0 and 35
3. In every feedback field, explicitly state: "Transcript not available — this score is a placeholder. Complete a full session with microphone enabled for accurate feedback."
4. Leave strengths as an empty array []
5. In improvements, include 3 actionable tips for interview preparation
6. In summary, clearly state that transcript analysis is not available for this session and the candidate should try again
7. In sampleAnswer, provide a strong example answer for a typical question for this role
Respond in JSON only.`;

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
              required: [
                "overallScore", "starScore", "starFeedback",
                "clarityScore", "clarityFeedback",
                "competencyScore", "competencyFeedback",
                "confidenceScore", "confidenceFeedback",
                "strengths", "improvements", "sampleAnswer", "summary",
              ],
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
        hasTranscript,
      };
    }),
});
