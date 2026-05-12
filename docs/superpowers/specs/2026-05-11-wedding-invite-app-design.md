# Wedding Invite Web App — Design Spec
**Date:** 2026-05-11  
**Stack:** Next.js 14 (App Router, TypeScript) + Supabase + Vercel

---

## 1. Overview

A single-domain web app with two audiences:

- **Admin** (`/admin`): Password-gated panel for one couple (Ngọc Sơn & Ái Nhãn) to configure every aspect of their invitation and moderate guest wishes.
- **Guests** (`/`): Immersive mobile-first invitation page that feels like opening a physical envelope, then browsing a curated wedding website.

No user accounts; admin access is a single plaintext password stored in an environment variable.

---

## 2. Guest Page (`/`)

### 2.1 Envelope Intro
- Full-screen dark overlay with an animated envelope illustration.
- Tap/click anywhere → envelope "opens" (CSS animation, ~0.8s), overlay fades out, main invitation slides in.
- The tap event is the user gesture that unlocks Web Audio API autoplay.

### 2.2 Background Music
- Floating fixed-position music button (bottom-right, z-index high).
- `<audio loop preload="none">` sourced from Supabase Storage public URL.
- Plays automatically after envelope tap; toggles on/off via button.
- Shows song name label for 3 seconds after play starts.
- Hidden until envelope is opened.

### 2.3 Invitation Card (Hero)
- Cream/ivory (`#FAF8F3`) background, burgundy (`#7C1B2B`) accents, gold (`#C9A96E`) ornaments.
- Large script font: couple names (Great Vibes / Cormorant Garamond).
- 囍 watermark pattern as SVG overlay (decorative, low opacity).
- Floating petal particles (CSS animation, 6–8 petals, varied speeds).

### 2.4 Countdown Timer
- Live JS timer counting down to wedding datetime.
- Four blocks: Days / Hours / Minutes / Seconds.
- Updates every second via `setInterval`.

### 2.5 Event Details
- Three cards: Date & Time, Venue (with address), Dresscode / Notes.
- All content from Supabase `wedding_config` table.

### 2.6 Photo Album
- Horizontal swipeable carousel: CSS `scroll-snap-type: x mandatory` + `-webkit-overflow-scrolling: touch`.
- Dot indicators + "N / Total" counter.
- Auto-advances every 4 s; pauses on touch.
- Photos ordered by `sort_order` column in Supabase Storage metadata.
- No external carousel library.

### 2.7 Location & Map
- Venue name, full address displayed.
- Embedded Google Maps iframe (URL from admin config or hardcoded lat/lng).
- "Chỉ đường" button → opens Google Maps app on mobile.

### 2.8 Bank QR Code (Mừng Cưới)
- Section heading: "Mừng cưới" with gift-box ornament.
- Displays bank name, account number, account holder name (from config).
- QR image: `https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NUMBER}-qr_only.jpg` — no API key required, static URL, renders inline.
- Brief note: "Quét mã để chuyển khoản mừng cưới".
- Optional second bank account (bride + groom can each have one).

### 2.9 Wishes Wall
- Input form: guest name (required) + message (required).
- Submit → POST `/api/wishes` → saved to Supabase `wishes` table.
- Display: card grid (newest-first), each card shows name, message, timestamp, like count.
- Real-time updates via Supabase Realtime `postgres_changes` subscription.
- Like button: increments `likes` column (no auth, one like per session via localStorage flag per wish ID).
- Moderated: only wishes with `approved = true` shown to guests.

### 2.10 Footer
- Couple names, wedding date, small 囍 ornament.
- "Made with love ♥" tagline.

---

## 3. Admin Panel (`/admin`)

### 3.1 Authentication
- Route: `/admin` (and all sub-paths).
- Middleware checks `ADMIN_PASSWORD` env var against a cookie (`admin_session`).
- Login page: single password field → sets httpOnly cookie → redirects to `/admin`.
- No bcrypt; env var comparison is sufficient for a one-couple personal site.
- Logout button clears cookie.

### 3.2 Wedding Config Tab
Fields (all stored in single-row `wedding_config` table):
- Bride name, groom name
- Wedding date + time (datetime-local input)
- Venue name, address, Google Maps URL
- Dresscode / extra notes (textarea)
- Bank 1: bank code (dropdown of major VN banks), account number, account holder
- Bank 2: same fields (optional)
- Music file upload (replaces current; stored in Supabase Storage `wedding-music` bucket)

Save button → PATCH `/api/config`.

