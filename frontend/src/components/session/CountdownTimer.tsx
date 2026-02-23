"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calcTimeLeft(targetDate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="text-center">
        <span className="text-sm font-medium text-yellow-500">
          Session has started
        </span>
      </div>
    );
  }

  const segments: { value: number; label: string }[] = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {segments.map((seg) => (
        <div key={seg.label} className="text-center">
          <div className="w-16 h-16 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {String(seg.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            {seg.label}
          </span>
        </div>
      ))}
    </div>
  );
}
