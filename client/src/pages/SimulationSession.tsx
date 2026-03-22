import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle, ChevronRight, Cpu, MessageSquare, Send, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Props { sessionId: number; }

interface FeedbackData {
  score: number;
  feedback: string;
  dimensions: { clarity: number; empathy: number; persuasiveness: number; professionalism: number };
}

const DIMENSION_LABELS = {
  clarity: "Clarity",
  empathy: "Empathy",
  persuasiveness: "Persuasiveness",
  professionalism: "Professionalism",
};

export default function SimulationSession({ sessionId }: Props) {
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState<FeedbackData | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading, refetch } = trpc.sessions.get.useQuery({ sessionId }, { refetchInterval: false });

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
    onSuccess: () => navigate("/scenarios"),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages, isTyping]);

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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center blueprint-bg">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 animate-pulse" style={{ color: "var(--cyan)" }} />
          <span className="mono text-sm text-muted-foreground">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Session not found.</p>
      </div>
    );
  }

  const { session, messages, scenario } = data;
  const isActive = session.status === "active";
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Chat panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{scenario?.title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="mono text-xs text-muted-foreground capitalize">{scenario?.category?.replace("_", " ")}</span>
              {scenario?.aiPersona && (
                <>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="mono text-xs text-muted-foreground truncate">with {scenario.aiPersona}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="mono text-xs text-muted-foreground">{userMessageCount} msg{userMessageCount !== 1 ? "s" : ""}</span>
            {isActive && (
              <>
                <button
                  onClick={() => setShowEndConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  End & Score
                </button>
                <button
                  onClick={() => abandonSession.mutate({ sessionId })}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  title="Abandon session"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 blueprint-bg">
          {messages.length === 0 && (
            <div className="flex justify-center">
              <div className="bg-white border border-border rounded-lg p-4 max-w-sm text-center">
                <MessageSquare className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  The AI is ready. Start the conversation to begin your practice session.
                </p>
                {scenario?.aiPersona && (
                  <p className="text-xs text-muted-foreground mt-2 mono">
                    You are speaking with: <span className="text-foreground">{scenario.aiPersona}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--cyan)" }}>
                      <Cpu className="w-3 h-3 text-white" />
                    </div>
                    <span className="mono text-xs text-muted-foreground">{scenario?.aiPersona?.split(",")[0] ?? "AI"}</span>
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-white border border-border rounded-bl-sm text-foreground"
                  }`}
                  style={msg.role === "user" ? { background: "var(--foreground)" } : {}}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.feedback && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 max-w-full">
                    <span className="font-medium">Coach: </span>{msg.feedback}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-border rounded-xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {isActive ? (
          <div className="flex-shrink-0 bg-white border-t border-border p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response... (Enter to send, Shift+Enter for new line)"
                rows={2}
                className="flex-1 resize-none px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-muted/30"
                disabled={sendMessage.isPending}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="mono text-xs text-muted-foreground">Enter to send · Shift+Enter for new line</span>
              {userMessageCount >= 3 && (
                <button
                  onClick={() => setShowEndConfirm(true)}
                  className="mono text-xs font-medium hover:underline"
                  style={{ color: "var(--cyan)" }}
                >
                  Ready to finish? →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 bg-muted/50 border-t border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">Session {session.status}.</p>
            {session.status === "completed" && (
              <button
                onClick={() => navigate(`/session/${sessionId}/result`)}
                className="mt-2 text-sm font-medium hover:underline"
                style={{ color: "var(--cyan)" }}
              >
                View Results →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feedback sidebar */}
      <div className="hidden md:flex w-72 flex-col border-l border-border bg-white overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-border">
          <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-1">// live_feedback</div>
          <h3 className="font-semibold text-sm">Real-Time Coaching</h3>
        </div>

        {latestFeedback ? (
          <div className="p-4 space-y-4">
            {/* Score */}
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg width="56" height="56" className="rotate-[-90deg]">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                  <circle
                    cx="28" cy="28" r="22" fill="none"
                    stroke={latestFeedback.score >= 80 ? "#22c55e" : latestFeedback.score >= 60 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="5"
                    strokeDasharray={138.2}
                    strokeDashoffset={138.2 - (latestFeedback.score / 100) * 138.2}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold mono">{latestFeedback.score}</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium">Message Score</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {latestFeedback.score >= 80 ? "Excellent!" : latestFeedback.score >= 60 ? "Good work" : "Needs improvement"}
                </div>
              </div>
            </div>

            {/* Feedback text */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">{latestFeedback.feedback}</p>
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-2.5">
              <div className="mono text-xs text-muted-foreground uppercase tracking-wider">Dimensions</div>
              {Object.entries(latestFeedback.dimensions).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS]}</span>
                    <span className="mono font-medium">{Math.round(val)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${val}%`,
                        background: val >= 80 ? "#22c55e" : val >= 60 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
            <Star className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Send a few messages to receive real-time coaching feedback.</p>
            <div className="mt-4 space-y-2 text-left w-full">
              {["Clarity", "Empathy", "Persuasiveness", "Professionalism"].map((d) => (
                <div key={d} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--cyan)" }} />
                  <span className="text-xs text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="mono text-xs text-muted-foreground uppercase tracking-wider mb-2">// tips</div>
          <ul className="space-y-1.5">
            {[
              "Use the person's name",
              "Ask open-ended questions",
              "Acknowledge their concerns",
              "Be specific, not vague",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "var(--cyan)" }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* End session confirm dialog */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl border border-border p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-bold text-lg mb-2">End Session?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              The AI will analyze your full conversation and provide a comprehensive performance score and feedback.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Continue Practicing
              </button>
              <button
                onClick={() => { setShowEndConfirm(false); completeSession.mutate({ sessionId }); }}
                disabled={completeSession.isPending}
                className="flex-1 py-2.5 rounded-md text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                {completeSession.isPending ? "Analyzing..." : "End & Get Score"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
