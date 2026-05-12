# Wedding Invite Web App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js 14 web app where an admin uploads wedding details/photos/music and guests view an animated invitation and send wishes in real-time.

**Architecture:** SSR guest page (App Router, server component fetches config at request time from Supabase), client-side components for interactive UI (envelope, album, music, countdown, realtime wishes). Admin panel is a password-gated set of client pages that call API routes. All media in Supabase Storage; structured data in PostgreSQL.

**Tech Stack:** Next.js 14 App Router · TypeScript · Supabase (PostgreSQL + Storage + Realtime) · @dnd-kit/sortable (photo reordering) · @supabase/ssr (cookie-based server auth) · Vercel (deploy) · Tailwind CSS (layout utilities) · Google Fonts (Cormorant Garamond, Great Vibes, Montserrat)

**Design tokens:** `--cream: #FAF8F3` · `--burg: #7C1B2B` · `--gold: #C9A96E` · `--dark: #231010`

---

## Task 1: Project Scaffold

**Files:**
- Create: `wedding-invite-app/` (project root, all files below are relative)
- Create: `tailwind.config.ts`
- Create: `.env.local`
- Create: `.env.example`
- Create: `package.json` (via npx)

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd ~/Desktop
npx create-next-app@latest wedding-invite-app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd wedding-invite-app
```

Expected: project created, `npm run dev` works on port 3000.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 3: Configure Tailwind with design tokens**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F3',
        'cream-2': '#F0E9DC',
        'cream-3': '#E4D8C6',
        burg: '#7C1B2B',
        'burg-2': '#9B2F3F',
        'burg-3': '#5A1120',
        gold: '#C9A96E',
        'gold-2': '#D8BC8A',
        dark: '#231010',
        mid: '#5C3535',
        soft: '#7A5555',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        body: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Set up Google Fonts in `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Thiệp Cưới — Ngọc Sơn & Ái Nhãn',
  description: 'Trân trọng kính mời đến Lễ Thành Hôn',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Great+Vibes&family=Montserrat:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: Add CSS variables to `app/globals.css`**

Replace the file content (keep Tailwind directives at top):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --cream: #FAF8F3;
  --cream2: #F0E9DC;
  --cream3: #E4D8C6;
  --burg: #7C1B2B;
  --burg2: #9B2F3F;
  --burg3: #5A1120;
  --gold: #C9A96E;
  --gold2: #D8BC8A;
  --dark: #231010;
  --mid: #5C3535;
  --soft: #7A5555;
}

*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html { scroll-behavior: smooth; }

/* Phone frame for desktop */
.phone {
  position: relative;
  max-width: 430px;
  margin: 0 auto;
  min-height: 100svh;
  background: var(--cream);
  overflow: hidden;
}

@media (min-width: 500px) {
  body {
    padding: 2rem 0;
    min-height: 100vh;
    background: #1a0808;
  }
  .phone {
    border-radius: 40px;
    box-shadow: 0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1);
  }
}
```

- [ ] **Step 6: Create env files**

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ADMIN_PASSWORD=your_admin_password_here
```

Create `.env.example` (commit this, not `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```

Add to `.gitignore`:
```
.env.local
```

- [ ] **Step 7: Verify build compiles**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no type errors.

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 14 + Tailwind + Supabase deps"
```

---

## Task 2: Supabase Database & Storage Setup

**Files:**
- Create: `supabase/migrations/001_init.sql`
- Create: `supabase/migrations/002_rls.sql`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project. Note the project URL and anon/service keys. Copy them into `.env.local`.

- [ ] **Step 2: Write migration 001 — tables**

Create `supabase/migrations/001_init.sql`:

```sql
-- wedding_config: single-row configuration table
create table if not exists wedding_config (
  id            int4 primary key default 1 check (id = 1),
  bride_name    text not null default 'Ái Nhãn',
  groom_name    text not null default 'Ngọc Sơn',
  wedding_date  timestamptz not null default '2025-12-13T11:00:00+07:00',
  venue_name    text not null default 'Trung Tâm Tiệc Cưới Ánh Dương',
  venue_address text not null default 'Quận 1, TP.HCM',
  maps_url      text,
  dresscode     text,
  extra_notes   text,
  bank1_code    text,
  bank1_account text,
  bank1_holder  text,
  bank2_code    text,
  bank2_account text,
  bank2_holder  text,
  music_url     text,
  photos        jsonb not null default '[]',
  updated_at    timestamptz not null default now()
);

-- Seed the single row
insert into wedding_config (id) values (1) on conflict do nothing;

-- Trigger to auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger wedding_config_updated_at
  before update on wedding_config
  for each row execute function update_updated_at();

-- wishes table
create table if not exists wishes (
  id          uuid primary key default gen_random_uuid(),
  guest_name  text not null,
  message     text not null,
  likes       int4 not null default 0,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);
```

- [ ] **Step 3: Write migration 002 — RLS policies**

Create `supabase/migrations/002_rls.sql`:

```sql
-- Enable RLS
alter table wedding_config enable row level security;
alter table wishes enable row level security;

-- wedding_config: public read-only (for guest page)
create policy "Public read wedding_config"
  on wedding_config for select using (true);

-- wishes: public read only approved wishes
create policy "Public read approved wishes"
  on wishes for select using (approved = true);

-- wishes: anyone can insert (guest submission)
create policy "Anyone can submit a wish"
  on wishes for insert with check (true);

-- Note: UPDATE and DELETE on wishes require service role key (used in API routes).
-- The anon key cannot update or delete wishes — that's intentional.
-- No service role policy needed; service role bypasses RLS by default.
```

- [ ] **Step 4: Run migrations in Supabase**

In Supabase dashboard → SQL Editor, paste and run `001_init.sql` then `002_rls.sql`.

Alternatively via CLI if supabase CLI is installed:
```bash
npx supabase db push
```

- [ ] **Step 5: Create storage buckets**

In Supabase dashboard → Storage → New bucket:
1. Name: `wedding-photos` · Public: ✓
2. Name: `wedding-music` · Public: ✓

For each bucket, add a policy:
- **SELECT**: `true` (public read)
- **INSERT/UPDATE/DELETE**: Only service role (leave unchecked for anon)

Or run in SQL Editor:
```sql
insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true),
       ('wedding-music', 'wedding-music', true)
on conflict do nothing;
```

- [ ] **Step 6: Verify tables exist**

In Supabase SQL Editor:
```sql
select * from wedding_config;
select count(*) from wishes;
```

Expected: 1 row in `wedding_config` with default values, 0 rows in `wishes`.

- [ ] **Step 7: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase migrations and storage bucket setup"
```

---

## Task 3: Types, Supabase Clients & VietQR Helper

**Files:**
- Create: `lib/types.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/vietqr.ts`

- [ ] **Step 1: Write shared types**

Create `lib/types.ts`:

```typescript
export interface PhotoEntry {
  url: string
  sort_order: number
}

export interface WeddingConfig {
  id: number
  bride_name: string
  groom_name: string
  wedding_date: string          // ISO 8601 string
  venue_name: string
  venue_address: string
  maps_url: string | null
  dresscode: string | null
  extra_notes: string | null
  bank1_code: string | null
  bank1_account: string | null
  bank1_holder: string | null
  bank2_code: string | null
  bank2_account: string | null
  bank2_holder: string | null
  music_url: string | null
  photos: PhotoEntry[]
  updated_at: string
}

export interface Wish {
  id: string
  guest_name: string
  message: string
  likes: number
  approved: boolean
  created_at: string
}

// Public shape exposed to the guest page (no internal fields)
export type PublicConfig = Omit<WeddingConfig, 'updated_at'>
export type PublicWish = Pick<Wish, 'id' | 'guest_name' | 'message' | 'likes' | 'created_at'>
```

- [ ] **Step 2: Write browser Supabase client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Write server Supabase client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Anon client — respects RLS, for server components reading public data
export function createServerAnonClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// Service role client — bypasses RLS, for API routes that need write access
export function createServiceClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 4: Write VietQR helper**

Create `lib/vietqr.ts`:

