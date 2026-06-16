/**
 * Supported languages for Agent Forge multilingual simulation.
 *
 * Tier 1 — Chat, Email, Phone AND Video AI Interview (Tavus supported): 17 languages
 * Tier 2 — Chat, Email, Phone only (LLM-powered): 18 additional languages
 *
 * Total: 35 languages across Chat/Email/Phone; 17 for Video AI Interview
 */

export interface Language {
  code: string;       // BCP-47 language tag
  name: string;       // English name
  nativeName: string; // Name in the language itself
  flag: string;       // Emoji flag
  tier: 1 | 2;        // 1 = all channels incl. video; 2 = chat/email/phone only
  rtl?: boolean;      // Right-to-left script
}

export const LANGUAGES: Language[] = [
  // ── Tier 1: All channels including Tavus Video AI Interview ──────────────
  { code: "en", name: "English",    nativeName: "English",    flag: "🇬🇧", tier: 1 },
  { code: "es", name: "Spanish",    nativeName: "Español",    flag: "🇪🇸", tier: 1 },
  { code: "fr", name: "French",     nativeName: "Français",   flag: "🇫🇷", tier: 1 },
  { code: "de", name: "German",     nativeName: "Deutsch",    flag: "🇩🇪", tier: 1 },
  { code: "pt", name: "Portuguese", nativeName: "Português",  flag: "🇧🇷", tier: 1 },
  { code: "it", name: "Italian",    nativeName: "Italiano",   flag: "🇮🇹", tier: 1 },
  { code: "nl", name: "Dutch",      nativeName: "Nederlands", flag: "🇳🇱", tier: 1 },
  { code: "pl", name: "Polish",     nativeName: "Polski",     flag: "🇵🇱", tier: 1 },
  { code: "ja", name: "Japanese",   nativeName: "日本語",      flag: "🇯🇵", tier: 1 },
  { code: "ko", name: "Korean",     nativeName: "한국어",      flag: "🇰🇷", tier: 1 },
  { code: "zh", name: "Mandarin Chinese", nativeName: "普通话", flag: "🇨🇳", tier: 1 },
  { code: "ar", name: "Arabic",     nativeName: "العربية",    flag: "🇸🇦", tier: 1, rtl: true },
  { code: "hi", name: "Hindi",      nativeName: "हिन्दी",     flag: "🇮🇳", tier: 1 },
  { code: "ru", name: "Russian",    nativeName: "Русский",    flag: "🇷🇺", tier: 1 },
  { code: "tr", name: "Turkish",    nativeName: "Türkçe",     flag: "🇹🇷", tier: 1 },
  { code: "sv", name: "Swedish",    nativeName: "Svenska",    flag: "🇸🇪", tier: 1 },
  { code: "no", name: "Norwegian",  nativeName: "Norsk",      flag: "🇳🇴", tier: 1 },

  // ── Tier 2: Chat, Email & Phone only (LLM-powered, no Tavus video) ───────
  { code: "da", name: "Danish",     nativeName: "Dansk",      flag: "🇩🇰", tier: 2 },
  { code: "fi", name: "Finnish",    nativeName: "Suomi",      flag: "🇫🇮", tier: 2 },
  { code: "el", name: "Greek",      nativeName: "Ελληνικά",   flag: "🇬🇷", tier: 2 },
  { code: "he", name: "Hebrew",     nativeName: "עברית",      flag: "🇮🇱", tier: 2, rtl: true },
  { code: "ms", name: "Malay",      nativeName: "Bahasa Melayu", flag: "🇲🇾", tier: 2 },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", tier: 2 },
  { code: "th", name: "Thai",       nativeName: "ภาษาไทย",    flag: "🇹🇭", tier: 2 },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", tier: 2 },
  { code: "tl", name: "Filipino",   nativeName: "Filipino",   flag: "🇵🇭", tier: 2 },
  { code: "sw", name: "Swahili",    nativeName: "Kiswahili",  flag: "🇰🇪", tier: 2 },
  { code: "bn", name: "Bengali",    nativeName: "বাংলা",      flag: "🇧🇩", tier: 2 },
  { code: "ur", name: "Urdu",       nativeName: "اردو",       flag: "🇵🇰", tier: 2, rtl: true },
  { code: "pa", name: "Punjabi",    nativeName: "ਪੰਜਾਬੀ",     flag: "🇮🇳", tier: 2 },
  { code: "ta", name: "Tamil",      nativeName: "தமிழ்",      flag: "🇮🇳", tier: 2 },
  { code: "gu", name: "Gujarati",   nativeName: "ગુજરાતી",    flag: "🇮🇳", tier: 2 },
  { code: "mr", name: "Marathi",    nativeName: "मराठी",      flag: "🇮🇳", tier: 2 },
  { code: "uk", name: "Ukrainian",  nativeName: "Українська", flag: "🇺🇦", tier: 2 },
];

/** All 35 languages */
export const ALL_LANGUAGES = LANGUAGES;

/** 17 Tier-1 languages supported across all channels including Tavus Video */
export const VIDEO_LANGUAGES = LANGUAGES.filter((l) => l.tier === 1);

/** 35 languages supported in Chat, Email & Phone channels */
export const CHAT_LANGUAGES = LANGUAGES;

/** Default language */
export const DEFAULT_LANGUAGE = LANGUAGES[0]; // English

/** Look up a language by BCP-47 code */
export function getLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? DEFAULT_LANGUAGE;
}

/** Build a language instruction string for AI system prompts */
export function buildLanguageInstruction(code: string): string {
  const lang = getLanguage(code);
  if (code === "en") return ""; // No instruction needed for English
  return `\n\nIMPORTANT: This entire conversation must be conducted in ${lang.name} (${lang.nativeName}). All your responses, questions, and feedback must be written in ${lang.name}. Do not switch to English at any point, even if the user writes in English.`;
}
