import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { elevenLabsTTS } from "../_core/elevenLabsTTS";
import { textToSpeech } from "../_core/tts";
import { ENV } from "../_core/env";

// ── Coach Persona Definitions ─────────────────────────────────────────────────

export const COACH_PERSONAS = [
  {
    id: "maya",
    name: "Maya Chen",
    title: "Reflective Leadership Coach",
    style: "Socratic / Reflective",
    framework: "Clean Language + Appreciative Inquiry",
    focusAreas: ["Leadership identity", "Self-awareness", "Values alignment", "Executive presence", "Team dynamics"],
    tone: "Warm, curious, non-judgemental. Speaks slowly. Uses silence intentionally. Never rushes.",
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Bella — warm female
    tagline: "Unlock who you're becoming as a leader",
    description: "Maya uses powerful questions and deep listening to help you discover insights about your leadership identity, values, and presence. She never tells you what to do — she helps you find your own answers.",
    specialisms: ["Leadership transitions", "Executive presence", "Values-based leadership", "Team culture"],
    openingQuestion: "What would you like to have happen in our time together today?",
    accentColor: "violet",
    gradient: "from-violet-500 to-purple-600",
    avatar: "MC",
  },
  {
    id: "james",
    name: "James Whitfield",
    title: "Performance & Sales Coach",
    style: "GROW Model / Solution-Focused",
    framework: "GROW (Goal → Reality → Options → Will)",
    focusAreas: ["Sales performance", "Goal-setting", "Pipeline management", "Objection handling", "Career targets"],
    tone: "Direct, energising, commercially minded. Challenges assumptions. Celebrates wins loudly.",
    voiceId: "pNInz6obpgDQGcFmaJgB", // Adam — deep male
    tagline: "Turn your goals into results",
    description: "James uses the GROW model to help you set clear goals, understand your current reality, explore your options, and commit to action. He's direct, commercially minded, and won't let you stay stuck.",
    specialisms: ["Sales coaching", "Performance goals", "Career advancement", "Revenue targets"],
    openingQuestion: "Let's get straight to it — what's the one thing you want to leave this session having cracked?",
    accentColor: "blue",
    gradient: "from-blue-500 to-cyan-600",
    avatar: "JW",
  },
  {
    id: "priya",
    name: "Priya Sharma",
    title: "Career Transitions Coach",
    style: "Solution-Focused / Narrative",
    framework: "Solution-Focused Brief Coaching + Narrative Coaching",
    focusAreas: ["Career pivots", "Confidence building", "Interview preparation", "Imposter syndrome", "Next-role strategy"],
    tone: "Gentle, encouraging, reframing. Validates feelings before moving to action. Builds confidence steadily.",
    voiceId: "oWAxZDx7w5VEj9dCyTzz", // Grace — calm female
    tagline: "Navigate your next chapter with confidence",
    description: "Priya specialises in career transitions and confidence. She helps you reframe limiting beliefs, reconnect with your strengths, and build a clear strategy for your next move — whether that's a promotion, pivot, or fresh start.",
    specialisms: ["Career change", "Confidence", "Imposter syndrome", "Interview prep", "Redundancy recovery"],
    openingQuestion: "Before we dive in — what's been going well for you recently that we should make sure we build on?",
    accentColor: "emerald",
    gradient: "from-emerald-500 to-teal-600",
    avatar: "PS",
  },
  {
    id: "marcus",
    name: "Marcus Reid",
    title: "Executive Presence Coach",
    style: "Directive / Challenge-Based",
    framework: "Gestalt Coaching + Ontological Coaching",
    focusAreas: ["Executive presence", "Communication impact", "Stakeholder influence", "Board-level confidence", "Strategic thinking"],
    tone: "Challenging, incisive, high-expectations. Won't let the coachee off the hook. Names what's not being said.",
    voiceId: "VR6AewLTigWG4xSOukaG", // Arnold — crisp male
    tagline: "Step into the room like you own it",
    description: "Marcus works with senior professionals who need to operate at the highest levels. He's direct, challenging, and won't let you hide behind comfortable narratives. If you want to be challenged to grow fast, Marcus is your coach.",
    specialisms: ["C-suite readiness", "Board presentations", "Stakeholder management", "Strategic communication"],
    openingQuestion: "The leaders who grow fastest are the ones who are brutally honest with themselves. So — what are you avoiding?",
    accentColor: "orange",
    gradient: "from-orange-500 to-red-600",
    avatar: "MR",
  },
] as const;

export type CoachId = typeof COACH_PERSONAS[number]["id"];

// ── System Prompt Builder ─────────────────────────────────────────────────────

function buildCoachSystemPrompt(coachId: CoachId, sessionGoal: string): string {
  const coach = COACH_PERSONAS.find(c => c.id === coachId);
  if (!coach) throw new Error(`Unknown coach: ${coachId}`);

  return `You are ${coach.name}, a world-class ${coach.style} coach. Your coaching approach is grounded in ${coach.framework}.

Your focus areas: ${coach.focusAreas.join(", ")}.

COACHING PRINCIPLES — follow these without exception:
1. You NEVER give direct advice or tell the coachee what to do. You ask questions that help them find their own answers.
2. You ask ONE question at a time. Never stack multiple questions in a single response.
3. You listen deeply — reflect back the coachee's exact words before asking your next question.
4. You track the session arc naturally: Check-in → Exploration → Insight → Action → Close.
5. You name what you observe without judgement: "I notice you used the word 'stuck' three times..."
6. You hold silence well — short responses are powerful. You don't fill space with words.
7. You challenge limiting beliefs with curiosity, not confrontation: "That's interesting — what makes you believe that?"
8. You celebrate insight and progress explicitly: "That's a significant realisation. What does that open up for you?"
9. Your responses are 1–4 sentences maximum. Coaching is about the coachee talking, not you.
10. You end the session with a specific commitment: "What will you do before we next speak, and by when?"
11. You speak in a natural, conversational tone — no bullet points, no lists, no headers. Just warm, direct conversation.
12. You are British in your phrasing and cultural references.

TONE: ${coach.tone}

SESSION GOAL (what the coachee wants to achieve today): "${sessionGoal || "To be explored in the session"}"

Remember: the coachee should be doing 80% of the talking. Your job is to ask the question that unlocks the next level of thinking. Keep your responses concise and conversational — this is a voice conversation.`;
}

