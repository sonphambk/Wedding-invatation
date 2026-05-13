# Theme Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Giao diện" tab to the admin panel where the admin can pick fonts, adjust font size scales, and change brand colors — all stored in the DB and applied live to the guest invitation page via CSS custom properties.

**Architecture:** Theme stored as JSONB in `wedding_config.theme_json`. Server reads it in `app/layout.tsx` and injects `:root { --font-heading: ...; --color-primary: ... }` so guest components get styled correctly on first render. Admin `ThemeEditor` component patches the same API endpoint with `{ theme_json: ... }` and shows a scoped live preview.

**Tech Stack:** Next.js 14 App Router, Supabase (Postgres JSONB), CSS Custom Properties, Tailwind CSS, React hooks (`useState`, `useEffect`).

---

## Task 1: Foundation — lib/theme.ts + DB migration + types

**Files:**
- Create: `lib/theme.ts`
- Create: `supabase/migrations/003_theme_json.sql`
- Modify: `lib/types.ts`

- [ ] **Step 1: Create `lib/theme.ts`**

```typescript
// lib/theme.ts

export interface WeddingTheme {
  fontHeading: string         // bare font name e.g. "Cormorant Garamond"
  fontBody: string            // bare font name e.g. "Montserrat"
  fontScript: string          // bare font name e.g. "Great Vibes"
  fontSizeHeadingScale: number // 0.8–1.4, default 1.0
  fontSizeBodyScale: number    // 0.8–1.4, default 1.0
  colorPrimary: string        // hex e.g. "#7C1B2B"
  colorAccent: string         // hex e.g. "#C9A96E"
}

export const DEFAULT_THEME: WeddingTheme = {
  fontHeading: 'Cormorant Garamond',
  fontBody: 'Montserrat',
  fontScript: 'Great Vibes',
  fontSizeHeadingScale: 1.0,
  fontSizeBodyScale: 1.0,
  colorPrimary: '#7C1B2B',
  colorAccent: '#C9A96E',
}

export interface FontOption {
  name: string
  category: 'serif' | 'sans-serif' | 'cursive'
}

export const HEADING_FONTS: FontOption[] = [
  { name: 'Cormorant Garamond', category: 'serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Libre Baskerville', category: 'serif' },
  { name: 'EB Garamond', category: 'serif' },
  { name: 'Lora', category: 'serif' },
  { name: 'Cinzel', category: 'serif' },
  { name: 'Gilda Display', category: 'serif' },
  { name: 'Yeseva One', category: 'serif' },
  { name: 'Marcellus', category: 'serif' },
  { name: 'Alice', category: 'serif' },
]

export const BODY_FONTS: FontOption[] = [
  { name: 'Montserrat', category: 'sans-serif' },
  { name: 'Raleway', category: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif' },
  { name: 'Source Sans 3', category: 'sans-serif' },
  { name: 'Nunito', category: 'sans-serif' },
  { name: 'Jost', category: 'sans-serif' },
  { name: 'DM Sans', category: 'sans-serif' },
  { name: 'Mulish', category: 'sans-serif' },
]

export const SCRIPT_FONTS: FontOption[] = [
  { name: 'Great Vibes', category: 'cursive' },
  { name: 'Allura', category: 'cursive' },
  { name: 'Pinyon Script', category: 'cursive' },
  { name: 'Dancing Script', category: 'cursive' },
  { name: 'Italianno', category: 'cursive' },
  { name: 'Parisienne', category: 'cursive' },
  { name: 'Satisfy', category: 'cursive' },
  { name: 'Tangerine', category: 'cursive' },
]

/** Safely parse raw DB value into a WeddingTheme, falling back to defaults per field. */
export function resolveTheme(raw: unknown): WeddingTheme {
  try {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const t = raw as Record<string, unknown>
      return {
        fontHeading: typeof t.fontHeading === 'string' ? t.fontHeading : DEFAULT_THEME.fontHeading,
        fontBody: typeof t.fontBody === 'string' ? t.fontBody : DEFAULT_THEME.fontBody,
        fontScript: typeof t.fontScript === 'string' ? t.fontScript : DEFAULT_THEME.fontScript,
        fontSizeHeadingScale: typeof t.fontSizeHeadingScale === 'number' ? t.fontSizeHeadingScale : DEFAULT_THEME.fontSizeHeadingScale,
        fontSizeBodyScale: typeof t.fontSizeBodyScale === 'number' ? t.fontSizeBodyScale : DEFAULT_THEME.fontSizeBodyScale,
        colorPrimary: typeof t.colorPrimary === 'string' ? t.colorPrimary : DEFAULT_THEME.colorPrimary,
        colorAccent: typeof t.colorAccent === 'string' ? t.colorAccent : DEFAULT_THEME.colorAccent,
      }
    }
  } catch { /* fall through */ }
  return { ...DEFAULT_THEME }
}

/** Build a CSS custom properties string suitable for injecting inside :root { ... } */
export function buildCssVars(theme: WeddingTheme): string {
  return [
    `--font-heading: '${theme.fontHeading}', serif;`,
    `--font-body: '${theme.fontBody}', sans-serif;`,
    `--font-script: '${theme.fontScript}', cursive;`,
    `--color-primary: ${theme.colorPrimary};`,
    `--color-accent: ${theme.colorAccent};`,
    `--scale-heading: ${theme.fontSizeHeadingScale};`,
    `--scale-body: ${theme.fontSizeBodyScale};`,
  ].join(' ')
}
```

