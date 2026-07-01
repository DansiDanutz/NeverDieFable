import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { todaysQuestions } from '@/mock';
import { colors, spacing, type } from '@/theme';

// TODAY — the Daily Companion. The screen the user opens every morning:
// a gentle streak, a couple of questions that fill memory gaps, and one
// tap to capture today. (docs/DAILY_COMPANION.md)
export default function TodayScreen() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={type.title}>Good evening, Dan</Text>
      <Text style={[type.dim, { marginTop: 4, marginBottom: spacing.l }]}>
        🔥 12-day streak · your memory grew by 41 items this week
      </Text>

      <Text style={[type.label, { marginBottom: spacing.s }]}>The Companion asks</Text>
      {todaysQuestions.map((q) => (
        <Card key={q.id} onPress={() => router.push('/capture')}>
          <Text style={type.body}>{q.question}</Text>
          <Text style={[type.dim, { marginTop: 6 }]}>{q.context}</Text>
          <View style={styles.answerRow}>
            <Text style={styles.answerBtn}>🎤 Answer with voice</Text>
            <Text style={[type.dim]}>⌨️ Type · Skip</Text>
          </View>
        </Card>
      ))}

      <Text style={[type.label, { marginTop: spacing.l, marginBottom: spacing.s }]}>Keep something now</Text>
      <Card onPress={() => router.push('/capture')}>
        <Text style={type.body}>📷 Photo · 🎙️ Record a meeting · 📄 Document · 🔐 Secret</Text>
        <Text style={[type.dim, { marginTop: 6 }]}>
          Everything is encrypted on your phone before it goes anywhere.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xl },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  answerBtn: { color: colors.gold, fontSize: 14, fontWeight: '600' },
});
