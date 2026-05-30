import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Video, VideoOff, ChevronLeft, Clock, AlertCircle } from "lucide-react";

export default function InterviewSession() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [, navigate] = useLocation();

  // Parse query params
  const searchParams = new URLSearchParams(window.location.search);
  const conversationUrl = searchParams.get("url") ?? "";
  const personaId = searchParams.get("persona") ?? "";
  const jobTitle = searchParams.get("jobTitle") ?? "";
  const candidateName = searchParams.get("candidateName") ?? "";

  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selfViewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const endSession = trpc.interview.endSession.useMutation();

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Self-view webcam
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (selfViewRef.current) {
          selfViewRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        // Permission denied — self-view won't show but interview still works via iframe
      });
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setMicEnabled((v) => !v);
  };

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setCamEnabled((v) => !v);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleEnd = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setEnded(true);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      await endSession.mutateAsync({ conversationId });
    } catch (_) { /* ignore */ }
    const resultParams = new URLSearchParams({ personaId, durationSeconds: String(elapsed) });
    if (jobTitle) resultParams.set("jobTitle", jobTitle);
    if (candidateName) resultParams.set("candidateName", candidateName);
    navigate(`/interview/result?${resultParams.toString()}`);
  };

  if (!conversationUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">No conversation URL found. Please start a new session.</p>
          <Button onClick={() => navigate("/interview")}>Back to Interview Practice</Button>
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
          {elapsed > 1500 && <span className="text-xs text-amber-400/70">(25 min limit approaching)</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/60">Live</span>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* Tavus CVI iframe — full interview video */}
        <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d1a] gap-4">
              <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-white/50">Connecting to your interviewer...</p>
              <p className="text-xs text-white/30">Allow camera and microphone when prompted</p>
            </div>
          )}
          <iframe
            src={conversationUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full"
            style={{ border: "none" }}
            onLoad={() => setIframeLoaded(true)}
            title="AI Video Interviewer"
          />
        </div>

        {/* Self-view (picture-in-picture) */}
        <div className="absolute bottom-8 right-8 w-32 md:w-44 aspect-video rounded-xl overflow-hidden border-2 border-white/20 bg-black shadow-xl">
          <video
            ref={selfViewRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${!camEnabled ? "opacity-0" : ""}`}
          />
          {!camEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <VideoOff className="w-6 h-6 text-white/40" />
            </div>
          )}
          <div className="absolute bottom-1 left-1 text-xs text-white/60 bg-black/40 px-1.5 py-0.5 rounded">You</div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-white/10 bg-black/40">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full border transition-all ${
            micEnabled
              ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
              : "bg-red-500/20 border-red-500/40 text-red-400"
          }`}
          title={micEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleCam}
          className={`p-3 rounded-full border transition-all ${
            camEnabled
              ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
              : "bg-red-500/20 border-red-500/40 text-red-400"
          }`}
          title={camEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {camEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setShowEndConfirm(true)}
          className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 transition-colors shadow-lg"
        >
          <PhoneOff className="w-5 h-5" />
          End Interview
        </button>
      </div>

      {/* End confirm modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <PhoneOff className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="text-lg font-semibold">End Interview?</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to end the session? This will disconnect from the AI interviewer.
              </p>
              <p className="text-xs text-muted-foreground">Session time: {formatTime(elapsed)}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEndConfirm(false)}>
                Continue
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleEnd} disabled={ended}>
                {ended ? "Ending..." : "End Session"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
