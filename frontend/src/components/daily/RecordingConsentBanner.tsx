"use client";

import { useState, useCallback, useEffect } from "react";
import { useAppMessage } from "@daily-co/daily-react";

interface RecordingConsentBannerProps {
  isRecording: boolean;
}

export default function RecordingConsentBanner({ isRecording }: RecordingConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show banner when recording starts
  useEffect(() => {
    if (isRecording && !dismissed) {
      setShowBanner(true);
    }
    if (!isRecording) {
      setDismissed(false);
    }
  }, [isRecording, dismissed]);

  // Also listen for recording-started app message from admin
  useAppMessage({
    onAppMessage: useCallback(
      (ev: { data: Record<string, unknown> }) => {
        if (ev.data.type === "recording-started") {
          setShowBanner(true);
          setDismissed(false);
        }
        if (ev.data.type === "recording-stopped") {
          setShowBanner(false);
        }
      },
      []
    ),
  });

  if (!showBanner) return null;

  return (
    <div
      className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 flex items-center justify-between gap-4"
      role="alert"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <div>
          <p className="font-bold text-sm">This session is being recorded</p>
          <p className="text-xs text-red-100">
            By continuing, you consent to being recorded. Leave the session if you do not consent.
          </p>
        </div>
      </div>
      <button
        onClick={() => {
          setShowBanner(false);
          setDismissed(true);
        }}
        className="flex-shrink-0 px-3 py-1 bg-white/20 hover:bg-white/30 text-sm font-medium"
        aria-label="Acknowledge recording"
      >
        I understand
      </button>
    </div>
  );
}
