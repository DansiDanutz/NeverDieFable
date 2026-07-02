// Client for the NeverDie backend (services/api). The backend holds the
// service key and the AI keys; the app only needs EXPO_PUBLIC_API_URL.
// Blobs upload straight to storage via one-time signed URLs — file bytes
// never pass through the API server.

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export type ApiPersona = {
  id: string;
  name: string;
  relationship: string | null;
  kind: 'self' | 'departed' | 'companion';
  mode: string;
  has_voice: boolean;
  has_card: boolean;
};

export type ApiVaultItem = {
  id: string;
  kind: string;
  title: string | null;
  status: string;
  captured_at: string | null;
  created_at: string;
  source_app: string | null;
};

export const api = {
  listPersonas: () => req<{ personas: ApiPersona[] }>('/personas'),

  chat: (personaId: string, message: string) =>
    req<{ text: string; audio_b64?: string | null; citations: string[] }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ persona_id: personaId, message, want_audio: true }),
    }),

  askVault: (query: string) =>
    req<{ answer: string; citations: { source: string }[] }>('/vault/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  listVault: (kind?: string) =>
    req<{ items: ApiVaultItem[]; total: number }>(
      `/vault/items${kind ? `?kind=${kind}` : ''}`,
    ),

  /** Full upload flow: register → PUT blob to the signed URL → mark uploaded. */
  uploadItem: async (opts: {
    kind: string;
    title: string;
    uri: string; // local file uri from a picker
    mimeType: string;
  }) => {
    const reg = await req<{ id: string; upload_url: string | null }>('/vault/items', {
      method: 'POST',
      body: JSON.stringify({ kind: opts.kind, title: opts.title, mime_type: opts.mimeType }),
    });
    if (reg.upload_url) {
      const blob = await (await fetch(opts.uri)).blob();
      const put = await fetch(reg.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': opts.mimeType },
        body: blob,
      });
      if (!put.ok) throw new Error(`upload failed: ${put.status}`);
      await req(`/vault/items/${reg.id}/uploaded`, { method: 'POST' });
    }
    return reg.id;
  },

  companionToday: () =>
    req<{ questions: CompanionQuestion[] }>('/companion/today'),

  answerCompanion: (questionId: string, text: string, personaId = 'self') =>
    req<{ status: string; memory_id?: string }>(
      `/companion/questions/${questionId}/answer?persona_id=${personaId}&text=${encodeURIComponent(text)}`,
      { method: 'POST' },
    ),

  completeness: (personaId: string) =>
    req<{ total: number; embedded: number; score: number }>(
      `/people/${personaId}/completeness`,
    ),

  legacyCheckin: () => req<{ stage: string }>('/legacy/checkin', { method: 'POST' }),
};

export type CompanionQuestion = {
  id: string;
  question: string;
  gap_kind: string;
  priority: number;
};
