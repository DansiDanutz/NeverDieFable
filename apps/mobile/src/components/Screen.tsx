import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';

// The signature backdrop: a deep night with two soft candle/amethyst glows,
// so every screen sits in the same warm darkness as the design.
export function Screen({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) {
  const inner = (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={['#1A2138', 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.5 }}
        style={styles.glowA}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['#241D33', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.6 }}
        style={styles.glowB}
      />
      {children}
    </>
  );

  return (
    <View style={[styles.root, style]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {inner}
        </ScrollView>
      ) : (
        <View style={styles.fill}>{inner}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  content: { padding: spacing.m, paddingBottom: spacing.xxl, minHeight: '100%' },
  glowA: { position: 'absolute', top: -120, left: -80, width: 380, height: 320, opacity: 0.5, borderRadius: 200 },
  glowB: { position: 'absolute', top: -60, right: -100, width: 340, height: 300, opacity: 0.45, borderRadius: 200 },
});
