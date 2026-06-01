import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowLeft, BarChart3, CheckCircle2, Clock, Linkedin, MessageSquare,
  Mic, MicOff, Play, RotateCcw, ThumbsDown, ThumbsUp, TrendingUp, Volume2, VolumeX
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

interface Props { sessionId: number; }

const SCORE_DIMENSIONS = [
  { key: "clarityScore",           label: "Clarity",            desc: "How clearly you communicated your points" },
  { key: "empathyScore",           label: "Empathy",             desc: "How well you acknowledged the other party's perspective" },
  { key: "persuasivenessScore",    label: "Persuasiveness",      desc: "How effectively you made your case" },
  { key: "objectionHandlingScore", label: "Objection Handling",  desc: "How well you addressed pushback and concerns" },
  { key: "professionalismScore",   label: "Professionalism",     desc: "Tone, language, and overall conduct" },
] as const;

const INDIGO = "oklch(0.51 0.23 264)";
const GREEN  = "oklch(0.45 0.14 160)";
const ORANGE = "oklch(0.62 0.18 47)";
const RED    = "oklch(0.58 0.22 27)";

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? GREEN : score >= 60 ? ORANGE : RED;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="oklch(0.93 0.005 264)" strokeWidth="10" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-foreground leading-none">{Math.round(score)}</span>
        <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  );
}

