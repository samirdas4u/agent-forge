import { ENV } from "./env";

export type TTSVoice =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";

export interface TTSParams {
  text: string;
  voice?: TTSVoice;
  speed?: number; // 0.25 – 4.0, default 1.0
}

/**
 * Convert text to speech via the Forge audio/speech endpoint.
 * Returns the raw MP3 audio as a Buffer.
 */
export async function textToSpeech({
  text,
  voice = "nova",
  speed = 1.0,
}: TTSParams): Promise<Buffer> {
  const baseUrl = ENV.forgeApiUrl?.replace(/\/$/, "") || "https://forge.manus.im";
  const url = `${baseUrl}/v1/audio/speech`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice,
      speed,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `TTS request failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
