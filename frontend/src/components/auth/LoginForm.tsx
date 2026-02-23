"use client";

import { useState, FormEvent } from "react";
import { sendOtp } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";

interface LoginFormProps {
  returnTo?: string;
  onOtpSent?: (email: string) => void;
}

export function LoginForm({ onOtpSent }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendOtp(email);
      setSuccess(true);
      onOtpSent?.(email);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-yellow-500 mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Check your email
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          We sent a verification code to <strong>{email}</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="login-email"
          className="block text-sm font-medium text-gray-900 dark:text-white mb-1"
        >
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={loading || !email}
      >
        {loading ? "Sending..." : "Send OTP"}
      </Button>
    </form>
  );
}