export default function SessionResult({ sessionId }: Props) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data, isLoading } = trpc.sessions.get.useQuery({ sessionId });
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ttsMutation = trpc.sessions.speakText.useMutation();
  const createSession = trpc.sessions.create.useMutation({
    onSuccess: (d) => navigate(`/simulate/${d.sessionId}`),
    onError: () => toast.error("Could not start a new session. Please try again."),
  });

  const stopReplay = useCallback(() => {
    setIsReplaying(false);
    setIsSpeaking(false);
    setReplayIndex(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const replayVoice = useCallback(async (msgs: any[], scenario: any) => {
    const speakable = msgs.filter((m: any) => m.role !== "system");
    setIsReplaying(true);
    setReplayIndex(0);
    for (let i = 0; i < speakable.length; i++) {
      if (!speakable[i].content) continue;
      setReplayIndex(i);
      setIsSpeaking(true);
      try {
        const voice = speakable[i].role === "user" ? "nova" : "onyx";
        const result = await ttsMutation.mutateAsync({
          text: speakable[i].content,
          voice: voice as "nova" | "onyx" | "alloy" | "echo" | "fable" | "shimmer",
        });
        await new Promise<void>((resolve) => {
          const dataUrl = `data:${result.mimeType};base64,${result.audioBase64}`;
          const audio = new Audio(dataUrl);
          audioRef.current = audio;
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
        });
      } catch {
        // skip failed TTS
      }
      setIsSpeaking(false);
      await new Promise((r) => setTimeout(r, 400));
    }
    setIsReplaying(false);
    setReplayIndex(0);
  }, [ttsMutation]);

  const handleLinkedInShare = useCallback((score: number, scenarioTitle: string) => {
    const text = encodeURIComponent(
      `I just completed an AI roleplay simulation on Agent Forge — "${scenarioTitle}" — and scored ${Math.round(score)}/100! 🎯 Practising real-world conversations with AI is a game-changer for L&D. Try it: https://www.agentforge.org.uk`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://www.agentforge.org.uk&summary=${text}`, "_blank");
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: INDIGO, borderTopColor: "transparent" }} />
            <p className="text-sm text-muted-foreground">Analysing session...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!data) return (
    <AppLayout>
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Session not found.</p>
      </div>
    </AppLayout>
  );

  const { session, messages, scenario } = data;
  const overallScore = session.overallScore ?? 0;
  const scoreLabel = overallScore >= 85 ? "Excellent" : overallScore >= 70 ? "Good" : overallScore >= 55 ? "Fair" : "Needs Work";
  const scoreLabelColor = overallScore >= 85 ? GREEN : overallScore >= 70 ? ORANGE : RED;
  const userMessages = messages.filter((m: any) => m.role === "user");
  const duration = session.durationSeconds ? Math.round(session.durationSeconds / 60) : 0;

  // Parse strengths / improvements from session fields
  const strengths: string[] = (session.strengths as string[] | null) ?? [];
  const improvements: string[] = (session.improvements as string[] | null) ?? [];
  const overallFeedback = session.feedbackSummary ?? "";

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-border px-6 py-4 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate("/simulate")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={13} /> Back
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">Session Results — {scenario?.title}</h1>
              <p className="text-xs text-muted-foreground">
                {format(new Date(session.startedAt), "MMMM d, yyyy · h:mm a")}
              </p>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              {/* LinkedIn share */}
              <button
                onClick={() => handleLinkedInShare(overallScore, scenario?.title ?? "AI Simulation")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-blue-50 hover:border-blue-300 transition-colors"
                style={{ color: "#0077B5" }}
                title="Share on LinkedIn"
              >
                <Linkedin size={12} /> Share
              </button>
              {/* Replay in voice mode */}
              {isReplaying ? (
                <button
                  onClick={stopReplay}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors"
                  style={{ background: "oklch(0.97 0.04 27)", borderColor: "oklch(0.85 0.10 27)", color: "oklch(0.48 0.20 27)" }}
                >
                  <VolumeX size={12} /> Stop Replay
                </button>
              ) : (
                <button
                  onClick={() => replayVoice(messages, scenario)}
                  disabled={ttsMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Volume2 size={12} /> Replay in Voice
                </button>
              )}
              <button
                onClick={() => {
                  if (session?.scenarioId) {
                    createSession.mutate({ scenarioId: session.scenarioId, language: (session as any).language ?? "en" });
                  } else {
                    navigate("/simulate");
                  }
                }}
                disabled={createSession.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: INDIGO }}
              >
                <Play size={12} /> {createSession.isPending ? "Starting…" : "Practice Again"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          {/* Top row: Score + stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall score card */}
            <div className="bg-white rounded-2xl border border-border p-6 flex flex-col items-center text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Overall Score</div>
              <ScoreRing score={overallScore} />
              <div className="mt-3 text-sm font-bold" style={{ color: scoreLabelColor }}>{scoreLabel}</div>
              {overallFeedback && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">{overallFeedback}</p>
              )}
            </div>

            {/* Stats */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {[
                { icon: MessageSquare, label: "Your Responses", value: userMessages.length, color: INDIGO, bg: "oklch(0.95 0.05 264)" },
                { icon: Clock, label: "Duration", value: `${duration}m`, color: ORANGE, bg: "oklch(0.97 0.05 47)" },
                { icon: TrendingUp, label: "Category", value: (scenario?.category ?? "general").replace("_", " "), color: GREEN, bg: "oklch(0.96 0.06 160)" },
                { icon: BarChart3, label: "Difficulty", value: scenario?.difficulty ?? "—", color: "oklch(0.55 0.18 300)", bg: "oklch(0.96 0.04 300)" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.bg }}>
                    <stat.icon size={15} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                    <div className="text-base font-extrabold text-foreground capitalize">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension scores */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Score Breakdown</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Performance across all 5 evaluation dimensions</p>
            </div>
            <div className="divide-y divide-border">
              {SCORE_DIMENSIONS.map(({ key, label, desc }) => {
                const score = (session as any)[key] ?? 0;
                const color = score >= 80 ? GREEN : score >= 60 ? ORANGE : RED;
                const bgColor = score >= 80 ? "oklch(0.96 0.06 160)" : score >= 60 ? "oklch(0.97 0.06 80)" : "oklch(0.97 0.04 25)";
                const badge = score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Weak";
                return (
                  <div key={key} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{label}</div>
                        <div className="text-xs text-muted-foreground">{desc}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: bgColor, color }}>
                          {badge}
                        </span>
                        <span className="text-xl font-extrabold" style={{ color }}>{Math.round(score)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths + Improvements */}
          {(strengths.length > 0 || improvements.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {strengths.length > 0 && (
                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border" style={{ background: "oklch(0.96 0.06 160)" }}>
                    <ThumbsUp size={14} style={{ color: GREEN }} />
                    <h3 className="text-sm font-bold" style={{ color: GREEN }}>Strengths</h3>
                  </div>
                  <ul className="divide-y divide-border">
                    {strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 px-5 py-3">
                        <CheckCircle2 size={13} style={{ color: GREEN, flexShrink: 0, marginTop: 2 }} />
                        <span className="text-sm text-foreground leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {improvements.length > 0 && (
                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border" style={{ background: "oklch(0.97 0.04 25)" }}>
                    <ThumbsDown size={14} style={{ color: RED }} />
                    <h3 className="text-sm font-bold" style={{ color: RED }}>Areas to Improve</h3>
                  </div>
                  <ul className="divide-y divide-border">
                    {improvements.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 px-5 py-3">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: RED }} />
                        <span className="text-sm text-foreground leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Conversation transcript */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">Conversation Transcript</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{messages.length} messages total</p>
              </div>
              {/* Voice replay indicator */}
              {isReplaying && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold animate-pulse" style={{ background: "oklch(0.95 0.05 162)", color: "oklch(0.38 0.14 162)" }}>
                  <Volume2 size={12} />
                  {isSpeaking ? `Speaking message ${replayIndex + 1} of ${messages.filter((m: any) => m.role !== "system").length}…` : "Loading…"}
                </div>
              )}
              <button
                onClick={() => navigate(`/session/${sessionId}/replay`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={12} /> Full Replay
              </button>
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {messages.filter((m: any) => m.role !== "system").map((msg: any) => (
                <div key={msg.id} className={`flex gap-3 px-5 py-3.5 ${msg.role === "user" ? "" : "bg-gray-50/50"}`}>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={msg.role === "user"
                      ? { background: "oklch(0.95 0.05 264)", color: INDIGO }
                      : { background: "oklch(0.97 0.05 47 / 0.5)", color: ORANGE }
                    }
                  >
                    {msg.role === "user" ? "U" : "AI"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: msg.role === "user" ? INDIGO : ORANGE }}>
                        {msg.role === "user" ? "You" : scenario?.aiPersona ?? "AI"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(msg.createdAt), "h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
                    {msg.feedback && (
                      <div className="mt-2 flex items-start gap-1.5 p-2 rounded-lg text-xs" style={{ background: "oklch(0.97 0.05 47 / 0.3)", color: ORANGE }}>
                        <BarChart3 size={11} style={{ flexShrink: 0, marginTop: 1 }} />
                        {msg.feedback}
                      </div>
                    )}
                  </div>
                  {msg.messageScore != null && (
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-extrabold" style={{ color: msg.messageScore >= 80 ? GREEN : msg.messageScore >= 60 ? ORANGE : RED }}>
                        {msg.messageScore}
                      </div>
                      <div className="text-[10px] text-muted-foreground">score</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
