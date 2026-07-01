// Mock data used by the scaffold screens until the API is wired (src/api.ts).

export type Persona = {
  id: string;
  name: string;
  relationship: string;
  kind: 'self' | 'departed';
  completeness: number; // 0..1
  tier: 'text' | 'voice' | 'avatar';
  emoji: string; // placeholder until avatar rigs render
};

export const personas: Persona[] = [
  { id: 'self', name: 'You', relationship: 'Your Digital Mind', kind: 'self', completeness: 0.42, tier: 'voice', emoji: '🧠' },
  { id: 'p1', name: 'Grandpa Ion', relationship: 'Grandfather', kind: 'departed', completeness: 0.68, tier: 'voice', emoji: '👴' },
  { id: 'p2', name: 'Aunt Maria', relationship: 'Aunt', kind: 'departed', completeness: 0.31, tier: 'text', emoji: '👩' },
];

export type CompanionQuestion = {
  id: string;
  question: string;
  context: string;
  kind: 'gap' | 'today' | 'housekeeping';
};

export const todaysQuestions: CompanionQuestion[] = [
  {
    id: 'q1',
    question: 'Who is standing next to you in this photo from June 12?',
    context: 'Unknown face · beach photo',
    kind: 'gap',
  },
  {
    id: 'q2',
    question: 'Tell me a story about how Grandpa Ion laughed.',
    context: "Grandpa Ion's garden · 3 stories to unlock his avatar",
    kind: 'gap',
  },
  {
    id: 'q3',
    question: 'How was today? Anything worth keeping forever?',
    context: 'Daily capture · 2 minutes',
    kind: 'today',
  },
];

export type VaultEntry = {
  id: string;
  kind: string;
  title: string;
  when: string;
  people: string[];
  icon: string;
};

export const recentVault: VaultEntry[] = [
  { id: 'v1', kind: 'recording', title: 'Call with the notary — Dad’s house', when: 'Today 14:20', people: ['Maria'], icon: '🎙️' },
  { id: 'v2', kind: 'photo', title: '14 photos — Sunday lunch', when: 'Yesterday', people: ['Mom', 'Ana'], icon: '🖼️' },
  { id: 'v3', kind: 'document', title: 'Insurance policy 2026.pdf', when: 'Mon', people: [], icon: '📄' },
  { id: 'v4', kind: 'voice_note', title: 'Idea for Ana’s birthday', when: 'Sun', people: ['Ana'], icon: '🎤' },
  { id: 'v5', kind: 'secret', title: '🔒 Sealed — opens for Ana at 18', when: 'Last week', people: ['Ana'], icon: '🔐' },
];

export type LegacyRule = {
  id: string;
  what: string;
  who: string;
  when: string;
  how: 'raw' | 'by_avatar' | 'time_capsule';
};

export const legacyRules: LegacyRule[] = [
  { id: 'r1', what: 'Letters folder (23 items)', who: 'Ana (daughter)', when: 'On her 18th birthday', how: 'by_avatar' },
  { id: 'r2', what: 'Business documents', who: 'Dan (brother)', when: 'On death', how: 'raw' },
  { id: 'r3', what: 'Wedding-day message', who: 'Ana (daughter)', when: 'Her wedding day', how: 'time_capsule' },
];
