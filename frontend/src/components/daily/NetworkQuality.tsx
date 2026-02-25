"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDaily } from "@daily-co/daily-react";

type Quality = "good" | "fair" | "poor" | "unknown";

function getQuality(stats: { latest?: { videoRecvBitsPerSecond?: number; videoRecvPacketLoss?: number } } | null): Quality {
  if (!stats?.latest) return "unknown";
  const loss = stats.latest.videoRecvPacketLoss ?? 0;
  const bps = stats.latest.videoRecvBitsPerSecond ?? 0;

  if (loss > 5 || bps < 50_000) return "poor";
  if (loss > 1 || bps < 200_000) return "fair";
  return "good";
}

const barColors: Record<Quality, string> = {
  good: "bg-green-500",
  fair: "bg-yellow-500",
  poor: "bg-red-500",
  unknown: "bg-gray-500",
};

const labels: Record<Quality, string> = {
  good: "Good connection",
  fair: "Fair connection",
  poor: "Poor connection",
  unknown: "Checking...",
};

export default function NetworkQuality() {
  const daily = useDaily();
  const [quality, setQuality] = useState<Quality>("unknown");
  const [degraded, setDegraded] = useState(false);
  const poorCountRef = useRef(0);

  const autoDisableVideo = useCallback(() => {
    if (!daily) return;
    try {
      const local = daily.participants()?.local;
      if (local?.video) {
        daily.setLocalVideo(false);
        setDegraded(true);
      }
    } catch {
      // ignore
    }
  }, [daily]);

  useEffect(() => {
    if (!daily) return;

    const check = async () => {
      try {
        const stats = await (daily as unknown as { getNetworkStats: () => Promise<{ latest?: { videoRecvBitsPerSecond?: number; videoRecvPacketLoss?: number } }> }).getNetworkStats();
        const q = getQuality(stats);
        setQuality(q);

        // Auto-disable video after 3 consecutive poor readings
        if (q === "poor") {
          poorCountRef.current++;
          if (poorCountRef.current >= 3) {
            autoDisableVideo();
          }
        } else {
          poorCountRef.current = 0;
        }
      } catch {
        setQuality("unknown");
      }
    };

    check();
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, [daily, autoDisableVideo]);

  if (quality === "unknown") return null;

  const barsActive = quality === "good" ? 3 : quality === "fair" ? 2 : 1;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-0.5" title={labels[quality]}>
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`w-1 ${bar === 1 ? "h-1.5" : bar === 2 ? "h-2.5" : "h-3.5"} ${
              bar <= barsActive ? barColors[quality] : "bg-gray-600"
            }`}
          />
        ))}
      </div>
      {degraded && (
        <span className="text-[10px] text-amber-400 font-medium">
          Video off (low bandwidth)
        </span>
      )}
    </div>
  );
}
