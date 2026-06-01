import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import {
  ArrowLeft, Brain, CheckCircle2, ChevronRight, Clock, Lightbulb,
  Mic, MicOff, PhoneOff, Sparkles, Star, Target, TrendingUp, Volume2, X, Heart, Zap, BookOpen
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type CoachId = "maya" | "james" | "priya" | "marcus";
type CallState = "idle" | "listening" | "processing" | "thinking" | "speaking";
type PageState = "picker" | "goal" | "session" | "report";

interface Message { role: "user" | "assistant"; content: string; }

interface CoachPersona {
  id: CoachId;
  name: string;
  title: string;
  style: string;
  tagline: string;
  description: string;
  specialisms: readonly string[];
  openingQuestion: string;
  accentColor: string;
  gradient: string;
  avatar: string;
}

interface CoachingReport {
  sessionSummary: string;
  keyInsight: string;
  breakthroughMoment: string;
  commitment: string;
  strengthsObserved: string[];
  growthEdge: string;
  reflectionQuestions: string[];
  nextSessionFocus: string;
  coachingDepth: "surface" | "exploratory" | "transformative";
  coachNote: string;
  coachName: string;
  coachTitle: string;
  sessionGoal: string;
  durationMins: number;
  messageCount: number;
  gradient: string;
  accentColor: string;
}

// ── Accent colour helpers ─────────────────────────────────────────────────────

const ACCENT_STYLES: Record<string, { orb: string; ring: string; badge: string; text: string; bg: string }> = {
  violet: {
    orb:   "from-violet-500 via-purple-500 to-indigo-600",
    ring:  "border-violet-400/40",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    text:  "text-violet-400",
    bg:    "bg-violet-500/10",
  },
  blue: {
    orb:   "from-blue-500 via-cyan-500 to-sky-600",
    ring:  "border-blue-400/40",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    text:  "text-blue-400",
    bg:    "bg-blue-500/10",
  },
  emerald: {
    orb:   "from-emerald-500 via-teal-500 to-green-600",
    ring:  "border-emerald-400/40",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    text:  "text-emerald-400",
    bg:    "bg-emerald-500/10",
  },
  orange: {
    orb:   "from-orange-500 via-red-500 to-rose-600",
    ring:  "border-orange-400/40",
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    text:  "text-orange-400",
    bg:    "bg-orange-500/10",
  },
};

// ── Call state labels ─────────────────────────────────────────────────────────

const CALL_STATE_LABELS: Record<CallState, string> = {
  idle:       "Tap the mic to speak",
  listening:  "Listening…",
  processing: "Understanding you…",
  thinking:   `Your coach is thinking…`,
  speaking:   "Your coach is speaking…",
};

// ── Depth badge ───────────────────────────────────────────────────────────────

const DEPTH_LABELS: Record<string, { label: string; color: string }> = {
  surface:       { label: "Surface-level",    color: "bg-slate-500/20 text-slate-300" },
  exploratory:   { label: "Exploratory",      color: "bg-blue-500/20 text-blue-300" },
  transformative:{ label: "Transformative",   color: "bg-violet-500/20 text-violet-300" },
};

// ── Session Arc Phases ──────────────────────────────────────────────────────

const SESSION_ARC = [
  { id: "checkin",     label: "Check-in" },
  { id: "exploration", label: "Exploration" },
  { id: "insight",     label: "Insight" },
  { id: "action",      label: "Action" },
  { id: "close",       label: "Close" },
] as const;

function getArcPhase(messageCount: number): number {
  if (messageCount < 4)  return 0;
  if (messageCount < 8)  return 1;
  if (messageCount < 12) return 2;
  if (messageCount < 16) return 3;
  return 4;
}

// ── Waveform Bars ─────────────────────────────────────────────────────────────

function WaveformBars({ active, colorClass }: { active: boolean; colorClass: string }) {
  const heights = [0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 0.6, 1.0, 0.7, 0.4, 0.8, 0.6];
  return (
    <div className="flex items-center gap-[3px] h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all duration-300 ${colorClass} ${active ? "opacity-90" : "opacity-20"}`}
          style={{
            height: active ? `${Math.round(h * 26 + 4)}px` : "4px",
            animation: active ? `waveBar ${0.55 + (i % 4) * 0.12}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Coaching() {
  const [pageState, setPageState] = useState<PageState>("picker");
  const [selectedCoach, setSelectedCoach] = useState<CoachPersona | null>(null);
  const [sessionGoal, setSessionGoal] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [callState, setCallState] = useState<CallState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [report, setReport] = useState<CoachingReport | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callActiveRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // tRPC mutations
  const chatMutation = trpc.coaching.chat.useMutation();
  const speakMutation = trpc.coaching.speak.useMutation();
  const reportMutation = trpc.coaching.generateReport.useMutation();
  const { data: coaches } = trpc.coaching.listCoaches.useQuery();

  // ── Session timer ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (pageState === "session") {
      sessionStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pageState]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── TTS playback ────────────────────────────────────────────────────────────

  const playAudio = useCallback((base64: string, mimeType: string, onEnd?: () => void) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(`data:${mimeType};base64,${base64}`);
    audioRef.current = audio;
    audio.onended = () => {
      setCallState("listening");
      onEnd?.();
      startListening();
    };
    audio.onerror = () => {
      setCallState("listening");
      startListening();
    };
    audio.play().catch(() => {
      setCallState("listening");
      startListening();
    });
  }, []);

  // ── Send message to coach ───────────────────────────────────────────────────

  const sendToCoach = useCallback(async (userText: string) => {
    if (!selectedCoach || !userText.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setCallState("thinking");

    try {
      const { reply } = await chatMutation.mutateAsync({
        coachId: selectedCoach.id,
        sessionGoal,
        messages: newMessages,
      });

      const withReply: Message[] = [...newMessages, { role: "assistant", content: reply }];
      setMessages(withReply);
      setCallState("speaking");

      // Speak the reply
      const ttsResult = await speakMutation.mutateAsync({
        text: reply,
        coachId: selectedCoach.id,
      });

      playAudio(ttsResult.audioBase64, ttsResult.mimeType);
    } catch (err) {
      console.error("Coach chat error:", err);
      toast.error("Connection issue — please try again");
      setCallState("listening");
      startListening();
    }
  }, [selectedCoach, sessionGoal, messages, chatMutation, speakMutation, playAudio]);

  // ── Web Speech API ──────────────────────────────────────────────────────────

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
      speechRecognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!callActiveRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice not supported in this browser. Try Chrome.");
      return;
    }

    stopListening();
    setLiveTranscript("");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";
    speechRecognitionRef.current = recognition;

    let finalText = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) { finalText += t; }
        else { interim = t; }
      }
      setLiveTranscript(finalText + interim);
      setCallState("listening");

      // Reset silence timer
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        const toSend = finalText.trim();
        if (toSend.length > 2) {
          setCallState("processing");
          setLiveTranscript("");
          stopListening();
          sendToCoach(toSend);
        }
      }, 1000);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.warn("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      if (callActiveRef.current && callState === "listening") {
        setTimeout(() => { if (callActiveRef.current) startListening(); }, 200);
      }
    };

    setCallState("listening");
    recognition.start();
  }, [stopListening, sendToCoach, callState]);

  // ── Start session ───────────────────────────────────────────────────────────

  const startSession = useCallback(async () => {
    if (!selectedCoach) return;
    setPageState("session");
    setMessages([]);
    callActiveRef.current = true;

    // Coach sends opening message first
    setCallState("thinking");
    try {
      const openingMsg = selectedCoach.openingQuestion;
      const initialMessages: Message[] = [{ role: "assistant", content: openingMsg }];
      setMessages(initialMessages);
      setCallState("speaking");

      const ttsResult = await speakMutation.mutateAsync({
        text: openingMsg,
        coachId: selectedCoach.id,
      });
      playAudio(ttsResult.audioBase64, ttsResult.mimeType);
    } catch {
      setCallState("listening");
      startListening();
    }
  }, [selectedCoach, speakMutation, playAudio, startListening]);

  // ── End session ─────────────────────────────────────────────────────────────

  const endSession = useCallback(async () => {
    callActiveRef.current = false;
    stopListening();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (timerRef.current) clearInterval(timerRef.current);
    setShowEndConfirm(false);
    setPageState("report");

    try {
      const result = await reportMutation.mutateAsync({
        coachId: selectedCoach!.id,
        sessionGoal,
        messages,
        durationSeconds: sessionTime,
      });
      if (result) setReport(result as CoachingReport);
    } catch (err) {
      console.error("Report generation error:", err);
    }
  }, [selectedCoach, sessionGoal, messages, sessionTime, stopListening, reportMutation]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      callActiveRef.current = false;
      stopListening();
      if (audioRef.current) { audioRef.current.pause(); }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopListening]);

  const accent = selectedCoach ? ACCENT_STYLES[selectedCoach.accentColor] : ACCENT_STYLES.violet;
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── PICKER ──────────────────────────────────────────────────────────────────

  if (pageState === "picker") {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0d0f14] text-white">
          {/* Header */}
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-white">AI Coaching</h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">Beta</span>
                  </div>
                  <p className="text-xs text-slate-500">1:1 voice coaching with AI personas grounded in real coaching frameworks</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-10">
            {/* Intro */}
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Choose your coach</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
                Each coach has a distinct style, framework, and focus. Pick the one that matches what you need right now — you can always come back and work with a different coach.
              </p>
            </div>

            {/* Coach cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(coaches ?? []).map((coach) => {
                const a = ACCENT_STYLES[coach.accentColor] ?? ACCENT_STYLES.violet;
                return (
                  <button
                    key={coach.id}
                    onClick={() => { setSelectedCoach(coach as CoachPersona); setPageState("goal"); }}
                    className="group text-left bg-[#13151c] border border-white/[0.07] rounded-2xl p-6 hover:border-white/20 hover:bg-[#16181f] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30"
                  >
                    {/* Coach avatar + name */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${coach.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
                        {coach.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base">{coach.name}</h3>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${a.badge}`}>
                            {coach.style.split("/")[0].trim()}
                          </span>
                        </div>
                        <p className={`text-xs font-medium mt-0.5 ${a.text}`}>{coach.title}</p>
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-sm font-semibold text-white/90 mb-2 italic">"{coach.tagline}"</p>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{coach.description}</p>

                    {/* Specialisms */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {coach.specialisms.slice(0, 3).map(s => (
                        <span key={s} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${a.bg} ${a.text}`}>{s}</span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${a.text} group-hover:gap-2.5 transition-all`}>
                      Work with {coach.name.split(" ")[0]} <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* What to expect */}
            <div className="mt-12 bg-[#13151c] border border-white/[0.07] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" /> What to expect
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Mic, title: "Voice-first", desc: "Speak naturally — your coach listens and responds in real time. No typing required." },
                  { icon: Brain, title: "Real frameworks", desc: "GROW, Socratic questioning, Clean Language — grounded in evidence-based coaching practice." },
                  { icon: BookOpen, title: "Post-session report", desc: "A personalised coaching report with your key insight, commitment, and reflection questions." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white mb-1">{title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── GOAL SETTING ────────────────────────────────────────────────────────────

  if (pageState === "goal" && selectedCoach) {
    const a = ACCENT_STYLES[selectedCoach.accentColor];
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0d0f14] text-white flex flex-col">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <button onClick={() => setPageState("picker")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to coaches
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg">
              {/* Coach summary */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedCoach.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                  {selectedCoach.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCoach.name}</h2>
                  <p className={`text-sm ${a.text}`}>{selectedCoach.title}</p>
                </div>
              </div>

              {/* Goal input */}
              <div className="bg-[#13151c] border border-white/[0.07] rounded-2xl p-6 mb-6">
                <label className="block text-sm font-semibold text-white mb-2">
                  What would you like to focus on today?
                </label>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  This helps {selectedCoach.name.split(" ")[0]} tailor the session to you. Be as specific or as open as you like — even "I'm not sure yet" is a valid answer.
                </p>
                <textarea
                  value={sessionGoal}
                  onChange={e => setSessionGoal(e.target.value)}
                  placeholder={`e.g. "I want to think through whether to take this promotion offer" or "I'm feeling stuck and not sure why"`}
                  rows={3}
                  className="w-full bg-[#0d0f14] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/20 resize-none"
                />
              </div>

              {/* Opening question preview */}
              <div className={`${a.bg} border ${a.ring} rounded-xl p-4 mb-6`}>
                <p className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">How {selectedCoach.name.split(" ")[0]} will open</p>
                <p className={`text-sm italic ${a.text}`}>"{selectedCoach.openingQuestion}"</p>
              </div>

              <button
                onClick={startSession}
                className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${selectedCoach.gradient} hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg`}
              >
                <Mic className="w-4 h-4" />
                Start coaching session
              </button>
              <p className="text-center text-xs text-slate-600 mt-3">Make sure your microphone is enabled</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // -- SESSION --

  if (pageState === "session" && selectedCoach) {
    const a = ACCENT_STYLES[selectedCoach.accentColor];
    const isOrbActive = callState === "listening" || callState === "speaking" || callState === "thinking";
    const arcPhase = getArcPhase(messages.length);

    const waveColorMap: Record<string, string> = {
      violet:  "bg-violet-400",
      blue:    "bg-blue-400",
      emerald: "bg-emerald-400",
      orange:  "bg-orange-400",
    };
    const waveColorClass = waveColorMap[selectedCoach.accentColor] ?? "bg-violet-400";

    return (
      <AppLayout fullscreen>
        <div className="min-h-screen bg-[#0d0f14] text-white flex flex-col">

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${selectedCoach.gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {selectedCoach.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{selectedCoach.name}</p>
                <p className={`text-[11px] ${a.text}`}>{selectedCoach.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5" />{fmtTime(sessionTime)}
              </div>
              <button
                onClick={() => setShowEndConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors bg-white/[0.04] hover:bg-red-500/10 px-3 py-1.5 rounded-lg"
              >
                <PhoneOff className="w-3.5 h-3.5" /> End session
              </button>
            </div>
          </div>

          {/* Session arc progress */}
          <div className="px-5 py-2.5 border-b border-white/[0.04] bg-[#0a0c11]">
            <div className="flex items-start gap-1 max-w-2xl mx-auto">
              {SESSION_ARC.map((phase, idx) => {
                const isActive = idx === arcPhase;
                const isDone   = idx < arcPhase;
                return (
                  <div key={phase.id} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`h-0.5 w-full rounded-full transition-all duration-700 ${
                      isDone   ? `bg-gradient-to-r ${selectedCoach.gradient}` :
                      isActive ? `bg-gradient-to-r ${selectedCoach.gradient} opacity-50` :
                      "bg-white/[0.07]"
                    }`} />
                    <span className={`text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                      isActive ? a.text : isDone ? "text-slate-600" : "text-slate-700"
                    }`}>{phase.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Conversation panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${selectedCoach.gradient} flex items-center justify-center text-white text-xs font-bold mr-2.5 mt-1 flex-shrink-0`}>
                        {selectedCoach.avatar[0]}
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-white/[0.07] text-slate-200 rounded-br-sm border border-white/[0.06]"
                        : `${a.bg} border ${a.ring} text-white rounded-bl-sm`
                    }`}>
                      {msg.role === "assistant" && (
                        <p className={`text-[9px] font-bold uppercase tracking-wider ${a.text} mb-1.5 opacity-60`}>
                          {selectedCoach.name.split(" ")[0]}
                        </p>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Thinking indicator */}
                {(callState === "thinking" || callState === "processing") && (
                  <div className="flex justify-start">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${selectedCoach.gradient} flex items-center justify-center text-white text-xs font-bold mr-2.5 mt-1 flex-shrink-0`}>
                      {selectedCoach.avatar[0]}
                    </div>
                    <div className={`${a.bg} border ${a.ring} rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1.5`}>
                      {[0, 1, 2].map(d => (
                        <div
                          key={d}
                          className={`w-2 h-2 rounded-full ${waveColorClass}`}
                          style={{ animation: "thinkDot 1.2s ease-in-out infinite", animationDelay: `${d * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Live transcript */}
                {liveTranscript && (
                  <div className="flex justify-end">
                    <div className="max-w-[78%] rounded-2xl px-4 py-3 text-sm bg-white/[0.03] text-slate-500 italic border border-white/[0.05] rounded-br-sm">
                      {liveTranscript}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Voice orb + waveform */}
              <div className="border-t border-white/[0.06] px-5 py-5 bg-[#0a0c11]">
                <div className="flex flex-col items-center gap-3">

                  {/* Waveform */}
                  <div className="h-8 flex items-center justify-center">
                    {callState === "speaking" && (
                      <WaveformBars active={true} colorClass={waveColorClass} />
                    )}
                    {callState === "listening" && (
                      <WaveformBars active={!!liveTranscript} colorClass="bg-slate-400" />
                    )}
                    {(callState === "thinking" || callState === "processing") && (
                      <p className={`text-xs font-medium ${a.text} animate-pulse`}>
                        {selectedCoach.name.split(" ")[0]} is reflecting…
                      </p>
                    )}
                    {callState === "idle" && (
                      <p className="text-xs text-slate-600">Tap the orb to begin</p>
                    )}
                  </div>

                  {/* Orb */}
                  <div className="relative flex items-center justify-center">
                    {callState === "listening" && (
                      <>
                        <div className={`absolute w-28 h-28 rounded-full bg-gradient-to-br ${selectedCoach.gradient} opacity-[0.08] animate-ping`} style={{ animationDuration: "1.8s" }} />
                        <div className={`absolute w-24 h-24 rounded-full bg-gradient-to-br ${selectedCoach.gradient} opacity-[0.12] animate-pulse`} />
                      </>
                    )}
                    {callState === "speaking" && (
                      <div className={`absolute w-28 h-28 rounded-full bg-gradient-to-br ${selectedCoach.gradient} opacity-[0.12] animate-pulse`} style={{ animationDuration: "0.8s" }} />
                    )}

                    <button
                      onClick={() => { if (callState === "idle") { callActiveRef.current = true; startListening(); } }}
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${selectedCoach.gradient} flex items-center justify-center shadow-2xl transition-all duration-300 ${
                        isOrbActive ? "scale-110" : "scale-100 hover:scale-105"
                      }`}
                    >
                      {callState === "listening" ? (
                        <Mic className="w-7 h-7 text-white" />
                      ) : callState === "speaking" ? (
                        <Volume2 className="w-7 h-7 text-white" />
                      ) : callState === "thinking" || callState === "processing" ? (
                        <Sparkles className="w-6 h-6 text-white" style={{ animation: "spin 2.5s linear infinite" }} />
                      ) : (
                        <Mic className="w-7 h-7 text-white opacity-70" />
                      )}
                    </button>
                  </div>

                  {/* State label */}
                  <p className="text-xs text-slate-500 font-medium tracking-wide">
                    {callState === "listening" && liveTranscript ? "Speaking…" :
                     callState === "listening" ? "Listening — speak naturally" :
                     callState === "speaking"  ? `${selectedCoach.name.split(" ")[0]} is speaking` :
                     callState === "thinking" || callState === "processing" ? "" :
                     "Tap the orb to speak"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* End session confirm */}
          {showEndConfirm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div className="bg-[#13151c] border border-white/[0.1] rounded-2xl p-6 max-w-sm w-full">
                <h3 className="text-base font-bold text-white mb-2">End this session?</h3>
                <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                  {messages.filter(m => m.role === "user").length > 0
                    ? "Your coaching report will be generated automatically."
                    : "The session hasn't really started yet — are you sure?"}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-slate-300 text-sm font-semibold hover:bg-white/[0.04] transition-colors">
                    Continue
                  </button>
                  <button onClick={endSession} className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold hover:bg-red-500/30 transition-colors">
                    End & get report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // ── REPORT ──────────────────────────────────────────────────────────────────

  if (pageState === "report" && selectedCoach) {
    const a = ACCENT_STYLES[selectedCoach.accentColor];
    const depth = report ? DEPTH_LABELS[report.coachingDepth] : null;

    return (
      <AppLayout>
        <div className="min-h-screen bg-[#0d0f14] text-white">
          <div className="max-w-2xl mx-auto px-5 py-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedCoach.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto mb-4`}>
                {selectedCoach.avatar}
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Coaching Report</h1>
              <p className={`text-sm ${a.text}`}>{selectedCoach.name} · {selectedCoach.title}</p>
              {report && (
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="text-xs text-slate-500">{report.durationMins} min session</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-500">{report.messageCount} exchanges</span>
                  {depth && (
                    <>
                      <span className="text-slate-700">·</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${depth.color}`}>{depth.label}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {reportMutation.isPending && (
              <div className="text-center py-16">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedCoach.gradient} flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-slate-400 text-sm">Generating your coaching report…</p>
                <p className="text-slate-600 text-xs mt-1">This takes about 10 seconds</p>
              </div>
            )}

            {report && (
              <div className="space-y-5">
                {/* Coach's personal note */}
                <div className={`${a.bg} border ${a.ring} rounded-2xl p-5`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${a.text} mb-2`}>A note from {report.coachName.split(" ")[0]}</p>
                  <p className="text-sm text-white/90 leading-relaxed italic">"{report.coachNote}"</p>
                </div>

                {/* Session summary */}
                <div className="bg-[#13151c] border border-white/[0.07] rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Session Summary</h3>
                  <p className="text-sm text-white/80 leading-relaxed">{report.sessionSummary}</p>
                </div>

                {/* Key insight + breakthrough */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#13151c] border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Insight</h3>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{report.keyInsight}</p>
                  </div>
                  <div className="bg-[#13151c] border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Breakthrough Moment</h3>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{report.breakthroughMoment}</p>
                  </div>
                </div>

                {/* Commitment */}
                <div className="bg-[#13151c] border border-emerald-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Commitment</h3>
                  </div>
                  <p className="text-sm text-white font-medium leading-relaxed">{report.commitment}</p>
                </div>

                {/* Strengths + growth edge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#13151c] border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-violet-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Strengths Observed</h3>
                    </div>
                    <ul className="space-y-2">
                      {report.strengthsObserved.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-gradient-to-br ${selectedCoach.gradient}`} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#13151c] border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Growth Edge</h3>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{report.growthEdge}</p>
                  </div>
                </div>

                {/* Reflection questions */}
                <div className="bg-[#13151c] border border-white/[0.07] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Reflection Questions</h3>
                    <span className="text-[10px] text-slate-600">Sit with these before your next session</span>
                  </div>
                  <ol className="space-y-3">
                    {report.reflectionQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                        <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${selectedCoach.gradient} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5`}>{i + 1}</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Next session focus */}
                <div className="bg-[#13151c] border border-white/[0.07] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recommended Next Session Focus</h3>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{report.nextSessionFocus}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => { setMessages([]); setSessionGoal(""); setPageState("goal"); }}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${selectedCoach.gradient} hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                  >
                    <Mic className="w-4 h-4" /> Start another session
                  </button>
                  <button
                    onClick={() => { setSelectedCoach(null); setMessages([]); setSessionGoal(""); setReport(null); setPageState("picker"); }}
                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-300 border border-white/[0.1] hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-2"
                  >
                    <Brain className="w-4 h-4" /> Try a different coach
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  return null;
}
