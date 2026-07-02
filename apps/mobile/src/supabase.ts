// Live Supabase client — auth + neverdie schema reads/writes under RLS.
// Uses the *anon* key only; the service key never ships in the app.
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(url, anonKey, {
  db: { schema: 'neverdie' },
  auth: { persistSession: true, autoRefreshToken: true },
});

export const isConfigured = Boolean(url && anonKey);