```typescript
// Vietnamese bank codes used in VietQR
export const VN_BANKS: Record<string, string> = {
  VCB: 'Vietcombank',
  TCB: 'Techcombank',
  ACB: 'ACB',
  MB:  'MB Bank',
  VPB: 'VPBank',
  TPB: 'TPBank',
  STB: 'Sacombank',
  BIDV: 'BIDV',
  CTG: 'VietinBank',
  VIB: 'VIB',
  OCB: 'OCB',
  MSB: 'MSB',
  HDB: 'HDBank',
  SCB: 'SCB',
  SHB: 'SHB',
}

/**
 * Returns the VietQR image URL for a given bank and account.
 * No API key required — this is a public static URL.
 */
export function vietqrUrl(bankCode: string, accountNumber: string): string {
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-qr_only.jpg`
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/
git commit -m "feat: add types, Supabase clients, and VietQR helper"
```

---

## Task 4: Admin Auth Middleware

**Files:**
- Create: `middleware.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`

- [ ] **Step 1: Write middleware**

Create `middleware.ts` at project root:

```typescript
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only guard /admin routes (not /admin/login or /api/admin/*)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get(ADMIN_COOKIE)?.value
    if (session !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 2: Write login API route**

Create `app/api/admin/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Sai mật khẩu' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return response
}
```

- [ ] **Step 3: Write logout API route**

Create `app/api/admin/logout/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  response.cookies.delete('admin_session')
  return response
}
```

- [ ] **Step 4: Write login page**

Create `app/admin/login/page.tsx`:

```typescript
'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error || 'Đăng nhập thất bại')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="font-display text-2xl text-dark text-center mb-2">
          Quản lý thiệp cưới
        </h1>
        <p className="text-soft text-sm text-center mb-6 font-body">
          Ngọc Sơn & Ái Nhãn · 13.12.2025
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-body font-medium text-mid uppercase tracking-wider mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-cream-3 rounded-lg px-4 py-2.5 text-dark font-body text-sm focus:outline-none focus:border-burg focus:ring-1 focus:ring-burg"
              placeholder="••••••••"
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-body text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-burg text-cream-2 font-body font-medium py-2.5 rounded-lg hover:bg-burg-2 transition-colors disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify middleware works**

```bash
npm run dev
```

Open http://localhost:3000/admin — should redirect to http://localhost:3000/admin/login. Login page should render.

- [ ] **Step 6: Commit**

```bash
git add middleware.ts app/admin/ app/api/admin/
git commit -m "feat: add admin auth middleware, login/logout API, login page"
```

---

## Task 5: API Routes — Config

**Files:**
- Create: `app/api/config/route.ts`

- [ ] **Step 1: Write GET config route (public)**

Create `app/api/config/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { WeddingConfig } from '@/lib/types'

export const revalidate = 60 // ISR: cache for 60s

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('wedding_config')
    .select('*')
    .eq('id', 1)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 })
  }

  return NextResponse.json(data as WeddingConfig)
}

export async function PATCH(request: NextRequest) {
  // Verify admin cookie
  const cookie = request.cookies.get('admin_session')?.value
  if (cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Only allow known fields (whitelist to prevent injection)
  const allowed = [
    'bride_name', 'groom_name', 'wedding_date',
    'venue_name', 'venue_address', 'maps_url',
    'dresscode', 'extra_notes',
    'bank1_code', 'bank1_account', 'bank1_holder',
    'bank2_code', 'bank2_account', 'bank2_holder',
    'music_url', 'photos',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('wedding_config')
    .update(update)
    .eq('id', 1)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

- [ ] **Step 2: Test GET route**

With `npm run dev` running:
```bash
curl http://localhost:3000/api/config | jq .
```

Expected: JSON with wedding config defaults (bride_name: "Ái Nhãn", groom_name: "Ngọc Sơn", etc.)

- [ ] **Step 3: Commit**

```bash
git add app/api/config/
git commit -m "feat: add config GET/PATCH API route"
```

---

## Task 6: API Routes — Wishes

**Files:**
- Create: `app/api/wishes/route.ts`
- Create: `app/api/wishes/[id]/route.ts`

- [ ] **Step 1: Write wishes list + submit routes**

Create `app/api/wishes/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Wish } from '@/lib/types'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('wishes')
    .select('id, guest_name, message, likes, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const { guest_name, message } = await request.json()

  if (!guest_name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 })
  }

  if (guest_name.length > 100 || message.length > 500) {
    return NextResponse.json({ error: 'Nội dung quá dài' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('wishes')
    .insert({ guest_name: guest_name.trim(), message: message.trim() })
    .select('id, guest_name, message, likes, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 2: Write per-wish route (admin operations + like)**

Create `app/api/wishes/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get('admin_session')?.value === process.env.ADMIN_PASSWORD
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const supabase = createServiceClient()

  // Like action: anyone can like (no admin required)
  if ('like' in body && body.like === true) {
    const { data: current } = await supabase
      .from('wishes')
      .select('likes')
      .eq('id', params.id)
      .single()

    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('wishes')
      .update({ likes: current.likes + 1 })
      .eq('id', params.id)
      .select('id, likes')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Admin-only: toggle approved
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allowed = ['approved']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  const { data, error } = await supabase
    .from('wishes')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('wishes')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Test wishes routes**

```bash
# Submit a wish
curl -X POST http://localhost:3000/api/wishes \
  -H "Content-Type: application/json" \
  -d '{"guest_name":"Test User","message":"Chúc mừng!"}' | jq .

# List approved wishes (should be empty — new wishes need approval)
curl http://localhost:3000/api/wishes | jq .
```

Expected: POST returns 201 with the wish object (approved: false). GET returns [].

- [ ] **Step 4: Commit**

```bash
git add app/api/wishes/
git commit -m "feat: add wishes GET/POST and per-wish PATCH/DELETE API routes"
```

---

## Task 7: API Routes — Upload

**Files:**
- Create: `app/api/upload/photos/route.ts`
- Create: `app/api/upload/music/route.ts`

- [ ] **Step 1: Write photo upload route**

Create `app/api/upload/photos/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')?.value
  if (cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, WEBP allowed' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const filename = `photo-${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const supabase = createServiceClient()
  const { error } = await supabase.storage
    .from('wedding-photos')
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('wedding-photos')
    .getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl }, { status: 201 })
}
```

- [ ] **Step 2: Write music upload route**

Create `app/api/upload/music/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3']

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')?.value
  if (cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only MP3 allowed' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 })
  }

  // Always overwrite to wedding-music/bgm.mp3
  const buffer = await file.arrayBuffer()
  const supabase = createServiceClient()

  const { error } = await supabase.storage
    .from('wedding-music')
    .upload('bgm.mp3', buffer, { contentType: 'audio/mpeg', upsert: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('wedding-music')
    .getPublicUrl('bgm.mp3')

  // Update wedding_config music_url
  await supabase.from('wedding_config').update({ music_url: publicUrl }).eq('id', 1)

  return NextResponse.json({ url: publicUrl }, { status: 201 })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/upload/
git commit -m "feat: add photo and music upload API routes"
```

---

## Task 8: Guest Page Shell

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the guest page**

Replace `app/page.tsx`:

```typescript
import { WeddingConfig } from '@/lib/types'
import EnvelopeIntro from '@/components/guest/EnvelopeIntro'
import GuestInvitation from '@/components/guest/GuestInvitation'

async function getConfig(): Promise<WeddingConfig | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/config`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function GuestPage() {
  const config = await getConfig()

  return (
    <main>
      <div className="phone">
        <EnvelopeIntro
          brideName={config?.bride_name ?? 'Ái Nhãn'}
          groomName={config?.groom_name ?? 'Ngọc Sơn'}
        />
        <GuestInvitation config={config} />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create GuestInvitation wrapper**

Create `components/guest/GuestInvitation.tsx`:

```typescript
'use client'
import { WeddingConfig } from '@/lib/types'
import HeroCard from './HeroCard'
import MusicPlayer from './MusicPlayer'
import CountdownTimer from './CountdownTimer'
import EventDetails from './EventDetails'
import PhotoAlbum from './PhotoAlbum'
import LocationMap from './LocationMap'
import BankQR from './BankQR'
import WishesWall from './WishesWall'

interface Props {
  config: WeddingConfig | null
}

export default function GuestInvitation({ config }: Props) {
  return (
    <div id="main-content" style={{ display: 'none' }}>
      <HeroCard config={config} />
      {config?.music_url && <MusicPlayer musicUrl={config.music_url} />}
      <CountdownTimer weddingDate={config?.wedding_date ?? '2025-12-13T11:00:00+07:00'} />
      <EventDetails config={config} />
      {config?.photos && config.photos.length > 0 && (
        <PhotoAlbum photos={config.photos} />
      )}
      <LocationMap config={config} />
      {(config?.bank1_account || config?.bank2_account) && (
        <BankQR config={config} />
      )}
      <WishesWall />
      <footer className="py-10 text-center bg-cream-2">
        <p className="font-script text-3xl text-burg">
          {config?.groom_name ?? 'Ngọc Sơn'} & {config?.bride_name ?? 'Ái Nhãn'}
        </p>
        <p className="font-body text-sm text-soft mt-1">
          {config?.wedding_date
            ? new Date(config.wedding_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : '13.12.2025'}
        </p>
        <p className="font-body text-xs text-soft mt-3">Made with ♥</p>
      </footer>
    </div>
  )
}
```

Note: `#main-content` starts hidden — `EnvelopeIntro` reveals it after the opening animation.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx components/guest/GuestInvitation.tsx
git commit -m "feat: add guest page shell and GuestInvitation wrapper"
```

---

## Task 9: EnvelopeIntro Component

**Files:**
- Create: `components/guest/EnvelopeIntro.tsx`

- [ ] **Step 1: Create the component**

Create `components/guest/EnvelopeIntro.tsx`:

```typescript
'use client'
import { useEffect, useRef } from 'react'

interface Props {
  brideName: string
  groomName: string
}

export default function EnvelopeIntro({ brideName, groomName }: Props) {
  const envelopeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const envelope = envelopeRef.current
    if (!envelope) return

    function open() {
      if (!envelope) return
      envelope.classList.add('opening')

      setTimeout(() => {
        envelope.style.display = 'none'
        const main = document.getElementById('main-content')
        if (main) main.style.display = 'block'

        // Dispatch event so MusicPlayer can start
        window.dispatchEvent(new Event('envelope-opened'))
      }, 800)
    }

    envelope.addEventListener('click', open)
    return () => envelope.removeEventListener('click', open)
  }, [])

  return (
    <>
      <style>{`
        #envelope {
          position: fixed; inset: 0; z-index: 200;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: var(--cream); cursor: pointer;
        }
        #envelope.opening {
          animation: envelopeExit .8s ease forwards;
        }
        @keyframes envelopeExit {
          0%   { opacity: 1; transform: translateY(0) }
          60%  { opacity: 0; transform: translateY(-60px) }
          100% { opacity: 0; transform: translateY(-100%) }
        }
        .env-seal {
          width: 120px; height: 120px;
          border: 2px solid var(--gold);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2rem;
          box-shadow: 0 0 0 8px rgba(201,169,110,.15);
          animation: sealPulse 2s ease-in-out infinite;
        }
        @keyframes sealPulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(201,169,110,.15) }
          50%       { box-shadow: 0 0 0 16px rgba(201,169,110,.05) }
        }
        .env-xi { font-size: 52px; color: var(--burg); line-height: 1; }
        .env-names { font-family: 'Great Vibes', cursive; font-size: 2rem; color: var(--dark); margin-bottom: 2rem; text-align: center; }
        .env-tap { font-family: 'Montserrat', sans-serif; font-size: .75rem; letter-spacing: .15em; color: var(--soft); text-transform: uppercase; animation: tapBlink 1.5s ease-in-out infinite; }
        @keyframes tapBlink { 0%,100%{opacity:.4} 50%{opacity:1} }

        /* Floating petals */
        .petal { position: absolute; width: 8px; height: 12px; border-radius: 50% 0 50% 0; background: var(--gold2); opacity: 0; animation: petalFall linear infinite; pointer-events: none; }
        @keyframes petalFall {
          0%   { opacity: 0; transform: translateY(-20px) rotate(0deg) }
          10%  { opacity: .6 }
          90%  { opacity: .3 }
          100% { opacity: 0; transform: translateY(100vh) rotate(360deg) }
        }
      `}</style>

      <div id="envelope" ref={envelopeRef}>
        {/* Petals */}
        {[
          { left: '15%', delay: '0s',    dur: '6s'  },
          { left: '30%', delay: '1.5s',  dur: '8s'  },
          { left: '50%', delay: '0.8s',  dur: '7s'  },
          { left: '65%', delay: '2.2s',  dur: '9s'  },
          { left: '80%', delay: '0.3s',  dur: '6.5s'},
          { left: '40%', delay: '3.1s',  dur: '7.5s'},
        ].map((p, i) => (
          <span
            key={i}
            className="petal"
            style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }}
          />
        ))}

        <div className="env-seal">
          <span className="env-xi">囍</span>
        </div>

        <p className="env-names">
          {groomName} &amp; {brideName}
        </p>

        <p className="env-tap">Chạm để mở thiệp</p>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Manual test**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Envelope shows with animated 囍 seal and pulsing border
- Tapping/clicking triggers fade-out animation (~0.8s)
- After animation: main content div becomes visible (currently empty)

- [ ] **Step 3: Commit**

```bash
git add components/guest/EnvelopeIntro.tsx
git commit -m "feat: add EnvelopeIntro component with 囍 seal animation"
```

---

## Task 10: HeroCard, MusicPlayer & CountdownTimer

**Files:**
- Create: `components/guest/HeroCard.tsx`
- Create: `components/guest/MusicPlayer.tsx`
- Create: `components/guest/CountdownTimer.tsx`

- [ ] **Step 1: HeroCard**

Create `components/guest/HeroCard.tsx`:

```typescript
import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

export default function HeroCard({ config }: Props) {
  const bride = config?.bride_name ?? 'Ái Nhãn'
  const groom = config?.groom_name ?? 'Ngọc Sơn'
  const date = config?.wedding_date
    ? new Date(config.wedding_date).toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
      })
    : 'Thứ Bảy, 13.12.2025'

  return (
    <>
      <style>{`
        .hero {
          min-height: 100svh; background: var(--cream);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 3rem 2rem; text-align: center; position: relative; overflow: hidden;
        }
        .hero-watermark {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-size: 18rem; color: var(--gold); opacity: .05; pointer-events: none;
          font-family: serif; user-select: none; line-height: 1;
        }
        .hero-ornament {
          width: 80px; height: 1px; background: var(--gold);
          display: inline-block; vertical-align: middle; margin: 0 1rem;
        }
        .hero-kinhm { font-family: 'Montserrat', sans-serif; font-size: .7rem; letter-spacing: .25em; color: var(--soft); text-transform: uppercase; margin-bottom: 1.5rem; }
        .hero-names { font-family: 'Great Vibes', cursive; font-size: 3.5rem; color: var(--dark); line-height: 1.2; margin-bottom: .5rem; }
        .hero-amp   { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: var(--gold); margin: .25rem 0; font-style: italic; }
        .hero-date  { font-family: 'Cormorant Garamond', serif; font-size: 1rem; color: var(--mid); margin-top: 1.5rem; letter-spacing: .05em; }
        .hero-divider { margin: 1.5rem auto; display: flex; align-items: center; gap: .5rem; }
        .hero-divider-line { flex: 1; height: 1px; background: var(--cream3); }
        .hero-divider-diamond { width: 6px; height: 6px; background: var(--gold); transform: rotate(45deg); }
        .hero-invitation { font-family: 'Cormorant Garamond', serif; font-size: .95rem; color: var(--mid); line-height: 1.8; max-width: 280px; margin: 0 auto; font-style: italic; }
      `}</style>

      <section className="hero">
        <div className="hero-watermark" aria-hidden="true">囍</div>

        <p className="hero-kinhm">Trân trọng kính mời</p>

        <p className="hero-names">{groom}</p>
        <p className="hero-amp">&amp;</p>
        <p className="hero-names">{bride}</p>

        <div className="hero-divider">
          <div className="hero-divider-line" />
          <div className="hero-divider-diamond" />
          <div className="hero-divider-line" />
        </div>

        <p className="hero-date">{date}</p>

        <div className="hero-divider">
          <div className="hero-divider-line" />
          <div className="hero-divider-diamond" />
          <div className="hero-divider-line" />
        </div>

        <p className="hero-invitation">
          Chúng tôi trân trọng kính mời quý vị<br />
          đến chung vui trong ngày thành hôn<br />
          của chúng tôi.
        </p>
      </section>
    </>
  )
}
```

- [ ] **Step 2: CountdownTimer**

Create `components/guest/CountdownTimer.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'

