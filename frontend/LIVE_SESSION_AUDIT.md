# Live Session System — Full Audit & Rebuild Checklist

## How This Document Works
- **[NEEDS TESTING]** = Implemented, needs manual verification
- **[INCOMPLETE]** = Not implemented yet
- **[PARTIAL]** = Partially implemented, needs more work
- Priority: P0 (launch blocker), P1 (must have), P2 (should have), P3 (nice to have)

---

## 1. PRE-JOIN EXPERIENCE

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 1.1 | Camera preview before joining | [NEEDS TESTING] | P0 | PreJoinScreen.tsx with live camera preview |
| 1.2 | Microphone preview with audio level meter | [NEEDS TESTING] | P0 | PreJoinScreen.tsx with audio level visualization |
| 1.3 | Speaker/output device test | [NEEDS TESTING] | P1 | DeviceSettings has speaker selector + test tone button (440Hz) |
| 1.4 | Device selection (choose camera, mic, speaker) | [NEEDS TESTING] | P0 | PreJoinScreen.tsx (pre-join) + DeviceSettings.tsx (mid-call) |
| 1.5 | Join with camera off / muted by default | [NEEDS TESTING] | P1 | PreJoinScreen passes audioEnabled/videoEnabled to DailyRoom |
| 1.6 | Display name entry (for authenticated users) | [NEEDS TESTING] | P1 | PreJoinScreen name input, persisted in localStorage |
| 1.7 | Network/connection quality test | [NEEDS TESTING] | P2 | NetworkTest component in PreJoinScreen using navigator.connection + fetch latency |
| 1.8 | Background blur / virtual background selection | [NEEDS TESTING] | P2 | Toggle in DeviceSettings using daily.updateInputSettings background-blur |
| 1.9 | Waiting room / lobby | [NEEDS TESTING] | P2 | RoomControls toggle + waiting participant admit/deny UI |

---

## 2. IN-CALL CONTROLS (Viewer/Attendee)

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 2.1 | Mute/unmute microphone | [NEEDS TESTING] | P0 | DailyControls.tsx in both DailyCall and DailyLivestream (promoted) |
| 2.2 | Start/stop camera | [NEEDS TESTING] | P0 | DailyControls.tsx |
| 2.3 | Screen share | [NEEDS TESTING] | P1 | DailyControls.tsx, hidden on mobile |
| 2.4 | Leave meeting button | [NEEDS TESTING] | P0 | DailyControls leaveCall, clears sessionStorage |
| 2.5 | Raise hand | [NEEDS TESTING] | P1 | DailyControls with hand-raise/hand-lower app messages |
| 2.6 | Reactions / emoji | [NEEDS TESTING] | P2 | DailyControls emoji popup (thumbs up, clap, heart, laugh, party) |
| 2.7 | Device selection during call | [NEEDS TESTING] | P1 | DeviceSettings.tsx with mic/camera/speaker selectors |
| 2.8 | Full-screen mode | [NEEDS TESTING] | P1 | DailyControls fullscreen toggle |
| 2.9 | Keyboard shortcuts | [NEEDS TESTING] | P2 | M=mute, V=camera, H=hand, Space=push-to-talk |
| 2.10 | Self-view (see your own camera) | [NEEDS TESTING] | P2 | DailyCall grid + floating PiP in DailyLivestream for viewers |
| 2.11 | Pin/spotlight a participant's video | [NEEDS TESTING] | P2 | Click tile to pin, shows pinned view with strip |

---

