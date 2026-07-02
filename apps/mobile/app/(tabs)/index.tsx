import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { api, CompanionQuestion } from '@/api';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { todaysQuestions } from '@/mock';
import { colors, spacing, type } from '@/theme';

// TODAY — the Daily Companion. The screen you open every day: the app
// interviews you with warm, specific questions, and every answer becomes
// permanent, recallable memory — your brain grows while you talk.
export default function TodayScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<CompanionQuestion[] | null>(null);
  const [offline, setOffline] = useState(false);
  const [answering, setAnswering] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const load = useCallback(() => {
    api
      .companionToday()
      .then((r) => setQuestions(r.questions))
      .catch(() => {
        setOffline(true);
        setQuestions(
          todaysQuestions.map((q) => ({
            id: q.id, question: q.question, gap_kind: q.kind, priority: 0.5,
          })),
        );
      });
  }, []);

  useEffect(load, [load]);

  const submit = async (q: CompanionQuestion) => {
    if (!draft.trim()) return;
    try {
      await api.answerCompanion(q.id, draft.trim());
      setSaved((s) => ({ ...s, [q.id]: true }));
    } catch {
      // keep the draft so nothing is lost
    }
    setAnswering(null);
    setDraft('');
  };

  return (
    <Screen>
      <Text style={type.title}>Good evening</Text>
      <Text style={[type.dim, { marginTop: 4, marginBottom: spacing.l }]}>
        🔥 Keep your streak — every answer makes your mind, and theirs, more alive.
      </Text>

      <Text style={[type.label, { marginBottom: spacing.s }]}>The Companion asks</Text>
      {questions === null && <ActivityIndicator color={colors.gold} />}
      {offline && (
        <Text style={[type.dim, { color: colors.gold, marginBottom: spacing.s }]}>
          ⚠ Example questions — backend not reachable.
        </Text>
      )}

      {(questions ?? []).map((q) => (
        <Card key={q.id}>
          <Text style={type.body}>{q.question}</Text>
          <Text style={[type.dim, { marginTop: 6 }]}>
            {q.gap_kind} · a memory worth keeping forever
          </Text>

          {saved[q.id] ? (
            <Text style={[styles.answerBtn, { color: colors.life }]}>✓ Kept — your mind just grew</Text>
          ) : answering === q.id ? (
            <View style={{ marginTop: spacing.m }}>
              <TextInput
                style={styles.input}
                placeholder="Tell the story… (or hold 🎤 to speak)"
                placeholderTextColor={colors.textDim}
                value={draft}
                onChangeText={setDraft}
                multiline
                autoFocus
              />
              <Text style={styles.answerBtn} onPress={() => submit(q)}>
                Keep this memory →
              </Text>
            </View>
          ) : (
            <View style={styles.answerRow}>
              <Text style={styles.answerBtn} onPress={() => { setAnswering(q.id); setDraft(''); }}>
                🎤 Answer
              </Text>
              <Text style={type.dim} onPress={load}>Skip · refresh</Text>
            </View>
          )}
        </Card>
      ))}

      <Text style={[type.label, { marginTop: spacing.l, marginBottom: spacing.s }]}>Keep something now</Text>
      <Card onPress={() => router.push('/capture')}>
        <Text style={type.body}>📷 Photo · 🎙️ Record · 📄 Document · 🔐 Secret</Text>
        <Text style={[type.dim, { marginTop: 6 }]}>
          Everything is encrypted on your phone before it goes anywhere.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  answerBtn: { color: colors.gold, fontSize: 14, fontWeight: '600', marginTop: spacing.s },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    padding: spacing.m,
    minHeight: 72,
    textAlignVertical: 'top',
  },
});
