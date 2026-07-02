import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing, type } from '@/theme';

// PLANT A GARDEN — the guided flow for a departed person's avatar.
// Deliberately gentle; every step optional; the persona grows in quality tiers.
const STEPS = [
  { icon: '💜', title: 'Who are they to you?', detail: 'Name, relationship, the dates of their life. That is enough to begin.' },
  { icon: '🖼️', title: 'Their face', detail: 'A few photos — even old or damaged ones. We restore them with care.' },
  { icon: '🎙️', title: 'Their voice', detail: 'Voicemails, home videos, any recording. Ten seconds is enough to begin; a minute makes it truly them.' },
  { icon: '✉️', title: 'Their words', detail: 'Letters, messages, emails — how they wrote, joked, loved.' },
  { icon: '🗣️', title: 'Your stories', detail: 'We interview you about them — how they laughed, what they always said.' },
  { icon: '👪', title: 'The Memory Circle', detail: 'Invite family. Everyone adds photos, voices and stories; everyone can visit them.' },
];

export default function NewGarden() {
  return (
    <Screen>
      <Text style={[type.title, { color: colors.memory, marginTop: spacing.s }]}>Bring someone back</Text>
      <Text style={[type.dim, { marginVertical: spacing.m }]}>
        We build their garden together, gently, one step at a time. You can pause anytime;
        nothing is ever lost. They grow more present with everything you add — first their words,
        then their voice, then their living portrait.
      </Text>

      {STEPS.map((s, i) => (
        <View key={s.title} style={styles.step}>
          <View style={styles.num}>
            <Text style={styles.numTxt}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.body}>{s.icon}  {s.title}</Text>
            <Text style={[type.dim, { marginTop: 3 }]}>{s.detail}</Text>
          </View>
        </View>
      ))}

      <Text style={[type.dim, { marginTop: spacing.m }]}>
        🤝 By continuing you confirm this person has passed away and that you knew them personally.
        Their garden belongs to the whole family: any guardian may pause it, and it always introduces
        itself as a kept memory — never as the living person.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: spacing.m, alignItems: 'flex-start', marginBottom: spacing.m },
  num: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.memorySoft,
    borderWidth: 1,
    borderColor: 'rgba(181,146,230,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numTxt: { color: colors.memory, fontSize: 13, fontWeight: '700' },
});
