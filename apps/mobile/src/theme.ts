// NeverDie design language — "Midnight & Candlelight".
// Deep, calm night (permanence) lit by warm candle-gold (memory, love).
// Departed loved ones carry a soft amethyst (memory) accent; the living, green.
// Never clinical, never morbid — presence, warmth, forever.

export const colors = {
  bg: '#0A0C12',
  bgElev: '#0E1119',
  surface: '#151A26',
  surfaceRaised: '#1B2231',
  surfaceGlass: 'rgba(27,34,49,0.72)',
  border: '#242C3D',
  borderSoft: '#1C2434',

  text: '#F4F1EA',
  textDim: '#98A1B4',
  textFaint: '#5E6678',

  gold: '#E7B14C',       // candlelight — primary accent, love & memory
  goldSoft: 'rgba(231,177,76,0.14)',
  goldLine: 'rgba(231,177,76,0.35)',

  memory: '#B592E6',     // amethyst — the departed, gardens
  memorySoft: 'rgba(181,146,230,0.14)',
  life: '#79C9A0',       // living people, active/healthy states
  danger: '#E5776F',
} as const;

export const gradients = {
  night: ['#0A0C12', '#121826', '#0A0C12'] as const,
  candle: ['#E7B14C', '#D98F3C'] as const,
  memory: ['#B592E6', '#8E6FD1'] as const,
};

export const spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 } as const;
export const radius = { s: 10, m: 16, l: 22, pill: 999 } as const;

export const type = {
  hero: { fontSize: 32, fontWeight: '800' as const, color: colors.text, letterSpacing: 0.2 },
  title: { fontSize: 26, fontWeight: '700' as const, color: colors.text, letterSpacing: 0.2 },
  h2: { fontSize: 19, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15.5, color: colors.text, lineHeight: 23 },
  dim: { fontSize: 13, color: colors.textDim, lineHeight: 19 },
  label: { fontSize: 11, fontWeight: '700' as const, color: colors.textFaint, textTransform: 'uppercase' as const, letterSpacing: 1.6 },
} as const;

// Soft shadow tokens (iOS/Android) for lifted cards.
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  glow: (c: string) => ({
    shadowColor: c,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  }),
} as const;
