import { describe, it, expect } from "vitest";
import { elevenLabsTTS, pickVoiceForPersona, ELEVENLABS_VOICES } from "./_core/elevenLabsTTS";

describe("ElevenLabs TTS integration", () => {
  it("pickVoiceForPersona returns correct voice for named personas", () => {
    expect(pickVoiceForPersona("Sarah Chen, VP of Operations", "sales")).toBe(ELEVENLABS_VOICES["bella"]);
    expect(pickVoiceForPersona("Marcus, angry customer", "customer_service")).toBe(ELEVENLABS_VOICES["adam"]);
    expect(pickVoiceForPersona("Jennifer Park, HR Director", "negotiation")).toBe(ELEVENLABS_VOICES["bella"]);
    expect(pickVoiceForPersona("David Kim, existing customer", "sales")).toBe(ELEVENLABS_VOICES["adam"]);
    expect(pickVoiceForPersona("Sophie, NHS Manager", "customer_service")).toBe(ELEVENLABS_VOICES["grace"]);
  });

  it("pickVoiceForPersona falls back to category-based voice when name is unknown", () => {
    expect(pickVoiceForPersona("Unknown Person", "interview")).toBe(ELEVENLABS_VOICES["adam"]);
    expect(pickVoiceForPersona("Unknown Person", "negotiation")).toBe(ELEVENLABS_VOICES["arnold"]);
    expect(pickVoiceForPersona("Unknown Person", "customer_service")).toBe(ELEVENLABS_VOICES["bella"]);
    expect(pickVoiceForPersona("Unknown Person", "sales")).toBe(ELEVENLABS_VOICES["domi"]);
  });

  it("pickVoiceForPersona falls back to Rachel for unknown persona and category", () => {
    expect(pickVoiceForPersona("", "")).toBe(ELEVENLABS_VOICES["rachel"]);
    expect(pickVoiceForPersona("Unknown", "unknown_category")).toBe(ELEVENLABS_VOICES["rachel"]);
  });

  it("elevenLabsTTS returns MP3 audio buffer for short text", async () => {
    // This test makes a real API call — requires ELEVENLABS_API_KEY to be set
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.warn("Skipping live ElevenLabs test: ELEVENLABS_API_KEY not set");
      return;
    }
    const voiceId = ELEVENLABS_VOICES["rachel"];
    const buffer = await elevenLabsTTS({ text: "Hello, this is a test.", voiceId });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000); // MP3 audio should be at least 1KB
  }, 15000);
});
