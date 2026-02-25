"use client";

import { useState, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { useEntitlement } from "@/lib/hooks/useEntitlement";
import { LoginForm } from "./LoginForm";
import { VerifyOtpForm } from "./VerifyOtpForm";
import { Button } from "@/components/ui/Button";

type AccessMode = "open" | "registration" | "ticketed";

interface AccessGateProps {
  eventId: number;
  eventSlug: string;
  sessionId?: string;
  eventAccessMode: AccessMode;
  sessionAccessOverride?: AccessMode | null;
  /** Pre-approved guest name — skips the gate if set */
  guestName?: string;
  /** Called when guest joins with their name */
  onGuestJoin?: (name: string) => void;
  children: ReactNode;
}

function getEffectiveAccess(
  eventMode: AccessMode,
  sessionOverride?: AccessMode | null
): AccessMode {
  return sessionOverride ?? eventMode;
}

type JoinTab = "login" | "guest";

export function AccessGate({
  eventId,
  eventSlug,
  sessionId,
  eventAccessMode,
  sessionAccessOverride,
  guestName: guestNameProp,
  onGuestJoin,
  children,
}: AccessGateProps) {
  const effectiveAccess = getEffectiveAccess(eventAccessMode, sessionAccessOverride);
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [joinedAsGuest, setJoinedAsGuest] = useState(false);
  const [activeTab, setActiveTab] = useState<JoinTab>("login");

  const guestApproved = joinedAsGuest || !!guestNameProp;

  const shouldCheckEntitlement = effectiveAccess === "ticketed" && isAuthenticated;
  const {
    data: entitlement,
    isLoading: entitlementLoading,
  } = useEntitlement(
    shouldCheckEntitlement ? eventId : undefined,
    sessionId,
    token ?? undefined
  );

  const handleGuestJoin = () => {
    if (!guestNameInput.trim()) return;
    setJoinedAsGuest(true);
    onGuestJoin?.(guestNameInput.trim());
  };

  // --- OPEN ACCESS ---
  if (effectiveAccess === "open") {
    if (isAuthenticated || guestApproved) {
      return <>{children}</>;
    }

    return (
      <div className="w-full max-w-lg mx-auto border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center pt-6 px-6">
          Join Session
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center px-6 mt-1 mb-4">
          This session is open to everyone.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "login"
                ? "text-gray-900 dark:text-white border-b-2 border-yellow-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("guest")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "guest"
                ? "text-gray-900 dark:text-white border-b-2 border-yellow-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Join as Guest
          </button>
        </div>

        <div className="p-6">
          {activeTab === "login" ? (
            <div className="space-y-4">
              {otpEmail ? (
                <VerifyOtpForm email={otpEmail} />
              ) : (
                <LoginForm onOtpSent={(email) => setOtpEmail(email)} />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGuestJoin()}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  autoFocus
                />
              </div>
              <button
                onClick={handleGuestJoin}
                disabled={!guestNameInput.trim()}
                className="w-full px-4 py-2 bg-yellow-500 text-black font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join as Guest
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- REGISTRATION / TICKETED ACCESS ---
  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-lg mx-auto border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Sign in to continue
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
          {effectiveAccess === "ticketed"
            ? "A ticket is required to access this session."
            : "Please sign in to access this session."}
        </p>
        {otpEmail ? (
          <VerifyOtpForm email={otpEmail} />
        ) : (
          <LoginForm onOtpSent={(email) => setOtpEmail(email)} />
        )}
      </div>
    );
  }

  // --- REGISTRATION: logged in = access granted ---
  if (effectiveAccess === "registration") {
    return <>{children}</>;
  }

  // --- TICKETED: check entitlement ---
  if (entitlementLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!entitlement?.hasAccess) {
    return (
      <div className="w-full max-w-lg mx-auto text-center border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-8">
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
