/**
 * DIDAgentSession — embeds a D-ID streaming avatar agent via the @d-id/client-sdk.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createAgentManager,
  type AgentManager,
  type AgentManagerOptions,
  type Message as DIDSDKMessage,
  ConnectionState,
  AgentActivityState,
} from "@d-id/client-sdk";

import { Button } from "@/components/ui/button";
import { PhoneOff, Loader2, Mic, MicOff, AlertTriangle } from "lucide-react";

export interface DIDMessage {
  role: "agent" | "user";
  content: string;
  timestamp: number;
}

interface Props {
  agentId: string;
  clientKey: string;
  onMessage?: (msg: DIDMessage) => void;
  onEnd?: (transcript: DIDMessage[]) => void;
  onError?: (err: string) => void;
  className?: string;
  autoConnect?: boolean;
}

type UIStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export default function DIDAgentSession({
  agentId,
  clientKey,
  onMessage,
  onEnd,
  onError,
  className = "",
  autoConnect = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const agentManagerRef = useRef<AgentManager | null>(null);
  const transcriptRef = useRef<DIDMessage[]>([]);
  // Use refs for callbacks to avoid stale closures in the SDK callbacks
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  onMessageRef.current = onMessage;
  onErrorRef.current = onError;

  const [status, setStatus] = useState<UIStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentTalking, setIsAgentTalking] = useState(false);

  const handleEnd = useCallback(() => {
    agentManagerRef.current?.disconnect();
    onEnd?.(transcriptRef.current);
  }, [onEnd]);

  useEffect(() => {
    if (!autoConnect) return;

    let cancelled = false;

    async function connect() {
      setStatus("connecting");
      setErrorMsg("");

      try {
        const options: AgentManagerOptions = {
          auth: { type: "key", clientKey },
          callbacks: {
            onSrcObjectReady(srcObject: MediaStream) {
              if (videoRef.current && srcObject) {
                videoRef.current.srcObject = srcObject;
              }
            },
            onConnectionStateChange(state: ConnectionState) {
              if (cancelled) return;
              if (state === ConnectionState.Connected) {
                setStatus("connected");
              } else if (
                state === ConnectionState.Disconnected ||
                state === ConnectionState.Closed ||
                state === ConnectionState.Completed
              ) {
                setStatus("disconnected");
              } else if (state === ConnectionState.Fail) {
                const msg = "WebRTC connection failed. Please check your camera/microphone permissions.";
                setStatus("error");
                setErrorMsg(msg);
                onErrorRef.current?.(msg);
              }
            },
            onNewMessage(messages: DIDSDKMessage[], type: "answer" | "partial" | "user") {
              if (cancelled) return;
              // Skip partials to avoid duplicate messages
              if (type === "partial") return;
              messages.forEach((m) => {
                const msg: DIDMessage = {
                  role: m.role === "user" ? "user" : "agent",
                  content: m.content,
                  timestamp: Date.now(),
                };
                transcriptRef.current.push(msg);
                onMessageRef.current?.(msg);
              });
            },
            onAgentActivityStateChange(state: AgentActivityState) {
              if (cancelled) return;
              setIsAgentTalking(state === AgentActivityState.Talking);
            },
            onError(error: Error, errorData?: object) {
              if (cancelled) return;
              const msg =
                error?.message ??
                (errorData as { description?: string } | undefined)?.description ??
                "Unknown D-ID error";
              setStatus("error");
              setErrorMsg(msg);
              onErrorRef.current?.(msg);
            },
          },
        };

        const manager = await createAgentManager(agentId, options);
        if (cancelled) {
          manager.disconnect();
          return;
        }
        agentManagerRef.current = manager;
        await manager.connect();
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Failed to connect to video agent";
        setStatus("error");
        setErrorMsg(msg);
        onErrorRef.current?.(msg);
      }
    }

    connect();

    return () => {
      cancelled = true;
      agentManagerRef.current?.disconnect();
      agentManagerRef.current = null;
    };
  }, [agentId, clientKey, autoConnect]);

  const toggleMute = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = isMuted; // if currently muted → re-enable; if not → disable
      });
    }
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Video element */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Connecting overlay */}
        {status === "connecting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
            <p className="text-sm font-medium">Connecting to your AI interviewer…</p>
            <p className="text-xs text-white/60">Camera &amp; microphone access required</p>
          </div>
        )}

        {/* Error overlay */}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-3 p-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <p className="text-sm font-medium text-center">{errorMsg || "Connection failed"}</p>
            <Button
              size="sm"
              variant="outline"
              className="text-white border-white/30 hover:bg-white/10"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Disconnected overlay */}
        {status === "disconnected" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white gap-2">
            <p className="text-sm font-medium">Session ended</p>
          </div>
        )}

        {/* Talking indicator */}
        {status === "connected" && isAgentTalking && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white">Speaking</span>
          </div>
        )}
      </div>

      {/* Controls */}
      {status === "connected" && (
        <div className="flex items-center gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            className={isMuted ? "border-red-400 text-red-400" : ""}
          >
            {isMuted ? <MicOff className="w-4 h-4 mr-1.5" /> : <Mic className="w-4 h-4 mr-1.5" />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEnd}
          >
            <PhoneOff className="w-4 h-4 mr-1.5" />
            End Session
          </Button>
        </div>
      )}
    </div>
  );
}
