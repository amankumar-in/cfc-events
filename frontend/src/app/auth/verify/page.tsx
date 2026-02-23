"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VerifyOtpForm } from "@/components/auth/VerifyOtpForm";
import { Button } from "@/components/ui/Button";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const returnTo = searchParams.get("returnTo") || "/";

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          No email provided.
        </p>
        <Button variant="primary" href="/auth/login">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8">
        <div className="mb-6">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verify Code
          </h1>
        </div>
        <VerifyOtpForm email={email} returnTo={returnTo} />
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Suspense
        fallback={
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent animate-spin" />
        }
      >
        <VerifyContent />
      </Suspense>
    </main>
  );
}
