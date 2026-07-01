import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

// Placeholder "ring": a labeled bar until we add SVG. Shows the Memory
// Completeness score that drives the habit loop (docs/DAILY_COMPANION.md).
export function CompletenessRing({ value, tint = colors.gold }: { value: number; tint?: string }) {
  const pct = Math.round(value * 100);
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: tint }]} />
      </View>
      <Text style={styles.pct}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  pct: { color: colors.textDim, fontSize: 12, width: 36, textAlign: 'right' },
});
