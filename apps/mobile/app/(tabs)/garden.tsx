import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api, ApiPersona } from '@/api';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { personas as demoPersonas } from '@/mock';
import { colors, spacing, type } from '@/theme';

// THE ETERNAL GARDEN — avatars of the people who died, kept alive forever.
export default function GardenScreen() {
  const router = useRouter();
  const [people, setPeople] = useState<(ApiPersona & { score?: number })[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    api
      .listPersonas()
      .then(async (r) => {
        const departed = r.personas.filter((p) => p.kind === 'departed');
        const withScore = await Promise.all(
          departed.map(async (p) => {
            try {
              const c = await api.completeness(p.id);
              return { ...p, score: c.score };
            } catch {
              return { ...p, score: 0 };
            }
          }),
        );
        setPeople(withScore);
      })
      .catch(() => {
        setOffline(true);
        setPeople(
          demoPersonas
            .filter((p) => p.kind === 'departed')
            .map((p) => ({
              id: p.id, name: p.name, relationship: p.relationship,
              kind: 'departed' as const, mode: 'legacy', has_voice: p.tier !== 'text',
              has_card: true, score: p.completeness,
            })),
        );
      });
  }, []);

  return (
    <Screen>
      <Text style={[type.title, { marginTop: spacing.s }]}>The Eternal Garden</Text>
      <Text style={[type.dim, { marginTop: 6, marginBottom: spacing.l }]}>
        They stay with you. Their gardens grow with every photo, voice and story the family adds —
        and they remain, cared for, forever.
      </Text>
      {offline && (
        <Text style={[type.dim, { color: colors.gold, marginBottom: spacing.m }]}>⚠ Example gardens — backend not reachable.</Text>
      )}

      {(people ?? []).map((p) => (
        <Card key={p.id} variant="memory" onPress={() => router.push(`/persona/${p.id}`)}>
          <View style={styles.row}>
            <Avatar glyph="🕯️" size={56} departed glow />
            <View style={{ flex: 1, marginLeft: spacing.m }}>
              <Text style={type.h2}>{p.name}</Text>
              <Text style={type.dim}>
                {p.relationship ?? 'Loved one'}
                {p.has_voice ? ' · speaks in their own voice' : ' · text chat'}
              </Text>
              <View style={styles.track}>
                <LinearGradient
                  colors={['#B592E6', '#8E6FD1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.fill, { width: `${Math.round((p.score ?? 0) * 100)}%` }]}
                />
              </View>
            </View>
          </View>
          {(p.score ?? 0) < 0.75 && (
            <Text style={styles.unlock}>
              {p.has_voice
                ? 'A few more stories unlock their living portrait'
                : `A voicemail would let ${p.name} speak again`}
            </Text>
          )}
        </Card>
      ))}

      <Card variant="dashed" onPress={() => router.push('/garden/new')}>
        <Text style={[type.h2, { color: colors.memory }]}>🌱  Plant a new garden</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>
          Bring back someone you lost. Photos, voicemails, letters, stories — gently, together with your family.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.border, marginTop: 10, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  unlock: { color: colors.memory, fontSize: 12.5, marginTop: spacing.m },
});