## 3. LAYOUT & VIDEO GRID

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 3.1 | Gallery/grid view | [NEEDS TESTING] | P0 | DailyParticipantGrid with responsive grid, max 9 tiles + overflow |
| 3.2 | Speaker/active speaker view | [NEEDS TESTING] | P1 | Speaker layout with main + strip |
| 3.3 | Side-by-side (screen share + speaker) | [NEEDS TESTING] | P1 | Screen share full + speaker strip below |
| 3.4 | Layout switching (gallery / speaker) | [NEEDS TESTING] | P1 | LayoutToggle component, auto-switches on screen share |
| 3.5 | Hide participants without video | [NEEDS TESTING] | P2 | Toggle in LayoutToggle bar, filters gallery view |
| 3.6 | Floating self-view (draggable PiP) | [PARTIAL] | P2 | Fixed PiP in DailyLivestream, not draggable |
| 3.7 | Participant tile shows speaking indicator | [NEEDS TESTING] | P1 | Green pulsing dot + yellow ring on active speaker |
| 3.8 | Connection quality indicator per participant | [NEEDS TESTING] | P2 | NetworkQuality component using getNetworkStats() |

---

## 4. LIVESTREAM-SPECIFIC (Viewers)

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 4.1 | See speakers/presenters broadcasting | [NEEDS TESTING] | P0 | DailyLivestream shows owners + promoted participants |
| 4.2 | Viewer count | [NEEDS TESTING] | P2 | Badge in top-right corner |
| 4.3 | Promoted viewer gets controls | [NEEDS TESTING] | P0 | DailyControls shown when localIsPromoted |
| 4.4 | "Waiting for stream" state | [NEEDS TESTING] | P2 | Waiting message with viewer count |
| 4.5 | Stream quality indicator | [NEEDS TESTING] | P2 | NetworkQuality bars shown in DailyLivestream viewer |
| 4.6 | Audio-only fallback | [NEEDS TESTING] | P2 | PreJoinScreen falls back to audio-only + NetworkQuality auto-disables video |

---

## 5. CHAT

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 5.1 | Send/receive messages | [NEEDS TESTING] | P0 | DailyChat via sendAppMessage + app-message listener |
| 5.2 | Message persistence | [NEEDS TESTING] | P0 | Backend saveChatMessage/getChatMessages, loads on mount |
| 5.3 | Message timestamps | [NEEDS TESTING] | P1 | Timestamps shown on messages |
| 5.4 | Sender name displayed correctly | [NEEDS TESTING] | P0 | Uses meeting token user_name |
| 5.5 | Chat visible on mobile | [NEEDS TESTING] | P1 | Slide-out overlay in both DailyCall and DailyLivestream |
| 5.6 | Unread message indicator | [NEEDS TESTING] | P1 | Badge on mobile chat toggle button |
| 5.7 | Auto-scroll with manual override | [NEEDS TESTING] | P2 | IntersectionObserver based |
| 5.8 | Message deletion (by host) | [NEEDS TESTING] | P1 | Admin delete with optimistic update + broadcast + backend |
| 5.9 | Mute/ban chatter | [NEEDS TESTING] | P1 | Per-user chat mute via ParticipantManager + DailyChat handles chat-mute/unmute messages |
| 5.10 | Private/direct messages | [NEEDS TESTING] | P3 | Click sender name to start DM, sends to specific participant with (DM) indicator |
| 5.11 | Reactions on messages | [NEEDS TESTING] | P3 | Emoji reactions on chat messages (👍❤️😂🎉) with counts, broadcast via app messages |
| 5.12 | Reply threading | [NEEDS TESTING] | P3 | Reply button on messages, reply context shown above message + input area |
| 5.13 | File/image sharing | [INCOMPLETE] | P3 | Requires file upload backend (S3/Cloudinary); use sendAppMessage with file URL after upload |
| 5.14 | Link preview | [NEEDS TESTING] | P3 | URLs auto-detected and rendered as clickable links in chat messages |
| 5.15 | @mentions | [NEEDS TESTING] | P3 | @name patterns highlighted in yellow in chat messages |
| 5.16 | Chat export / download | [NEEDS TESTING] | P3 | Admin "Export chat" button downloads chat as .txt file |

---

