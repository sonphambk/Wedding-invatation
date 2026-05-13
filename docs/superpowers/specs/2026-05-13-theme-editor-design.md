# Theme Editor — Design Spec
**Date:** 2026-05-13  
**Feature:** Admin visual theme customization for wedding invitation layout  
**Status:** Approved

---

## Problem

The wedding invitation layout has all typography and colors hardcoded (e.g. `#7C1B2B`, `font-family: 'Great Vibes'` as inline strings). Admins cannot change fonts, sizes, or colors without editing source code.

## Goal

Give the admin a self-service "Giao diện" (Design) tab to customize font families, font sizes, and brand colors. Changes persist to the database and apply instantly to the guest-facing invitation page. A live preview inside the admin panel shows changes before saving.

---

## Approach: CSS Custom Properties + DB

Theme is stored as JSONB in the database. On each server render, `app/layout.tsx` reads the theme and injects CSS custom properties into `:root`. All guest components reference these vars instead of hardcoded values. This means:

- Guest page is styled correctly on first server render (no flash)
- No React context or client-side hydration needed for theming
- Adding new theme properties in the future is trivial

---

## Data Model

### DB migration

Add `theme_json` JSONB column (nullable) to `wedding_config`:

```sql
ALTER TABLE wedding_config ADD COLUMN theme_json JSONB;
```

A `NULL` value falls back to the default theme constants defined in `lib/theme.ts`.

### TypeScript interface (`lib/theme.ts`)

```typescript
export interface WeddingTheme {
  fontHeading: string        // bare font name, e.g. "Cormorant Garamond"
  fontBody: string           // bare font name, e.g. "Montserrat"
  fontScript: string         // bare font name, e.g. "Great Vibes"
  fontSizeHeadingScale: number  // multiplier 0.8–1.4, default 1.0
  fontSizeBodyScale: number     // multiplier 0.8–1.4, default 1.0
  colorPrimary: string       // hex, default "#7C1B2B" (burgundy)
  colorAccent: string        // hex, default "#C9A96E" (gold)
}

export const DEFAULT_THEME: WeddingTheme = {
  fontHeading: "Cormorant Garamond",
  fontBody: "Montserrat",
  fontScript: "Great Vibes",
  fontSizeHeadingScale: 1.0,
  fontSizeBodyScale: 1.0,
  colorPrimary: "#7C1B2B",
  colorAccent: "#C9A96E",
}
```

Font names are stored as bare names (e.g. `"Cormorant Garamond"`). `lib/theme.ts` exports a `buildCssVars(theme)` function that appends the correct fallback category: heading → `, serif`, body → `, sans-serif`, script → `, cursive`. The curated font list in `ThemeEditor.tsx` stores metadata `{ name: string, category: 'serif'|'sans-serif'|'cursive' }` for this mapping. The bare font name is also used to construct the Google Fonts URL: `?family=Cormorant+Garamond|Montserrat|Great+Vibes`.

### CSS custom properties (injected in `app/layout.tsx`)

```css
:root {
  --font-heading: 'Cormorant Garamond', serif;  /* built by buildCssVars() */
  --font-body: 'Montserrat', sans-serif;
  --font-script: 'Great Vibes', cursive;
  --color-primary: #7C1B2B;
  --color-accent: #C9A96E;
  --scale-heading: 1;
  --scale-body: 1;
}
```

---

## API Changes

### `GET /api/config`
No change — `theme_json` is included in the response automatically since the query selects all columns.

### `PATCH /api/config`
Add `theme_json` to the allowed fields allowlist. Accepts a `WeddingTheme` object or `null` (to reset to defaults).

### `lib/types.ts`
Add `theme_json: WeddingTheme | null` to `WeddingConfig`.

---

## Guest Components — CSS Var Adoption

These components have hardcoded color/font values that must be updated to use CSS vars:

| Component | Hardcoded values to replace |
|---|---|
| `HeroCard.tsx` | `color: '#7C1B2B'`, font-family strings |
| `EnvelopeIntro.tsx` | gradient colors `#931f33`, `#7C1B2B`, font-families |
| `InvitationMessage.tsx` | heading/body font inline styles |
| `EventDetails.tsx` | color and font inline styles |
| `LocationMap.tsx` | color and font inline styles |
| `ParentsSection.tsx` | color inline styles |
| `CouplePortraits.tsx` | color inline styles |
| `GuestInvitation.tsx` (footer) | inline font-family + color |

