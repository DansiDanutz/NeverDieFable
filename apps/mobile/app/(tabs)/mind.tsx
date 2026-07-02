import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/api';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Ring } from '@/components/Ring';
import { Screen } from '@/components/Screen';
import { colors, spacing, type } from '@/theme';

// MY MIND — your own Digital Mind: voice, memory, and what your family inherits.
export default function MindScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<{ total: number; score: number } | null>(null);

  useEffect(() => {
    api.completeness('self').then((s) => setStats({ total: s.total, score: s.score })).catch(() => setStats({ total: 0, score: 0 }));
  }, []);

  return (
    <Screen>
      <View style={styles.hero}>
        <Avatar glyph="🧠" size={96} glow />
        <Text style={[type.h2, { marginTop: spacing.m }]}>Your Digital Mind</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>
          {stats ? `Voice cloned · ${stats.total.toLocaleString()} memories` : 'Loading your mind…'}
        </Text>
      </View>

      <Ring value={stats?.score ?? 0} size={168} />
      <Text style={[type.dim, { textAlign: 'center', marginTop: 6, marginBottom: spacing.l }]}>
        Memory completeness — it grows every day you talk
      </Text>

      <Card variant="gold" onPress={() => router.push('/persona/self')}>
        <Text style={type.body}>🪞  Mirror — talk with yourself</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>Reflect, remember, ask your own life anything. In your voice.</Text>
      </Card>
      <Card onPress={() => router.push('/persona/self')}>
        <Text style={type.body}>🎭  Rehearsal — meet what your family will</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>Experience your Mind exactly as your heirs one day will.</Text>
      </Card>

      <Text style={[type.label, { marginTop: spacing.l, marginBottom: spacing.s }]}>Grow your mind</Text>
      <Card>
        <Text style={type.dim}>
          Answer the Companion each evening · record the 2-minute voice session for studio-quality voice ·
          import your email and photo archives. Every memory makes you more present, forever.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: spacing.m, marginBottom: spacing.m },
});
