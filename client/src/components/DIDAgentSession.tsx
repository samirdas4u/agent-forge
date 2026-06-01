/**
 * DIDAgentSession — embeds a D-ID streaming avatar agent via the @d-id/client-sdk.
 *
 * Auth strategy:
 * - We fetch the DID_API_KEY from our server via tRPC (getDIDToken).
 * - We pass it as { type: "basic", token: <DID_API_KEY> } to the SDK.
 * - HTTP calls go through our /api/did-proxy which replaces the auth header.
 * - The WebSocket to wss://notifications.d-id.com uses Basic auth directly —
 *   this is the same credential the server uses, so it is always valid.
 *
 * Video fix:
 * - onSrcObjectReady fires from a WebRTC peerConnection.ontrack event.
 *   We store the MediaStream in state and use a useEffect to assign it to the
 *   video element, avoiding the race condition where videoRef.current is null
 *   when the callback fires.
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
import { trpc } from "@/lib/trpc";

export interface DIDMessage {
  role: "agent" | "user";
  content: string;
  timestamp: number;
}

interface Props {
  agentId: string;
  /** clientKey is kept for backwards compat but is no longer used for auth */
  clientKey?: string;
  onMessage?: (msg: DIDMessage) => void;
  onEnd?: (transcript: DIDMessage[]) => void;
  onError?: (err: string) => void;
  className?: string;
  autoConnect?: boolean;
}

type UIStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export default function DIDAgentSession({
  agentId,
  onMessage,
  onEnd,
  onError,
  className = "",
  autoConnect = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const agentManagerRef = useRef<AgentManager | null>(null);
  const transcriptRef = useRef<DIDMessage[]>([]);

  // Store the MediaStream in state so we can assign it to the video element
  // via useEffect — avoids the race condition where videoRef.current is null
  // when onSrcObjectReady fires from the WebRTC ontrack event.
  const [srcObject, setSrcObject] = useState<MediaStream | null>(null);

  // Use refs for callbacks to avoid stale closures in the SDK callbacks
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  onMessageRef.current = onMessage;
  onErrorRef.current = onError;

  const [status, setStatus] = useState<UIStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  // Start muted for autoplay compliance; user can unmute after stream starts
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(false);
  const [isAgentTalking, setIsAgentTalking] = useState(false);

  // Assign srcObject to video element whenever it changes
  useEffect(() => {
    if (videoRef.current && srcObject) {
      videoRef.current.srcObject = srcObject;
      // Start muted for autoplay compliance, then show unmute prompt
      videoRef.current.muted = true;
      videoRef.current.play().then(() => {
        setShowUnmutePrompt(true);
      }).catch(() => {
        // Autoplay blocked — not a fatal error
      });
    }
  }, [srcObject]);

  // Fetch the server-side DID token (Basic auth credential)
  const { data: tokenData } = trpc.system.getDIDToken.useQuery(undefined, {
    staleTime: Infinity, // token doesn't change
    retry: 3,
  });

  const handleEnd = useCallback(() => {
    agentManagerRef.current?.disconnect();
    onEnd?.(transcriptRef.current);
  }, [onEnd]);

  useEffect(() => {
    if (!autoConnect) return;
    // Wait until we have the token
    if (!tokenData?.token) return;

    let cancelled = false;

    async function connect() {
      setStatus("connecting");
      setErrorMsg("");
      setSrcObject(null);

      try {
        // HTTP calls go through our server proxy (/api/did-proxy).
        // The proxy replaces the Authorization header with the real DID_API_KEY.
        // The WebSocket (wss://notifications.d-id.com) uses Basic auth directly —
        // same credential as the server, so it is always accepted.
        const proxyBase = `${window.location.origin}/api/did-proxy`;
        const options: AgentManagerOptions = {
          auth: { type: "basic", token: tokenData!.token },
          baseURL: proxyBase,
          callbacks: {
            onSrcObjectReady(stream: MediaStream) {
              if (cancelled) return;
              // Store in state — useEffect above will assign to video element
              setSrcObject(stream);
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
  }, [agentId, autoConnect, tokenData]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = isMuted; // if currently muted → re-enable; if not → disable
      });
    }
    setIsMuted((prev) => !prev);
    setShowUnmutePrompt(false);
  }, [isMuted]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Video element */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        {/* Start muted for autoplay compliance; user unmutes via button */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Connecting overlay */}
        {(status === "connecting" || status === "idle") && (
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

        {/* Unmute prompt — shown after stream starts */}
        {status === "connected" && showUnmutePrompt && isMuted && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={toggleMute}
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-5 py-3 flex items-center gap-2 text-white text-sm font-medium hover:bg-black/80 transition-colors">
              <MicOff className="w-4 h-4 text-amber-400" />
              Click to unmute audio
            </div>
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
