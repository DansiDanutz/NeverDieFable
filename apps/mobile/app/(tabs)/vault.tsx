import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { api, ApiVaultItem } from '@/api';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { recentVault } from '@/mock';
import { colors, spacing, type } from '@/theme';

const KIND_ICON: Record<string, string> = {
  photo: '🖼️', video: '🎞️', audio: '🎧', voice_note: '🎤', message_thread: '💬',
  email: '✉️', document: '📄', secret: '🔐', recording: '🎙️', story: '📖',
  time_capsule: '🕰️',
};

// VAULT — store everything, ask anything.
// The search bar is the product: natural questions over your whole life,
// answered with cited sources from the live memory engine.
export default function VaultScreen() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<{ text: string; sources: string[] } | null>(null);
  const [asking, setAsking] = useState(false);
  const [items, setItems] = useState<ApiVaultItem[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    api
      .listVault()
      .then((r) => setItems(r.items))
      .catch(() => {
        setOffline(true);
        setItems(
          recentVault.map((v) => ({
            id: v.id, kind: v.kind, title: v.title, status: 'ready',
            captured_at: null, created_at: '', source_app: null,
          })),
        );
      });
  }, []);

  const ask = useCallback(async () => {
    const q = query.trim();
    if (!q || asking) return;
    setAsking(true);
    setAnswer(null);
    try {
      const r = await api.askVault(q);
      setAnswer({ text: r.answer, sources: r.citations.map((c) => c.source) });
    } catch {
      setAnswer({ text: '⚠ Could not reach your memories — is the backend running?', sources: [] });
    } finally {
      setAsking(false);
    }
  }, [query, asking]);

  return (
    <Screen>
      <TextInput
        style={styles.search}
        placeholder='Ask anything… “what did we say about the house?”'
        placeholderTextColor={colors.textDim}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        onSubmitEditing={ask}
      />

      {asking && <Text style={[type.dim, { marginBottom: spacing.m }]}>searching your life…</Text>}
      {answer && (
        <Card style={{ borderColor: colors.gold }}>
          <Text style={type.body}>{answer.text}</Text>
          {answer.sources.length > 0 && (
            <Text style={[type.dim, { marginTop: 8 }]}>
              from: {answer.sources.slice(0, 3).join(' · ')}
            </Text>
          )}
        </Card>
      )}

      <Text style={[type.label, { marginVertical: spacing.s }]}>
        {offline ? 'Recent (examples — backend offline)' : 'Recent'}
      </Text>
      {(items ?? []).map((v) => (
        <Card key={v.id}>
          <View style={styles.row}>
            <Text style={{ fontSize: 22 }}>{KIND_ICON[v.kind] ?? '📦'}</Text>
            <View style={{ flex: 1, marginLeft: spacing.m }}>
              <Text style={type.body}>{v.title ?? v.kind}</Text>
              <Text style={[type.dim, { marginTop: 2 }]}>
                {v.status}{v.source_app ? ` · via ${v.source_app}` : ''}
              </Text>
            </View>
          </View>
        </Card>
      ))}
      {items?.length === 0 && (
        <Text style={type.dim}>
          Your vault is empty. Use ＋ Keep something — every photo, voice and
          document you add becomes memory your Mind can answer from.
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    color: colors.text,
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: spacing.m,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
});
