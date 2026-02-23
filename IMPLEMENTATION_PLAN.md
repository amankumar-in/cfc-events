# Multi-Event Platform Transformation - Implementation Plan

## Context

The current codebase is a single-event website built for "UNITE Expo 2025". It has a flat Event model (really sessions — workshops, panels, keynotes) with no parent hierarchy. The homepage and about pages are heavily hardcoded to one event. The goal is to transform this into a **multi-event platform** where:

- Multiple unrelated events (conferences, expos, festivals) can be hosted
- Each event contains sessions (talks, workshops, panels)
- Virtual/hybrid sessions are supported via Daily.co embedded video
- Admins can trigger live actions (polls, announcements, downloads) during sessions
- Users authenticate via OTP (no passwords) and access is controlled by entitlements/tickets
- Each event gets its own mini-site under `/events/[slug]/`

---

## New Dependencies

### Backend
```
bcryptjs                         - OTP code hashing
@strapi/provider-email-nodemailer - Email from backend (OTP delivery)
```

### Frontend
```
@daily-co/daily-js               - Daily.co video SDK
@daily-co/daily-react            - Daily.co React hooks
```

### Environment Variables

**Backend `.env` (add):**
```
DAILY_API_KEY=
DAILY_DOMAIN=

EMAIL_HOST=smtp.zeptomail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=emailapikey
EMAIL_PASSWORD=<from frontend .env.local>
EMAIL_FROM=UNITE Expo <tickets@rewardsforeducation.com>
```

**Frontend `.env.local` (add):**
```
NEXT_PUBLIC_DAILY_DOMAIN=
DAILY_API_KEY=
```

---

## Work Stream 1: Backend Schema Changes

All schemas live in `backend/src/api/*/content-types/*/schema.json`.

### 1.1 Create new `Session` content type

The current `Event` model IS the session (workshops, panels, keynotes). We create a new `Session` API and later repurpose the `Event` API for the parent.

**Create:** `backend/src/api/session/` with standard Strapi structure:
- `content-types/session/schema.json`
- `controllers/session.ts`
- `routes/session.ts`
- `services/session.ts`

**Session schema fields (all existing Event fields + new ones):**

| Field | Type | Notes |
|-------|------|-------|
| Title | string, required | From current Event |
| ShortDescription | text, required | From current Event |
| Location | string | From current Event |
| Slug | uid (from Title), required | From current Event |
| Description | blocks, required | From current Event |
| StartDate | datetime | From current Event |
| EndDate | datetime | From current Event |
| RoomNumber | string | From current Event |
| SessionType | enum: Conference, Workshop, Networking, Exhibition, Panel, Keynote, Breakout, Fireside | Replaces `Enumeration` |
| FeaturedSession | boolean, default false | Replaces `FeaturedEvent` |
| MaxAttendees | integer | From current Event |
| SortOrder | integer, default 0 | **New** |
| Image | media (images) | From current Event |
| **format** | enum: in-person, virtual, hybrid | **New** - default: in-person |
| **streamType** | enum: call, livestream | **New** - nullable |
| **accessOverride** | enum: open, registration, ticketed | **New** - nullable, inherits from event |
| **isRecorded** | boolean, default false | **New** |
| **recordingUrl** | string | **New** - nullable, for VOD |
| **dailyRoomName** | string | **New** - nullable |
| **dailyRoomUrl** | string | **New** - nullable |

**Session relations:**
- `event` → manyToOne → Event (inversedBy: sessions)
- `speakers` → manyToMany → Speaker (inversedBy: sessions)
- `venue` → manyToOne → Venue (inversedBy: sessions)
- `ticketCategories` → manyToMany → TicketCategory (mappedBy: allowedSessions)

### 1.2 Rewrite `Event` as parent content type

**Replace:** `backend/src/api/event/content-types/event/schema.json` entirely.

The old event data will need to be migrated to the sessions table via Strapi admin or SQL after deployment.

**New Event schema fields:**

| Field | Type | Notes |
|-------|------|-------|
| Title | string, required | |
| Slug | uid (from Title), required | |
| ShortDescription | text, required | |
| Description | blocks, required | |
| StartDate | datetime, required | |
| EndDate | datetime, required | |
| Location | string, required | City-level |
| Image | media (images) | Card/thumbnail |
| Banner | media (images) | Landing page hero |
| Category | enum: conference, festival, expo, summit, workshop-series, meetup, webinar | Required |
| accessMode | enum: open, registration, ticketed | Required, default: open |
| isFeatured | boolean, default false | |
| Status | enum: draft, published, live, completed, cancelled | Required, default: draft |

