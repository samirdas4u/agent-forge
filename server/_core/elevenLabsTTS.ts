import { ENV } from "./env";

/**
 * ElevenLabs voice IDs for each simulation persona.
 * These are stable, pre-built voices from the ElevenLabs voice library.
 *
 * Voice mapping strategy:
 * - Sales/cold call personas → confident, assertive voices
 * - Customer service → warm, calm voices
 * - Interview/HR personas → professional, measured voices
 * - Negotiation/executive personas → authoritative voices
 * - Default fallback → Rachel (neutral, clear female voice)
 */
export const ELEVENLABS_VOICES: Record<string, string> = {
  // Female voices
  "rachel":   "21m00Tcm4TlvDq8ikWAM", // Rachel — clear, neutral, professional (default female)
  "domi":     "AZnzlk1XvdvUeBnXmlld", // Domi — strong, confident female
  "bella":    "EXAVITQu4vr4xnSDxMaL", // Bella — warm, friendly female
  "elli":     "MF3mGyEYCl7XYWbV9V6O", // Elli — young, energetic female
  "grace":    "oWAxZDx7w5VEj9dCyTzz", // Grace — warm, Southern US female

  // Male voices
  "adam":     "pNInz6obpgDQGcFmaJgB", // Adam — deep, authoritative male (default male)
  "antoni":   "ErXwobaYiN019PkySvjV", // Antoni — well-rounded male
  "josh":     "TxGEqnHWrfWFTfGW9XjX", // Josh — young, expressive male
  "arnold":   "VR6AewLTigWG4xSOukaG", // Arnold — crisp, confident male
  "sam":      "yoZ06aMxZJJ28mfd3POQ", // Sam — raspy, authoritative male
};

/**
 * Maps scenario category + persona name keywords to a specific ElevenLabs voice ID.
 * Falls back to Rachel (female) or Adam (male) based on persona name heuristics.
 */
export function pickVoiceForPersona(
  aiPersona: string,
  category: string
): string {
  const name = (aiPersona ?? "").toLowerCase();
  const cat = (category ?? "").toLowerCase();

  // Named personas from seed scenarios
  if (name.includes("sarah") || name.includes("jennifer") || name.includes("priya")) {
    return ELEVENLABS_VOICES["bella"]; // Warm, professional female
  }
  if (name.includes("marcus") || name.includes("david") || name.includes("alex")) {
    return ELEVENLABS_VOICES["adam"]; // Deep, authoritative male
  }
  if (name.includes("sophie") || name.includes("nhs") || name.includes("nurse")) {
    return ELEVENLABS_VOICES["grace"]; // Warm, calm female (NHS/healthcare)
  }
  if (name.includes("board") || name.includes("cfo") || name.includes("ceo") || name.includes("cto")) {
    return ELEVENLABS_VOICES["arnold"]; // Crisp, executive male
  }

  // Category-based fallbacks
  if (cat === "customer_service") return ELEVENLABS_VOICES["bella"];
  if (cat === "interview") return ELEVENLABS_VOICES["adam"];
  if (cat === "negotiation") return ELEVENLABS_VOICES["arnold"];
  if (cat === "sales") return ELEVENLABS_VOICES["domi"];
  if (cat === "presentation") return ELEVENLABS_VOICES["rachel"];

  // Ultimate fallback — Rachel
  return ELEVENLABS_VOICES["rachel"];
}

/**
 * Convert text to speech using ElevenLabs API.
 * Returns MP3 audio as a Buffer.
 * Throws if the API key is missing or the request fails.
 */
export async function elevenLabsTTS(params: {
  text: string;
  voiceId: string;
  modelId?: string;
}): Promise<Buffer> {
  const { text, voiceId, modelId = "eleven_turbo_v2_5" } = params;
  const apiKey = ENV.elevenLabsApiKey;

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ElevenLabs TTS failed: ${response.status} ${response.statusText} — ${errorText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