## 6. ADMIN / HOST CONTROLS

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 6.1 | "Go Live" button (start session) | [NEEDS TESTING] | P0 | LiveControlPanel with backend goLive + broadcast |
| 6.2 | "End Session" button | [NEEDS TESTING] | P0 | LiveControlPanel with confirmation + broadcast + audit |
| 6.3 | Mute individual participant | [NEEDS TESTING] | P0 | ParticipantManager with feedback toast |
| 6.4 | Mute all participants | [NEEDS TESTING] | P1 | ParticipantManager "Mute All" button |
| 6.5 | Remove/eject participant | [NEEDS TESTING] | P1 | ParticipantManager with confirmation dialog |
| 6.6 | Promote viewer to speaker | [NEEDS TESTING] | P0 | ParticipantManager + DailyActionOverlay promotion prompt |
| 6.7 | Demote speaker to viewer | [NEEDS TESTING] | P0 | ParticipantManager revokes canSend + sends demote message |
| 6.8 | See all participants with roles | [NEEDS TESTING] | P1 | ParticipantManager with Host/Speaker/Promoted/Viewer badges |
| 6.9 | Waiting room management | [NEEDS TESTING] | P2 | RoomControls: toggle waiting room + admit/deny UI |
| 6.10 | Lock room (prevent new joins) | [NEEDS TESTING] | P2 | RoomControls toggle sets max_participants via Daily REST API |
| 6.11 | Disable participant chat | [NEEDS TESTING] | P2 | RoomControls toggle, broadcasts chat-disabled/enabled app message |
| 6.12 | Disable participant screen share | [NEEDS TESTING] | P2 | RoomControls toggle, updates room via Daily REST API |
| 6.13 | Co-host assignment | [NEEDS TESTING] | P3 | Co-host button in ParticipantManager, grants full permissions + purple badge |
| 6.14 | Transfer host role | [NEEDS TESTING] | P3 | Transfer button in ParticipantManager, grants full admin permissions via Daily API |

---

## 7. RECORDING

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 7.1 | Start recording | [NEEDS TESTING] | P0 | LiveControlPanel toggle with Daily.co startRecording |
| 7.2 | Stop recording | [NEEDS TESTING] | P0 | LiveControlPanel toggle with Daily.co stopRecording |
| 7.3 | Pause/resume recording | [NOT NEEDED] | P2 | Daily.co API does not support pause/resume natively |
| 7.4 | Recording consent notification | [NEEDS TESTING] | P0 | RecordingConsentBanner with dismiss, broadcasts to all |
| 7.5 | Recording indicator (red dot) | [NEEDS TESTING] | P0 | DailyControls + LiveControlPanel recording indicator + timer |
| 7.6 | Recording webhook (completion) | [NEEDS TESTING] | P0 | Backend handleWebhook for recording.ready-to-download |
| 7.7 | Save recording URL to session | [NEEDS TESTING] | P0 | Backend saves recordingUrl + recordingDuration to session |
| 7.8 | Recording playback page | [PARTIAL] | P1 | RecordingPlayer exists, URL now populated via webhook |
| 7.9 | Recording download | [NEEDS TESTING] | P2 | Download button in RecordingPlayer header |
---

## 8. ACTIONS (Polls, Announcements, Downloads)

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 8.1 | Admin sends poll | [NEEDS TESTING] | P1 | PollCreator sends via sendAppMessage |
| 8.2 | Viewer sees poll | [NEEDS TESTING] | P1 | DailyActionOverlay modal with vote buttons |
| 8.3 | Poll results collected | [NEEDS TESTING] | P1 | Votes sent as poll-vote app messages back to admin |
| 8.4 | Poll results shown to admin | [NEEDS TESTING] | P1 | PollCreator shows live bar chart with counts + percentages |
| 8.5 | Admin sends announcement | [NEEDS TESTING] | P1 | Announcement toast with dismiss button, auto-dismiss 10s |
| 8.6 | Admin sends download link | [NEEDS TESTING] | P2 | Download card with dismiss button |
| 8.7 | Actions shown to late joiners | [NEEDS TESTING] | P1 | Fetches active actions from backend on mount |
| 8.8 | Action history / log | [NEEDS TESTING] | P2 | ActionHistory component in ActionsSidebar shows past actions |
| 8.9 | Action positioning | [NEEDS TESTING] | P0 | Announcements top-center, downloads bottom-left, polls centered modal |

