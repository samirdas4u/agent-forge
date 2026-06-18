import { useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { PhoneOff, ChevronLeft, Clock, AlertCircle } from "lucide-react";
import DIDAgentSession, { type DIDMessage } from "@/components/DIDAgentSession";
import { INTERVIEW_AGENTS } from "../../../shared/didAgents";

export default function InterviewSession() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [, navigate] = useLocation();

  // Parse query params
  const searchParams = new URLSearchParams(window.location.search);
  const agentId = searchParams.get("agentId") ?? "";
  // Look up the clientKey for this agentId from the INTERVIEW_AGENTS map
  const clientKey = Object.values(INTERVIEW_AGENTS).find((a) => a.agentId === agentId)?.clientKey ?? "";
  const personaId = searchParams.get("persona") ?? "";
  const jobTitle = searchParams.get("jobTitle") ?? "";
  const candidateName = searchParams.get("candidateName") ?? "";

  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [sessionError, setSessionError] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<DIDMessage[]>([]);

  // Start timer when component mounts
  useState(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleMessage = (msg: DIDMessage) => {
    transcriptRef.current.push(msg);
  };

  const handleEnd = (transcript: DIDMessage[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setEnded(true);
    // Navigate to result page with transcript encoded in sessionStorage
    const transcriptKey = `interview_transcript_${conversationId}`;
    sessionStorage.setItem(transcriptKey, JSON.stringify(transcript));
    const resultParams = new URLSearchParams({
      personaId,
      durationSeconds: String(elapsed),
      transcriptKey,
    });
    if (jobTitle) resultParams.set("jobTitle", jobTitle);
    if (candidateName) resultParams.set("candidateName", candidateName);
    navigate(`/interview/result?${resultParams.toString()}`);
  };

  const handleError = (err: string) => {
    setSessionError(err);
  };

  if (!agentId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">No agent ID found. Please start a new session.</p>
          <Button onClick={() => navigate("/career-prep")}>Back to Career Prep</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <button
          onClick={() => setShowEndConfirm(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Exit
        </button>
        <div className="flex items-center gap-2 text-sm font-mono text-white/80">
          <Clock className="w-4 h-4 text-green-400" />
          <span className={elapsed > 1500 ? "text-amber-400" : "text-green-400"}>{formatTime(elapsed)}</span>
          {elapsed > 1500 && (
            <span className="text-xs text-amber-400/70 hidden sm:inline">(25 min limit approaching)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/60">Live</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl">
          {sessionError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {sessionError}
            </div>
          )}
          <DIDAgentSession
            agentId={agentId}
            clientKey={clientKey}
            onMessage={handleMessage}
            onEnd={handleEnd}
            onError={handleError}
            className="w-full"
          />
        </div>
      </div>

      {/* End confirm modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <PhoneOff className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="text-lg font-semibold">End Interview?</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to end the session? Your conversation will be saved for feedback.
              </p>
              <p className="text-xs text-muted-foreground">Session time: {formatTime(elapsed)}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEndConfirm(false)}>
                Continue
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleEnd(transcriptRef.current)}
                disabled={ended}
              >
                {ended ? "Ending..." : "End Session"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