**Event relations:**
- `sessions` → oneToMany → Session (mappedBy: event)
- `sponsors` → manyToMany → Sponsor (mappedBy: events) — existing relation shape preserved
- `ticketCategories` → manyToMany → TicketCategory (mappedBy: allowedEvents) — existing
- `venue` → manyToOne → Venue (inversedBy: events) — existing
- `organizers` → manyToMany → Organizer (inversedBy: events) — new
- `organizations` → manyToMany → Organization (inversedBy: events) — new
- `faqs` → oneToMany → FAQ (mappedBy: event) — new
- `contactMessages` → oneToMany → ContactMessage (mappedBy: event) — new

### 1.3 Update existing content types

**Speaker** (`backend/src/api/speaker/content-types/speaker/schema.json`):
- Replace `events` relation → `sessions` (manyToMany, mappedBy: speakers)
- Speakers link to sessions, not parent events. Event speaker pages aggregate from sessions.

**Venue** (`backend/src/api/venue/content-types/venue/schema.json`):
- Keep `events` relation (oneToMany, mappedBy: venue)
- Add `sessions` relation (oneToMany, mappedBy: venue)

**TicketCategory** (`backend/src/api/ticket-category/content-types/ticket-category/schema.json`):
- Keep `allowedEvents` relation
- Add `grantsFullEventAccess` (boolean, default true, required)
- Add `allowedSessions` (manyToMany → Session, inversedBy: ticketCategories)

**FAQ** (`backend/src/api/faq/content-types/faq/schema.json`):
- Add `event` relation (manyToOne → Event, inversedBy: faqs)

**ContactMessage** (`backend/src/api/contact-message/content-types/contact-message/schema.json`):
- Add `event` relation (manyToOne → Event, inversedBy: contactMessages)

**Organizer** (`backend/src/api/organizer/content-types/organizer/schema.json`):
- Add `events` relation (manyToMany → Event, mappedBy: organizers)

**Organization** (`backend/src/api/organization/content-types/organization/schema.json`):
- Add `events` relation (manyToMany → Event, mappedBy: organizations)

**Sponsor** — no changes needed. The existing `events` M2M relation already works with the new parent Event since we're reusing the same API name.

### 1.4 Create `Entitlement` content type

**Create:** `backend/src/api/entitlement/` (standard Strapi structure + custom routes)

| Field | Type |
|-------|------|
| source | enum: ticket_purchase, free_registration, manual_grant, speaker |
| grantedAt | datetime, required |

**Relations:**
- `user` → manyToOne → users-permissions User
- `event` → manyToOne → Event
- `session` → manyToOne → Session (nullable, for session-specific entitlements)
- `ticket` → manyToOne → Ticket (nullable)

**Custom routes:**
- `GET /api/entitlements/check?eventId=X&sessionId=Y` — check if authenticated user has access
- `POST /api/entitlements/grant` — create entitlement (used on registration/purchase)

### 1.5 Create `OTP Verification` content type

**Create:** `backend/src/api/otp-verification/` (standard Strapi structure)

| Field | Type |
|-------|------|
| email | email, required |
| codeHash | string, required |
| expiresAt | datetime, required |
| attempts | integer, default 0, required |
| verified | boolean, default false |

No relations. Draft/publish disabled.

### 1.6 Extend users-permissions User

**Create:** `backend/src/extensions/users-permissions/content-types/user/schema.json`

Strapi v5 merges this with the built-in user schema. Only declare NEW fields:

| Field | Type |
|-------|------|
| name | string |
| phone | string |
| organization | string |
| isEventAdmin | boolean, default false |

**Relations:**
- `entitlements` → oneToMany → Entitlement
- `adminEvents` → manyToMany → Event

---

## Work Stream 2: Backend Custom API Routes

### 2.1 Configure email plugin

**Modify:** `backend/config/plugins.ts` (currently empty)

Configure `@strapi/provider-email-nodemailer` using the same ZeptoMail SMTP credentials that already work in the frontend. This lets the backend send OTP emails directly.

### 2.2 Auth API (`backend/src/api/auth/`)

Custom routes (no content type, just controller/routes/services):

**`POST /api/auth/send-otp`** (public, no auth)
- Accept `{ email }`
- Generate 6-digit code, hash with bcrypt
- Store in otp-verification table (upsert by email)
- Set expiry to 10 minutes
- Send email via Strapi email plugin
- Return `{ success: true }`

