// Thin client for services/api. All blobs are encrypted on-device before upload
// (see src/crypto.ts, to come) — the server never sees plaintext.

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  askVault: (query: string) =>
    req<{ answer: string; citations: unknown[] }>('/vault/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  chat: (personaId: string, message: string) =>
    req<{ text: string; audio_ref?: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ persona_id: personaId, message, want_audio: true }),
    }),

  companionToday: () => req<{ streak_days: number; questions: unknown[] }>('/companion/today'),

  legacyCheckin: () => req<{ stage: string }>('/legacy/checkin', { method: 'POST' }),
};
