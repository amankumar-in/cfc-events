"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useDaily } from "@daily-co/daily-react";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

interface DeviceSettingsProps {
  open: boolean;
  onClose: () => void;
}

export default function DeviceSettings({ open, onClose }: DeviceSettingsProps) {
  const daily = useDaily();
  const panelRef = useRef<HTMLDivElement>(null);

  const [audioInputs, setAudioInputs] = useState<DeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<DeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<DeviceInfo[]>([]);

  const [selectedAudioInput, setSelectedAudioInput] = useState("");
  const [selectedVideoInput, setSelectedVideoInput] = useState("");
  const [selectedAudioOutput, setSelectedAudioOutput] = useState("");
  const [bgBlurEnabled, setBgBlurEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("high-contrast");
    }
    return false;
  });

  // Load available devices
  useEffect(() => {
    if (!open || !daily) return;

    const loadDevices = async () => {
      try {
        const { devices } = await daily.enumerateDevices();

        const audioIn: DeviceInfo[] = [];
        const videoIn: DeviceInfo[] = [];
        const audioOut: DeviceInfo[] = [];

        for (const d of devices) {
          const info = {
            deviceId: d.deviceId,
            label: d.label || `${d.kind} (${d.deviceId.slice(0, 8)})`,
          };
          if (d.kind === "audioinput") audioIn.push(info);
          else if (d.kind === "videoinput") videoIn.push(info);
          else if (d.kind === "audiooutput") audioOut.push(info);
        }

        setAudioInputs(audioIn);
        setVideoInputs(videoIn);
        setAudioOutputs(audioOut);

        // Get current selections
        const currDevices = await daily.getInputDevices();
        const cam = currDevices?.camera as Record<string, unknown> | undefined;
        const mic = currDevices?.mic as Record<string, unknown> | undefined;
        const spk = currDevices?.speaker as Record<string, unknown> | undefined;
        if (cam?.deviceId) {
          setSelectedVideoInput(cam.deviceId as string);
        }
        if (mic?.deviceId) {
          setSelectedAudioInput(mic.deviceId as string);
        }
        if (spk?.deviceId) {
          setSelectedAudioOutput(spk.deviceId as string);
        }
      } catch (err) {
        console.warn("Failed to enumerate devices:", err);
      }
    };

    loadDevices();
  }, [open, daily]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleAudioInputChange = useCallback(
    async (deviceId: string) => {
      setSelectedAudioInput(deviceId);
      try {
        await daily?.setInputDevicesAsync({ audioDeviceId: deviceId });
      } catch (err) {
        console.error("Failed to set audio input:", err);
      }
    },
    [daily]
  );

  const handleVideoInputChange = useCallback(
    async (deviceId: string) => {
      setSelectedVideoInput(deviceId);
      try {
        await daily?.setInputDevicesAsync({ videoDeviceId: deviceId });
      } catch (err) {
        console.error("Failed to set video input:", err);
      }
    },
    [daily]
  );

  const handleAudioOutputChange = useCallback(
    async (deviceId: string) => {
      setSelectedAudioOutput(deviceId);
      try {
        await daily?.setOutputDeviceAsync({ outputDeviceId: deviceId });
      } catch (err) {
        console.error("Failed to set audio output:", err);
      }
    },
    [daily]
  );

  const handleToggleBlur = useCallback(
    async () => {
      const next = !bgBlurEnabled;
      setBgBlurEnabled(next);
      try {
        if (next) {
          await (daily as unknown as { updateInputSettings: (s: unknown) => Promise<void> })?.updateInputSettings({
            video: { processor: { type: "background-blur", config: { strength: 0.5 } } },
          });
        } else {
          await (daily as unknown as { updateInputSettings: (s: unknown) => Promise<void> })?.updateInputSettings({
            video: { processor: { type: "none" } },
          });
        }
      } catch (err) {
        console.warn("Background blur not supported:", err);
        setBgBlurEnabled(false);
      }
    },
    [daily, bgBlurEnabled]
  );

  const handleTestSpeaker = useCallback(() => {
    try {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 500);
    } catch {
      // AudioContext not available
    }
  }, []);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-800 border border-gray-700 shadow-xl z-50 p-4 space-y-4"
      role="dialog"
      aria-label="Device settings"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white text-sm font-bold">Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          aria-label="Close settings"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Microphone */}
      {audioInputs.length > 0 && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Microphone
          </label>
          <select
            value={selectedAudioInput}
            onChange={(e) => handleAudioInputChange(e.target.value)}
            className="w-full bg-gray-700 text-white text-xs border border-gray-600 px-2 py-1.5"
          >
            {audioInputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Camera */}
      {videoInputs.length > 0 && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Camera</label>
          <select
            value={selectedVideoInput}
            onChange={(e) => handleVideoInputChange(e.target.value)}
            className="w-full bg-gray-700 text-white text-xs border border-gray-600 px-2 py-1.5"
          >
            {videoInputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Speaker */}
      {audioOutputs.length > 0 && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Speaker</label>
          <select
            value={selectedAudioOutput}
            onChange={(e) => handleAudioOutputChange(e.target.value)}
            className="w-full bg-gray-700 text-white text-xs border border-gray-600 px-2 py-1.5"
          >
            {audioOutputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Background blur */}
      {videoInputs.length > 0 && (
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-400">Background blur</label>
          <button
            onClick={handleToggleBlur}
            className={`relative w-9 h-5 transition-colors ${
              bgBlurEnabled ? "bg-yellow-500" : "bg-gray-600"
            }`}
            role="switch"
            aria-checked={bgBlurEnabled}
            aria-label={bgBlurEnabled ? "Disable background blur" : "Enable background blur"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${
                bgBlurEnabled ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>
      )}

      {/* High contrast mode */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-400">High contrast</label>
        <button
          onClick={() => {
            const next = !highContrast;
            setHighContrast(next);
            document.documentElement.classList.toggle("high-contrast", next);
          }}
          className={`relative w-9 h-5 transition-colors ${
            highContrast ? "bg-yellow-500" : "bg-gray-600"
          }`}
          role="switch"
          aria-checked={highContrast}
          aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${
              highContrast ? "translate-x-4" : ""
            }`}
          />
        </button>
      </div>

      {/* Speaker test */}
      {audioOutputs.length > 0 && (
        <button
          onClick={handleTestSpeaker}
          className="w-full px-3 py-1.5 text-xs font-medium border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          Test Speaker
        </button>
      )}

      {audioInputs.length === 0 &&
        videoInputs.length === 0 &&
        audioOutputs.length === 0 && (
          <p className="text-xs text-gray-400">No devices found.</p>
        )}
    </div>
  );
}