Strategy: do a targeted find-replace pass. Each `#7C1B2B` → `var(--color-primary)`, `#C9A96E` → `var(--color-accent)`. Font families follow same pattern.

---

## Admin UI

### New tab

Add **"🎨 Giao diện"** tab to `AdminShell.tsx` alongside existing tabs (Config, Photos, Wishes).

### `components/admin/ThemeEditor.tsx`

A new client component with three sections:

**1. Font chữ (Font Family)**
- "Tiêu đề" (Heading): `<select>` with 10 curated options
- "Nội dung" (Body): `<select>` with 8 curated options
- "Chữ thảo" (Script): `<select>` with 8 curated options

**2. Cỡ chữ (Font Size Scale)**
- "Tiêu đề": range slider 0.8–1.4, step 0.05, displays current value as `1.0×`
- "Nội dung": same

**3. Màu sắc (Colors)**
- "Màu chính" (Primary): `<input type="color">` with hex display
- "Màu điểm" (Accent): same

**4. Live Preview**
A `<div>` styled with the current theme state applied as inline CSS variables (scoped, not modifying `:root`). Shows:
- Couple names in script font + primary color
- Wedding date in heading font
- A sample body text line
- Colors applied to borders and accents

Updates in real-time as admin changes controls (no save needed to preview).

**5. Actions**
- `[Lưu giao diện]` — PATCH `/api/config` with `{ theme_json: currentTheme }`
- `[Reset mặc định]` — sets state back to `DEFAULT_THEME` and saves

### Curated Font Lists

**Heading fonts (10):**
Cormorant Garamond, Playfair Display, Libre Baskerville, EB Garamond, Lora, Cinzel, Gilda Display, Yeseva One, Marcellus, Alice

**Body fonts (8):**
Montserrat, Raleway, Lato, Source Sans 3, Nunito, Jost, DM Sans, Mulish

**Script fonts (8):**
Great Vibes, Allura, Pinyon Script, Dancing Script, Italianno, Parisienne, Satisfy, Tangerine

### Dynamic Google Fonts loading

`app/layout.tsx` reads theme from DB and constructs the Google Fonts `<link>` URL including all three font families from the stored theme. Falls back to the three default fonts if `theme_json` is null.

---

## File Inventory

| File | Action |
|---|---|
| `supabase/migrations/004_theme_json.sql` | Create — adds `theme_json` JSONB column |
| `lib/theme.ts` | Create — `WeddingTheme` interface + `DEFAULT_THEME` + CSS var builder |
| `lib/types.ts` | Edit — add `theme_json` field to `WeddingConfig` |
| `app/layout.tsx` | Edit — inject CSS vars from theme, dynamic Google Fonts URL |
| `app/api/config/route.ts` | Edit — add `theme_json` to PATCH allowlist |
| `components/admin/ThemeEditor.tsx` | Create — full theme editor UI |
| `components/admin/AdminShell.tsx` | Edit — add "Giao diện" tab |
| `components/guest/HeroCard.tsx` | Edit — CSS var adoption |
| `components/guest/EnvelopeIntro.tsx` | Edit — CSS var adoption |
| `components/guest/InvitationMessage.tsx` | Edit — CSS var adoption |
| `components/guest/EventDetails.tsx` | Edit — CSS var adoption |
| `components/guest/LocationMap.tsx` | Edit — CSS var adoption |
| `components/guest/ParentsSection.tsx` | Edit — CSS var adoption |
| `components/guest/CouplePortraits.tsx` | Edit — CSS var adoption |
| `components/guest/GuestInvitation.tsx` | Edit — footer CSS var adoption |

---

## Error Handling

- If `theme_json` is malformed in DB, `lib/theme.ts` falls back to `DEFAULT_THEME` (try/parse with catch)
- If a selected Google Font fails to load, browser falls back to the generic family (serif/sans-serif/cursive) — acceptable degradation
- Save errors surface the existing red error banner pattern already in `ConfigForm.tsx`

---

## Out of Scope

- Section visibility toggles (show/hide sections)
- Layout direction changes (horizontal ↔ vertical)
- Image size / hero image height control
- Per-section independent themes
- Export theme as CSS file
