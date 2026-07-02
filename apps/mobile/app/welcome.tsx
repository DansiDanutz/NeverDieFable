import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing, type } from '@/theme';

// FIRST MOMENT — the promise, on open. Warm, still, unmistakable.
export default function Welcome() {
  const router = useRouter();
  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <Text style={styles.flame}>🕯️</Text>
        <Text style={styles.brand}>NeverDie</Text>
        <Text style={styles.promise}>
          Keep everything you love.{'\n'}Leave something behind.{'\n'}Never fully lose anyone.
        </Text>

        <Pressable style={styles.cta} onPress={() => router.replace('/(tabs)')}>
          <LinearGradient
            colors={['#E7B14C', '#D98F3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGrad}
          >
            <Text style={styles.ctaText}>Begin your mind</Text>
          </LinearGradient>
        </Pressable>

        <Text style={[type.dim, { marginTop: spacing.m }]}>
          🔒 End-to-end encrypted · only you hold the key
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  flame: { fontSize: 64, textShadowColor: 'rgba(231,177,76,0.6)', textShadowRadius: 24 },
  brand: { ...type.title, fontSize: 30, marginTop: spacing.l, letterSpacing: 1 },
  promise: { ...type.body, color: colors.textDim, textAlign: 'center', marginTop: spacing.m, lineHeight: 26 },
  cta: { width: '100%', marginTop: spacing.xl },
  ctaGrad: { borderRadius: radius.m, paddingVertical: 15, alignItems: 'center' },
  ctaText: { color: '#1a1206', fontWeight: '800', fontSize: 16 },
});