---

## 9. ROOM LIFECYCLE & BACKEND

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 9.1 | Room creation | [NEEDS TESTING] | P0 | With dedup — checks if room already exists for session |
| 9.2 | Room deletion/cleanup | [NEEDS TESTING] | P0 | deleteRoom endpoint exists, cleans up actions store |
| 9.3 | Room reuse | [NEEDS TESTING] | P1 | createRoom returns existing room if one exists |
| 9.4 | Meeting token auth | [NEEDS TESTING] | P0 | Token generation with access control |
| 9.5 | Token expiration handling | [NEEDS TESTING] | P1 | Warning at 3.5h, refresh flow in DailyRoom |
| 9.6 | Webhooks from Daily.co | [NEEDS TESTING] | P0 | Backend handleWebhook for recording events |
| 9.7 | Session `liveStatus` field | [NEEDS TESTING] | P0 | goLive/endSession update status, useSessionStatus polls |
| 9.8 | Rate limiting on API endpoints | [NEEDS TESTING] | P1 | In-memory rate limiter with sliding window |
| 9.9 | Audit logging | [NEEDS TESTING] | P1 | session-audit-log content type, logged on go-live/end/actions |
| 9.10 | `sendAction` payload validation | [NEEDS TESTING] | P1 | validate-action.ts with allowed types whitelist |
| 9.11 | Attendance tracking | [NEEDS TESTING] | P1 | session-attendance content type, recordJoin/recordLeave |

---

## 10. ERROR HANDLING & RECOVERY

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 10.1 | Auto-reconnect on network drop | [NEEDS TESTING] | P0 | DailyRoom handles network-connection events |
| 10.2 | "Reconnecting..." UI | [NEEDS TESTING] | P0 | ReconnectingOverlay with timeout → manual rejoin |
| 10.3 | Camera/mic permission denied handling | [NEEDS TESTING] | P0 | ErrorDisplay with classified error messages |
| 10.4 | "No camera found" / "No mic found" | [NEEDS TESTING] | P1 | device-not-found classification, continues audio-only |
| 10.5 | Token expired mid-call | [NEEDS TESTING] | P1 | TokenExpiryWarning banner with refresh button |
| 10.6 | Room deleted while in call | [NEEDS TESTING] | P1 | left-meeting event handled |
| 10.7 | Admin feedback on action success/failure | [NEEDS TESTING] | P1 | FeedbackToast in ParticipantManager |
| 10.8 | Network quality indicator | [NEEDS TESTING] | P2 | NetworkQuality bars in DailyControls + DailyLivestream |
| 10.9 | Graceful degradation (auto-disable video) | [NEEDS TESTING] | P2 | NetworkQuality auto-disables video after 3 consecutive poor readings |

---

## 11. MOBILE EXPERIENCE

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 11.1 | Touch-friendly controls | [NEEDS TESTING] | P1 | Responsive padding/sizing in DailyControls |
| 11.2 | Portrait mode support | [PARTIAL] | P1 | Grid adapts columns but could be improved |
| 11.3 | Mobile chat overlay | [NEEDS TESTING] | P1 | Slide-out in both DailyCall and DailyLivestream |
| 11.4 | Responsive video grid | [NEEDS TESTING] | P1 | Grid columns adapt to tile count |
| 11.5 | Picture-in-Picture | [NEEDS TESTING] | P3 | PiP button in DailyControls using browser requestPictureInPicture API |
| 11.6 | Background audio (continue with screen off) | [INCOMPLETE] | P3 | Platform-dependent; iOS/Android handle via WebRTC natively, no frontend action needed |

---

