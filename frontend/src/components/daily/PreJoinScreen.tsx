"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAudioLevel } from "@daily-co/daily-react";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Network Test                                                       */
/* ------------------------------------------------------------------ */

function NetworkTest() {
  const [status, setStatus] = useState<"testing" | "good" | "fair" | "poor">("testing");

  useEffect(() => {
    let cancelled = false;
    const test = async () => {
      try {
        // Use navigator.connection if available
        const conn = (navigator as unknown as { connection?: { downlink?: number; effectiveType?: string } }).connection;
        if (conn?.effectiveType) {
          if (!cancelled) {
            if (conn.effectiveType === "4g" && (conn.downlink ?? 10) >= 2) {
              setStatus("good");
            } else if (conn.effectiveType === "3g" || (conn.downlink ?? 10) >= 0.5) {
              setStatus("fair");
            } else {
              setStatus("poor");
            }
          }
          return;
        }

        // Fallback: measure fetch latency
        const start = performance.now();
        await fetch("/favicon.ico", { cache: "no-store", mode: "no-cors" });
        const latency = performance.now() - start;
        if (!cancelled) {
          if (latency < 200) setStatus("good");
          else if (latency < 500) setStatus("fair");
          else setStatus("poor");
        }
      } catch {
        if (!cancelled) setStatus("fair");
      }
    };
    test();
    return () => { cancelled = true; };
  }, []);

  const colors = { testing: "bg-gray-500", good: "bg-green-500", fair: "bg-yellow-500", poor: "bg-red-500" };
  const labels = { testing: "Testing...", good: "Good network", fair: "Fair network", poor: "Poor network" };

  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block w-2 h-2 ${colors[status]}`} />
      {labels[status]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PreJoinScreenProps {
  userName?: string;
  onJoin: (settings: {
    userName: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
    audioDeviceId?: string;
    videoDeviceId?: string;
  }) => void;
  sessionTitle?: string;
  sessionType?: "call" | "livestream";
}

interface DeviceInfo {
  deviceId: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PreJoinScreen({
  userName: initialUserName = "",
  onJoin,
  sessionTitle,
  sessionType = "call",
}: PreJoinScreenProps) {
  /* ----- state ---------------------------------------------------- */
  const [userName, setUserName] = useState(initialUserName);

  // Defaults differ by session type: call = on, livestream = off
  const [audioEnabled, setAudioEnabled] = useState(sessionType === "call");
  const [videoEnabled, setVideoEnabled] = useState(sessionType === "call");

  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<DeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");

  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const [micLevel, setMicLevel] = useState(0);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | undefined>();

  /* ----- refs ----------------------------------------------------- */
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  /* ----- Daily's audio level hook --------------------------------- */
  useAudioLevel(
    audioTrack,
    useCallback((volume: number) => {
      setMicLevel(volume);
    }, [])
  );

  /* ----- helpers -------------------------------------------------- */

  /** Stop every track on the current stream. */
  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setAudioTrack(undefined);
    setMicLevel(0);
  }, []);

  /** Enumerate devices after permission has been granted. */
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter((d) => d.kind === "videoinput" && d.deviceId)
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 5)}` }));
      const audioInputs = devices
        .filter((d) => d.kind === "audioinput" && d.deviceId)
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 5)}` }));

      setCameras(videoInputs);
      setMicrophones(audioInputs);

      if (videoInputs.length === 0) {
        setCameraError("No camera found. You can still join with audio only.");
      }
      if (audioInputs.length === 0) {
        setMicError("No microphone found. You can still join with video only.");
      }

      return { videoInputs, audioInputs };
    } catch {
      return { videoInputs: [] as DeviceInfo[], audioInputs: [] as DeviceInfo[] };
    }
  }, []);

  /**
   * Acquire (or re-acquire) the media stream with the given device constraints.
   * Called on mount, when device selection changes, or when toggling audio/video.
   */
  const acquireStream = useCallback(
    async (opts?: { cameraId?: string; micId?: string; video?: boolean; audio?: boolean }) => {
      const wantVideo = opts?.video ?? videoEnabled;
      const wantAudio = opts?.audio ?? audioEnabled;
      const cameraId = opts?.cameraId ?? selectedCameraId;
      const micId = opts?.micId ?? selectedMicId;

      // If both are off we just stop everything
      if (!wantVideo && !wantAudio) {
        stopCurrentStream();
        return;
      }

      // Build constraints
      const constraints: MediaStreamConstraints = {};

      if (wantVideo) {
        constraints.video = cameraId ? { deviceId: { exact: cameraId } } : true;
      }
      if (wantAudio) {
        constraints.audio = micId ? { deviceId: { exact: micId } } : true;
      }

      try {
        stopCurrentStream();
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!mountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setPermissionError(null);

        // Assign video to preview element
        if (wantVideo && videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Pass audio track to Daily's useAudioLevel hook
        const streamAudioTrack = wantAudio ? stream.getAudioTracks()[0] : undefined;
        setAudioTrack(streamAudioTrack);

        // Update selected device IDs from the actual tracks
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          if (settings.deviceId && settings.deviceId !== cameraId) {
            setSelectedCameraId(settings.deviceId);
          }
        }
        if (audioTrack) {
          const settings = audioTrack.getSettings();
          if (settings.deviceId && settings.deviceId !== micId) {
            setSelectedMicId(settings.deviceId);
          }
        }

        // After getting permission, enumerate devices to get full labels
        await enumerateDevices();
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        const error = err as DOMException;

        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          setPermissionError(
            "Camera and microphone access was denied. Please allow access in your browser settings and reload the page."
          );
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          if (wantVideo && wantAudio) {
            // Try audio-only
            setCameraError("No camera found. Trying audio only.");
            try {
              const audioOnly = await navigator.mediaDevices.getUserMedia({
                audio: micId ? { deviceId: { exact: micId } } : true,
              });
              if (!mountedRef.current) {
                audioOnly.getTracks().forEach((t) => t.stop());
                return;
              }
              streamRef.current = audioOnly;
              setAudioTrack(audioOnly.getAudioTracks()[0]);
              await enumerateDevices();
            } catch {
              setMicError("No microphone found either.");
              setPermissionError(
                "No camera or microphone found. Please connect a device and reload."
              );
            }
          } else if (wantVideo) {
            setCameraError("No camera found. You can join with audio only.");
          } else {
            setMicError("No microphone found. You can join with video only.");
          }
        } else if (error.name === "NotReadableError" || error.name === "AbortError") {
          setPermissionError(
            "Your camera or microphone is already in use by another application. Please close it and try again."
          );
        } else {
          setPermissionError(
            `Could not access media devices: ${error.message || "Unknown error"}`
          );
        }
      }
    },
    [
      videoEnabled,
      audioEnabled,
      selectedCameraId,
      selectedMicId,
      stopCurrentStream,
      enumerateDevices,
    ]
  );

  /* ----- initial mount -------------------------------------------- */
  useEffect(() => {
    mountedRef.current = true;
    acquireStream();

    return () => {
      mountedRef.current = false;
      stopCurrentStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- device change handlers ----------------------------------- */
  const handleCameraChange = useCallback(
    (deviceId: string) => {
      setSelectedCameraId(deviceId);
      acquireStream({ cameraId: deviceId });
    },
    [acquireStream]
  );

  const handleMicChange = useCallback(
    (deviceId: string) => {
      setSelectedMicId(deviceId);
      acquireStream({ micId: deviceId });
    },
    [acquireStream]
  );

  const handleToggleVideo = useCallback(() => {
    const next = !videoEnabled;
    setVideoEnabled(next);
    acquireStream({ video: next });
  }, [videoEnabled, acquireStream]);

  const handleToggleAudio = useCallback(() => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    acquireStream({ audio: next });
  }, [audioEnabled, acquireStream]);

  /* ----- join ----------------------------------------------------- */
  const handleJoin = useCallback(() => {
    // Stop all tracks — Daily.co will acquire its own
    stopCurrentStream();

    onJoin({
      userName: userName.trim() || "Guest",
      audioEnabled,
      videoEnabled,
      audioDeviceId: selectedMicId || undefined,
      videoDeviceId: selectedCameraId || undefined,
    });
  }, [
    userName,
    audioEnabled,
    videoEnabled,
    selectedCameraId,
    selectedMicId,
    onJoin,
    stopCurrentStream,
  ]);

  /* ----- user initial for avatar ---------------------------------- */
  const userInitial = (userName.trim() || "G").charAt(0).toUpperCase();

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          {sessionTitle && (
            <h1 className="text-2xl font-bold text-white mb-1">{sessionTitle}</h1>
          )}
          <p className="text-sm text-gray-400 uppercase tracking-wider">
            {sessionType === "livestream" ? "Livestream" : "Video Call"}
          </p>
        </div>

        {/* Permission error banner */}
        {permissionError && (
          <div className="mb-4 bg-red-900/40 border border-red-700 px-4 py-3">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-red-300">{permissionError}</p>
                <button
                  onClick={() => {
                    setPermissionError(null);
                    setCameraError(null);
                    setMicError(null);
                    acquireStream();
                  }}
                  className="mt-2 text-xs text-yellow-500 hover:text-yellow-400 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Camera preview */}
        <div className="relative bg-gray-800 aspect-video mb-4 overflow-hidden">
          {videoEnabled && !cameraError ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-400">
                {userInitial}
              </div>
            </div>
          )}

          {/* Camera off label */}
          {!videoEnabled && (
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-xs text-gray-500">Camera is off</span>
            </div>
          )}

          {/* Camera error label */}
          {cameraError && videoEnabled && (
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="text-xs text-gray-500">{cameraError}</span>
            </div>
          )}
        </div>

        {/* Name field */}
        <div className="mb-4">
          <label
            htmlFor="prejoin-name"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Display name
          </label>
          <input
            id="prejoin-name"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        {/* Camera row */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="prejoin-camera"
              className="block text-xs font-medium text-gray-400 mb-1"
            >
              Camera
            </label>
            <select
              id="prejoin-camera"
              value={selectedCameraId}
              onChange={(e) => handleCameraChange(e.target.value)}
              disabled={cameras.length === 0 && !videoEnabled}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            >
              {cameras.length === 0 ? (
                <option value="">{videoEnabled ? "No cameras detected" : "Camera off"}</option>
              ) : (
                cameras.map((cam) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="pt-5">
            <button
              onClick={handleToggleVideo}
              className={`p-2 ${
                videoEnabled
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white"
              }`}
              title={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Microphone row */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <label
              htmlFor="prejoin-mic"
              className="block text-xs font-medium text-gray-400 mb-1"
            >
              Microphone
            </label>
            <select
              id="prejoin-mic"
              value={selectedMicId}
              onChange={(e) => handleMicChange(e.target.value)}
              disabled={microphones.length === 0 && !audioEnabled}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
            >
              {microphones.length === 0 ? (
                <option value="">{audioEnabled ? "No microphones detected" : "Microphone off"}</option>
              ) : (
                microphones.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="pt-5">
            <button
              onClick={handleToggleAudio}
              className={`p-2 ${
                audioEnabled
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white"
              }`}
              title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mic level meter */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-800 border border-gray-700 overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-[width] duration-100"
                style={{ width: `${Math.min(micLevel * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-16 text-right">
              {audioEnabled ? "mic level" : "muted"}
            </span>
          </div>
          {micError && (
            <p className="text-xs text-gray-500 mt-1">{micError}</p>
          )}
        </div>

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={!userName.trim()}
          className="w-full py-3 bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Join {sessionType === "livestream" ? "Livestream" : "Session"}
        </button>

        {/* Summary of selected state + network test */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span
              className={`inline-block w-2 h-2 ${
                videoEnabled ? "bg-green-500" : "bg-red-500"
              }`}
            />
            Camera {videoEnabled ? "on" : "off"}
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`inline-block w-2 h-2 ${
                audioEnabled ? "bg-green-500" : "bg-red-500"
              }`}
            />
            Mic {audioEnabled ? "on" : "off"}
          </span>
          <NetworkTest />
        </div>
      </div>
    </div>
  );
}
