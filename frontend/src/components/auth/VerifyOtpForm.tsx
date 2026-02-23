"use client";

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { verifyOtp, sendOtp } from "@/lib/api/auth";
import { useAuth } from "./useAuth";
import { Button } from "@/components/ui/Button";

interface VerifyOtpFormProps {
  email: string;
  returnTo?: string;
}

const CODE_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes

export function VerifyOtpForm({ email, returnTo }: VerifyOtpFormProps) {
  const { login } = useAuth();
  const router = useRouter();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(OTP_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== CODE_LENGTH) return;

    setError(null);
    setLoading(true);

    try {
      const res = await verifyOtp(email, code);
      if (res?.jwt) {
        await login(res.jwt);
        router.push(returnTo || "/");
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setCanResend(false);
    setCountdown(OTP_EXPIRY_SECONDS);
    setError(null);
    try {
      await sendOtp(email);
    } catch {
      setError("Failed to resend code.");
    }
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-12 h-14 text-center text-xl font-bold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-yellow-500"
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        {countdown > 0 ? (
          <span>
            Code expires in {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        ) : (
          <span>Code expired</span>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={loading || digits.join("").length !== CODE_LENGTH}
      >
        {loading ? "Verifying..." : "Verify"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className={`text-sm font-medium ${
            canResend
              ? "text-yellow-500 hover:text-yellow-400"
              : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          Resend code
        </button>
      </div>
    </form>
  );
}