- [ ] **Step 2: Create DB migration**

```sql
-- supabase/migrations/003_theme_json.sql
ALTER TABLE wedding_config ADD COLUMN IF NOT EXISTS theme_json JSONB;
```

- [ ] **Step 3: Apply migration to Supabase**

Open the Supabase dashboard → SQL Editor → paste and run the SQL above.
Or if using Supabase CLI: `supabase db push`

- [ ] **Step 4: Add `theme_json` to `lib/types.ts`**

In `lib/types.ts`, import `WeddingTheme` and add the field to `WeddingConfig`. Replace the entire file:

```typescript
// lib/types.ts
import { WeddingTheme } from './theme'

export type { WeddingTheme }

export interface PhotoEntry {
  url: string;
  sort_order: number;
}

export interface WeddingConfig {
  id: number;
  bride_name: string;
  groom_name: string;
  wedding_date: string | null;
  venue_name: string;
  venue_address: string;
  maps_url: string;
  dresscode: string;
  extra_notes: string;
  bank1_code: string;
  bank1_account: string;
  bank1_holder: string;
  bank2_code: string;
  bank2_account: string;
  bank2_holder: string;
  music_url: string;
  photos: PhotoEntry[];
  theme_json: WeddingTheme | null;
  updated_at: string;
}

export interface Wish {
  id: string;
  guest_name: string;
  message: string;
  likes: number;
  approved: boolean;
  created_at: string;
}

export type PublicConfig = Omit<WeddingConfig, 'updated_at'>;
export type PublicWish = Pick<Wish, 'id' | 'guest_name' | 'message' | 'likes' | 'created_at'>;
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/admin/Desktop/wedding-invite-app
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing errors unrelated to the new files).

- [ ] **Step 6: Commit**

```bash
git add lib/theme.ts lib/types.ts supabase/migrations/003_theme_json.sql
git commit -m "feat(theme): add WeddingTheme type, CSS var builder, DB migration

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 2: API — allow theme_json in PATCH

**Files:**
- Modify: `app/api/config/route.ts`

- [ ] **Step 1: Add `theme_json` to `ALLOWED_FIELDS`**

In `app/api/config/route.ts`, replace the `ALLOWED_FIELDS` constant:

```typescript
const ALLOWED_FIELDS = new Set([
  'bride_name', 'groom_name', 'wedding_date', 'venue_name', 'venue_address',
  'maps_url', 'dresscode', 'extra_notes', 'bank1_code', 'bank1_account',
  'bank1_holder', 'bank2_code', 'bank2_account', 'bank2_holder', 'music_url',
  'photos', 'theme_json',
]);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/config/route.ts
git commit -m "feat(api): allow theme_json in PATCH /api/config

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3: layout.tsx — inject CSS vars + expand Google Fonts

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

Replace the entire file:

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { createServerAnonClient } from "@/lib/supabase/server";
import { resolveTheme, buildCssVars, DEFAULT_THEME } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Thiệp Cưới",
  description: "Trân trọng kính mời",
};

// All curated fonts preloaded so switching fonts is instant (no additional network request)
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Alice&family=Allura&family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Dancing+Script:wght@400;500&family=DM+Sans:wght@300;400;500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Gilda+Display&family=Great+Vibes&family=Italianno&family=Jost:wght@300;400;500&family=Lato:wght@300;400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=Marcellus&family=Montserrat:wght@300;400;500;600&family=Mulish:wght@300;400;500&family=Nunito:wght@300;400;500&family=Parisienne&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Raleway:wght@300;400;500;600&family=Satisfy&family=Source+Sans+3:wght@300;400;500&family=Tangerine:wght@400;700&family=Yeseva+One&display=swap";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let cssVars = buildCssVars(DEFAULT_THEME)
  try {
    const supabase = await createServerAnonClient()
    const { data } = await supabase
      .from('wedding_config')
      .select('theme_json')
      .eq('id', 1)
      .single()
    if (data?.theme_json) {
      cssVars = buildCssVars(resolveTheme(data.theme_json))
    }
  } catch { /* use DEFAULT_THEME */ }

  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS_URL} rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />
      </head>
      <body className="font-body min-h-full">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Start dev server and check the page loads**

```bash
npm run dev &
sleep 5 && curl -s http://localhost:3000 | grep -o 'color-primary[^;]*' | head -3
```

Expected: `color-primary: #7C1B2B` (or the stored value) appears in the page source.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(theme): inject CSS custom properties from DB theme in layout

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4: Guest components — adopt CSS custom properties

