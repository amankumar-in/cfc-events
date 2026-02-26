"use client";

import { use, useState } from "react";
import { useEventContext } from "@/components/event/EventContext";
import { useAuth } from "@/components/auth/useAuth";
import { useSession } from "@/lib/hooks/useSession";
import { useSessionStatus, LiveStatus } from "@/lib/hooks/useSessionStatus";
import { SessionStatusBadge } from "@/components/session/SessionStatusBadge";
import { AccessGate } from "@/components/auth/AccessGate";
import DailyRoom from "@/components/daily/DailyRoom";
import DailyErrorBoundary from "@/components/daily/DailyErrorBoundary";
import DailyCall from "@/components/daily/DailyCall";
import DailyLivestream from "@/components/daily/DailyLivestream";
import PreJoinScreen from "@/components/daily/PreJoinScreen";
import RecordingPlayer from "@/components/daily/RecordingPlayer";
import { CountdownTimer } from "@/components/session/CountdownTimer";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { getStrapiURL } from "@/lib/api/api-config";
import Link from "next/link";
import { VenueDetail, VenueDetailData } from "@/components/venue/VenueDetail";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ eventSlug: string; sessionSlug: string }>;
}) {
  const { sessionSlug } = use(params);
  const event = useEventContext();
  const { data: session, isLoading } = useSession(sessionSlug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Session Not Found
        </p>
        <Button variant="primary" href={`/events/${event.Slug}/sessions`}>
          Back to Sessions
        </Button>
      </div>
    );
  }

  return <SessionContent session={session} event={event} />;
}

interface PreJoinSettings {
  userName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
}