**`POST /api/auth/verify-otp`** (public, no auth)
- Accept `{ email, code }`
- Find OTP record by email
- Check expiry, check attempts (max 5)
- Verify code hash with bcrypt
- If valid: find or create user by email, issue JWT via `strapi.plugin('users-permissions').services.jwt.issue()`
- Return `{ jwt, user }`

**`GET /api/auth/me`** (authenticated)
- Return current user with entitlements populated

### 2.3 Daily.co API (`backend/src/api/daily/`)

Custom routes (no content type):

**`POST /api/daily/create-room`** (authenticated, event admin only)
- Accept `{ sessionId }`
- Call Daily.co REST API: `POST https://api.daily.co/v1/rooms`
- Configure room based on session.streamType (call vs livestream)
- For livestream: set `enable_mesh_sfu: true`, `enable_hidden_participants: true`
- Store `dailyRoomName` and `dailyRoomUrl` on the session entity
- Return room details

**`POST /api/daily/meeting-token`** (public — handles auth internally)
- Accept `{ sessionId, userName }` (userName for anonymous guests)
- Determine session access requirements
- For open sessions: generate anonymous viewer token
- For registration/ticketed: verify auth + entitlement, generate appropriate token
- For speakers: generate token with `canSend: true`
- For admins: generate owner token with `is_owner: true`
- Call Daily.co REST API: `POST https://api.daily.co/v1/meeting-tokens`
- Return `{ token }`

**`POST /api/daily/send-action`** (authenticated, event admin only)
- Accept `{ roomName, action }` where action is `{ type, data }`
- Call Daily.co REST API: `POST /rooms/:name/send-app-message`
- This is for server-side admin actions (polls, announcements)

**`DELETE /api/daily/rooms/:roomName`** (authenticated, event admin only)
- Delete room via Daily.co REST API

---

## Work Stream 3: Frontend Restructuring

### 3.1 New route structure

```
frontend/src/app/
  layout.tsx                                    MODIFY (add AuthProvider, dynamic metadata)
  page.tsx                                      REPLACE (platform homepage → event cards)

  events/
    page.tsx                                    REPLACE (browse all events)
    [eventSlug]/
      layout.tsx                                NEW (event context provider, event nav)
      page.tsx                                  NEW (event landing page)
      sessions/
        page.tsx                                NEW (schedule/session list)
        [sessionSlug]/
          page.tsx                              NEW (session detail / join / watch recording)
      speakers/
        page.tsx                                NEW (event speakers, aggregated from sessions)
        [slug]/
          page.tsx                              NEW (speaker detail, scoped to event)
      sponsors/
        page.tsx                                NEW (event sponsors)
        [slug]/
          page.tsx                              NEW (sponsor detail)
      venue/
        page.tsx                                NEW (event venue info)
      tickets/
        page.tsx                                NEW (ticket categories for event)
        buy/
          page.tsx                              MOVE+MODIFY from current tickets/buy/
          BuyTicketContent.tsx                   MOVE+MODIFY
        payment/
          page.tsx                              MOVE+MODIFY
          PaymentContent.tsx                    MOVE+MODIFY
        confirmation/
          page.tsx                              MOVE+MODIFY
          ConfirmationContent.tsx               MOVE+MODIFY
      faq/
        page.tsx                                NEW (event FAQs filtered by event)
      contact/
        page.tsx                                NEW (contact form scoped to event)
      archive/
        page.tsx                                NEW (past sessions + recordings)

  auth/
    login/page.tsx                              NEW (email input → send OTP)
    verify/page.tsx                             NEW (OTP code input → verify → JWT)

  admin/
    events/[eventSlug]/sessions/[sessionSlug]/
      live/page.tsx                             NEW (admin live control panel)

  api/
    auth/
      send-otp/route.ts                        NEW (proxy to backend)
      verify-otp/route.ts                      NEW (proxy to backend)
    daily/
      meeting-token/route.ts                   NEW (proxy to backend)
    tickets/                                    KEEP existing routes, modify for event context

  about/page.tsx                                MODIFY (generic platform about)
  about/mission-vision/page.tsx                 KEEP (platform-level)
  contact/page.tsx                              MODIFY (platform-level contact)
```

**Old top-level routes to deprecate:** `/speakers`, `/sponsors`, `/venue`, `/tickets`, `/about/faq`, `/about/organizers` — these move under `/events/[eventSlug]/`. Add redirects or remove.