### 3.3 Photos Tab
- Drag-and-drop upload zone (accepts JPG/PNG/WEBP, max 10 MB each).
- Thumbnail grid showing current photos with `sort_order`.
- Drag-to-reorder (react-beautiful-dnd or @dnd-kit/core).
- Delete button per photo.
- Uploads to Supabase Storage `wedding-photos` bucket; metadata (sort_order) in `wedding_config` JSON column or separate `photos` table.

### 3.4 Wishes Tab
- Table: name, message, timestamp, likes, approved (toggle), delete.
- Bulk approve / delete.
- Filter: pending / approved / all.
- Real-time row updates via Supabase Realtime.

---

## 4. Data Model

### `wedding_config` (single row, id=1)
| column | type | notes |
|---|---|---|
| id | int4 PK | always 1 |
| bride_name | text | |
| groom_name | text | |
| wedding_date | timestamptz | |
| venue_name | text | |
| venue_address | text | |
| maps_url | text | Google Maps embed URL |
| dresscode | text | nullable |
| extra_notes | text | nullable |
| bank1_code | text | e.g. "VCB" |
| bank1_account | text | |
| bank1_holder | text | |
| bank2_code | text | nullable |
| bank2_account | text | nullable |
| bank2_holder | text | nullable |
| music_url | text | Supabase Storage public URL |
| photos | jsonb | `[{url, sort_order}]` |
| updated_at | timestamptz | auto |

### `wishes`
| column | type | notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| guest_name | text | |
| message | text | |
| likes | int4 | default 0 |
| approved | bool | default false |
| created_at | timestamptz | now() |

### Supabase Storage Buckets
- `wedding-photos` — public read, authenticated write
- `wedding-music` — public read, authenticated write

---

## 5. API Routes

| method | path | auth | description |
|---|---|---|---|
| GET | `/api/config` | none | Returns public config for guest page |
| PATCH | `/api/config` | admin cookie | Updates wedding config |
| GET | `/api/wishes` | none | Returns approved wishes |
| POST | `/api/wishes` | none | Submit new wish (approved=false) |
| PATCH | `/api/wishes/[id]` | admin cookie | Toggle approved / update likes |
| DELETE | `/api/wishes/[id]` | admin cookie | Delete wish |
| POST | `/api/upload/photos` | admin cookie | Upload photos to Supabase Storage |
| POST | `/api/upload/music` | admin cookie | Upload mp3 to Supabase Storage |

---

## 6. Architecture & Component Map

```
app/
  page.tsx                 ← Guest invitation page (SSR fetches config)
  admin/
    page.tsx               ← Admin dashboard shell
    login/page.tsx         ← Password login
  api/
    config/route.ts
    wishes/route.ts
    wishes/[id]/route.ts
    upload/photos/route.ts
    upload/music/route.ts
middleware.ts              ← Admin auth guard

components/
  guest/
    EnvelopeIntro.tsx
    MusicPlayer.tsx
    HeroCard.tsx
    CountdownTimer.tsx
    EventDetails.tsx
    PhotoAlbum.tsx
    LocationMap.tsx
    BankQR.tsx
    WishesWall.tsx
    WishForm.tsx
  admin/
    ConfigForm.tsx
    PhotoManager.tsx
    WishesManager.tsx

lib/
  supabase/
    client.ts              ← Browser client (anon key)
    server.ts              ← Server client (service role key)
  vietqr.ts               ← URL builder helper
```

---

## 7. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```

---

## 8. Deployment

1. Create Supabase project → run SQL migrations → configure RLS.
2. `npx create-next-app@latest` → `npm install @supabase/supabase-js @supabase/ssr`.
3. Push to GitHub → import to Vercel → set env vars.
4. Vercel auto-deploys on every push to `main`.

Estimated free tier usage: well within Supabase free (500 MB storage, 50k realtime msgs/month) and Vercel Hobby limits.

---

## 9. Error Handling & Edge Cases

- **Config not found**: Guest page shows skeleton/loading state; no crash.
- **No photos uploaded**: Album section hidden.
- **No music URL**: Music button hidden.
- **Wish submit fail**: Inline error message; no page reload.
- **VietQR image fail**: `onerror` fallback showing account number text only.
- **Realtime disconnect**: Falls back to polling every 30 s.

---

## 10. Out of Scope

- Multi-couple / multi-event support.
- Email notifications.
- Custom domain setup (Vercel provides `*.vercel.app` for free).
- SMS RSVP.
- Analytics / tracking.