function SessionContent({
  session,
  event,
}: {
  session: Record<string, unknown>;
  event: { id: number; Slug: string; accessMode?: "open" | "registration" | "ticketed" };
}) {
  const { user } = useAuth();
  const isAdmin = user?.isEventAdmin === true;
  const [inCall, setInCall] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`inCall-${session.documentId}`) === "true";
    }
    return false;
  });
  const [showPreJoin, setShowPreJoin] = useState(false);
  const [preJoinSettings, setPreJoinSettings] = useState<PreJoinSettings | null>(null);
  const [guestName, setGuestName] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("guestDisplayName") || undefined;
    }
    return undefined;
  });

  const liveStatus = (session.liveStatus as LiveStatus) ?? undefined;
  const status = useSessionStatus(
    session.StartDate as string,
    session.EndDate as string,
    liveStatus
  );

  const format = (session.format as string) ?? "in-person";
  const sessionType = (session.streamType as string) ?? "call";
  const roomUrl = session.dailyRoomUrl as string | undefined;
  const recordingUrl = session.recordingUrl as string | undefined;
  const speakers = (session.speakers as { id: number; Name: string; Slug: string; Title?: string; Organization?: string; ProfileImage?: { url: string } }[]) ?? [];
  const venue = session.venue as { Name?: string; Address?: string; City?: string } | undefined;
  const accessOverride = (session.accessOverride as "open" | "registration" | "ticketed" | undefined) ?? null;
  const eventAccessMode = event.accessMode ?? "open";

  const formattedStart = new Date(session.StartDate as string).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedEnd = new Date(session.EndDate as string).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const canJoin = status === "live" && (format === "virtual" || format === "hybrid") && roomUrl;

  const handleLeave = () => {
    setInCall(false);
    setShowPreJoin(false);
    setPreJoinSettings(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`inCall-${session.documentId}`);
    }
  };

  const handleJoinClick = () => {
    setShowPreJoin(true);
  };

  const handlePreJoinComplete = (settings: PreJoinSettings) => {
    setPreJoinSettings(settings);
    setGuestName(settings.userName);
    setShowPreJoin(false);
    setInCall(true);
    // Persist state
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`inCall-${session.documentId}`, "true");
      if (settings.userName) {
        localStorage.setItem("guestDisplayName", settings.userName);
      }
    }
  };

  // PreJoinScreen overlay
  if (showPreJoin && canJoin) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900">
        <AccessGate eventId={event.id} eventSlug={event.Slug} sessionId={session.documentId as string} eventAccessMode={eventAccessMode} sessionAccessOverride={accessOverride} guestName={guestName} onGuestJoin={(name) => setGuestName(name)}>
          <div className="relative h-full">
            <button
              onClick={() => setShowPreJoin(false)}
              className="absolute top-4 left-4 z-10 text-gray-400 hover:text-white flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">Back</span>
            </button>
            <PreJoinScreen
              userName={guestName || user?.name || user?.email || ""}
              onJoin={handlePreJoinComplete}
              sessionTitle={session.Title as string}
              sessionType={sessionType as "call" | "livestream"}
            />
          </div>
        </AccessGate>
      </div>
    );
  }

  // Full-screen call overlay
  if (inCall && canJoin) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900">
        <AccessGate eventId={event.id} eventSlug={event.Slug} sessionId={session.documentId as string} eventAccessMode={eventAccessMode} sessionAccessOverride={accessOverride} guestName={guestName} onGuestJoin={(name) => setGuestName(name)}>
          <div className="w-full h-full">
            <DailyErrorBoundary>
              <DailyRoom
                sessionId={session.documentId as string}
                roomUrl={roomUrl!}
                userName={preJoinSettings?.userName || guestName || user?.name || user?.email}
                audioEnabled={preJoinSettings?.audioEnabled}
                videoEnabled={preJoinSettings?.videoEnabled}
                audioDeviceId={preJoinSettings?.audioDeviceId}
                videoDeviceId={preJoinSettings?.videoDeviceId}
                onLeave={handleLeave}
              >
                {sessionType === "livestream" ? (
                  <DailyLivestream onLeave={handleLeave} sessionId={session.documentId as string} isAdmin={isAdmin} sessionTitle={session.Title as string} sessionType={sessionType} />
                ) : (
                  <DailyCall onLeave={handleLeave} sessionId={session.documentId as string} isAdmin={isAdmin} />
                )}
              </DailyRoom>
            </DailyErrorBoundary>
          </div>
        </AccessGate>
      </div>
    );
  }

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Session header */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <SessionStatusBadge
              startDate={session.StartDate as string}
              endDate={session.EndDate as string}
              liveStatus={liveStatus}
            />
            <div className="flex gap-2">
              {session.SessionType ? (
                <Chip variant="primary" size="sm">
                  {String(session.SessionType)}
                </Chip>
              ) : null}
              {format && (
                <Chip variant="outline" size="sm">
                  {format}
                </Chip>
              )}
              {format !== "in-person" && sessionType && (
                <Chip variant="secondary" size="sm">
                  {sessionType}
                </Chip>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {session.Title as string}
            </h1>
            {isAdmin && (
              <Link
                href={`/admin/events/${event.Slug}/sessions/${session.Slug}/live`}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-yellow-500 hover:text-yellow-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedStart} - {formattedEnd}</span>
            </div>
            {format === "virtual" ? (
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Online Session</span>
              </div>
            ) : (
              venue?.Name && (
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{venue.Name}{format === "hybrid" ? " + Online" : ""}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Status notice */}
      {status === "upcoming" && format === "in-person" && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This session has not started yet. Check back at the scheduled time.
          </div>
        </div>
      )}

      {status === "upcoming" && (format === "virtual" || format === "hybrid") && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-center gap-2 text-sm text-blue-700 dark:text-blue-300 mb-4 text-center">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {format === "hybrid"
                ? "This hybrid session will be available both in-person and online. The video room will open when the session starts."
                : "This virtual session will be available online. The video room will open when the session starts."}
            </div>
            <CountdownTimer targetDate={session.StartDate as string} />
          </div>
        </div>
      )}

      {status === "past" && !recordingUrl && (
        <div className="bg-amber-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-white font-medium">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            This session has concluded. No recording is available.
          </div>
        </div>
      )}

      {status === "live" && format === "in-person" && (
        <div className="bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Happening now{venue?.Name ? ` at ${venue.Name}` : ""} — head to the venue to join.
          </div>
        </div>
      )}

      {/* Join session button — live virtual/hybrid with room */}
      {canJoin && (
        <div className="bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-bold text-green-800 dark:text-green-200">
                    This session is live now
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {sessionType === "livestream" ? "Watch the livestream" : "Join the video call"}
                    {format === "hybrid" && venue?.Name ? ` or attend at ${venue.Name}` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={handleJoinClick}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {sessionType === "livestream" ? "Watch Live" : "Join Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "live" && (format === "virtual" || format === "hybrid") && !roomUrl && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-300 mb-2">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">The video room is not available yet.</span>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              The session is live but the video room has not been set up. Please check back shortly.
            </p>
          </div>
        </div>
      )}

      {status === "past" && recordingUrl && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Session Recording
            </h2>
            <RecordingPlayer
              recordingUrl={recordingUrl}
              title={session.Title as string}
            />
          </div>
        </section>
      )}

      {/* Session description */}
      {session.ShortDescription && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose dark:prose-invert max-w-3xl">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {String(session.ShortDescription)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Venue — only for in-person and hybrid sessions */}
      {format !== "virtual" && venue?.Name && (
        <section className="py-12 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Venue</h2>
            <div className="max-w-2xl">
              <VenueDetail venue={venue as VenueDetailData} compact />
            </div>
          </div>
        </section>
      )}

      {/* Speakers */}
      {speakers.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Speakers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {speakers.map((speaker) => (
                <Link
                  key={speaker.id}
                  href={`/events/${event.Slug}/speakers/${speaker.Slug}`}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-yellow-500 transition-colors h-full">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
                      {speaker.ProfileImage ? (
                        <img
                          src={getStrapiURL(speaker.ProfileImage.url)}
                          alt={speaker.Name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-3xl font-bold">
                            {speaker.Name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {speaker.Organization && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white py-1 px-3">
                          <div className="text-xs uppercase tracking-wider truncate">
                            {speaker.Organization}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-yellow-500 transition-colors text-gray-900 dark:text-white">
                        {speaker.Name}
                      </h3>
                      {speaker.Title && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {speaker.Title}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
