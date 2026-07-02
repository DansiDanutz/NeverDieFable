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
    req<{ streak: number; questions: CompanionQuestion[] }>('/companion/today'),

  answerCompanion: (questionId: string, text: string, personaId = 'self') =>
    req<{ status: string; memory_id?: string; streak?: number }>(
      `/companion/questions/${questionId}/answer?persona_id=${personaId}&text=${encodeURIComponent(text)}`,
      { method: 'POST' },
    ),

  completeness: (personaId: string) =>
    req<{ total: number; embedded: number; score: number }>(
      `/people/${personaId}/completeness`,
    ),

  legacyCheckin: () => req<{ stage: string }>('/legacy/checkin', { method: 'POST' }),

  legacyState: () =>
    req<LegacyState>('/legacy/state'),

  legacyRules: () =>
    req<{ rules: LegacyRule[] }>('/legacy/rules'),

  /** Instant voice clone: upload one clean sample (~30s–3min) of the person
   *  speaking. The persona then replies aloud in their own voice. */
  cloneVoice: async (personaId: string, uri: string, mimeType = 'audio/m4a') => {
    const form = new FormData();
    // React Native FormData file part: { uri, name, type }
    form.append('sample', {
      uri,
      name: `voice-${personaId}.${mimeType.split('/')[1] ?? 'm4a'}`,
      type: mimeType,
    } as unknown as Blob);
    const res = await fetch(`${BASE}/personas/${personaId}/voice/clone`, {
      method: 'POST',
      body: form, // let fetch set the multipart boundary; do NOT set Content-Type
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return res.json() as Promise<{ persona_id: string; voice_ref: string; status: string }>;
  },

  circleInvite: (personaId: string) =>
    req<{ token: string; persona: string; join_url: string }>(
      `/circle/${personaId}/invite`,
      { method: 'POST' },
    ),

  circleMembers: (personaId: string) =>
    req<{ members: CircleMember[] }>(`/circle/${personaId}/members`),

  /** Enroll this device's Expo push token for the daily ritual nudge. */
  registerPush: (token: string, platform: string) =>
    req<{ status: string }>(
      `/push/register?token=${encodeURIComponent(token)}&platform=${platform}`,
      { method: 'POST' },
    ),
};

export type CircleMember = {
  display_name: string;
  role: string;
  contributions: number;
  joined_at: string;
};

export type LegacyState = {
  stage: 'active' | 'unreachable' | 'verification' | 'grace' | 'unsealed';
  checkin_days: number;
  quorum: number;
  grace_days: number;
  verifiers: number;
  confirmations: number;
  rules: number;
};

export type LegacyRule = {
  id: string;
  heir_name: string | null;
  trigger: string;
  delivery: 'raw' | 'by_avatar' | 'time_capsule';
  note: string | null;
  executed_at: string | null;
};

export type CompanionQuestion = {
  id: string;
  question: string;
  gap_kind: string;
  priority: number;
};
