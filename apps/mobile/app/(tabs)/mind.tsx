import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { CompletenessRing } from '@/components/CompletenessRing';
import { colors, spacing, type } from '@/theme';

// MY MIND — your own Digital Mind: voice clone, avatar, and what your
// family will inherit. "Talk with yourself" is the daily magic;
// "Rehearsal" shows exactly what heirs will experience.
export default function MindScreen() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 56 }}>🧠</Text>
        </View>
        <Text style={[type.h2, { marginTop: spacing.m }]}>Your Digital Mind</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>Voice cloned · Avatar ready · 4,213 memories</Text>
      </View>

      <Card onPress={() => router.push('/persona/self')}>
        <Text style={type.body}>🪞 Mirror — talk with yourself</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>
          Reflect, remember, ask your own life anything. In your voice.
        </Text>
      </Card>
      <Card onPress={() => router.push('/persona/self')}>
        <Text style={type.body}>🎭 Rehearsal — see what your family will meet</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>
          Experience your Mind exactly as your heirs will, and fix what feels wrong.
        </Text>
      </Card>

      <Text style={[type.label, { marginTop: spacing.l, marginBottom: spacing.s }]}>Mind health</Text>
      <Card>
        <Text style={[type.dim, { marginBottom: 6 }]}>Memory completeness</Text>
        <CompletenessRing value={0.42} />
        <Text style={[type.dim, { marginTop: spacing.m }]}>
          To grow: answer the Companion 5 more days · import your email archive · record
          the guided voice session (2 min) to reach studio-quality voice.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xl },
  avatarWrap: { alignItems: 'center', marginVertical: spacing.l },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.gold,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