**Files:**
- Modify: `components/guest/HeroCard.tsx`
- Modify: `components/guest/InvitationMessage.tsx`
- Modify: `components/guest/ParentsSection.tsx`
- Modify: `components/guest/CouplePortraits.tsx`
- Modify: `components/guest/EventDetails.tsx`
- Modify: `components/guest/LocationMap.tsx`
- Modify: `components/guest/GuestInvitation.tsx`

> Strategy: Replace hardcoded `#7C1B2B` → `var(--color-primary)`, `#C9A96E` → `var(--color-accent)`, font-family strings → `var(--font-heading)` / `var(--font-body)` / `var(--font-script)`. Add `calc(... * var(--scale-heading, 1))` only on large display font-sizes.

- [ ] **Step 1: Update `HeroCard.tsx` — replace `<style>` block**

Find the `<style>{`` block in `HeroCard.tsx` and replace **only these CSS rules** (keep everything else the same):

```css
/* Replace these rules inside the existing <style> block */

/* Corner brackets — accent color */
.hero::before, .hero::after {
  content: ''; position: absolute;
  width: clamp(40px, 6vw, 64px); height: clamp(40px, 6vw, 64px);
  border-color: var(--color-accent); border-style: solid; opacity: .45;
  pointer-events: none;
}

/* 囍 watermark — primary color */
.hero-watermark {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-family: serif;
  font-size: clamp(260px, 50vw, 620px);
  color: var(--color-primary); opacity: .04;
  line-height: 1; user-select: none; pointer-events: none;
}

/* Save the Date script */
.save-bg {
  position: absolute;
  left: 50%; top: 50%; bottom: auto;
  transform: translate(-50%, 70%) rotate(-5deg);
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(clamp(2.6rem, 8vw, 5.4rem) * var(--scale-heading, 1));
  color: #f4cabd;
  opacity: .85;
  line-height: 1; letter-spacing: .015em;
  pointer-events: none; user-select: none;
  white-space: nowrap; z-index: 1;
  animation: fadeIn 1.4s ease both .55s;
}

/* Big date */
.hero-date {
  position: relative; z-index: 2;
  font-family: var(--font-heading);
  font-weight: 300;
  font-size: calc(clamp(3.6rem, 13vw, 9rem) * var(--scale-heading, 1));
  color: var(--color-primary);
  line-height: .9; letter-spacing: -.02em; margin: 0;
  animation: fadeUp 1.1s ease both .25s;
}

/* Names */
.hero-names {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: calc(clamp(1.4rem, 4.2vw, 2.8rem) * var(--scale-heading, 1));
  letter-spacing: .14em;
  color: var(--color-primary);
  line-height: 1.3;
  margin: clamp(2rem, 4vw, 2.75rem) 0 0;
  animation: fadeUp 1s ease both .95s;
}

/* Ampersand */
.hero-amp {
  font-family: var(--font-script);
  font-weight: 400;
  font-size: 1.25em;
  color: var(--color-primary);
  letter-spacing: 0;
  display: inline-block; margin: 0 .25em; vertical-align: -.05em;
}

/* Eyebrow labels */
.hero-eyebrow {
  display: block;
  font-family: var(--font-body);
  font-size: clamp(.62rem, 1.1vw, .72rem);
  letter-spacing: .38em; text-transform: uppercase;
  color: #7A5555;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
  animation: fadeIn 1s ease both 0s;
}
.hero-place {
  display: block;
  font-family: var(--font-body);
  font-size: clamp(.62rem, 1.1vw, .72rem);
  letter-spacing: .35em; text-transform: uppercase;
  color: #7A5555;
  margin-top: clamp(1.5rem, 3vw, 2rem);
  animation: fadeIn 1s ease both 1.25s;
}

