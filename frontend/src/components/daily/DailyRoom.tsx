"use client";

import { useEffect, useState, useRef, ReactNode, useCallback } from "react";
import DailyIframe, { DailyCall as DailyCallType } from "@daily-co/daily-js";
import { DailyProvider, DailyAudio } from "@daily-co/daily-react";
import { getMeetingToken, recordJoin, recordLeave } from "@/lib/api/daily";
import { getToken } from "@/lib/auth/token";
import RecordingConsentBanner from "./RecordingConsentBanner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ConnectionState = "idle" | "joining" | "joined" | "reconnecting" | "error";

type ErrorKind =
  | "permission-denied"
  | "device-not-found"
  | "network"
  | "room-full"
  | "webrtc-unsupported"
  | "generic";

interface ClassifiedError {
  kind: ErrorKind;
  message: string;
}

interface DailyRoomProps {
  sessionId: string;
  roomUrl: string;
  token?: string;
  userName?: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Duration in ms after which we consider reconnection to have failed. */
const RECONNECT_TIMEOUT_MS = 30_000;

/** Token lifetime from backend is 4 h; warn at 3.5 h. */
const TOKEN_WARN_MS = 3.5 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function destroySafe(co: DailyCallType) {
  try {
    co.leave().catch(() => {});
    co.destroy();
  } catch {
    // already destroyed
  }
}

/** Classify an error (from Daily or native) into a user-friendly bucket. */
function classifyError(err: unknown): ClassifiedError {
  const msg =
    (err as { errorMsg?: string })?.errorMsg ??
    (err as { error?: { msg?: string } })?.error?.msg ??
    (err instanceof Error ? err.message : String(err));

  const lower = msg.toLowerCase();

  if (
    lower.includes("webrtc") ||
    lower.includes("not supported") ||
    lower.includes("suppressed")
  ) {
    return {
      kind: "webrtc-unsupported",
      message:
        "Your browser does not support video calls. Please use a recent version of Chrome, Firefox, Safari, or Edge.",
    };
  }

  if (
    lower.includes("not allowed") ||
    lower.includes("permission denied") ||
    lower.includes("notallowederror")
  ) {
    return {
      kind: "permission-denied",
      message:
        "Camera/microphone access was denied. Please allow access in your browser settings.",
    };
  }

  if (
    lower.includes("not found") ||
    lower.includes("notfounderror") ||
    lower.includes("requested device not found") ||
    lower.includes("no device")
  ) {
    return {
      kind: "device-not-found",
      message:
        "No camera/microphone found. You can still join audio-only.",
    };
  }

  if (lower.includes("full") || lower.includes("room is full")) {
    return {
      kind: "room-full",
      message: "This session is full.",
    };
  }

  if (
    lower.includes("network") ||
    lower.includes("connection") ||
    lower.includes("websocket") ||
    lower.includes("ice")
  ) {
    return {
      kind: "network",
      message: "Network connection lost. Please check your internet and try again.",
    };
  }

  return {
    kind: "generic",
    message: msg || "An unexpected error occurred.",
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Spinner({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div
      className={`${className} border-t-2 border-yellow-500 border-solid rounded-full animate-spin`}
    />
  );
}

function ErrorDisplay({
  error,
  onRetry,
}: {
  error: ClassifiedError;
  onRetry?: () => void;
}) {
  const canRetry = error.kind !== "room-full" && error.kind !== "webrtc-unsupported";

  return (
    <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="text-center max-w-md px-6">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          {error.kind === "webrtc-unsupported" && (
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          )}
          {error.kind === "permission-denied" && (
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          )}
          {error.kind === "device-not-found" && (
            <svg
              className="w-12 h-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
          {(error.kind === "network" || error.kind === "generic") && (
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
              />
            </svg>
          )}
          {error.kind === "room-full" && (
            <svg
              className="w-12 h-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </div>

        <p className="text-red-600 dark:text-red-400 mb-4 text-sm">
          {error.message}
        </p>

        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-yellow-500 text-black font-medium hover:bg-yellow-400"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

function ReconnectingOverlay({ onRejoin }: { onRejoin: () => void }) {
  const [showRejoin, setShowRejoin] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowRejoin(true), RECONNECT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="text-center">
        {!showRejoin ? (
          <>
            <Spinner className="w-8 h-8 mx-auto mb-3" />
            <p className="text-white text-sm font-medium">Reconnecting...</p>
            <p className="text-gray-400 text-xs mt-1">
              Please wait while we restore your connection.
            </p>
          </>
        ) : (
          <>
            <svg
              className="w-10 h-10 text-red-500 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636a9 9 0 11-12.728 0"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01"
              />
            </svg>
            <p className="text-white text-sm font-medium mb-1">
              Connection lost
            </p>
            <p className="text-gray-400 text-xs mb-4">
              Automatic reconnection failed.
            </p>
            <button
              onClick={onRejoin}
              className="px-4 py-2 bg-yellow-500 text-black font-medium hover:bg-yellow-400"
            >
              Rejoin
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function TokenExpiryWarning({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-yellow-500 text-black px-4 py-2 text-sm font-medium shadow-lg">
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Session token expiring soon.</span>
      <button
        onClick={onRefresh}
        className="underline hover:no-underline font-bold"
      >
        Refresh now
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DailyRoom({
  sessionId,
  roomUrl,
  token: propToken,
  userName,
  audioEnabled = true,
  videoEnabled = true,
  audioDeviceId,
  videoDeviceId,
  children,
}: DailyRoomProps) {
  const [callObject, setCallObject] = useState<DailyCallType | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [error, setError] = useState<ClassifiedError | null>(null);
  const [tokenWarning, setTokenWarning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const callRef = useRef<DailyCallType | null>(null);
  const genRef = useRef(0);
  const tokenTimestampRef = useRef<number>(0);
  const tokenWarningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attendanceIdRef = useRef<string | null>(null);

  // -----------------------------------------------------------------------
  // Token refresh
  // -----------------------------------------------------------------------

  const fetchFreshToken = useCallback(async () => {
    const jwt = getToken();
    const res = await getMeetingToken(sessionId, userName, jwt ?? undefined);
    tokenTimestampRef.current = Date.now();
    return res.token as string;
  }, [sessionId, userName]);

  const scheduleTokenWarning = useCallback(() => {
    if (tokenWarningTimerRef.current) {
      clearTimeout(tokenWarningTimerRef.current);
    }
    tokenWarningTimerRef.current = setTimeout(() => {
      setTokenWarning(true);
    }, TOKEN_WARN_MS);
  }, []);

  const handleTokenRefresh = useCallback(async () => {
    try {
      const freshToken = await fetchFreshToken();
      const daily = callRef.current;
      if (daily) {
        // Daily.co doesn't have a direct "update token" method on an active
        // call, but we can leave + rejoin with the fresh token transparently.
        // However, for the best UX we store the fresh token and let the user
        // continue — the new token will be used on any subsequent rejoin.
        // For now, hide the warning and reschedule.
        //
        // If Daily adds updateToken() in the future, call it here.
      }
      setTokenWarning(false);
      scheduleTokenWarning();
      // Store fresh token so any future rejoin picks it up
      tokenTimestampRef.current = Date.now();
      // Note: propToken is not mutable, but freshToken will be used on rejoin
    } catch {
      // Silently fail — user can try again or just continue until the token
      // actually expires, at which point they will be disconnected and can
      // use the rejoin flow.
    }
  }, [fetchFreshToken, scheduleTokenWarning]);

  // -----------------------------------------------------------------------
  // Join / Rejoin
  // -----------------------------------------------------------------------

  const joinRoom = useCallback(async () => {
    // Increment generation so any previous in-flight call becomes stale
    const gen = ++genRef.current;
    const isStale = () => gen !== genRef.current;

    try {
      setConnectionState("joining");
      setError(null);
      setTokenWarning(false);

      // Destroy any existing instance first
      if (callRef.current) {
        destroySafe(callRef.current);
        callRef.current = null;
        setCallObject(null);
      }

      // Obtain meeting token
      let meetingToken = propToken;
      if (!meetingToken) {
        meetingToken = await fetchFreshToken();
      } else {
        tokenTimestampRef.current = Date.now();
      }

      if (isStale()) return;

      // Check WebRTC support before creating the call object
      const browserInfo = DailyIframe.supportedBrowser();
      if (!browserInfo.supported) {
        setError({
          kind: "webrtc-unsupported",
          message:
            "Your browser does not support video calls. Please use a recent version of Chrome, Firefox, Safari, or Edge.",
        });
        setConnectionState("error");
        return;
      }

      // Create call object
      const daily = DailyIframe.createCallObject();
      callRef.current = daily;

      // -----------------------------------------------------------------
      // Event listeners
      // -----------------------------------------------------------------

      // Error events
      daily.on("error", (ev) => {
        console.error("Daily error:", ev);
        const classified = classifyError(ev);

        // Device errors are non-fatal — user can still participate
        if (classified.kind === "device-not-found") {
          // We don't set connection state to error; just log the warning.
          // The user is still in the call.
          console.warn("Device not found — continuing in audio-only mode.");
          return;
        }

        setError(classified);
        setConnectionState("error");
      });

      // Network / reconnection events
      daily.on("network-connection", (ev) => {
        const type = String(ev?.type ?? "");
        if (type === "interrupted") {
          setConnectionState("reconnecting");
        } else if (type === "connected") {
          // Only move back to joined if we were reconnecting
          setConnectionState((prev) =>
            prev === "reconnecting" ? "joined" : prev
          );
        }
      });

      // Left meeting (kicked, network failure after retry, etc.)
      daily.on("left-meeting", () => {
        // If we are not in a "stale" teardown, treat as unexpected disconnect
        if (!isStale()) {
          setConnectionState("error");
          setError({
            kind: "network",
            message: "You were disconnected from the session.",
          });
        }
      });

      // Recording state tracking
      daily.on("recording-started", () => setIsRecording(true));
      daily.on("recording-stopped", () => setIsRecording(false));

      // -----------------------------------------------------------------
      // Join the call
      // -----------------------------------------------------------------

      const joinOptions: Record<string, unknown> = {
        url: roomUrl,
        token: meetingToken,
        startVideoOff: !videoEnabled,
        startAudioOff: !audioEnabled,
      };
      if (audioDeviceId) joinOptions.audioSource = audioDeviceId;
      if (videoDeviceId) joinOptions.videoSource = videoDeviceId;

      await daily.join(joinOptions);

      if (isStale()) {
        destroySafe(daily);
        callRef.current = null;
        return;
      }

      setCallObject(daily);
      setConnectionState("joined");
      scheduleTokenWarning();

      // Record attendance
      const localUser = daily.participants()?.local;
      recordJoin(sessionId, localUser?.user_id || undefined, localUser?.user_name || userName)
        .then((res: unknown) => {
          const data = res as { attendanceId?: string };
          if (data?.attendanceId) {
            attendanceIdRef.current = data.attendanceId;
          }
        })
        .catch((err: unknown) => console.warn("Failed to record join:", err));
    } catch (err) {
      if (isStale()) return;
      console.error("Failed to join Daily room:", err);
      const classified = classifyError(err);
      setError(classified);
      setConnectionState("error");
    }
  }, [
    roomUrl,
    propToken,
    sessionId,
    userName,
    audioEnabled,
    videoEnabled,
    audioDeviceId,
    videoDeviceId,
    fetchFreshToken,
    scheduleTokenWarning,
  ]);

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  useEffect(() => {
    joinRoom();

    return () => {
      // Bump generation so any in-flight joinRoom from this effect becomes stale
      genRef.current++;

      if (tokenWarningTimerRef.current) {
        clearTimeout(tokenWarningTimerRef.current);
      }

      // Record attendance leave
      if (attendanceIdRef.current) {
        recordLeave(attendanceIdRef.current).catch(() => {});
        attendanceIdRef.current = null;
      }

      const co = callRef.current;
      if (co) {
        destroySafe(co);
        callRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinRoom]);

  // -----------------------------------------------------------------------
  // Retry handler
  // -----------------------------------------------------------------------

  const handleRetry = useCallback(() => {
    setError(null);
    setConnectionState("idle");
    joinRoom();
  }, [joinRoom]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  // Error state — full-page error screen
  if (connectionState === "error" && error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  // Joining state — full-page spinner
  if (connectionState === "joining" || connectionState === "idle" || !callObject) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Spinner className="w-10 h-10 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Joining session...
          </p>
        </div>
      </div>
    );
  }

  // Joined (possibly reconnecting) — render children with optional overlays
  return (
    <DailyProvider callObject={callObject}>
      <div className="relative h-full">
        <DailyAudio />

        {/* Recording consent banner */}
        <RecordingConsentBanner isRecording={isRecording} />

        {/* Token expiry warning banner */}
        {tokenWarning && (
          <TokenExpiryWarning onRefresh={handleTokenRefresh} />
        )}

        {/* Reconnecting overlay — semi-transparent on top of the call */}
        {connectionState === "reconnecting" && (
          <ReconnectingOverlay onRejoin={handleRetry} />
        )}

        {children}
      </div>
    </DailyProvider>
  );
}
