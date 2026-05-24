import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  AlertCircle, CheckCircle2, ChevronRight, Clock,
  Lightbulb, MessageSquare, Mic, MicOff, Send, Sparkles, X, Zap
} from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import AppLayout from "@/components/AppLayout";

interface Props { sessionId: number; }

interface FeedbackData {
  score: number;
  feedback: string;
  dimensions: {
    clarity: number;
    empathy: number;
    persuasiveness: number;
    professionalism: number;
    objection_handling?: number;
  };
}

const DIMENSIONS = [
  { key: "clarity", label: "Clarity" },
  { key: "empathy", label: "Empathy" },
  { key: "persuasiveness", label: "Persuasiveness" },
  { key: "professionalism", label: "Professionalism" },
  { key: "objection_handling", label: "Objection Handling" },
];

const TIPS = [
  "Use the person's name to build rapport",
  "Ask open-ended questions to uncover needs",
  "Acknowledge concerns before responding",
  "Be specific — avoid vague promises",
  "Summarise what you've heard before replying",
];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  sales:            { bg: "oklch(0.95 0.04 240)", color: "oklch(0.4 0.18 240)" },
  customer_service: { bg: "oklch(0.95 0.05 300)", color: "oklch(0.4 0.18 300)" },
  interview:        { bg: "oklch(0.95 0.05 200)", color: "oklch(0.4 0.15 200)" },
  negotiation:      { bg: "oklch(0.97 0.06 80)",  color: "oklch(0.45 0.14 60)" },
  presentation:     { bg: "oklch(0.97 0.04 350)", color: "oklch(0.45 0.14 350)" },
};

function DimBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80
    ? "oklch(0.45 0.14 160)"
    : value >= 60
    ? "oklch(0.62 0.18 47)"
    : "oklch(0.58 0.22 27)";
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function SimulationSession({ sessionId }: Props) {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading, refetch } = trpc.sessions.get.useQuery(
    { sessionId },
    { refetchInterval: false }
  );

  const sendMessage = trpc.sessions.sendMessage.useMutation({
    onMutate: () => setIsTyping(true),
    onSuccess: (result) => {
      setIsTyping(false);
      if (result.feedback) setLatestFeedback(result.feedback as FeedbackData);
      refetch();
    },
    onError: () => {
      setIsTyping(false);
      toast.error("Failed to send message. Please try again.");
    },
  });

  const completeSession = trpc.sessions.complete.useMutation({
    onSuccess: () => navigate(`/session/${sessionId}/result`),
    onError: () => toast.error("Failed to complete session."),
  });

  const abandonSession = trpc.sessions.abandon.useMutation({
    onSuccess: () => navigate("/simulate"),
  });

  const transcribeVoice = trpc.sessions.transcribeVoice.useMutation({
    onSuccess: (result) => {
      setIsTranscribing(false);
      if (result.text) {
        setInput((prev) => (prev ? prev + " " + result.text : result.text));
        toast.success("Voice transcribed — review and send!");
      }
    },
    onError: () => {
      setIsTranscribing(false);
      toast.error("Transcription failed. Please try again.");
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // Check size (16MB limit)
        if (blob.size > 16 * 1024 * 1024) {
          toast.error("Recording too long. Please keep it under 2 minutes.");
          return;
        }
        setIsTranscribing(true);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          transcribeVoice.mutate({ audioBase64: base64, mimeType: "audio/webm" });
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages, isTyping]);

  useEffect(() => {
    const t = setInterval(() => setSessionTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;
    const content = input.trim();
    setInput("");
    sendMessage.mutate({ sessionId, content });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (isLoading) {
    return (
      <AppLayout fullscreen>
        <div className="h-full flex items-center justify-center bg-background">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.51 0.23 264)" }}>
              <Zap size={15} color="white" className="animate-pulse" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Loading session...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout fullscreen>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Session not found.</p>
        </div>
      </AppLayout>
    );
  }

  const { session, messages, scenario } = data;
  const isActive = session.status === "active";
  const userMessageCount = messages.filter((m: any) => m.role === "user").length;
  const catStyle = CATEGORY_COLORS[scenario?.category ?? ""] ?? { bg: "oklch(0.95 0.05 264)", color: "oklch(0.51 0.23 264)" };

  return (
    <AppLayout fullscreen>
      {/* 3-panel layout: context | chat | scoring */}
      <div className="flex h-full overflow-hidden">

        {/* ── LEFT PANEL: Scenario context ── */}
        <div className="hidden lg:flex w-72 xl:w-80 flex-col border-r border-border bg-white overflow-y-auto shrink-0">
          {/* Panel header */}
          <div className="px-4 py-3.5 border-b border-border">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Scenario</div>
            <h2 className="text-sm font-bold text-foreground leading-snug">{scenario?.title}</h2>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {/* Category + difficulty */}
            <div className="flex gap-1.5 flex-wrap">
              <span
                className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide"
                style={{ background: catStyle.bg, color: catStyle.color }}
              >
                {scenario?.category?.replace("_", " ")}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide"
                style={{
                  background: scenario?.difficulty === "beginner" ? "oklch(0.96 0.06 160)" : scenario?.difficulty === "advanced" ? "oklch(0.97 0.04 25)" : "oklch(0.97 0.06 80)",
                  color: scenario?.difficulty === "beginner" ? "oklch(0.38 0.12 160)" : scenario?.difficulty === "advanced" ? "oklch(0.5 0.18 25)" : "oklch(0.45 0.14 60)",
                }}
              >
                {scenario?.difficulty}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">{scenario?.description}</p>

            {/* AI Persona card */}
            {scenario?.aiPersona && (
              <div className="rounded-xl border border-border p-3" style={{ background: "oklch(0.97 0.005 264)" }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">AI Persona</div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: "oklch(0.51 0.23 264)", color: "white" }}
                  >
                    {scenario.aiPersona[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{scenario.aiPersona.split(",")[0]}</div>
                    {scenario.aiPersona.includes(",") && (
                      <div className="text-[10px] text-muted-foreground">{scenario.aiPersona.split(",").slice(1).join(",").trim()}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Objective */}
            {scenario?.systemPrompt && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Your Objective</div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                  {scenario.systemPrompt.replace(/^You are[\s\S]*?\n/, "").substring(0, 200)}...
                </p>
              </div>
            )}

            {/* Session timer */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "oklch(0.97 0.005 264)" }}>
              <Clock size={13} style={{ color: "oklch(0.51 0.23 264)" }} />
              <span className="text-xs font-semibold text-foreground tabular-nums">{formatTime(sessionTime)}</span>
              <span className="text-xs text-muted-foreground ml-auto">{userMessageCount} messages</span>
            </div>

            {/* Tips */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb size={12} style={{ color: "oklch(0.62 0.18 47)" }} />
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coaching Tips</div>
              </div>
              <ul className="space-y-1.5">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <ChevronRight size={11} className="shrink-0 mt-0.5" style={{ color: "oklch(0.51 0.23 264)" }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* End session button */}
          {isActive && (
            <div className="p-4 border-t border-border">
              <button
                onClick={() => setShowEndConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "oklch(0.45 0.14 160)" }}
              >
                <CheckCircle2 size={13} />
                End & Get Score
              </button>
            </div>
          )}
        </div>

        {/* ── CENTER PANEL: Chat ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border shrink-0">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground truncate">{scenario?.title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                {scenario?.aiPersona && (
                  <span className="text-xs text-muted-foreground">with {scenario.aiPersona.split(",")[0]}</span>
                )}
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground tabular-nums">{formatTime(sessionTime)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isActive && (
                <>
                  <button
                    onClick={() => setShowEndConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-gray-50 transition-colors"
                  >
                    <CheckCircle2 size={12} style={{ color: "oklch(0.45 0.14 160)" }} />
                    <span className="hidden sm:inline">End & Score</span>
                    <span className="sm:hidden">End</span>
                  </button>
                  <button
                    onClick={() => abandonSession.mutate({ sessionId })}
                    className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Abandon session"
                  >
                    <X size={15} className="text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "oklch(0.985 0.002 264)" }}>
            {messages.length === 0 && (
              <div className="flex justify-center pt-4">
                <div className="bg-white border border-border rounded-2xl p-5 max-w-sm text-center shadow-sm">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: "oklch(0.95 0.05 264)" }}
                  >
                    <MessageSquare size={18} style={{ color: "oklch(0.51 0.23 264)" }} />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">Ready to begin</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Type your opening message to start the conversation with{" "}
                    <strong>{scenario?.aiPersona?.split(",")[0] ?? "the AI"}</strong>.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: "oklch(0.51 0.23 264)", color: "white" }}
                  >
                    {scenario?.aiPersona?.[0]?.toUpperCase() ?? "A"}
                  </div>
                )}
                <div className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`} style={{ maxWidth: "76%" }}>
                  {msg.role === "assistant" ? (
                    <div className="chat-bubble-ai">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    <div className="chat-bubble-user">{msg.content}</div>
                  )}
                  {/* Inline feedback for user messages */}
                  {msg.feedback && msg.role === "user" && (
                    <div
                      className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs leading-relaxed"
                      style={{ background: "oklch(0.97 0.05 47 / 0.6)", border: "1px solid oklch(0.9 0.06 47)", maxWidth: "100%" }}
                    >
                      <Sparkles size={11} style={{ color: "oklch(0.62 0.18 47)", flexShrink: 0, marginTop: 1 }} />
                      <span style={{ color: "oklch(0.35 0.1 47)" }}>{msg.feedback}</span>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: "oklch(0.91 0.012 264)", color: "oklch(0.35 0.08 264)" }}
                  >
                    Y
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "oklch(0.51 0.23 264)", color: "white" }}
                >
                  {scenario?.aiPersona?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div className="chat-bubble-ai flex items-center gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {isActive ? (
            <div className="shrink-0 bg-white border-t border-border p-3">
              {/* Recording indicator */}
              {isRecording && (
                <div
                  className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "oklch(0.97 0.04 25)", border: "1px solid oklch(0.9 0.06 25)" }}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span style={{ color: "oklch(0.5 0.18 25)" }}>Recording… {Math.floor(recordingTime / 60).toString().padStart(2, "0")}:{(recordingTime % 60).toString().padStart(2, "0")}</span>
                  <span className="ml-auto text-muted-foreground font-normal">Click mic to stop</span>
                </div>
              )}
              {isTranscribing && (
                <div
                  className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: "oklch(0.95 0.05 264 / 0.5)", border: "1px solid oklch(0.88 0.08 264)" }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "oklch(0.51 0.23 264)" }} />
                  <span style={{ color: "oklch(0.38 0.18 264)" }}>Transcribing your voice…</span>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRecording ? "Recording… click mic to stop" : "Type your response or use the mic…"}
                  rows={2}
                  className="flex-1 resize-none px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-white"
                  disabled={sendMessage.isPending || isRecording || isTranscribing}
                />
                {/* Mic button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing || sendMessage.isPending}
                  title={isRecording ? "Stop recording" : "Record voice"}
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                  style={{
                    background: isRecording ? "oklch(0.58 0.22 27)" : "oklch(0.95 0.03 264)",
                    border: isRecording ? "2px solid oklch(0.58 0.22 27)" : "1px solid oklch(0.88 0.06 264)",
                  }}
                >
                  {isRecording
                    ? <MicOff size={15} color="white" />
                    : <Mic size={15} style={{ color: "oklch(0.51 0.23 264)" }} />
                  }
                </button>
                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessage.isPending || isRecording || isTranscribing}
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: "oklch(0.51 0.23 264)" }}
                >
                  <Send size={15} color="white" />
                </button>
              </div>
              <div className="flex justify-between mt-1.5 px-0.5">
                <span className="text-[10px] text-muted-foreground hidden sm:block">Enter to send · Shift+Enter for new line · Mic to speak</span>
                <span className="text-[10px] text-muted-foreground sm:hidden">Tap mic to speak</span>
                {userMessageCount >= 3 && (
                  <button
                    onClick={() => setShowEndConfirm(true)}
                    className="text-[10px] font-semibold hover:underline"
                    style={{ color: "oklch(0.51 0.23 264)" }}
                  >
                    Ready to finish? →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="shrink-0 bg-gray-50 border-t border-border p-4 text-center">
              <p className="text-sm text-muted-foreground">Session {session.status}.</p>
              {session.status === "completed" && (
                <button
                  onClick={() => navigate(`/session/${sessionId}/result`)}
                  className="mt-2 text-sm font-semibold hover:underline"
                  style={{ color: "oklch(0.51 0.23 264)" }}
                >
                  View Results →
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Live scoring ── */}
        <div className="hidden xl:flex w-72 flex-col border-l border-border bg-white overflow-y-auto shrink-0">
          <div className="px-4 py-3.5 border-b border-border">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Live Coaching</div>
            <h3 className="text-sm font-bold text-foreground">Real-Time Feedback</h3>
          </div>

          {latestFeedback ? (
            <div className="p-4 space-y-5">
              {/* Score ring */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <svg width="60" height="60" className="rotate-[-90deg]">
                    <circle cx="30" cy="30" r="24" fill="none" stroke="oklch(0.91 0.012 264)" strokeWidth="5" />
                    <circle
                      cx="30" cy="30" r="24" fill="none"
                      stroke={latestFeedback.score >= 80 ? "oklch(0.45 0.14 160)" : latestFeedback.score >= 60 ? "oklch(0.62 0.18 47)" : "oklch(0.58 0.22 27)"}
                      strokeWidth="5"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 - (latestFeedback.score / 100) * 150.8}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-extrabold text-foreground">{latestFeedback.score}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Message Score</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {latestFeedback.score >= 85 ? "Excellent!" : latestFeedback.score >= 70 ? "Good work" : latestFeedback.score >= 50 ? "Getting there" : "Needs work"}
                  </div>
                  <div
                    className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                    style={{
                      background: latestFeedback.score >= 85 ? "oklch(0.96 0.06 160)" : latestFeedback.score >= 70 ? "oklch(0.95 0.05 264)" : latestFeedback.score >= 50 ? "oklch(0.97 0.06 80)" : "oklch(0.97 0.04 25)",
                      color: latestFeedback.score >= 85 ? "oklch(0.38 0.12 160)" : latestFeedback.score >= 70 ? "oklch(0.38 0.18 264)" : latestFeedback.score >= 50 ? "oklch(0.45 0.14 60)" : "oklch(0.5 0.18 25)",
                    }}
                  >
                    {latestFeedback.score >= 85 ? "Excellent" : latestFeedback.score >= 70 ? "Good" : latestFeedback.score >= 50 ? "Fair" : "Poor"}
                  </div>
                </div>
              </div>

              {/* Coaching note */}
              <div
                className="flex items-start gap-2 p-3 rounded-xl text-xs leading-relaxed"
                style={{ background: "oklch(0.97 0.05 47 / 0.5)", border: "1px solid oklch(0.9 0.06 47)" }}
              >
                <AlertCircle size={12} style={{ color: "oklch(0.62 0.18 47)", flexShrink: 0, marginTop: 1 }} />
                <p style={{ color: "oklch(0.35 0.1 47)" }}>{latestFeedback.feedback}</p>
              </div>

              {/* Dimension bars */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Score Breakdown</div>
                {DIMENSIONS.map(({ key, label }) => {
                  const val = (latestFeedback.dimensions as any)[key];
                  if (val == null) return null;
                  return <DimBar key={key} label={label} value={val} />;
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "oklch(0.95 0.05 264)" }}
              >
                <Sparkles size={20} style={{ color: "oklch(0.51 0.23 264)" }} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">Waiting for your response</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Send a message and I'll score it across 5 dimensions in real time.
              </p>
              <div className="w-full space-y-2">
                {DIMENSIONS.map(({ label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "oklch(0.51 0.23 264)" }} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Running session stats */}
          {userMessageCount > 0 && (
            <div className="p-4 border-t border-border mt-auto">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Session Stats</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5" style={{ background: "oklch(0.97 0.005 264)" }}>
                  <div className="text-lg font-extrabold text-foreground">{userMessageCount}</div>
                  <div className="text-[10px] text-muted-foreground">Messages</div>
                </div>
                <div className="rounded-lg p-2.5" style={{ background: "oklch(0.97 0.005 264)" }}>
                  <div className="text-lg font-extrabold text-foreground">{formatTime(sessionTime)}</div>
                  <div className="text-[10px] text-muted-foreground">Duration</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* End session confirm dialog */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "oklch(0.96 0.06 160)" }}>
              <CheckCircle2 size={18} style={{ color: "oklch(0.45 0.14 160)" }} />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-2">End Session?</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              The AI will analyse your full conversation and provide a comprehensive QA score with detailed feedback across all 5 dimensions.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => { setShowEndConfirm(false); completeSession.mutate({ sessionId }); }}
                disabled={completeSession.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "oklch(0.51 0.23 264)" }}
              >
                {completeSession.isPending ? "Analysing..." : "End & Score"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
