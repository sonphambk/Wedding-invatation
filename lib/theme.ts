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

const MIN_FONT_SCALE = 0.8
const MAX_FONT_SCALE = 1.4
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/

function resolveFontName(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : fallback
}

function resolveFontScale(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return value >= MIN_FONT_SCALE && value <= MAX_FONT_SCALE ? value : fallback
}

function resolveHexColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback
  }

  return HEX_COLOR_RE.test(value) ? value : fallback
}

function escapeCssString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

/** Safely parse raw DB value into a WeddingTheme, falling back to defaults per field. */
export function resolveTheme(raw: unknown): WeddingTheme {
  try {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const t = raw as Record<string, unknown>
      return {
        fontHeading: resolveFontName(t.fontHeading, DEFAULT_THEME.fontHeading),
        fontBody: resolveFontName(t.fontBody, DEFAULT_THEME.fontBody),
        fontScript: resolveFontName(t.fontScript, DEFAULT_THEME.fontScript),
        fontSizeHeadingScale: resolveFontScale(t.fontSizeHeadingScale, DEFAULT_THEME.fontSizeHeadingScale),
        fontSizeBodyScale: resolveFontScale(t.fontSizeBodyScale, DEFAULT_THEME.fontSizeBodyScale),
        colorPrimary: resolveHexColor(t.colorPrimary, DEFAULT_THEME.colorPrimary),
        colorAccent: resolveHexColor(t.colorAccent, DEFAULT_THEME.colorAccent),
      }
    }
  } catch {
    // fall through
  }
  return { ...DEFAULT_THEME }
}

/** Build a CSS custom properties string suitable for injecting inside :root { ... } */
export function buildCssVars(theme: WeddingTheme): string {
  return [
    `--font-heading: '${escapeCssString(theme.fontHeading)}', serif;`,
    `--font-body: '${escapeCssString(theme.fontBody)}', sans-serif;`,
    `--font-script: '${escapeCssString(theme.fontScript)}', cursive;`,
    `--color-primary: ${theme.colorPrimary};`,
    `--color-accent: ${theme.colorAccent};`,
    `--scale-heading: ${theme.fontSizeHeadingScale};`,
    `--scale-body: ${theme.fontSizeBodyScale};`,
  ].join(' ')
}
