import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { CheckCircle, ChevronRight, Clock, MessageSquare, Play, RotateCcw, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Props { sessionId: number; }

const SCORE_DIMENSIONS = [
  { key: "clarityScore", label: "Clarity" },
  { key: "empathyScore", label: "Empathy" },
  { key: "persuasivenessScore", label: "Persuasiveness" },
  { key: "objectionHandlingScore", label: "Objection Handling" },
  { key: "professionalismScore", label: "Professionalism" },
] as const;

function ScoreGauge({ score, label, size = 80 }: { score: number; label: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold mono">{Math.round(score)}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

export default function SessionResult({ sessionId }: Props) {
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.sessions.get.useQuery({ sessionId });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mono">Analyzing session...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-muted-foreground">Session not found.</div>;

  const { session, messages, scenario } = data;
  const overallScore = session.overallScore ?? 0;
  const scoreColor = overallScore >= 80 ? "#22c55e" : overallScore >= 60 ? "#f59e0b" : "#ef4444";
  const scoreLabel = overallScore >= 85 ? "Excellent" : overallScore >= 70 ? "Good" : overallScore >= 55 ? "Fair" : "Needs Work";
  const userMessages = messages.filter((m) => m.role === "user");
  const duration = session.durationSeconds ? Math.round(session.durationSeconds / 60) : 0;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="mono text-xs text-muted-foreground mb-1 uppercase tracking-widest">// session_complete</div>
        <h1 className="text-2xl font-bold">Session Results</h1>
        <p className="text-muted-foreground text-sm mt-1">{scenario?.title}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Overall score */}
        <div className="md:col-span-1 bg-white rounded-xl border border-border p-6 flex flex-col items-center text-center">
          <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Overall Score</div>
          <div className="relative w-32 h-32 mb-4">
            <svg width="128" height="128" className="rotate-[-90deg]">
              <circle cx="64" cy="64" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="64" cy="64" r="54" fill="none"
                stroke={scoreColor} strokeWidth="10"
                strokeDasharray={339.3}
                strokeDashoffset={339.3 - (overallScore / 100) * 339.3}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold mono">{Math.round(overallScore)}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="font-bold text-lg" style={{ color: scoreColor }}>{scoreLabel}</div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{userMessages.length} messages</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{duration}m</span>
            </div>
          </div>
        </div>

        {/* Dimension scores */}
        <div className="md:col-span-2 bg-white rounded-xl border border-border p-6">
          <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Performance Dimensions</div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {SCORE_DIMENSIONS.map(({ key, label }) => {
              const score = session[key] ?? 0;
              return <ScoreGauge key={key} score={score} label={label} size={72} />;
            })}
          </div>
          <div className="mt-4 space-y-2">
            {SCORE_DIMENSIONS.map(({ key, label }) => {
              const score = session[key] ?? 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs w-36 text-muted-foreground">{label}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${score}%`,
                        background: score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444",
                        transition: "width 1s ease-out",
                      }}
                    />
                  </div>
                  <span className="mono text-xs font-medium w-8 text-right">{Math.round(score)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback summary */}
      {session.feedbackSummary && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-3">AI Coach Feedback</div>
          <p className="text-sm leading-relaxed text-foreground">{session.feedbackSummary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        {(session.strengths as string[])?.length > 0 && (
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <div className="font-semibold text-sm text-emerald-800">Strengths</div>
            </div>
            <ul className="space-y-2">
              {(session.strengths as string[]).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {(session.improvements as string[])?.length > 0 && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <div className="font-semibold text-sm text-amber-800">Areas to Improve</div>
            </div>
            <ul className="space-y-2">
              {(session.improvements as string[]).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Conversation replay */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="mono text-xs text-muted-foreground uppercase tracking-widest">Conversation Transcript</div>
          <button
            onClick={() => navigate(`/session/${sessionId}/replay`)}
            className="flex items-center gap-1.5 text-xs font-medium hover:underline"
            style={{ color: "var(--cyan)" }}
          >
            <RotateCcw className="w-3 h-3" />
            Full Replay
          </button>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "text-white rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
                style={msg.role === "user" ? { background: "var(--foreground)" } : {}}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/scenarios")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          <Play className="w-4 h-4" />
          Practice Again
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm border border-border hover:bg-muted transition-colors"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => navigate("/analytics")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm border border-border hover:bg-muted transition-colors"
        >
          View Analytics
        </button>
      </div>
    </div>
  );
}
