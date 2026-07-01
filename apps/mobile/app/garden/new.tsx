import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/Card';
import { colors, spacing, type } from '@/theme';

// PLANT A GARDEN — the guided flow for creating a departed person's avatar.
// Deliberately gentle, one step at a time; every step is optional and the
// persona grows in quality tiers as material arrives. (docs/VISION.md §3)
const STEPS = [
  { icon: '💜', title: 'Who are they to you?', detail: 'Name, relationship, the dates of their life. That is enough to begin.' },
  { icon: '🖼️', title: 'Their face', detail: 'A few photos — even old or damaged ones. We restore them with care.' },
  { icon: '🎙️', title: 'Their voice', detail: 'Voicemails, home videos, any recording. Ten seconds is enough for a first voice; a minute makes it truly them.' },
  { icon: '✉️', title: 'Their words', detail: 'Letters, messages, emails — how they wrote, joked, loved.' },
  { icon: '🗣️', title: 'Your stories', detail: 'We interview you about them — how they laughed, what they always said, whom they called "my little star".' },
  { icon: '👪', title: 'The Memory Circle', detail: 'Invite family. Everyone adds photos, voices and stories; everyone can visit them.' },
];

export default function NewGarden() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[type.title, { color: colors.memory }]}>Bring someone back</Text>
      <Text style={[type.dim, { marginVertical: spacing.m }]}>
        We will build their garden together, gently, step by step. You can pause anytime;
        nothing is ever lost. They will grow more present with everything you add — first
        their words, then their voice, then their living portrait.
      </Text>

      {STEPS.map((s, i) => (
        <Card key={s.title}>
          <Text style={type.body}>
            {s.icon}  {i + 1}. {s.title}
          </Text>
          <Text style={[type.dim, { marginTop: 4 }]}>{s.detail}</Text>
        </Card>
      ))}

      <Text style={[type.dim, { marginTop: spacing.m }]}>
        🤝 By continuing you confirm this person has passed away and that you knew them
        personally. Their garden belongs to the whole family: any guardian may pause it,
        and it always introduces itself as a kept memory — never as the living person.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xl },
});
