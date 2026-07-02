import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, ApiPersona } from '@/api';
import { Card } from '@/components/Card';
import { personas as demoPersonas } from '@/mock';
import { colors, spacing, type } from '@/theme';

// THE ETERNAL GARDEN — the flagship. Avatars of the people who died,
// built from their photos, voices, letters and the family's stories.
// Loads real personas from the backend; falls back to the demo set offline.
export default function GardenScreen() {
  const router = useRouter();
  const [people, setPeople] = useState<ApiPersona[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    api
      .listPersonas()
      .then((r) => setPeople(r.personas.filter((p) => p.kind === 'departed')))
      .catch(() => {
        setOffline(true);
        setPeople(
          demoPersonas
            .filter((p) => p.kind === 'departed')
            .map((p) => ({
              id: p.id,
              name: p.name,
              relationship: p.relationship,
              kind: 'departed' as const,
              mode: 'legacy',
              has_voice: p.tier !== 'text',
              has_card: true,
            })),
        );
      });
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[type.dim, { marginBottom: spacing.l }]}>
        The people you love stay with you. Their gardens grow with every photo,
        voice and story the family adds — and they remain, cared for, forever.
      </Text>
      {offline && (
        <Text style={[type.dim, { color: colors.gold, marginBottom: spacing.m }]}>
          ⚠ Showing example gardens — backend not reachable.
        </Text>
      )}

      {(people ?? []).map((p) => (
        <Card key={p.id} onPress={() => router.push(`/persona/${p.id}`)}>
          <View style={styles.row}>
            <View style={styles.portrait}>
              <Text style={{ fontSize: 30 }}>🕯️</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.m }}>
              <Text style={type.h2}>{p.name}</Text>
              <Text style={type.dim}>
                {p.relationship ?? 'Loved one'}
                {p.has_voice ? ' · speaks in their own voice' : ' · text chat'}
              </Text>
            </View>
          </View>
          {!p.has_voice && (
            <Text style={styles.unlock}>
              A voicemail or home video would let {p.name} speak again
            </Text>
          )}
        </Card>
      ))}
      {people === null && <Text style={type.dim}>Opening the garden…</Text>}

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
