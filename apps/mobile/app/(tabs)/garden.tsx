import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { CompletenessRing } from '@/components/CompletenessRing';
import { personas } from '@/mock';
import { colors, spacing, type } from '@/theme';

// THE ETERNAL GARDEN — the flagship. Avatars of the people who died,
// built from their photos, voices, letters and the family's stories.
export default function GardenScreen() {
  const router = useRouter();
  const departed = personas.filter((p) => p.kind === 'departed');
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[type.dim, { marginBottom: spacing.l }]}>
        The people you love stay with you. Their gardens grow with every photo,
        voice and story the family adds — and they remain, cared for, forever.
      </Text>

      {departed.map((p) => (
        <Card key={p.id} onPress={() => router.push(`/persona/${p.id}`)}>
          <View style={styles.row}>
            <View style={styles.portrait}>
              <Text style={{ fontSize: 30 }}>{p.emoji}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.m }}>
              <Text style={type.h2}>{p.name}</Text>
              <Text style={[type.dim, { marginBottom: 8 }]}>
                {p.relationship} · {p.tier === 'voice' ? 'speaks in his own voice' : 'text chat'}
              </Text>
              <CompletenessRing value={p.completeness} tint={colors.memory} />
            </View>
          </View>
          {p.tier !== 'avatar' && (
            <Text style={styles.unlock}>
              {p.tier === 'voice'
                ? '3 more stories from the family unlock his living portrait'
                : 'A voicemail or home video would let her speak again'}
            </Text>
          )}
        </Card>
      ))}

      <Card onPress={() => router.push('/garden/new')} style={styles.newCard}>
        <Text style={[type.h2, { color: colors.memory }]}>🌱 Plant a new garden</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>
          Bring back someone you lost. Photos, voicemails, letters, stories —
          we will guide you gently, step by step, together with your family.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center' },
  portrait: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.memory,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlock: { color: colors.memory, fontSize: 13, marginTop: spacing.m },
  newCard: { borderStyle: 'dashed', borderColor: colors.memory, backgroundColor: 'transparent' },
});