// ── Coaching Router ───────────────────────────────────────────────────────────

export const coachingRouter = router({
  // List all available coach personas
  listCoaches: publicProcedure.query(() => {
    return COACH_PERSONAS.map(c => ({
      id: c.id,
      name: c.name,
      title: c.title,
      style: c.style,
      tagline: c.tagline,
      description: c.description,
      specialisms: c.specialisms,
      openingQuestion: c.openingQuestion,
      accentColor: c.accentColor,
      gradient: c.gradient,
      avatar: c.avatar,
    }));
  }),

  // Send a message to the coach and get a response
  chat: publicProcedure
    .input(z.object({
      coachId: z.enum(["maya", "james", "priya", "marcus"]),
      sessionGoal: z.string().max(500).default(""),
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = buildCoachSystemPrompt(input.coachId, input.sessionGoal);

      const llmMessages = [
        { role: "system" as const, content: systemPrompt },
        ...input.messages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const result = await invokeLLM({ messages: llmMessages });
      const reply = result.choices?.[0]?.message?.content ?? "I'm here with you. Take your time.";

      return { reply: typeof reply === "string" ? reply : JSON.stringify(reply) };
    }),

  // Convert coach response to speech (ElevenLabs with coach-specific voice)
  speak: publicProcedure
    .input(z.object({
      text: z.string().min(1).max(1000),
      coachId: z.enum(["maya", "james", "priya", "marcus"]),
    }))
    .mutation(async ({ input }) => {
      const coach = COACH_PERSONAS.find(c => c.id === input.coachId);
      if (!coach) throw new Error("Unknown coach");

      // Truncate to keep TTS snappy
      const truncated = input.text.length > 500
        ? input.text.substring(0, 497) + "..."
        : input.text;

      // Try ElevenLabs first
      if (ENV.elevenLabsApiKey) {
        try {
          const audioBuffer = await elevenLabsTTS({
            text: truncated,
            voiceId: coach.voiceId,
            modelId: "eleven_turbo_v2_5",
          });
          return { audioBase64: audioBuffer.toString("base64"), mimeType: "audio/mpeg", provider: "elevenlabs" };
        } catch (err) {
          console.warn("[Coaching TTS] ElevenLabs failed, falling back:", (err as Error).message);
        }
      }

      // Fallback: built-in TTS
      const fallbackVoice = ["maya", "priya"].includes(input.coachId) ? "nova" : "onyx";
      const audioBuffer = await textToSpeech({ text: truncated, voice: fallbackVoice, speed: 1.0 });
      return { audioBase64: audioBuffer.toString("base64"), mimeType: "audio/mpeg", provider: "forge" };
    }),

  // Generate post-session coaching report
  generateReport: publicProcedure
    .input(z.object({
      coachId: z.enum(["maya", "james", "priya", "marcus"]),
      sessionGoal: z.string().max(500).default(""),
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })),
      durationSeconds: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const coach = COACH_PERSONAS.find(c => c.id === input.coachId)!;
      const userMessages = input.messages.filter(m => m.role === "user");
      const durationMins = Math.max(1, Math.round(input.durationSeconds / 60));

      if (userMessages.length === 0) {
        return null;
      }

      const conversationText = input.messages
        .map(m => `${m.role === "user" ? "Coachee" : coach.name}: ${m.content}`)
        .join("\n\n");

      const prompt = `You are ${coach.name}, a world-class coach. You have just completed a ${durationMins}-minute coaching session.

The coachee's stated goal was: "${input.sessionGoal || "not specified"}"

Here is the full conversation:
---
${conversationText}
---

Generate a rich, personalised post-session coaching report. Be specific — reference actual things the coachee said. Be warm but honest. This report will be read by the coachee immediately after the session.

Respond in JSON only.`;

      const result = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert coach writing a post-session report. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "coaching_report",
            strict: true,
            schema: {
              type: "object",
              properties: {
                sessionSummary: { type: "string" },
                keyInsight: { type: "string" },
                breakthroughMoment: { type: "string" },
                commitment: { type: "string" },
                strengthsObserved: { type: "array", items: { type: "string" } },
                growthEdge: { type: "string" },
                reflectionQuestions: { type: "array", items: { type: "string" } },
                nextSessionFocus: { type: "string" },
                coachingDepth: { type: "string", enum: ["surface", "exploratory", "transformative"] },
                coachNote: { type: "string" },
              },
              required: [
                "sessionSummary", "keyInsight", "breakthroughMoment", "commitment",
                "strengthsObserved", "growthEdge", "reflectionQuestions",
                "nextSessionFocus", "coachingDepth", "coachNote"
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = result.choices?.[0]?.message?.content;
      const report = typeof content === "string" ? JSON.parse(content) : content;

      return {
        ...report,
        coachName: coach.name,
        coachTitle: coach.title,
        sessionGoal: input.sessionGoal,
        durationMins,
        messageCount: userMessages.length,
        gradient: coach.gradient,
        accentColor: coach.accentColor,
      };
    }),
});
