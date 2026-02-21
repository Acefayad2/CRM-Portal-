# Meetings feature – setup and behavior

In-portal “presentation meeting room”: host (agent) runs a live session with slides; clients join via a link and see slides only (no host camera). Phase 1 is slide sync + host camera preview (local only); audio/LiveKit can be added later.

## Env vars

No extra env vars are required for the base feature. Existing Supabase and Next.js config is used:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` – server-side APIs (invite validation, signed URLs, meeting state updates)
- `NEXT_PUBLIC_APP_URL` – used when generating the guest invite link (e.g. `https://yourapp.com`)

## Supabase tables

Migration: `supabase/migrations/019_meetings.sql`

| Table | Purpose |
|-------|--------|
| **meetings** | One row per meeting: `host_user_id`, `title`, `status` (draft \| live \| ended), `starts_at`, `ends_at`, `deck_id` (optional). |
| **meeting_invites** | One row per invite link: `meeting_id`, `invite_token` (unique, url-safe), `expires_at`. |
| **slide_decks** | One row per deck: `owner_user_id`, `title`. |
| **slides** | One row per slide (page): `deck_id`, `slide_index`, `storage_path` (path in Storage), `speaker_notes` (optional). |
| **meeting_state** | One row per meeting: `meeting_id` (PK), `current_slide_index`, `allow_client_navigation`, `updated_at`. |

RLS:

- **meetings** – host can CRUD own meetings.
- **meeting_invites** – host can create/delete invites for their meetings; guests never use direct table access.
- **slide_decks** / **slides** – owner can CRUD own decks and slides.
- **meeting_state** – only host can read/update via Supabase; guests get/update state only via API using an invite token.

## Storage bucket

- **Bucket name:** `slide-decks`
- **Create it** in Supabase Dashboard → Storage if it does not exist (the migration only adds the RLS policy for `storage.objects`).
- **Path format:** `{user_id}/{deck_id}/deck.pdf` (one PDF per deck; `user_id` is the first path segment so RLS can restrict by owner).
- **Policy:** `slide_decks_storage_owner` allows access only when `(storage.foldername(name))[1] = auth.uid()::text`.

## Invite tokens

- Created by the host via **POST /api/meetings/[id]/invite** (body optional: `{ "expiresInHours": 24 }`).
- Stored in **meeting_invites** with `invite_token` (random, url-safe) and `expires_at`.
- **Guest join URL:** `{NEXT_PUBLIC_APP_URL}/meet/{invite_token}` (no account required).
- Validation is **server-only** in API routes using the service role:
  - **GET /api/meetings/public/state?token=** – returns meeting + state + deck + slides if token is valid and not expired.
  - **GET /api/meetings/public/pdf-url?token=** – returns a signed URL for the meeting’s deck PDF.
  - **PATCH /api/meetings/public/state?token=** – allows updating `current_slide_index` only when `allow_client_navigation` is true.
- Clients never see the host’s camera; they only receive slide state and the PDF URL.

## Realtime / slide sync

- **Host:** Uses authenticated Supabase client; can subscribe to **meeting_state** (and optionally use Realtime for presence). Slide changes are written via **PATCH /api/meetings/[id]/state** (host-only).
- **Viewers:** Do not use Supabase Realtime. They poll **GET /api/meetings/public/state?token=** on an interval (e.g. 2s) to get `current_slide_index` and `allow_client_navigation`. When navigation is allowed, they can call **PATCH /api/meetings/public/state?token=** to change slide.
- So: host is the single source of truth; viewers follow by polling (and optional PATCH when allowed). No Realtime subscription is required for guests.

## Routes

| Route | Who | Purpose |
|-------|-----|--------|
| **/portal/meetings** | Authenticated | List meetings, create meeting. |
| **/portal/meetings/[id]** | Host | Host room: select deck, upload PDF, copy invite link, go live, change slides, script/camera panel. |
| **/meet/[token]** | Guest | Viewer room: current slide, optional prev/next if allowed, connection status. |

## API (summary)

- **Meetings:** GET/POST /api/meetings, GET/PATCH /api/meetings/[id], POST /api/meetings/[id]/invite, GET/PATCH /api/meetings/[id]/state.
- **Public (guest):** GET /api/meetings/public/state?token=, GET /api/meetings/public/pdf-url?token=, PATCH /api/meetings/public/state?token= (when client navigation allowed).
- **Decks:** GET/POST /api/decks, GET/PATCH/DELETE /api/decks/[id], POST /api/decks/[id]/upload, GET /api/decks/[id]/pdf-url.

## PDF handling

- Upload: **POST /api/decks/[id]/upload** (multipart, field `file`). PDF is stored in `slide-decks/{user_id}/{deck_id}/deck.pdf`. Slide rows are created (one per page when possible; see upload route).
- Viewing: Host and guest get a **signed URL** (deck URL or public pdf-url) and render in the browser with **pdf.js** (client-side); `slide_index` is the page number (0-based).

## Phase 2+ (not implemented)

- **Host audio to clients:** e.g. LiveKit (or P2P) so viewers can hear the host.
- **Optional client Q&A:** allow viewers to unmute or turn on video for questions.