interface Props { weddingDate: string }

function pad(n: number) { return String(Math.max(0, Math.floor(n))).padStart(2, '0') }

export default function CountdownTimer({ weddingDate }: Props) {
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    const target = new Date(weddingDate).getTime()
    function tick() { setDiff(Math.max(0, target - Date.now())) }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [weddingDate])

  const days  = Math.floor(diff / 864e5)
  const hours = Math.floor((diff % 864e5) / 36e5)
  const mins  = Math.floor((diff % 36e5) / 6e4)
  const secs  = Math.floor((diff % 6e4) / 1e3)

  return (
    <>
      <style>{`
        .countdown { background: var(--burg); padding: 2.5rem 1.5rem; text-align: center; }
        .countdown-label { font-family: 'Montserrat', sans-serif; font-size: .65rem; letter-spacing: .2em; color: rgba(255,255,255,.6); text-transform: uppercase; margin-bottom: 1rem; }
        .countdown-grid { display: flex; gap: 1rem; justify-content: center; }
        .cd-block { flex: 1; max-width: 72px; }
        .cd-num { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; color: #FAF8F3; font-weight: 300; line-height: 1; }
        .cd-unit { font-family: 'Montserrat', sans-serif; font-size: .6rem; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .1em; margin-top: .25rem; }
      `}</style>

      <section className="countdown">
        <p className="countdown-label">Đếm ngược đến ngày cưới</p>
        <div className="countdown-grid">
          {[
            { n: pad(days),  u: 'Ngày'   },
            { n: pad(hours), u: 'Giờ'    },
            { n: pad(mins),  u: 'Phút'   },
            { n: pad(secs),  u: 'Giây'   },
          ].map(({ n, u }) => (
            <div key={u} className="cd-block">
              <div className="cd-num">{n}</div>
              <div className="cd-unit">{u}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 3: MusicPlayer**

Create `components/guest/MusicPlayer.tsx`:

```typescript
'use client'
import { useEffect, useRef, useState } from 'react'

interface Props { musicUrl: string }

export default function MusicPlayer({ musicUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [labelVisible, setLabelVisible] = useState(false)

  useEffect(() => {
    function onOpen() {
      const audio = audioRef.current
      if (!audio) return
      audio.play()
        .then(() => {
          setPlaying(true)
          setLabelVisible(true)
          setTimeout(() => setLabelVisible(false), 3000)
        })
        .catch(() => {}) // autoplay blocked: user can tap manually
    }

    window.addEventListener('envelope-opened', onOpen)
    return () => window.removeEventListener('envelope-opened', onOpen)
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  return (
    <>
      <style>{`
        .music-player {
          position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 100;
          display: flex; flex-direction: column; align-items: flex-end; gap: .5rem;
        }
        .music-label {
          background: rgba(35,16,16,.85); color: #FAF8F3;
          font-family: 'Montserrat', sans-serif; font-size: .7rem;
          padding: .35rem .75rem; border-radius: 20px; white-space: nowrap;
          transition: opacity .4s; pointer-events: none;
        }
        .music-label.hidden { opacity: 0; }
        .music-btn {
          width: 48px; height: 48px; border-radius: 50%;
          background: var(--burg); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(124,27,43,.4);
          transition: transform .15s;
        }
        .music-btn:active { transform: scale(.92); }
        .music-btn.playing { animation: ripple 1.5s ease-out infinite; }
        @keyframes ripple {
          0%   { box-shadow: 0 4px 16px rgba(124,27,43,.4), 0 0 0 0 rgba(124,27,43,.4) }
          70%  { box-shadow: 0 4px 16px rgba(124,27,43,.4), 0 0 0 16px rgba(124,27,43,0) }
          100% { box-shadow: 0 4px 16px rgba(124,27,43,.4), 0 0 0 0 rgba(124,27,43,0) }
        }
        .music-icon { color: #FAF8F3; font-size: 1.2rem; }
      `}</style>

      <audio ref={audioRef} loop preload="none" src={musicUrl} />

      <div className="music-player">
        <div className={`music-label ${labelVisible ? '' : 'hidden'}`}>
          ♪ Nhạc nền đám cưới
        </div>
        <button
          className={`music-btn ${playing ? 'playing' : ''}`}
          onClick={toggle}
          aria-label={playing ? 'Tắt nhạc' : 'Bật nhạc'}
        >
          <span className="music-icon">{playing ? '⏸' : '▶'}</span>
        </button>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Manual test**

Open http://localhost:3000. Verify:
- Envelope opens → hero card, countdown, and music button appear
- Countdown ticks correctly
- Music button shows (only if config has music_url — currently null, so hidden is correct)

- [ ] **Step 5: Commit**

```bash
git add components/guest/HeroCard.tsx components/guest/CountdownTimer.tsx components/guest/MusicPlayer.tsx
git commit -m "feat: add HeroCard, CountdownTimer, MusicPlayer components"
```

---

## Task 11: EventDetails, LocationMap & BankQR

**Files:**
- Create: `components/guest/EventDetails.tsx`
- Create: `components/guest/LocationMap.tsx`
- Create: `components/guest/BankQR.tsx`

- [ ] **Step 1: EventDetails**

Create `components/guest/EventDetails.tsx`:

```typescript
import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

export default function EventDetails({ config }: Props) {
  const dateStr = config?.wedding_date
    ? new Date(config.wedding_date).toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
      })
    : 'Thứ Bảy, 13 tháng 12, 2025'
  const timeStr = config?.wedding_date
    ? new Date(config.wedding_date).toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit', hour12: false
      }) + ' SA'
    : '11:00 SA'

  const items = [
    { icon: '📅', label: 'Ngày cưới',  value: dateStr },
    { icon: '⏰', label: 'Thời gian',  value: timeStr },
    { icon: '📍', label: 'Địa điểm',   value: config?.venue_name ?? 'Trung Tâm Tiệc Cưới Ánh Dương' },
  ]
  if (config?.dresscode) {
    items.push({ icon: '👗', label: 'Trang phục', value: config.dresscode })
  }

  return (
    <>
      <style>{`
        .details { padding: 2.5rem 1.5rem; background: var(--cream2); }
        .details-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: var(--dark); text-align: center; margin-bottom: 1.5rem; }
        .details-card { background: var(--cream); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: .75rem; display: flex; align-items: flex-start; gap: .75rem; }
        .details-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: .1rem; }
        .details-label { font-family: 'Montserrat', sans-serif; font-size: .6rem; letter-spacing: .15em; text-transform: uppercase; color: var(--soft); margin-bottom: .2rem; }
        .details-value { font-family: 'Cormorant Garamond', serif; font-size: 1rem; color: var(--dark); line-height: 1.4; }
        .details-address { font-family: 'Montserrat', sans-serif; font-size: .75rem; color: var(--mid); margin-top: .25rem; }
      `}</style>

      <section className="details">
        <h2 className="details-title">Thông tin buổi lễ</h2>
        {items.map(({ icon, label, value }) => (
          <div key={label} className="details-card">
            <span className="details-icon">{icon}</span>
            <div>
              <p className="details-label">{label}</p>
              <p className="details-value">{value}</p>
              {label === 'Địa điểm' && config?.venue_address && (
                <p className="details-address">{config.venue_address}</p>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
```

- [ ] **Step 2: LocationMap**

Create `components/guest/LocationMap.tsx`:

```typescript
import { WeddingConfig } from '@/lib/types'

interface Props { config: WeddingConfig | null }

export default function LocationMap({ config }: Props) {
  const mapsUrl = config?.maps_url
    ?? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919!2d106.7!3d10.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzEyLjAiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1svi!2s!4v1'
  const navUrl = config?.venue_address
    ? `https://maps.google.com/?q=${encodeURIComponent(config.venue_address)}`
    : 'https://maps.google.com/'

  return (
    <>
      <style>{`
        .location { padding: 2.5rem 1.5rem; background: var(--cream); }
        .location-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: var(--dark); text-align: center; margin-bottom: 1.25rem; }
        .location-address { font-family: 'Montserrat', sans-serif; font-size: .8rem; color: var(--mid); text-align: center; margin-bottom: 1rem; line-height: 1.6; }
        .location-map { width: 100%; height: 200px; border-radius: 12px; border: none; display: block; }
        .location-btn {
          display: block; width: 100%; margin-top: 1rem;
          padding: .85rem; border-radius: 12px;
          background: var(--burg); color: var(--cream); text-align: center;
          font-family: 'Montserrat', sans-serif; font-size: .8rem; font-weight: 500;
          text-decoration: none; letter-spacing: .05em;
          transition: background .15s;
        }
        .location-btn:hover { background: var(--burg2); }
      `}</style>

      <section className="location">
        <h2 className="location-title">Địa điểm</h2>
        <p className="location-address">
          {config?.venue_name ?? 'Trung Tâm Tiệc Cưới Ánh Dương'}<br />
          {config?.venue_address ?? 'Quận 1, TP.HCM'}
        </p>
        <iframe
          src={mapsUrl}
          className="location-map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Bản đồ địa điểm"
          allowFullScreen
        />
        <a href={navUrl} target="_blank" rel="noopener noreferrer" className="location-btn">
          🗺 Chỉ đường
        </a>
      </section>
    </>
  )
}
```

- [ ] **Step 3: BankQR**

Create `components/guest/BankQR.tsx`:

```typescript
import { WeddingConfig } from '@/lib/types'
import { vietqrUrl, VN_BANKS } from '@/lib/vietqr'

interface Props { config: WeddingConfig }

function BankCard({ code, account, holder }: { code: string; account: string; holder: string }) {
  const qr = vietqrUrl(code, account)
  const bankName = VN_BANKS[code] ?? code

  return (
    <div style={{
      background: 'var(--cream)', border: '1px solid var(--cream3)',
      borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem', textAlign: 'center'
    }}>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '.65rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--soft)', marginBottom: '.5rem' }}>
        {bankName}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qr}
        alt={`QR ${bankName} ${account}`}
        style={{ width: '180px', height: '180px', borderRadius: '8px', margin: '0 auto .75rem', display: 'block', background: '#f0f0f0' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', fontWeight: 600 }}>
        {account}
      </p>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '.75rem', color: 'var(--mid)', marginTop: '.25rem' }}>
        {holder}
      </p>
    </div>
  )
}

export default function BankQR({ config }: Props) {
  return (
    <>
      <style>{`
        .bankqr { padding: 2.5rem 1.5rem; background: var(--cream2); }
        .bankqr-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: var(--dark); text-align: center; margin-bottom: .5rem; }
        .bankqr-sub { font-family: 'Montserrat', sans-serif; font-size: .75rem; color: var(--soft); text-align: center; margin-bottom: 1.5rem; }
      `}</style>

      <section className="bankqr">
        <h2 className="bankqr-title">🎁 Mừng cưới</h2>
        <p className="bankqr-sub">Quét mã để chuyển khoản mừng cưới</p>
        {config.bank1_code && config.bank1_account && config.bank1_holder && (
          <BankCard code={config.bank1_code} account={config.bank1_account} holder={config.bank1_holder} />
        )}
        {config.bank2_code && config.bank2_account && config.bank2_holder && (
          <BankCard code={config.bank2_code} account={config.bank2_account} holder={config.bank2_holder} />
        )}
      </section>
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/guest/EventDetails.tsx components/guest/LocationMap.tsx components/guest/BankQR.tsx
git commit -m "feat: add EventDetails, LocationMap, BankQR guest components"
```

---

## Task 12: PhotoAlbum Component

**Files:**
- Create: `components/guest/PhotoAlbum.tsx`

- [ ] **Step 1: Create component**

Create `components/guest/PhotoAlbum.tsx`:

```typescript
'use client'
import { useEffect, useRef, useState } from 'react'
import { PhotoEntry } from '@/lib/types'
import Image from 'next/image'

interface Props { photos: PhotoEntry[] }

export default function PhotoAlbum({ photos }: Props) {
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order)
  const trackRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const touchingRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    function onScroll() {
      if (!track) return
      const idx = Math.round(track.scrollLeft / track.clientWidth)
      setCurrent(idx)
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    track.addEventListener('touchstart', () => { touchingRef.current = true }, { passive: true })
    track.addEventListener('touchend', () => { touchingRef.current = false }, { passive: true })

    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-advance every 4s, pauses when touching
  useEffect(() => {
    const track = trackRef.current
    if (!track || sorted.length <= 1) return

    const id = setInterval(() => {
      if (touchingRef.current) return
      const next = (current + 1) % sorted.length
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
    }, 4000)

    return () => clearInterval(id)
  }, [current, sorted.length])

  return (
    <>
      <style>{`
        .album { background: var(--dark); overflow: hidden; }
        .album-header { padding: 1.5rem 1.5rem .75rem; display: flex; align-items: center; justify-content: space-between; }
        .album-title { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; color: var(--cream); }
        .album-counter { font-family: 'Montserrat', sans-serif; font-size: .7rem; color: rgba(255,255,255,.4); }
        .album-track {
          display: flex; overflow-x: scroll; scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .album-track::-webkit-scrollbar { display: none; }
        .album-slide { flex: 0 0 100%; scroll-snap-align: start; position: relative; height: 280px; }
        .album-dots { display: flex; gap: .4rem; justify-content: center; padding: 1rem; }
        .album-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.25); transition: background .2s; }
        .album-dot.active { background: var(--gold); }
      `}</style>

      <section className="album">
        <div className="album-header">
          <h2 className="album-title">Album ảnh</h2>
          <span className="album-counter">{current + 1} / {sorted.length}</span>
        </div>

        <div className="album-track" ref={trackRef}>
          {sorted.map((photo, i) => (
            <div key={photo.url} className="album-slide">
              <Image
                src={photo.url}
                alt={`Ảnh cưới ${i + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="430px"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div className="album-dots">
          {sorted.map((_, i) => (
            <div key={i} className={`album-dot ${i === current ? 'active' : ''}`} />
          ))}
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Add Supabase Storage domain to Next.js image config**

Modify `next.config.ts` (or `next.config.js`):

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: Commit**

```bash
git add components/guest/PhotoAlbum.tsx next.config.ts
git commit -m "feat: add PhotoAlbum swipeable carousel and configure image domains"
```

---

## Task 13: WishesWall & WishForm with Realtime

**Files:**
- Create: `components/guest/WishesWall.tsx`
- Create: `components/guest/WishForm.tsx`

- [ ] **Step 1: WishForm**

Create `components/guest/WishForm.tsx`:

```typescript
'use client'
import { useState, FormEvent } from 'react'
import { PublicWish } from '@/lib/types'

interface Props {
  onWishSubmitted: (wish: PublicWish) => void
}

export default function WishForm({ onWishSubmitted }: Props) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest_name: name, message }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Gửi thất bại, vui lòng thử lại')
    } else {
      setDone(true)
      setName('')
      setMessage('')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(201,169,110,.1)', borderRadius: '12px' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)' }}>
          ♥ Cảm ơn lời chúc của bạn!
        </p>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '.75rem', color: 'var(--soft)', marginTop: '.5rem' }}>
          Lời chúc sẽ hiển thị sau khi được duyệt.
        </p>
        <button
          onClick={() => setDone(false)}
          style={{ marginTop: '1rem', fontFamily: "'Montserrat', sans-serif", fontSize: '.75rem', color: 'var(--burg)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Gửi lời chúc khác
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      <input
        type="text"
        placeholder="Tên của bạn *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={100}
        style={{
          border: '1px solid var(--cream3)', borderRadius: '10px',
          padding: '.75rem 1rem', fontFamily: "'Montserrat', sans-serif",
          fontSize: '.85rem', color: 'var(--dark)', background: 'var(--cream)',
          outline: 'none', width: '100%',
        }}
      />
      <textarea
        placeholder="Lời chúc của bạn *"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        maxLength={500}
        rows={3}
        style={{
          border: '1px solid var(--cream3)', borderRadius: '10px',
          padding: '.75rem 1rem', fontFamily: "'Montserrat', sans-serif",
          fontSize: '.85rem', color: 'var(--dark)', background: 'var(--cream)',
          outline: 'none', width: '100%', resize: 'vertical',
        }}
      />
      {error && (
        <p style={{ color: '#c0392b', fontFamily: "'Montserrat', sans-serif", fontSize: '.75rem' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: 'var(--burg)', color: 'var(--cream)',
          border: 'none', borderRadius: '10px', padding: '.85rem',
          fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: '.85rem',
          cursor: 'pointer', opacity: loading ? .6 : 1, transition: 'opacity .15s',
        }}
      >
        {loading ? 'Đang gửi...' : '💌 Gửi lời chúc'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: WishesWall with Realtime**

Create `components/guest/WishesWall.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PublicWish } from '@/lib/types'
import WishForm from './WishForm'

export default function WishesWall() {
  const [wishes, setWishes] = useState<PublicWish[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  // Initial fetch
  useEffect(() => {
    fetch('/api/wishes')
      .then((r) => r.json())
      .then((data: PublicWish[]) => setWishes(data))
      .catch(() => {})
  }, [])

  // Load liked IDs from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('liked_wishes')
      if (raw) setLikedIds(new Set(JSON.parse(raw)))
    } catch {}
  }, [])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('wishes-wall')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wishes', filter: 'approved=eq.true' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWishes((prev) => [payload.new as PublicWish, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setWishes((prev) =>
              prev.map((w) => w.id === payload.new.id ? { ...w, ...payload.new } : w)
            )
          } else if (payload.eventType === 'DELETE') {
            setWishes((prev) => prev.filter((w) => w.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Fallback: poll every 30s if realtime drops
    const pollId = setInterval(() => {
      fetch('/api/wishes').then((r) => r.json()).then(setWishes).catch(() => {})
    }, 30_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollId)
    }
  }, [])

  async function like(id: string) {
    if (likedIds.has(id)) return

    const newLiked = new Set(likedIds).add(id)
    setLikedIds(newLiked)
    localStorage.setItem('liked_wishes', JSON.stringify([...newLiked]))

    // Optimistic update
    setWishes((prev) => prev.map((w) => w.id === id ? { ...w, likes: w.likes + 1 } : w))

    await fetch(`/api/wishes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ like: true }),
    })
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  return (
    <>
      <style>{`
        .wishes { padding: 2.5rem 1.5rem; background: var(--cream2); }
        .wishes-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: var(--dark); text-align: center; margin-bottom: 1.5rem; }
        .wish-card { background: var(--cream); border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: .75rem; }
        .wish-header { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; margin-bottom: .5rem; }
        .wish-name { font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 600; color: var(--dark); }
        .wish-date { font-family: 'Montserrat', sans-serif; font-size: .65rem; color: var(--soft); flex-shrink: 0; }
        .wish-msg  { font-family: 'Montserrat', sans-serif; font-size: .8rem; color: var(--mid); line-height: 1.6; }
        .wish-like { margin-top: .75rem; display: flex; align-items: center; gap: .4rem; }
        .like-btn  { background: none; border: none; cursor: pointer; padding: 0; font-size: .9rem; transition: transform .1s; }
        .like-btn:active { transform: scale(1.3); }
        .like-btn.liked { filter: saturate(2); }
        .like-count { font-family: 'Montserrat', sans-serif; font-size: .7rem; color: var(--soft); }
        .wishes-divider { margin: 1.5rem 0; border: none; border-top: 1px solid var(--cream3); }
        .wishes-empty { font-family: 'Montserrat', sans-serif; font-size: .8rem; color: var(--soft); text-align: center; padding: 1.5rem 0; font-style: italic; }
      `}</style>

      <section className="wishes">
        <h2 className="wishes-title">💌 Lời chúc</h2>

        <WishForm onWishSubmitted={(w) => {}} />

        <hr className="wishes-divider" />

        {wishes.length === 0 ? (
          <p className="wishes-empty">Chưa có lời chúc nào. Hãy là người đầu tiên!</p>
        ) : (
          wishes.map((w) => (
            <div key={w.id} className="wish-card">
              <div className="wish-header">
                <span className="wish-name">{w.guest_name}</span>
                <span className="wish-date">{formatDate(w.created_at)}</span>
              </div>
              <p className="wish-msg">{w.message}</p>
              <div className="wish-like">
                <button
                  className={`like-btn ${likedIds.has(w.id) ? 'liked' : ''}`}
                  onClick={() => like(w.id)}
                  aria-label="Thích"
                  title={likedIds.has(w.id) ? 'Đã thích' : 'Thích'}
                >
                  {likedIds.has(w.id) ? '❤️' : '🤍'}
                </button>
                {w.likes > 0 && <span className="like-count">{w.likes}</span>}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  )
}
```

- [ ] **Step 3: Manual test**

1. Submit a wish via the form → get success message.
2. In Supabase dashboard, approve the wish (`approved = true`).
3. Refresh guest page → wish appears in the wall.
4. Click like button → count increments, saves to localStorage.

- [ ] **Step 4: Commit**

```bash
git add components/guest/WishForm.tsx components/guest/WishesWall.tsx
git commit -m "feat: add WishForm and WishesWall with Supabase Realtime"
```

---

## Task 14: Admin Dashboard Shell

**Files:**
- Create: `app/admin/page.tsx`
- Create: `components/admin/AdminShell.tsx`

- [ ] **Step 1: Admin shell with tabs**

Create `components/admin/AdminShell.tsx`:

```typescript
'use client'
import { useState } from 'react'
import ConfigForm from './ConfigForm'
import PhotoManager from './PhotoManager'
import WishesManager from './WishesManager'

const TABS = [
  { id: 'config', label: 'Thông tin' },
  { id: 'photos', label: 'Ảnh' },
  { id: 'wishes', label: 'Lời chúc' },
]

export default function AdminShell() {
  const [tab, setTab] = useState<'config' | 'photos' | 'wishes'>('config')

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-cream-2">
      {/* Header */}
      <header className="bg-burg text-cream px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="font-display text-lg leading-none">Quản lý thiệp cưới</p>
          <p className="font-body text-xs opacity-60 mt-0.5">Ngọc Sơn & Ái Nhãn</p>
        </div>
        <button
          onClick={handleLogout}
          className="font-body text-xs opacity-70 hover:opacity-100 border border-cream/30 px-3 py-1.5 rounded-lg transition-opacity"
        >
          Đăng xuất
        </button>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-cream-3 sticky top-[52px] z-10">
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 py-3 font-body text-sm font-medium transition-colors border-b-2 ${
                tab === t.id
                  ? 'border-burg text-burg'
                  : 'border-transparent text-soft hover:text-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-xl mx-auto p-4">
        {tab === 'config' && <ConfigForm />}
        {tab === 'photos' && <PhotoManager />}
        {tab === 'wishes' && <WishesManager />}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Admin page**

Create `app/admin/page.tsx`:

```typescript
import AdminShell from '@/components/admin/AdminShell'

export default function AdminPage() {
  return <AdminShell />
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx components/admin/AdminShell.tsx
git commit -m "feat: add admin dashboard shell with tabs"
```

---

## Task 15: Admin ConfigForm

**Files:**
- Create: `components/admin/ConfigForm.tsx`

- [ ] **Step 1: Write ConfigForm**

Create `components/admin/ConfigForm.tsx`:

```typescript
'use client'
import { useEffect, useState, FormEvent } from 'react'
import { WeddingConfig } from '@/lib/types'
import { VN_BANKS } from '@/lib/vietqr'

const BANK_OPTIONS = Object.entries(VN_BANKS).map(([code, name]) => ({ code, name }))

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block font-body text-xs font-medium text-mid uppercase tracking-wider mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-cream-3 rounded-lg px-3 py-2 font-body text-sm text-dark bg-white focus:outline-none focus:border-burg focus:ring-1 focus:ring-burg'

export default function ConfigForm() {
  const [config, setConfig] = useState<Partial<WeddingConfig>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [musicFile, setMusicFile] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then((data) => {
      setConfig(data)
      setLoading(false)
    })
  }, [])

  function set(key: keyof WeddingConfig, value: string | null) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    // Upload music if new file selected
    if (musicFile) {
      const fd = new FormData()
      fd.append('file', musicFile)
      const res = await fetch('/api/upload/music', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        config.music_url = url
      }
    }

    const res = await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })

    if (res.ok) setSaved(true)
    setSaving(false)
  }

  if (loading) return <p className="font-body text-sm text-soft py-4">Đang tải...</p>

  return (
    <form onSubmit={handleSave} className="space-y-2 py-4">
      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-display text-base text-dark mb-3">Thông tin cô dâu & chú rể</h3>
        <Field label="Tên chú rể">
          <input className={inputCls} value={config.groom_name ?? ''} onChange={(e) => set('groom_name', e.target.value)} />
        </Field>
        <Field label="Tên cô dâu">
          <input className={inputCls} value={config.bride_name ?? ''} onChange={(e) => set('bride_name', e.target.value)} />
        </Field>
        <Field label="Ngày & giờ cưới">
          <input
            type="datetime-local"
            className={inputCls}
            value={config.wedding_date ? config.wedding_date.slice(0, 16) : ''}
            onChange={(e) => set('wedding_date', e.target.value + ':00+07:00')}
          />
        </Field>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-display text-base text-dark mb-3">Địa điểm</h3>
        <Field label="Tên nhà hàng / trung tâm">
          <input className={inputCls} value={config.venue_name ?? ''} onChange={(e) => set('venue_name', e.target.value)} />
        </Field>
        <Field label="Địa chỉ">
          <input className={inputCls} value={config.venue_address ?? ''} onChange={(e) => set('venue_address', e.target.value)} />
        </Field>
        <Field label="Google Maps Embed URL">
          <input className={inputCls} value={config.maps_url ?? ''} onChange={(e) => set('maps_url', e.target.value || null)} placeholder="https://www.google.com/maps/embed?..." />
        </Field>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-display text-base text-dark mb-3">Thêm thông tin</h3>
        <Field label="Trang phục (tuỳ chọn)">
          <input className={inputCls} value={config.dresscode ?? ''} onChange={(e) => set('dresscode', e.target.value || null)} />
        </Field>
        <Field label="Ghi chú thêm (tuỳ chọn)">
          <textarea className={inputCls} rows={2} value={config.extra_notes ?? ''} onChange={(e) => set('extra_notes', e.target.value || null)} />
        </Field>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-display text-base text-dark mb-3">Tài khoản ngân hàng 1</h3>
        <Field label="Ngân hàng">
          <select className={inputCls} value={config.bank1_code ?? ''} onChange={(e) => set('bank1_code', e.target.value || null)}>
            <option value="">— Chọn ngân hàng —</option>
            {BANK_OPTIONS.map(({ code, name }) => (
              <option key={code} value={code}>{name} ({code})</option>
            ))}
          </select>
        </Field>
        <Field label="Số tài khoản">
          <input className={inputCls} value={config.bank1_account ?? ''} onChange={(e) => set('bank1_account', e.target.value || null)} />
        </Field>
        <Field label="Tên chủ tài khoản">
          <input className={inputCls} value={config.bank1_holder ?? ''} onChange={(e) => set('bank1_holder', e.target.value || null)} />
        </Field>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-display text-base text-dark mb-3">Tài khoản ngân hàng 2 (tuỳ chọn)</h3>
        <Field label="Ngân hàng">
          <select className={inputCls} value={config.bank2_code ?? ''} onChange={(e) => set('bank2_code', e.target.value || null)}>
            <option value="">— Chọn ngân hàng —</option>
            {BANK_OPTIONS.map(({ code, name }) => (
              <option key={code} value={code}>{name} ({code})</option>
            ))}
          </select>
        </Field>
        <Field label="Số tài khoản">
          <input className={inputCls} value={config.bank2_account ?? ''} onChange={(e) => set('bank2_account', e.target.value || null)} />
        </Field>
        <Field label="Tên chủ tài khoản">
          <input className={inputCls} value={config.bank2_holder ?? ''} onChange={(e) => set('bank2_holder', e.target.value || null)} />
        </Field>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-display text-base text-dark mb-3">Nhạc nền</h3>
        {config.music_url && (
          <p className="font-body text-xs text-soft mb-2">Hiện tại: <a href={config.music_url} target="_blank" rel="noopener noreferrer" className="text-burg underline">Nghe thử</a></p>
        )}
        <Field label="Upload nhạc mới (MP3, tối đa 20 MB)">
          <input
            type="file"
            accept="audio/mpeg,audio/mp3"
            className={inputCls}
            onChange={(e) => setMusicFile(e.target.files?.[0] ?? null)}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-burg text-cream font-body font-medium py-3 rounded-xl hover:bg-burg-2 transition-colors disabled:opacity-60"
      >
        {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu!' : 'Lưu thay đổi'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Manual test**

1. Login at /admin/login.
2. On Config tab, edit bride/groom names, click "Lưu thay đổi".
3. Open http://localhost:3000 — names should update on the hero card.

- [ ] **Step 3: Commit**

```bash
git add components/admin/ConfigForm.tsx
git commit -m "feat: add admin ConfigForm with all wedding fields"
```

---

## Task 16: Admin PhotoManager (Drag-and-Drop)

**Files:**
- Create: `components/admin/PhotoManager.tsx`

- [ ] **Step 1: Write PhotoManager**

Create `components/admin/PhotoManager.tsx`:

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  rectSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PhotoEntry } from '@/lib/types'
import Image from 'next/image'

function SortablePhoto({ photo, onDelete }: { photo: PhotoEntry; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.url })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform), transition,
        opacity: isDragging ? .5 : 1, position: 'relative',
        borderRadius: '10px', overflow: 'hidden', aspectRatio: '1',
        background: '#f0ebe4', cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <Image src={photo.url} alt={`Photo ${photo.sort_order}`} fill style={{ objectFit: 'cover' }} sizes="120px" />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        style={{
          position: 'absolute', top: 4, right: 4, width: 24, height: 24,
          background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none',
          borderRadius: '50%', fontSize: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Xoá ảnh"
      >✕</button>
    </div>
  )
}

export default function PhotoManager() {
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        setPhotos(data.photos ?? [])
        setLoading(false)
      })
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setPhotos((prev) => {
      const oldIndex = prev.findIndex((p) => p.url === active.id)
      const newIndex = prev.findIndex((p) => p.url === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      return reordered.map((p, i) => ({ ...p, sort_order: i }))
    })
    setDirty(true)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)

    const newPhotos: PhotoEntry[] = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/photos', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        newPhotos.push({ url, sort_order: photos.length + newPhotos.length })
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos])
    setDirty(true)
    setUploading(false)
    e.target.value = ''
  }

  function deletePhoto(url: string) {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.url !== url)
      return filtered.map((p, i) => ({ ...p, sort_order: i }))
    })
    setDirty(true)
  }

  async function saveOrder() {
    setSaving(true)
    await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos }),
    })
    setSaving(false)
    setDirty(false)
  }

  if (loading) return <p className="font-body text-sm text-soft py-4">Đang tải...</p>

  return (
    <div className="py-4">
      {/* Upload zone */}
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-cream-3 rounded-xl cursor-pointer hover:border-burg transition-colors bg-white mb-4">
        <span className="text-2xl mb-1">{uploading ? '⏳' : '📷'}</span>
        <span className="font-body text-sm text-soft">{uploading ? 'Đang upload...' : 'Chọn ảnh để upload (JPG/PNG/WEBP, max 10 MB)'}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {/* Photo grid */}
      {photos.length > 0 ? (
        <>
          <p className="font-body text-xs text-soft mb-2">Kéo để sắp xếp lại · {photos.length} ảnh</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={photos.map((p) => p.url)} strategy={rectSortingStrategy}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
                {photos.map((photo) => (
                  <SortablePhoto key={photo.url} photo={photo} onDelete={() => deletePhoto(photo.url)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {dirty && (
            <button
              onClick={saveOrder}
              disabled={saving}
              className="w-full bg-burg text-cream font-body font-medium py-2.5 rounded-xl hover:bg-burg-2 transition-colors disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : '💾 Lưu thứ tự ảnh'}
            </button>
          )}
        </>
      ) : (
        <p className="font-body text-sm text-soft text-center py-6 italic">Chưa có ảnh nào</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Manual test**

1. Login → Photos tab.
2. Upload 3 images.
3. Drag to reorder.
4. Click "Lưu thứ tự ảnh".
5. Open guest page → album shows photos in correct order.

- [ ] **Step 3: Commit**

```bash
git add components/admin/PhotoManager.tsx
git commit -m "feat: add PhotoManager with drag-and-drop reordering"
```

---

## Task 17: Admin WishesManager

**Files:**
- Create: `components/admin/WishesManager.tsx`

- [ ] **Step 1: Write WishesManager**

Create `components/admin/WishesManager.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wish } from '@/lib/types'

type Filter = 'pending' | 'approved' | 'all'

export default function WishesManager() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('pending')

  // Load all wishes (admin sees all, including unapproved)
  useEffect(() => {
    fetch('/api/config') // uses anon — won't work for all wishes
      .catch(() => {})

    // Fetch all wishes via service-role equivalent: we call a dedicated admin endpoint
    // Since we don't have one, we query Supabase directly with the anon key
    // but RLS only shows approved. For admin we use an API route that reads all.
    loadWishes()
  }, [])

  async function loadWishes() {
    // Fetch all wishes for admin using cookie-authenticated call
    const res = await fetch('/api/admin/wishes')
    if (res.ok) {
      setWishes(await res.json())
    }
    setLoading(false)
  }

  // Realtime
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('wishes-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, () => {
        loadWishes()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function toggleApprove(id: string, currentApproved: boolean) {
    await fetch(`/api/wishes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !currentApproved }),
    })
    setWishes((prev) => prev.map((w) => w.id === id ? { ...w, approved: !currentApproved } : w))
  }

  async function deleteWish(id: string) {
    if (!confirm('Xoá lời chúc này?')) return
    await fetch(`/api/wishes/${id}`, { method: 'DELETE' })
    setWishes((prev) => prev.filter((w) => w.id !== id))
  }

  const filtered = wishes.filter((w) => {
    if (filter === 'pending') return !w.approved
    if (filter === 'approved') return w.approved
    return true
  })

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('vi-VN')
  }

  if (loading) return <p className="font-body text-sm text-soft py-4">Đang tải...</p>

  return (
    <div className="py-4">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['pending', 'approved', 'all'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-colors ${
              filter === f ? 'bg-burg text-cream' : 'bg-white text-mid hover:text-dark border border-cream-3'
            }`}
          >
            {f === 'pending' ? `Chờ duyệt (${wishes.filter(w => !w.approved).length})` : f === 'approved' ? 'Đã duyệt' : 'Tất cả'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-body text-sm text-soft text-center py-8 italic">Không có lời chúc</p>
      ) : (
        filtered.map((w) => (
          <div key={w.id} className="bg-white rounded-xl p-4 mb-3 border border-cream-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-display text-dark font-medium">{w.guest_name}</span>
              <span className="font-body text-xs text-soft flex-shrink-0">{formatDate(w.created_at)}</span>
            </div>
            <p className="font-body text-sm text-mid mb-3 leading-relaxed">{w.message}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => toggleApprove(w.id, w.approved)}
                className={`px-3 py-1 rounded-lg font-body text-xs font-medium transition-colors ${
                  w.approved
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-burg text-cream hover:bg-burg-2'
                }`}
              >
                {w.approved ? '✓ Đã duyệt' : '✓ Duyệt'}
              </button>
              <button
                onClick={() => deleteWish(w.id)}
                className="px-3 py-1 rounded-lg font-body text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                🗑 Xoá
              </button>
              <span className="font-body text-xs text-soft ml-auto">❤️ {w.likes}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add admin wishes API route (all wishes, not just approved)**

Create `app/api/admin/wishes/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')?.value
  if (cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 3: Manual test**

1. Submit a wish from the guest page.
2. Admin → Lời chúc tab → wish appears under "Chờ duyệt".
3. Click "✓ Duyệt" → moves to "Đã duyệt".
4. Refresh guest page → wish now visible.
5. Click "🗑 Xoá" → wish disappears from both admin and guest views.

- [ ] **Step 4: Commit**

```bash
git add components/admin/WishesManager.tsx app/api/admin/wishes/
git commit -m "feat: add WishesManager and admin wishes API route"
```

---

## Task 18: Deploy to Vercel

**Files:**
- Modify: `.env.local` (add NEXT_PUBLIC_SITE_URL)

- [ ] **Step 1: Final build check**

```bash
npm run build
```

Expected: `✓ Compiled successfully`. Fix any TypeScript errors before proceeding.

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/wedding-invite-app.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Import to Vercel**

1. Go to https://vercel.com → New Project.
2. Import the GitHub repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables (from `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-app-name.vercel.app`
5. Click Deploy.

- [ ] **Step 4: Update NEXT_PUBLIC_SITE_URL locally**

Add to `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://your-app-name.vercel.app
```

Also update in `app/page.tsx` — the `getConfig` fetch uses this URL for SSR.

- [ ] **Step 5: Smoke test production**

1. Open `https://your-app-name.vercel.app` — guest page loads.
2. Open `https://your-app-name.vercel.app/admin/login` — login page works.
3. Login → save wedding info → verify it shows on guest page.
4. Upload a photo → verify album appears.
5. Submit a wish → approve in admin → verify it appears live.

- [ ] **Step 6: Final commit**

```bash
git add .env.example
git commit -m "chore: finalize deployment config and env example"
git push origin main
```

---

## Self-Review — Spec Coverage

| Spec section | Covered in task |
|---|---|
| Envelope intro animation | Task 9 |
| Background music + autoplay unlock | Task 10 |
| Hero card (cream/burg/gold, 囍) | Task 10 |
| Countdown timer | Task 10 |
| Event details from config | Task 11 |
| Swipeable photo album, auto-advance | Task 12 |
| Location + Google Maps embed | Task 11 |
| Bank QR (VietQR URL) | Task 11 |
| Wishes wall + form + real-time | Task 13 |
| Like button + localStorage dedup | Task 13 |
| Admin-only moderated display | Task 13 + Task 17 |
| Footer | Task 8 |
| Admin password auth (cookie) | Task 4 |
| Admin config form (all fields) | Task 15 |
| Music upload | Task 15 |
| Photo upload + drag reorder | Task 16 |
| Wishes moderation (approve/delete) | Task 17 |
| API routes (all 8) | Tasks 5–7 + Task 17 |
| Supabase tables + RLS | Task 2 |
| Environment variables | Task 1 |
| Deploy to Vercel | Task 18 |
| Error handling: no config → skeleton | Task 8 |
| Error handling: no photos → hide | Task 8 |
| Error handling: no music → hide | Task 8 |
| VietQR image fail → fallback text | Task 11 (onerror) |
| Realtime disconnect → poll 30s | Task 13 |