/* Guest name line */
.hero-guest {
  display: flex; align-items: baseline; gap: .5rem;
  max-width: min(90%, 460px);
  margin: clamp(1.5rem, 3vw, 2rem) auto 0;
  font-family: var(--font-heading);
  font-style: italic;
  font-size: clamp(.85rem, 1.5vw, 1rem);
  color: #5C3535; letter-spacing: .04em;
  animation: fadeIn 1s ease both 1.45s;
}
.hero-guest-name {
  flex: 1;
  border-bottom: 1px dotted #B89B7E;
  padding: 0 .25em .15em;
  font-style: normal; font-weight: 500;
  color: var(--color-primary);
  text-align: center; min-height: 1.5em;
}

/* Scroll cue */
.scroll-cue span {
  font-family: var(--font-body);
  font-size: .6rem; letter-spacing: .3em;
  text-transform: uppercase; color: #7A5555;
}
.scroll-tick {
  width: 1px; height: 44px;
  background: linear-gradient(to bottom, var(--color-accent), transparent);
  animation: tickPulse 2s ease-in-out infinite;
}

/* Mobile override for scaled font-sizes */
@media (max-width: 560px) {
  .hero-watermark { font-size: clamp(180px, 60vw, 260px); opacity: .025; }
  .save-bg {
    transform: translate(-50%, 70%) rotate(-5deg);
    font-size: calc(clamp(2rem, 10vw, 3.2rem) * var(--scale-heading, 1));
    opacity: .85;
  }
  .hero-date { font-size: calc(clamp(2.8rem, 14vw, 4.4rem) * var(--scale-heading, 1)); }
  .hero-names { letter-spacing: .1em; font-size: calc(clamp(1.1rem, 5.2vw, 1.6rem) * var(--scale-heading, 1)); }
}
```

- [ ] **Step 2: Update `InvitationMessage.tsx` — key CSS rules**

Replace these rules inside the existing `<style>` block:

```css
.im-eyebrow {
  display: block;
  font-family: var(--font-body);
  font-size: .68rem; letter-spacing: .38em;
  text-transform: uppercase; color: var(--color-accent);
  margin-bottom: .75rem;
}
.im-title {
  font-family: var(--font-script);
  font-size: calc(clamp(2.5rem, 7vw, 4rem) * var(--scale-heading, 1));
  color: var(--color-primary);
  line-height: 1; margin: 0 0 1.5rem;
}
.im-intro {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: calc(clamp(.95rem, 2vw, 1.1rem) * var(--scale-body, 1));
  color: #5C3535; line-height: 1.7; margin: 0 0 1.25rem;
}
.im-guest {
  font-family: var(--font-script);
  font-size: clamp(1.6rem, 4.5vw, 2.4rem);
  color: var(--color-primary); line-height: 1; margin: 0 0 1.5rem;
}
.im-names {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: calc(clamp(1.4rem, 4vw, 2rem) * var(--scale-heading, 1));
  letter-spacing: .04em; color: #231010;
  text-transform: uppercase; line-height: 1.3;
}
.im-amp {
  font-family: var(--font-script);
  font-weight: 400; color: var(--color-accent);
  font-size: 1.4em; text-transform: none;
  margin: 0 .35em; vertical-align: -.05em;
}
.im-count-label {
  display: block;
  font-family: var(--font-heading);
  font-style: italic;
  font-size: clamp(.95rem, 2vw, 1.1rem);
  color: #5C3535; margin-bottom: 1.25rem;
}
.im-cell::before {
  content: ''; position: absolute; inset: 4px;
  border: 1px solid var(--color-accent); opacity: .35;
  pointer-events: none;
}
.im-cell-num {
  display: block;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: clamp(1.5rem, 4.5vw, 2.4rem);
  color: var(--color-primary); line-height: 1;
}
.im-cell-lbl {
  display: block;
  font-family: var(--font-body);
  font-size: .58rem; letter-spacing: .25em;
  text-transform: uppercase; color: #7A5555; margin-top: .4rem;
}
```

- [ ] **Step 3: Update `ParentsSection.tsx` — key CSS rules**

```css
.parents-sec::before {
  content: '囍'; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-weight: 700; font-size: clamp(220px, 50vw, 540px);
  color: var(--color-primary); opacity: .035;
  line-height: 1; pointer-events: none; user-select: none; z-index: 0;
}
.parents-quote {
  text-align: center;
  font-family: var(--font-heading);
  font-style: italic;
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  color: #5C3535; line-height: 1.7;
  max-width: 620px; margin: 0 auto clamp(2rem, 5vw, 3rem);
}
.parents-label {
  display: inline-block;
  font-family: var(--font-script);
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: var(--color-primary); margin-bottom: 1rem; line-height: 1;
}
.parents-name {
  font-family: var(--font-heading);
  font-size: clamp(.92rem, 1.9vw, 1.05rem);
  letter-spacing: .04em; color: #231010; line-height: 1.85; margin: 0;
}
.parents-loc {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: clamp(.85rem, 1.7vw, .98rem);
  color: #5C3535; margin-top: .65rem;
}
.parents-divider {
  width: 1px; height: clamp(120px, 18vw, 180px);
  background: linear-gradient(to bottom, transparent, var(--color-accent) 25%, var(--color-accent) 75%, transparent);
  opacity: .55; position: relative;
}
.parents-divider::after {
  content: '✦'; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: #FAF6EE; color: var(--color-accent);
  font-size: 1rem; padding: 0 .4rem;
}
```

- [ ] **Step 4: Update `CouplePortraits.tsx` — key CSS rules**

```css
.cp-eyebrow {
  display: block; text-align: center;
  font-family: var(--font-body);
  font-size: .68rem; letter-spacing: .38em;
  text-transform: uppercase; color: var(--color-accent); margin-bottom: .6rem;
}
.cp-title {
  text-align: center;
  font-family: var(--font-script);
  font-size: calc(clamp(2rem, 5.5vw, 3rem) * var(--scale-heading, 1));
  color: var(--color-primary); line-height: 1; margin: 0 0 clamp(2rem, 5vw, 3rem);
}
.cp-frame::before {
  content: ''; position: absolute; inset: 6px;
  border: 1px solid var(--color-accent); opacity: .35;
  pointer-events: none; z-index: 2;
}
.cp-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-script);
  font-size: clamp(3rem, 8vw, 5rem); color: var(--color-accent);
  background: linear-gradient(135deg, #F0E9DC, #E4D8C6);
}
.cp-role {
  display: block;
  font-family: var(--font-body);
  font-size: .65rem; letter-spacing: .35em;
  text-transform: uppercase; color: #7A5555; margin-top: 1.25rem;
}
.cp-name {
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: calc(clamp(1.2rem, 2.8vw, 1.55rem) * var(--scale-heading, 1));
  color: var(--color-primary); margin: .5rem 0 0; letter-spacing: .02em;
}
```

- [ ] **Step 5: Update `EventDetails.tsx` — key CSS rules**

```css
.ev-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #F0E9DC, #E4D8C6);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-weight: 700; font-size: clamp(5rem, 12vw, 8rem);
  color: var(--color-primary); opacity: .6;
}
.ev-frame::before {
  content: ''; position: absolute; inset: 6px;
  border: 1px solid var(--color-accent); opacity: .35;
  pointer-events: none; z-index: 2;
}
.ev-eyebrow {
  display: block;
  font-family: var(--font-body);
  font-size: .68rem; letter-spacing: .38em;
  text-transform: uppercase; color: var(--color-accent); margin-bottom: .65rem;
}
.ev-title {
  font-family: var(--font-script);
  font-size: calc(clamp(2.2rem, 5.5vw, 3rem) * var(--scale-heading, 1));
  color: var(--color-primary); line-height: 1; margin: 0 0 1.5rem;
}
.ev-date {
  font-family: var(--font-heading);
  font-weight: 300;
  font-size: calc(clamp(2.6rem, 8vw, 4.5rem) * var(--scale-heading, 1));
  color: var(--color-primary); line-height: 1; letter-spacing: -.01em; margin: 0 0 .6rem;
}
.ev-weekday {
  display: block;
  font-family: var(--font-body);
  font-size: .7rem; letter-spacing: .35em;
  text-transform: uppercase; color: #7A5555; margin-bottom: .35rem;
}
.ev-time {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: clamp(1.05rem, 2.2vw, 1.25rem);
  color: #231010; margin: 0 0 1.5rem;
}
.ev-time strong { font-weight: 600; color: var(--color-primary); font-style: normal; }
.ev-divider { width: 80px; height: 1px; background: var(--color-accent); opacity: .55; margin: 1.5rem 0; }
.ev-ev-label {
  display: block;
  font-family: var(--font-body);
  font-size: .62rem; letter-spacing: .3em;
  text-transform: uppercase; color: var(--color-accent); margin-bottom: .25rem;
}
.ev-ev { font-family: var(--font-heading); color: #231010; }
.ev-ev-line strong { font-weight: 600; color: var(--color-primary); }
```

- [ ] **Step 6: Update `LocationMap.tsx` — key CSS rules**

```css
.loc-frame::before {
  content: ''; position: absolute; inset: 6px;
  border: 1px solid var(--color-accent); opacity: .35;
  pointer-events: none; z-index: 2;
}
.loc-eyebrow {
  display: block;
  font-family: var(--font-body);
  font-size: .68rem; letter-spacing: .38em;
  text-transform: uppercase; color: var(--color-accent); margin-bottom: .65rem;
}
.loc-title {
  font-family: var(--font-script);
  font-size: calc(clamp(2.2rem, 5.5vw, 3rem) * var(--scale-heading, 1));
  color: var(--color-primary); line-height: 1; margin: 0 0 1.5rem;
}
.loc-venue {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: calc(clamp(1.2rem, 2.6vw, 1.45rem) * var(--scale-heading, 1));
  color: #231010; margin: 0 0 .55rem;
  letter-spacing: .02em; text-transform: uppercase;
}
.loc-address {
  font-family: var(--font-heading);
  font-style: italic;
  font-size: clamp(.95rem, 1.8vw, 1.05rem);
  color: #5C3535; line-height: 1.7; margin: 0 0 1.5rem;
}
.loc-btn-primary { background: var(--color-primary); color: #FAF8F3; border: 1px solid var(--color-primary); }
.loc-btn-primary:hover { background: color-mix(in srgb, var(--color-primary) 80%, black); }
.loc-btn-secondary { background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary); }
.loc-btn-secondary:hover { background: var(--color-primary); color: #FAF8F3; }
```

- [ ] **Step 7: Update `GuestInvitation.tsx` footer**

In `GuestInvitation.tsx`, replace the `<footer>` element:

```tsx
<footer style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: '#F0E9DC' }}>
  <p style={{ fontFamily: 'var(--font-script)', fontSize: '2rem', color: 'var(--color-primary)' }}>
    {config?.groom_name ?? 'Ngọc Sơn'} &amp; {config?.bride_name ?? 'Ái Nhãn'}
  </p>
  <p style={{ fontFamily: 'var(--font-body)', fontSize: '.8rem', color: '#7A5555', marginTop: '.5rem' }}>
    {config?.wedding_date
      ? new Date(config.wedding_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '05.07.2026'}
  </p>
  <p style={{ fontFamily: 'var(--font-body)', fontSize: '.7rem', color: '#7A5555', marginTop: '1rem' }}>
    Thank you · Made with ♥
  </p>
</footer>
```

- [ ] **Step 8: Build and verify no regressions**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 9: Check dev server visually**

Open `http://localhost:3000` in a browser and verify:
- The guest invitation still renders correctly with all fonts and colors as before (since DEFAULT_THEME matches the original hardcoded values)

- [ ] **Step 10: Commit**

```bash
git add components/guest/
git commit -m "feat(theme): adopt CSS custom properties in all guest components

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5: ThemeEditor component

**Files:**
- Create: `components/admin/ThemeEditor.tsx`

- [ ] **Step 1: Create `components/admin/ThemeEditor.tsx`**

```typescript
// components/admin/ThemeEditor.tsx
'use client'
import { useEffect, useState } from 'react'
import {
  WeddingTheme, DEFAULT_THEME,
  HEADING_FONTS, BODY_FONTS, SCRIPT_FONTS,
} from '@/lib/theme'

const inputCls = 'w-full border border-[#E4D8C6] rounded-lg px-3 py-2 font-body text-sm text-dark bg-white focus:outline-none focus:border-burg focus:ring-1 focus:ring-burg'

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

export default function ThemeEditor() {
  const [theme, setTheme] = useState<WeddingTheme>(DEFAULT_THEME)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => {
        if (d.theme_json) setTheme(d.theme_json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function update<K extends keyof WeddingTheme>(key: K, value: WeddingTheme[K]) {
    setTheme(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function save(themeToSave: WeddingTheme | null) {
    setSaving(true)
    setErrorMsg('')
    const res = await fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme_json: themeToSave }),
    })
    if (res.ok) setSaved(true)
    else setErrorMsg(`Lưu thất bại (${res.status})`)
    setSaving(false)
  }

  async function handleReset() {
    setTheme(DEFAULT_THEME)
    await save(null)
  }

  // Scoped CSS vars for the live preview (does NOT affect :root)
  const previewVars = {
    '--font-heading': `'${theme.fontHeading}', serif`,
    '--font-body': `'${theme.fontBody}', sans-serif`,
    '--font-script': `'${theme.fontScript}', cursive`,
    '--color-primary': theme.colorPrimary,
    '--color-accent': theme.colorAccent,
    '--scale-heading': theme.fontSizeHeadingScale,
    '--scale-body': theme.fontSizeBodyScale,
  } as React.CSSProperties

  if (loading) return <p className="font-body text-sm text-soft py-4">Đang tải...</p>

  return (
    <div className="py-4 space-y-3">

      {/* Font Family */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">🔤 Font chữ</h3>
        <Field label="Tiêu đề (heading)">
          <select className={inputCls} value={theme.fontHeading} onChange={e => update('fontHeading', e.target.value)}>
            {HEADING_FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
          </select>
        </Field>
        <Field label="Nội dung (body)">
          <select className={inputCls} value={theme.fontBody} onChange={e => update('fontBody', e.target.value)}>
            {BODY_FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
          </select>
        </Field>
        <Field label="Chữ thảo (script)">
          <select className={inputCls} value={theme.fontScript} onChange={e => update('fontScript', e.target.value)}>
            {SCRIPT_FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
          </select>
        </Field>
      </div>

      {/* Font Size Scale */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">📏 Cỡ chữ</h3>
        <Field label={`Tiêu đề — ${theme.fontSizeHeadingScale.toFixed(2)}×`}>
          <input
            type="range" min="0.8" max="1.4" step="0.05"
            value={theme.fontSizeHeadingScale}
            onChange={e => update('fontSizeHeadingScale', parseFloat(e.target.value))}
            className="w-full accent-burg"
          />
          <div className="flex justify-between font-body text-xs text-soft mt-1">
            <span>0.80×</span><span>1.00×</span><span>1.40×</span>
          </div>
        </Field>
        <Field label={`Nội dung — ${theme.fontSizeBodyScale.toFixed(2)}×`}>
          <input
            type="range" min="0.8" max="1.4" step="0.05"
            value={theme.fontSizeBodyScale}
            onChange={e => update('fontSizeBodyScale', parseFloat(e.target.value))}
            className="w-full accent-burg"
          />
          <div className="flex justify-between font-body text-xs text-soft mt-1">
            <span>0.80×</span><span>1.00×</span><span>1.40×</span>
          </div>
        </Field>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">🎨 Màu sắc</h3>
        <Field label="Màu chính">
          <div className="flex items-center gap-3">
            <input
              type="color" value={theme.colorPrimary}
              onChange={e => update('colorPrimary', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-[#E4D8C6] p-0.5 bg-white"
            />
            <span className="font-body text-sm text-mid font-mono">{theme.colorPrimary}</span>
          </div>
        </Field>
        <Field label="Màu điểm nhấn (vàng)">
          <div className="flex items-center gap-3">
            <input
              type="color" value={theme.colorAccent}
              onChange={e => update('colorAccent', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-[#E4D8C6] p-0.5 bg-white"
            />
            <span className="font-body text-sm text-mid font-mono">{theme.colorAccent}</span>
          </div>
        </Field>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-display text-base text-dark mb-3">👁 Xem trước</h3>
        <div style={previewVars} className="border border-[#E4D8C6] rounded-lg p-5 bg-[#FAF6EE] text-center">
          <p style={{
            fontFamily: 'var(--font-script)', lineHeight: 1, margin: '0 0 .5rem',
            fontSize: `calc(2rem * var(--scale-heading, 1))`,
            color: 'var(--color-primary)',
          }}>
            Ngọc Sơn &amp; Ái Nhãn
          </p>
          <p style={{
            fontFamily: 'var(--font-heading)', letterSpacing: '.06em', margin: '0 0 .75rem',
            fontSize: `calc(1.4rem * var(--scale-heading, 1))`,
            color: 'var(--color-primary)',
          }}>
            05 · 07 · 2026
          </p>
          <div style={{ width: 60, height: 1, background: 'var(--color-accent)', margin: '.75rem auto', opacity: .7 }} />
          <p style={{
            fontFamily: 'var(--font-body)', letterSpacing: '.25em', textTransform: 'uppercase', margin: '0 0 .35rem',
            fontSize: `calc(.7rem * var(--scale-body, 1))`,
            color: 'var(--color-accent)',
          }}>
            Wedding Invitation
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', letterSpacing: '.12em', textTransform: 'uppercase',
            fontSize: `calc(.75rem * var(--scale-body, 1))`,
            color: '#5C3535',
          }}>
            Trân trọng kính mời
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 font-body text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button" onClick={() => save(theme)} disabled={saving}
          className="flex-1 bg-burg text-cream font-body font-medium py-3 rounded-xl hover:bg-burg-2 transition-colors disabled:opacity-60"
        >
          {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu!' : 'Lưu giao diện'}
        </button>
        <button
          type="button" onClick={handleReset} disabled={saving}
          className="px-4 py-3 border border-[#E4D8C6] text-soft font-body text-sm rounded-xl hover:border-burg hover:text-burg transition-colors disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/ThemeEditor.tsx
git commit -m "feat(admin): add ThemeEditor component with live preview

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6: AdminShell — add Giao diện tab + end-to-end verification

**Files:**
- Modify: `components/admin/AdminShell.tsx`

- [ ] **Step 1: Update `AdminShell.tsx`**

Replace the entire file:

```typescript
// components/admin/AdminShell.tsx
'use client'
import { useState } from 'react'
import ConfigForm from './ConfigForm'
import PhotoManager from './PhotoManager'
import WishesManager from './WishesManager'
import ThemeEditor from './ThemeEditor'

type Tab = 'config' | 'photos' | 'wishes' | 'theme'

const TABS: { id: Tab; label: string }[] = [
  { id: 'config', label: 'Thông tin' },
  { id: 'photos', label: 'Ảnh' },
  { id: 'wishes', label: 'Lời chúc' },
  { id: 'theme', label: '🎨 Giao diện' },
]

export default function AdminShell() {
  const [tab, setTab] = useState<Tab>('config')

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-cream-2">
      <header className="bg-burg text-cream px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="font-display text-lg leading-none">Quản lý thiệp cưới</p>
          <p className="font-body text-xs opacity-60 mt-0.5">Ngọc Sơn &amp; Ái Nhãn</p>
        </div>
        <button
          onClick={handleLogout}
          className="font-body text-xs opacity-70 hover:opacity-100 border border-cream/30 px-3 py-1.5 rounded-lg transition-opacity"
        >
          Đăng xuất
        </button>
      </header>

      <nav className="bg-white border-b border-[#E4D8C6] sticky top-[52px] z-10">
        <div className="flex">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 font-body text-sm font-medium transition-colors border-b-2 ${
                tab === t.id ? 'border-burg text-burg' : 'border-transparent text-soft hover:text-dark'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-xl mx-auto p-4">
        {tab === 'config' && <ConfigForm />}
        {tab === 'photos' && <PhotoManager />}
        {tab === 'wishes' && <WishesManager />}
        {tab === 'theme' && <ThemeEditor />}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Full build check**

```bash
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` with no errors.

- [ ] **Step 3: End-to-end manual test**

With dev server running at `http://localhost:3000`:

1. Open `http://localhost:3000/admin` and log in
2. Click the **🎨 Giao diện** tab — ThemeEditor should appear
3. Change **Font chữ → Chữ thảo** from "Great Vibes" to "Dancing Script"
4. Observe the live preview below instantly updates the couple name font
5. Change **Màu chính** to `#1a3c5e` (navy blue) — preview couple names should turn navy
6. Click **Lưu giao diện** — button shows "✓ Đã lưu!"
7. Open `http://localhost:3000` — the invitation should now use Dancing Script for the couple names and navy as the primary color
8. Go back to admin → 🎨 Giao diện → click **Reset** — saves `theme_json: null`
9. Refresh `http://localhost:3000` — original burgundy/Great Vibes style should be restored

- [ ] **Step 4: Final commit + push**

```bash
git add components/admin/AdminShell.tsx
git commit -m "feat(admin): add Giao diện tab — theme editor live in admin panel

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push
```

---

## Self-Review Checklist (completed)

- ✅ **Spec coverage:** All spec sections covered — DB migration (Task 1), `lib/theme.ts` (Task 1), API (Task 2), CSS vars injection (Task 3), all 8 guest components (Task 4), ThemeEditor UI (Task 5), AdminShell tab (Task 6), font list (Task 5), live preview (Task 5), reset/save actions (Task 5)
- ✅ **Placeholders:** None — all steps contain complete code
- ✅ **Type consistency:** `WeddingTheme` defined in Task 1 `lib/theme.ts`; used identically in Task 5 `ThemeEditor.tsx`. `resolveTheme()` and `buildCssVars()` defined in Task 1, called in Task 3 `layout.tsx`. `HEADING_FONTS`, `BODY_FONTS`, `SCRIPT_FONTS` defined in Task 1, imported in Task 5.
- ✅ **Font scale vars:** `var(--scale-heading, 1)` fallback ensures existing CSS degrades safely if var is not yet set