## 12. ACCESSIBILITY

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 12.1 | Keyboard shortcuts for controls | [NEEDS TESTING] | P1 | M, V, H, Space keys in DailyControls |
| 12.2 | Screen reader support (aria-labels) | [NEEDS TESTING] | P1 | aria-labels, aria-pressed, role attributes on all controls |
| 12.3 | Live captions / closed captions | [NEEDS TESTING] | P2 | Captions toggle in DailyControls using daily.startTranscription/stopTranscription |
| 12.4 | High contrast mode | [NEEDS TESTING] | P3 | Toggle in DeviceSettings, applies .high-contrast class to document root |
| 12.5 | Focus management (trap focus in modals) | [NEEDS TESTING] | P2 | useFocusTrap hook on promotion prompt + poll modal |

---

## 13. NOTIFICATIONS

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 13.1 | Participant joined notification | [NEEDS TESTING] | P1 | ParticipantNotifications toast (green) |
| 13.2 | Participant left notification | [NEEDS TESTING] | P2 | ParticipantNotifications toast (gray) |
| 13.3 | Hand raised notification (to host) | [NEEDS TESTING] | P1 | Raised hands banner + count in ParticipantManager |
| 13.4 | New chat message notification | [NEEDS TESTING] | P1 | Unread badge on mobile chat toggle |
| 13.5 | Recording started notification | [NEEDS TESTING] | P0 | RecordingConsentBanner shown to all participants |
| 13.6 | Screen share started notification | [NEEDS TESTING] | P2 | ParticipantNotifications tracks track-started/stopped for screenVideo |
| 13.7 | "Session ending soon" warning | [NEEDS TESTING] | P2 | Admin "Warn Ending" button broadcasts to DailyLivestream + DailyActionOverlay |

---

## 14. STATE PERSISTENCE

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 14.1 | Guest name survives page refresh | [NEEDS TESTING] | P1 | Stored in localStorage |
| 14.2 | `inCall` state survives navigation | [NEEDS TESTING] | P1 | Stored in sessionStorage |
| 14.3 | Chat history on rejoin | [NEEDS TESTING] | P0 | Backend persistence, loads on mount |
| 14.4 | Promoted status on reconnect | [NEEDS TESTING] | P1 | sessionStorage flag + re-promote-request app message auto-handled by admin |
| 14.5 | Admin sidebar tab state | [NEEDS TESTING] | P2 | Persisted via sessionStorage |
| 14.6 | Session status real-time sync | [NEEDS TESTING] | P1 | useSessionStatus polls, broadcasts on go-live/end |

---

## 15. SECURITY

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 15.1 | Room-level access verification | [NEEDS TESTING] | P0 | Token generation with access checks |
| 15.2 | Rate limiting | [NEEDS TESTING] | P1 | In-memory rate limiter on all endpoints |
| 15.3 | Action payload validation | [NEEDS TESTING] | P1 | validate-action.ts with allowed types whitelist |
| 15.4 | Recording consent | [NEEDS TESTING] | P0 | RecordingConsentBanner |
| 15.5 | CSRF protection on token endpoint | [NEEDS TESTING] | P2 | Origin/referer check on /api/daily/meeting-token |
| 15.6 | API key rotation strategy | [INCOMPLETE] | P3 | Operational: rotate DAILY_API_KEY via env vars, no code change needed |

---

## 16. MONITORING & ANALYTICS

| # | Feature | Status | Priority | Notes |
|---|---------|--------|----------|-------|
| 16.1 | Error tracking (Sentry/similar) | [NEEDS TESTING] | P1 | DailyErrorBoundary wraps DailyRoom in both viewer + admin, reports to /api/client-error |
| 16.2 | Session analytics (duration, participants) | [PARTIAL] | P2 | Attendance data collected but no analytics dashboard |
| 16.3 | Daily.co quota/usage monitoring | [NEEDS TESTING] | P2 | Health endpoint checks Daily.co API status + domain info |
| 16.4 | Health check endpoint | [NEEDS TESTING] | P2 | /api/health returns frontend/backend/dailyApiKey status |
