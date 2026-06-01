import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Award, ChevronLeft, Lightbulb, Linkedin, RefreshCw,
  Star, ThumbsUp, TrendingUp, User, Clock, AlertTriangle, Info
} from "lucide-react";

// ── Score ring component ─────────────────────────────────────────────────────
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color =
    score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={8}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={size / 4}
        fontWeight="bold"
        style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: size / 4 }}
        className="rotate-90"
      />
    </svg>
  );
}

// ── Dimension bar ────────────────────────────────────────────────────────────
function DimensionBar({
  label,
  score,
  feedback,
}: {
  label: string;
  score: number;
  feedback: string;
}) {
  const color =
    score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span
          className={`font-bold tabular-nums ${
            score >= 80
              ? "text-green-400"
              : score >= 60
              ? "text-amber-400"
              : "text-red-400"
          }`}
        >
          {score}/100
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{feedback}</p>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function InterviewResult() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const personaId = searchParams.get("personaId") ?? "";
  const jobTitle = searchParams.get("jobTitle") ?? undefined;
  const candidateName = searchParams.get("candidateName") ?? undefined;
  const durationSeconds = parseInt(searchParams.get("durationSeconds") ?? "0", 10);

  const generateFeedback = trpc.interview.generateFeedback.useMutation();
  const [feedback, setFeedback] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) {
      setError("Missing session data. Please complete an interview first.");
      return;
    }
    // Read real transcript from sessionStorage if available (set by InterviewSession)
    const transcriptKey = searchParams.get("transcriptKey") ?? "";
    let transcript: { role: "agent" | "user"; content: string }[] | undefined;
    if (transcriptKey) {
      try {
        const raw = sessionStorage.getItem(transcriptKey);
        if (raw) {
          transcript = JSON.parse(raw);
          sessionStorage.removeItem(transcriptKey); // clean up
        }
      } catch {
        // ignore parse errors
      }
    }
    generateFeedback.mutateAsync({ personaId, jobTitle, candidateName, durationSeconds })
      .then((data) => setFeedback(data))
      .catch((err) => setError(err.message ?? "Failed to generate feedback."));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLinkedIn = () => {
    if (!feedback) return;
    const text = encodeURIComponent(
      `Just completed an AI video interview practice session on Agent Forge!\n\nOverall score: ${feedback.overallScore}/100 for a ${feedback.role} role.\n\n${feedback.summary}\n\n#InterviewPrep #CareerDevelopment #AgentForge`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?mini=true&summary=${text}`, "_blank");
  };

  const handlePracticeAgain = () => {
    navigate("/interview");
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!feedback && !error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <Award className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Generating Your Feedback Report</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Our AI coach is analysing your interview performance. This usually takes 10–20 seconds.
            </p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <Award className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Could not generate feedback</h2>
          <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
          <Button onClick={handlePracticeAgain}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Interview Practice
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ── Result page ────────────────────────────────────────────────────────────
  const scoreColor =
    feedback.overallScore >= 80
      ? "text-green-400"
      : feedback.overallScore >= 60
      ? "text-amber-400"
      : "text-red-400";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handlePracticeAgain} className="text-muted-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Interview Practice
          </Button>
        </div>

        {/* No-content banner */}
        {feedback.noContent && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
            <div>
              <span className="font-semibold text-red-200">No interview content detected.</span>{" "}
              The session ended too quickly for any answers to be recorded. Please try again, ensure your microphone is enabled, and complete at least a few questions before ending.
            </div>
          </div>
        )}
        {/* Transcript disclaimer banner — only show if no real transcript was used */}
        {!feedback.noContent && !feedback.hasTranscript && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 py-3 text-sm text-amber-300/80">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
            <span>
              <span className="font-semibold text-amber-200">Transcript not available.</span>{" "}
              Video interview feedback is based on session metadata only — not your actual spoken answers. Scores shown are conservative placeholders. For detailed transcript-based feedback, use the <strong>Chat</strong> or <strong>Phone</strong> simulation channels.
            </span>
          </div>
        )}
        {/* Transcript-based feedback confirmation */}
        {!feedback.noContent && feedback.hasTranscript && (
          <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-950/20 px-4 py-3 text-sm text-green-300/80">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
            <span>
              <span className="font-semibold text-green-200">Real transcript analysis.</span>{" "}
              This feedback is based on your actual spoken responses captured during the session.
            </span>
          </div>
        )}
        {/* Hero card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/60 to-[#0d0d1a] p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Score ring */}
            <div className="relative flex-shrink-0">
              <svg width={140} height={140} className="-rotate-90">
                <circle
                  cx={70}
                  cy={70}
                  r={58}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={10}
                />
                <circle
                  cx={70}
                  cy={70}
                  r={58}
                  fill="none"
                  stroke={
                    feedback.overallScore >= 80
                      ? "#22c55e"
                      : feedback.overallScore >= 60
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                  strokeWidth={10}
                  strokeDasharray={`${(feedback.overallScore / 100) * 2 * Math.PI * 58} ${2 * Math.PI * 58}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor}`}>
                  {feedback.overallScore}
                </span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>

            {/* Summary */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 className="text-2xl font-bold">Interview Feedback Report</h1>
                <div className="flex flex-wrap gap-3 mt-2 justify-center md:justify-start text-sm text-muted-foreground">
                  {feedback.candidateName && (
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> {feedback.candidateName}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> {feedback.role}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {feedback.durationMins} min session
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{feedback.summary}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-1">
                <Button onClick={handleLinkedIn} variant="outline" size="sm" className="gap-2">
                  <Linkedin className="w-4 h-4 text-[#0077b5]" /> Share on LinkedIn
                </Button>
                <Button onClick={handlePracticeAgain} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <RefreshCw className="w-4 h-4" /> Practice Again
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dimension scores */}
        <div className="rounded-2xl border border-white/10 bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Performance Dimensions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <DimensionBar
              label="STAR Method Usage"
              score={feedback.starScore}
              feedback={feedback.starFeedback}
            />
            <DimensionBar
              label="Communication Clarity"
              score={feedback.clarityScore}
              feedback={feedback.clarityFeedback}
            />
            <DimensionBar
              label="UK Professional Competencies"
              score={feedback.competencyScore}
              feedback={feedback.competencyFeedback}
            />
            <DimensionBar
              label="Confidence & Presence"
              score={feedback.confidenceScore}
              feedback={feedback.confidenceFeedback}
            />
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-2xl border border-green-500/20 bg-green-950/20 p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-green-400">
              <ThumbsUp className="w-5 h-5" /> Strengths
            </h2>
            <ul className="space-y-3">
              {(feedback.strengths ?? []).map((s: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-amber-400">
              <TrendingUp className="w-5 h-5" /> Areas to Improve
            </h2>
            <ul className="space-y-3">
              {(feedback.improvements ?? []).map((s: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sample better answer */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-400">
            <Lightbulb className="w-5 h-5" /> Example of a Stronger Answer
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            "{feedback.sampleAnswer}"
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-4">
          <Button onClick={handleLinkedIn} variant="outline" className="gap-2">
            <Linkedin className="w-4 h-4 text-[#0077b5]" /> Share on LinkedIn
          </Button>
          <Button onClick={handlePracticeAgain} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <RefreshCw className="w-4 h-4" /> Practice Another Interview
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