### 3.2 New components

```
frontend/src/components/
  auth/
    AuthProvider.tsx                  React context: user, token, isAuthenticated, login(), logout()
    useAuth.ts                        Hook to consume auth context
    LoginForm.tsx                     Email input + "Send OTP" button
    VerifyOtpForm.tsx                 6-digit code input + verify
    AccessGate.tsx                    Wraps content requiring auth/entitlement

  event/
    EventCard.tsx                     Card for event listings (image, title, dates, category, location)
    EventHero.tsx                     Event landing page hero (banner, title, dates, CTA)
    EventNav.tsx                      Sub-navigation for event pages (Sessions, Speakers, etc.)
    EventContext.tsx                  React context providing event data to child routes

  session/
    SessionCard.tsx                   Card for session listings (title, time, speakers, format badge)
    SessionJoinButton.tsx             Smart button: adapts to session state + access level
    SessionStatusBadge.tsx            Badge: Upcoming / Live / Past
    CountdownTimer.tsx                Countdown to session start

  daily/
    DailyRoom.tsx                     Main wrapper: DailyProvider + room join logic
    DailyCall.tsx                     Interactive call layout (participant grid + controls)
    DailyLivestream.tsx               Viewer layout (stream + chat + actions overlay)
    DailyControls.tsx                 Audio/video/screenshare/leave buttons
    DailyParticipantGrid.tsx          Video tile grid
    DailyChat.tsx                     In-session chat via sendAppMessage
    DailyActionOverlay.tsx            Renders received actions (polls, announcements, downloads)
    RecordingPlayer.tsx               Video player for past session recordings

  admin/
    LiveControlPanel.tsx              Admin view: video + controls sidebar
    PollCreator.tsx                   Create poll (question + options), send to room
    AnnouncementSender.tsx            Type + send announcements
    DownloadLinkSender.tsx            Share file/download link
    ParticipantManager.tsx            View participants, promote/demote speakers
    ActionsSidebar.tsx                Container for all admin action tools
```

### 3.3 New lib files

```
frontend/src/lib/
  api/
    api-config.ts                     MODIFY: add auth token injection to fetchAPI
    events.ts                         NEW: fetchEvents, fetchEventBySlug
    sessions.ts                       NEW: fetchSessions, fetchSessionBySlug, fetchEventSessions
    auth.ts                           NEW: sendOtp, verifyOtp, getMe
    entitlements.ts                   NEW: checkAccess, grantAccess
    daily.ts                          NEW: getMeetingToken, createRoom, sendAction

  hooks/
    useEvent.ts                       NEW: fetch + cache event by slug
    useSession.ts                     NEW: fetch + cache session by slug
    useEventSessions.ts               NEW: fetch sessions for an event
    useEntitlement.ts                 NEW: check user entitlement for event/session
    useSessionStatus.ts               NEW: compute upcoming/live/past from dates

  auth/
    token.ts                          NEW: localStorage get/set/clear JWT
    auth-context.ts                   NEW: context type definitions
```

### 3.4 Key page implementations

**Platform Homepage (`/` → `page.tsx`):**
- Fetch featured events: `GET /api/events?filters[isFeatured][$eq]=true&populate=*&sort=StartDate:asc`
- Fetch upcoming events: `GET /api/events?filters[Status][$in]=published,live&populate=*&sort=StartDate:asc&pagination[limit]=8`
- Hero with platform branding (configurable or minimal)
- EventCard grid
- CTA to browse all events

**Event Layout (`/events/[eventSlug]/layout.tsx`):**
- Fetch event by slug: `GET /api/events?filters[Slug][$eq]=${slug}&populate[sessions][populate]=speakers,venue&populate[sponsors][populate]=*&populate[venue][populate]=*`
- Provide event data via EventContext to all child routes
- Render EventNav sub-navigation
- Adapt Header to show event name

**Event Landing Page (`/events/[eventSlug]/page.tsx`):**
- Consume EventContext
- Hero with event Banner/Image, title, dates, location
- Event description (blocks renderer)
- Featured sessions
- Featured speakers (aggregated from sessions)
- Sponsors grid
- Venue map
- CTA to buy tickets

**Session Detail (`/events/[eventSlug]/sessions/[sessionSlug]/page.tsx`):**

Adapts based on session state:

| State | UI |
|-------|-----|
| **Upcoming** | Info + countdown + access-appropriate CTA (Register / Buy Ticket / Add to Calendar) |
| **Live, in-person** | Info + "Happening now at [venue]" |
| **Live, virtual/hybrid** | AccessGate → DailyRoom (call or livestream) + chat + action overlay |
| **Past, recorded** | Info + RecordingPlayer |
| **Past, not recorded** | Info + speakers + summary |

**Session Join Flow (virtual):**
1. Session page checks session state (live? virtual/hybrid?)
2. If open access: show "Join as Guest" (name input) + "Login for full experience"
3. If registration required: show LoginForm, redirect back after OTP
4. If ticketed: show LoginForm, check entitlement after auth, show "Buy Tickets" if no entitlement
5. On successful access: fetch meeting token from backend, render DailyRoom

### 3.5 Modify existing components

**Header.tsx:**
- Detect if on event page (pathname starts with `/events/[slug]/`)
- If event page: show event-specific nav (Sessions, Speakers, Sponsors, Venue, Tickets)
- If platform page: show platform nav (Events, About, Contact)
- Add Login/Profile button (uses auth context)
- Remove hardcoded "2025" chip

**Footer.tsx:**
- Remove hardcoded "UNITE Expo" references
- Make dynamic based on context (platform vs event)

**api-config.ts:**
- Add auth token from localStorage to request headers when available
- Keep existing fetchAPI signature compatible

### 3.6 Auth pages

**`/auth/login`:**
- Email input form
- "Send OTP" → calls `POST /api/auth/send-otp`
- Preserves `returnTo` URL from query params
- On success: redirect to `/auth/verify?email=...&returnTo=...`

**`/auth/verify`:**
- 6-digit code input (individual digit boxes for UX)
- Countdown timer showing code expiry
- "Resend code" button
- On success: store JWT in localStorage, update auth context, redirect to `returnTo`

**Seamless signup flow:**
- User finds event → clicks Join on a virtual session → needs login
- Redirect to `/auth/login?returnTo=/events/expo-2025/sessions/keynote`
- User enters email → OTP sent → enters code
- Account created (if new) → JWT stored → redirect back to session → auto-join

### 3.7 Admin live control page

**`/admin/events/[eventSlug]/sessions/[sessionSlug]/live`:**
- Protected route (requires auth + isEventAdmin + adminEvents includes this event)
- Split layout: video feed (left) + controls sidebar (right)
- Admin joins Daily room with `is_owner: true` token
- Controls sidebar contains:
  - **Poll Creator**: question + options fields → sends via `/api/daily/send-action`
  - **Announcement Sender**: message + optional link → sends via `/api/daily/send-action`
  - **Download Link Sender**: label + URL → sends via `/api/daily/send-action`
  - **Participant Manager**: list participants, promote/demote buttons (calls `updateParticipant`)
  - **Session Controls**: start/stop recording, end session

---

## Work Stream 4: Daily.co Integration Details

### 4.1 Room creation flow

When an admin publishes a virtual/hybrid session:
1. Admin clicks "Create Room" in Strapi or on the admin page
2. Backend calls `POST https://api.daily.co/v1/rooms` with config:
   - For `call`: standard room, `max_participants` from session.MaxAttendees
   - For `livestream`: `enable_mesh_sfu: true`, `enable_hidden_participants: true`, `enable_terse_logging: true`
3. Backend stores `dailyRoomName` and `dailyRoomUrl` on the session

### 4.2 Meeting token generation

| User type | Token properties |
|-----------|-----------------|
| Anonymous guest (free open) | `user_name: "Guest Name"`, `is_owner: false`, `canSend: false` (livestream) or `canSend: true` (call) |
| Registered attendee | `user_name: user.name`, `user_id: user.id`, `is_owner: false` |
| Speaker | `user_name: speaker.Name`, `is_owner: false`, `canSend: true` (always) |
| Event admin | `user_name: user.name`, `is_owner: true` |

### 4.3 Action message format

All actions sent via `sendAppMessage()` or REST API use this shape:

```typescript
interface SessionAction {
  type: 'poll' | 'announcement' | 'download' | 'qa_question' | 'qa_answer' | 'signup_form';
  id: string;            // unique action ID
  timestamp: string;     // ISO datetime
  data: {
    // poll
    question?: string;
    options?: string[];
    // announcement
    title?: string;
    message?: string;
    // download
    label?: string;
    url?: string;
    // qa
    questionText?: string;
    answer?: string;
  };
}
```

