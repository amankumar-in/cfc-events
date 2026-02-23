export interface SessionSpeaker {
  id: number;
  Name: string;
  Slug: string;
  Title?: string;
  Organization?: string;
  ShortBio?: string;
  Bio?: string;
  Featured?: boolean;
  SortOrder?: number;
  LinkedIn?: string;
  Twitter?: string;
  Website?: string;
  ProfileImage?: {
    url: string;
    formats?: {
      small?: { url: string };
      medium?: { url: string };
      thumbnail?: { url: string };
    };
  };
}

export interface SessionWithSpeakers {
  id: number;
  Title: string;
  Slug: string;
  StartDate: string;
  EndDate: string;
  SessionType?: string;
  Format?: string;
  FeaturedSession?: boolean;
  speakers?: SessionSpeaker[];
  venue?: { id: number; Name: string; Slug?: string };
  Image?: { url: string } | null;
  [key: string]: unknown;
}

/**
 * Extract unique speakers from an array of sessions, deduped by id,
 * sorted by SortOrder then Name.
 */
export function extractSpeakersFromSessions(
  sessions: SessionWithSpeakers[]
): SessionSpeaker[] {
  const speakerMap = new Map<number, SessionSpeaker>();

  for (const session of sessions) {
    if (!session.speakers) continue;
    for (const speaker of session.speakers) {
      if (!speakerMap.has(speaker.id)) {
        speakerMap.set(speaker.id, speaker);
      }
    }
  }

  return Array.from(speakerMap.values()).sort((a, b) => {
    // Featured speakers first
    const featA = a.Featured ? 0 : 1;
    const featB = b.Featured ? 0 : 1;
    if (featA !== featB) return featA - featB;
    const orderA = a.SortOrder ?? 999;
    const orderB = b.SortOrder ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.Name.localeCompare(b.Name);
  });
}

/**
 * Find which sessions a given speaker is presenting at.
 */
export function getSessionsForSpeaker(
  sessions: SessionWithSpeakers[],
  speakerId: number
): SessionWithSpeakers[] {
  return sessions.filter(
    (s) => s.speakers?.some((sp) => sp.id === speakerId) ?? false
  );
}
