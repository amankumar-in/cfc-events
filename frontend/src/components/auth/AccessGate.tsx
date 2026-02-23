"use client";

import { useState, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { useEntitlement } from "@/lib/hooks/useEntitlement";
import { LoginForm } from "./LoginForm";
import { VerifyOtpForm } from "./VerifyOtpForm";
import { Button } from "@/components/ui/Button";

interface AccessGateProps {
  eventId: number;
  eventSlug: string;
  sessionId?: number;
  children: ReactNode;
}

export function AccessGate({ eventId, eventSlug, sessionId, children }: AccessGateProps) {
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  const {
    data: entitlement,
    isLoading: entitlementLoading,
  } = useEntitlement(
    isAuthenticated ? eventId : undefined,
    sessionId,
    token ?? undefined
  );

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Sign in to continue
        </h3>
        {otpEmail ? (
          <VerifyOtpForm email={otpEmail} />
        ) : (
          <LoginForm onOtpSent={(email) => setOtpEmail(email)} />
        )}
      </div>
    );
  }

  if (entitlementLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!entitlement?.hasAccess) {
    return (
      <div className="max-w-md mx-auto text-center border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-8">
        <div className="w-12 h-12 bg-black dark:bg-white mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white dark:text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Ticket Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You need a ticket to access this content.
        </p>
        <Button variant="primary" href={`/events/${eventSlug}/tickets`}>
          Buy Tickets
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
