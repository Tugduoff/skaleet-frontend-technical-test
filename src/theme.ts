import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Shared design tokens: every screen and component builds on these so the
 * app stays visually consistent. Change a value here, change it everywhere.
 *
 * The language is monochrome-first, inspired by Revolut: a pure white base,
 * light-grey filled surfaces, near-black text and near-black pill actions.
 * Color is used sparingly so structure and type do the work.
 */
export const colors = {
  /** App background — pure white, the canvas everything sits on. */
  background: '#FFFFFF',
  /** Filled surfaces: cards, inputs, chips, icon discs — warm bone tint. */
  surface: '#F6EDE5',
  /** Stronger tint for pressed states and avatar discs. */
  surfaceStrong: '#ECE1D6',
  /** Icon backdrops and secondary buttons. */
  primarySoft: '#F1E7DD',
  /** Main text — near black. */
  ink: '#08090B',
  /** Secondary text. */
  inkMuted: '#5C636E',
  /** Placeholders, icons at rest. */
  inkFaint: '#9AA1AB',
  /** Brand/action color — monochrome black, Revolut-style. */
  primary: '#08090B',
  /** Warm orange accent — interactive hints, active states, icon tints. */
  accent: '#FF5A1F',
  /** Soft orange tint for accent icon discs. */
  accentSoft: '#FFEDE4',
  /** Top of the app-wide background gradient — a whisper of warm orange. */
  gradientTop: '#FFF1E8',
  success: '#0E9F6E',
  danger: '#D92D20',
  dangerSoft: '#FDECEC',
  /** Hairline separators. */
  border: '#E8DED3',
  white: '#FFFFFF',
} as const;

/** Spacing scale — use these instead of magic numbers. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  display: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  /** The balance / amount hero — oversized, tight tracking, tabular digits. */
  hero: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  heading: { fontSize: 20, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyMedium: { fontSize: 15, fontWeight: '500' },
  caption: { fontSize: 13, fontWeight: '400' },
  captionMedium: { fontSize: 13, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
} as const satisfies Record<string, TextStyle>;

/**
 * Elevation presets. The design is intentionally flat: only floating
 * elements (the FAB) cast a shadow, and even that one stays soft.
 */
export const shadows = {
  card: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  fab: {
    shadowColor: colors.ink,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  bar: {
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
} as const satisfies Record<string, ViewStyle>;
