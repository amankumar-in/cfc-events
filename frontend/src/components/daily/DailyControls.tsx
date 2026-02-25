"use client";

import { useDaily, useLocalParticipant } from "@daily-co/daily-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff } from "lucide-react";
import DeviceSettings from "./DeviceSettings";
import NetworkQuality from "./NetworkQuality";

interface DailyControlsProps {
  onLeave?: () => void;
  showScreenShare?: boolean;
  compact?: boolean;
  isRecording?: boolean;
}

export default function DailyControls({
  onLeave,
  showScreenShare = true,
  compact = false,
  isRecording = false,
}: DailyControlsProps) {
  const daily = useDaily();
  const localParticipant = useLocalParticipant();

  const [handRaised, setHandRaised] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);

  const pushToTalkPrevState = useRef<boolean | null>(null);
  const reactionsRef = useRef<HTMLDivElement>(null);

  const isMuted = !localParticipant?.audio;
  const isCamOff = !localParticipant?.video;
  const isScreenSharing = localParticipant?.screen;

  const userName =
    localParticipant?.user_name || localParticipant?.user_id || "Guest";

  // Touch-friendly sizing: bigger on mobile
  const btnSize = compact ? "p-2" : "p-3 sm:p-3";
  const iconSize = compact ? "w-4 h-4" : "w-5 h-5";

  // ── Toggle helpers ──────────────────────────────────────────────────

  const toggleMic = useCallback(() => {
    daily?.setLocalAudio(!localParticipant?.audio);
  }, [daily, localParticipant?.audio]);

  const toggleCam = useCallback(() => {
    daily?.setLocalVideo(!localParticipant?.video);
  }, [daily, localParticipant?.video]);

  const toggleScreen = useCallback(async () => {
    if (isScreenSharing) {
      daily?.stopScreenShare();
    } else {
      daily?.startScreenShare();
    }
  }, [daily, isScreenSharing]);

  const leaveCall = useCallback(() => {
    daily?.leave();
    onLeave?.();
  }, [daily, onLeave]);

  const toggleHandRaise = useCallback(() => {
    const next = !handRaised;
    setHandRaised(next);
    daily?.sendAppMessage(
      { type: next ? "hand-raise" : "hand-lower", raised: next, userName },
      "*"
    );
  }, [daily, handRaised, userName]);

  const sendReaction = useCallback(
    (emoji: string) => {
      daily?.sendAppMessage({ type: "reaction", emoji, userName }, "*");
      setReactionsOpen(false);
    },
    [daily, userName]
  );

  const toggleCaptions = useCallback(() => {
    if (!daily) return;
    const next = !captionsOn;
    setCaptionsOn(next);
    try {
      if (next) {
        (daily as unknown as { startTranscription: (opts?: unknown) => void }).startTranscription();
      } else {
        (daily as unknown as { stopTranscription: () => void }).stopTranscription();
      }
    } catch {
      // Transcription may not be available on this plan
      setCaptionsOn(false);
    }
  }, [daily, captionsOn]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  // ── Fullscreen change listener ──────────────────────────────────────

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Close reactions popup on outside click ─────────────────────────

  useEffect(() => {
    if (!reactionsOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        reactionsRef.current &&
        !reactionsRef.current.contains(e.target as Node)
      ) {
        setReactionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [reactionsOpen]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────

  useEffect(() => {
    const isInputFocused = () => {
      const tag = document.activeElement?.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      switch (e.key) {
        case "m":
        case "M":
          e.preventDefault();
          toggleMic();
          break;
        case "v":
        case "V":
          e.preventDefault();
          toggleCam();
          break;
        case "h":
        case "H":
          e.preventDefault();
          toggleHandRaise();
          break;
        case " ":
          e.preventDefault();
          if (pushToTalkPrevState.current === null) {
            pushToTalkPrevState.current = !!localParticipant?.audio;
            daily?.setLocalAudio(true);
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isInputFocused()) return;
      if (e.key === " " && pushToTalkPrevState.current !== null) {
        e.preventDefault();
        daily?.setLocalAudio(pushToTalkPrevState.current);
        pushToTalkPrevState.current = null;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [daily, localParticipant?.audio, toggleMic, toggleCam, toggleHandRaise]);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-900">
      {/* Left: recording indicator + network quality */}
      <div className="flex items-center gap-2 min-w-[60px] sm:min-w-[80px]">
        <NetworkQuality />
        {isRecording && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 text-xs sm:text-sm text-white select-none">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <span className="font-semibold tracking-wide text-red-400">
              REC
            </span>
          </div>
        )}
      </div>

      {/* Center: controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mic */}
        <button
          onClick={toggleMic}
          className={`${btnSize} ${
            isMuted
              ? "bg-red-600 hover:bg-red-500"
              : "bg-gray-700 hover:bg-gray-600"
          } text-white transition-colors`}
          title={isMuted ? "Unmute (M)" : "Mute (M)"}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={!isMuted}
        >
          {isMuted ? <MicOff className={iconSize} /> : <Mic className={iconSize} />}
        </button>

        {/* Camera */}
        <button
          onClick={toggleCam}
          className={`${btnSize} ${
            isCamOff
              ? "bg-red-600 hover:bg-red-500"
              : "bg-gray-700 hover:bg-gray-600"
          } text-white transition-colors`}
          title={isCamOff ? "Turn on camera (V)" : "Turn off camera (V)"}
          aria-label={isCamOff ? "Turn on camera" : "Turn off camera"}
          aria-pressed={!isCamOff}
        >
          {isCamOff ? <VideoOff className={iconSize} /> : <Video className={iconSize} />}
        </button>

        {/* Screen share */}
        {showScreenShare && (
          <button
            onClick={toggleScreen}
            className={`${btnSize} ${
              isScreenSharing
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white transition-colors hidden sm:block`}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
            aria-label={isScreenSharing ? "Stop screen share" : "Share screen"}
            aria-pressed={!!isScreenSharing}
          >
            <svg
              className={iconSize}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}

        {/* Hand raise */}
        <button
          onClick={toggleHandRaise}
          className={`${btnSize} ${
            handRaised
              ? "bg-yellow-500 hover:bg-yellow-400 text-gray-900"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          } transition-colors`}
          title={handRaised ? "Lower hand (H)" : "Raise hand (H)"}
          aria-label={handRaised ? "Lower hand" : "Raise hand"}
          aria-pressed={handRaised}
        >
          <svg
            className={iconSize}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
            />
          </svg>
        </button>

        {/* Captions */}
        <button
          onClick={toggleCaptions}
          className={`${btnSize} ${
            captionsOn
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-gray-700 hover:bg-gray-600"
          } text-white transition-colors hidden sm:block`}
          title={captionsOn ? "Turn off captions" : "Turn on captions"}
          aria-label={captionsOn ? "Turn off captions" : "Turn on captions"}
          aria-pressed={captionsOn}
        >
          <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>

        {/* Reactions */}
        <div className="relative hidden sm:block" ref={reactionsRef}>
          <button
            onClick={() => setReactionsOpen((prev) => !prev)}
            className={`${btnSize} ${
              reactionsOpen
                ? "bg-gray-600"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white transition-colors`}
            title="Reactions"
            aria-label="Send a reaction"
            aria-expanded={reactionsOpen}
          >
            <svg
              className={iconSize}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {reactionsOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1 bg-gray-800 border border-gray-700 p-2 shadow-lg" role="menu">
              {["👍", "👏", "❤️", "😂", "🎉"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  className="text-xl hover:bg-gray-700 p-1.5 transition-colors leading-none"
                  title={emoji}
                  role="menuitem"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Device Settings */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setSettingsOpen((prev) => !prev)}
            className={`${btnSize} ${
              settingsOpen ? "bg-gray-600" : "bg-gray-700 hover:bg-gray-600"
            } text-white transition-colors`}
            title="Settings"
            aria-label="Device settings"
            aria-expanded={settingsOpen}
          >
            <svg
              className={iconSize}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          <DeviceSettings
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </div>

        {/* Picture-in-Picture */}
        <button
          onClick={() => {
            try {
              const video = document.querySelector("video");
              if (video && document.pictureInPictureElement) {
                document.exitPictureInPicture();
              } else if (video) {
                video.requestPictureInPicture();
              }
            } catch {}
          }}
          className={`${btnSize} bg-gray-700 hover:bg-gray-600 text-white transition-colors hidden sm:block`}
          title="Picture-in-Picture"
          aria-label="Toggle picture-in-picture"
        >
          <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h4v4h-4z" />
          </svg>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className={`${btnSize} bg-gray-700 hover:bg-gray-600 text-white transition-colors hidden sm:block`}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <svg
            className={iconSize}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {isFullscreen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Right: leave button */}
      <div className="flex items-center min-w-[60px] sm:min-w-[80px] justify-end">
        <button
          onClick={leaveCall}
          className={`${btnSize} px-3 sm:px-4 bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 sm:gap-2 transition-colors`}
          title="Leave call"
          aria-label="Leave call"
        >
          <svg
            className={iconSize}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
            />
          </svg>
          <span className={`font-medium ${compact ? "text-xs" : "text-xs sm:text-sm"}`}>
            Leave
          </span>
        </button>
      </div>
    </div>
  );
}
