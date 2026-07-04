import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Marketplace task surfaces.

  Each task route shares the same white + plum storefront identity as the home
  page while still allowing slightly different section copy. Tokens are exposed
  via `--tk-*` so archive/detail layouts can stay editable without touching
  route or fetch logic.
*/

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const MARKET_FONT = "'Space Grotesk', 'Inter', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: MARKET_FONT,
  fontBody: MARKET_FONT,
  bg: '#fffaf9',
  surface: '#ffffff',
  raised: '#f7f2f5',
  text: '#241f33',
  muted: '#665c77',
  line: '#eadfe8',
  accent: '#432e54',
  accentSoft: '#f5e6e6',
  onAccent: '#ffffff',
  glow: 'rgba(174,68,90,0.1)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Insights', note: 'Guides, updates, and stories arranged like a modern storefront.' },
  listing: { ...base, kicker: 'Vendor index', note: 'Compare local businesses through a cleaner directory-style shelf.' },
  classified: { ...base, kicker: 'Offers', note: 'Fast-moving posts highlighted with clear pricing and actions.' },
  image: { ...base, kicker: 'Visuals', note: 'Image-first discovery with a gallery layout and richer media pacing.' },
  sbm: { ...base, kicker: 'Resources', note: 'Useful links and saved finds collected in one simple stream.' },
  pdf: { ...base, kicker: 'Documents', note: 'Downloadable files presented with a polished workspace feel.' },
  profile: { ...base, kicker: 'Profiles', note: 'People and teams surfaced with a premium catalog treatment.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    // Re-point the shared article-body accent vars so post HTML (headings,
    // links) inherits this task's accent instead of the global site accent.
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