The DailyActionOverlay component listens for `app-message` events and renders the appropriate UI (poll modal, announcement toast, download card, etc.).

### 4.4 Bring to stage (livestream)

Admin uses ParticipantManager to promote a viewer:
```javascript
callObject.updateParticipant(participantSessionId, {
  updatePermissions: {
    canSend: new Set(['video', 'audio']),
    hasPresence: true
  }
});
```
To demote back: set `canSend: false`, `hasPresence: false`.

Works mid-stream with up to 25 simultaneous speakers.

### 4.5 Recording → VOD

- Admin starts recording via Daily API during session
- After session ends, Daily processes and provides recording URL
- Backend webhook or manual update stores `recordingUrl` on the session
- Session page renders RecordingPlayer for past sessions with recordings

---

## Access Control Matrix (complete)

| Event accessMode | Session accessOverride | Effective | Anonymous? | Login? | Ticket? |
|-----------------|----------------------|-----------|-----------|--------|---------|
| open | null | open | Yes (enter name) | Optional | No |
| open | registration | registration | No | Required | No |
| open | ticketed | ticketed | No | Required | Required |
| registration | null | registration | No | Required | No |
| registration | open | open | Yes | Optional | No |
| ticketed | null | ticketed | No | Required | Required |
| ticketed | open | open | Yes | Optional | No |
| ticketed | registration | registration | No | Required | No |

Session `accessOverride` takes precedence when set. When null, inherits from event `accessMode`.

For **free offline events**: still require a free ticket (price=0) for headcount tracking and QR check-in.

For **paid events with logged-in users**: system checks entitlement — if user has a ticket linked to their email, they don't need to enter a ticket number. Entitlement is auto-created when ticket purchase is confirmed.

---

## Build Order (sequential dependencies)

```
1. Backend schemas (WS1: 1.1-1.6)
   └── All content types must exist before custom APIs reference them

2. Backend email plugin config (WS2: 2.1)
   └── Needed before OTP can send emails

3. Backend custom APIs (WS2: 2.2-2.3)
   └── Auth, Daily.co, Entitlement endpoints
   └── Depends on: schemas + email plugin

4. Frontend lib + components (WS3: 3.2-3.3)
   └── Auth provider, event context, Daily components, API helpers
   └── Can be built once backend APIs exist

5. Frontend pages (WS3: 3.1, 3.4-3.7)
   └── Route restructuring, all new pages
   └── Depends on: components + lib + backend APIs

6. Integration testing
   └── End-to-end flows: browse → join → watch → admin actions
```

---

## Verification

### Backend
- [ ] `npm run develop` starts without errors
- [ ] Strapi admin shows Event (parent) and Session (child) content types
- [ ] Creating Event → adding Sessions → linking Speakers/Venue/Sponsors works
- [ ] `GET /api/events?populate[sessions][populate]=speakers` returns nested data
- [ ] `POST /api/auth/send-otp` sends email with OTP code
- [ ] `POST /api/auth/verify-otp` returns JWT on valid code
- [ ] `GET /api/auth/me` returns user with entitlements
- [ ] `POST /api/daily/create-room` creates Daily.co room
- [ ] `POST /api/daily/meeting-token` returns valid token
- [ ] `GET /api/entitlements/check` returns access status

### Frontend
- [ ] `/` shows platform homepage with event cards
- [ ] `/events` lists all events with category filter
- [ ] `/events/[slug]` shows event landing page with sub-nav
- [ ] `/events/[slug]/sessions` shows schedule
- [ ] `/events/[slug]/sessions/[slug]` adapts to session state (upcoming/live/past)
- [ ] Virtual session join flow works (anonymous for open, OTP for registration, ticket check for paid)
- [ ] OTP login → verify → redirect back works seamlessly
- [ ] Admin live control page shows video + action controls
- [ ] Polls/announcements sent by admin appear for all participants
- [ ] Past sessions with recordings show video player
- [ ] Dark mode works on all new pages

---

## File Count Estimate

| Category | New | Modified | Deprecated/Removed |
|----------|-----|----------|-------------------|
| Backend schemas | ~6 | ~8 | 0 |
| Backend APIs | ~12 | ~2 | 0 |
| Frontend pages | ~20 | ~5 | ~8 (moved under events) |
| Frontend components | ~25 | ~3 | 0 |
| Frontend lib | ~12 | ~2 | 0 |
| Config files | ~2 | ~2 | 0 |
| **Total** | **~77** | **~22** | **~8** |
