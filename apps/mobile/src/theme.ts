// NeverDie design language: "midnight & candlelight".
// Deep night blues (permanence, calm) with warm gold accents (memory, warmth).
// Never clinical, never morbid.

export const colors = {
  bg: '#0B0E14',
  surface: '#141926',
  surfaceRaised: '#1C2333',
  border: '#252D40',
  text: '#F2EFE8',
  textDim: '#9AA3B5',
  gold: '#E8B04B',
  goldSoft: '#E8B04B33',
  life: '#7BC49A',      // living people, active states
  memory: '#B08BD9',    // departed people, gardens
  danger: '#E06C6C',
} as const;

export const spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32 } as const;

export const type = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text, letterSpacing: 0.2 },
  h2: { fontSize: 19, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  dim: { fontSize: 13, color: colors.textDim, lineHeight: 18 },
  label: { fontSize: 11, color: colors.textDim, textTransform: 'uppercase' as const, letterSpacing: 1.2 },
} as const;
