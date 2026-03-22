import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Cpu, MessageSquare, RotateCcw } from "lucide-react";
import { format } from "date-fns";

interface Props { sessionId: number; }

export default function SessionReplay({ sessionId }: Props) {
  const [, navigate] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"step" | "full">("full");

  const { data, isLoading } = trpc.sessions.get.useQuery({ sessionId });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <RotateCcw className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
          <p className="text-sm text-muted-foreground mono">Loading replay...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-muted-foreground">Session not found.</div>;

  const { session, messages, scenario } = data;
  const displayMessages = mode === "step" ? messages.slice(0, currentIndex + 1) : messages;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(`/session/${sessionId}/result`)}
          className="p-2 rounded-md border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="mono text-xs text-muted-foreground uppercase tracking-widest">// session_replay</div>
          <h1 className="text-xl font-bold">{scenario?.title}</h1>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6 bg-white rounded-lg border border-border p-3">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("full")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === "full" ? "bg-foreground text-background" : "hover:bg-muted"}`}
          >
            Full View
          </button>
          <button
            onClick={() => { setMode("step"); setCurrentIndex(0); }}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === "step" ? "bg-foreground text-background" : "hover:bg-muted"}`}
          >
            Step Through
          </button>
        </div>
        {mode === "step" && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="mono text-xs text-muted-foreground">
              {currentIndex + 1} / {messages.length}
            </span>
            <button
              onClick={() => setCurrentIndex(Math.min(messages.length - 1, currentIndex + 1))}
              disabled={currentIndex === messages.length - 1}
              className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="ml-auto mono text-xs text-muted-foreground">
          {format(new Date(session.startedAt), "MMM d, yyyy · HH:mm")}
        </div>
      </div>

      {/* Session info */}
      <div className="flex flex-wrap gap-3 mb-6">
        {session.overallScore != null && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-border">
            <span className="text-xs text-muted-foreground">Overall Score:</span>
            <span className="mono text-sm font-bold">{Math.round(session.overallScore)}/100</span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-border">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="mono text-xs">{messages.filter((m) => m.role === "user").length} user messages</span>
        </div>
        <div className={`px-3 py-1.5 rounded-md border text-xs font-medium ${session.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
          {session.status}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {displayMessages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} ${mode === "step" && idx === currentIndex ? "ring-2 ring-offset-2 ring-ring rounded-xl" : ""}`}
          >
            <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5">
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
                    : "bg-white border border-border rounded-bl-sm"
                }`}
                style={msg.role === "user" ? { background: "var(--foreground)" } : {}}
              >
                {msg.content}
              </div>
              {msg.feedback && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 max-w-full">
                  <span className="font-medium">Coach feedback: </span>{msg.feedback}
                </div>
              )}
              {msg.messageScore != null && (
                <div className="mono text-xs text-muted-foreground">
                  Score: <span className="font-medium">{Math.round(msg.messageScore)}/100</span>
                </div>
              )}
              <div className="mono text-xs text-muted-foreground">
                {format(new Date(msg.createdAt), "HH:mm:ss")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {mode === "step" && currentIndex < messages.length - 1 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-md text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            Next Message <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
