import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '@/theme';

// Circular avatar with a glowing ring — gold for the living/self, amethyst for
// the departed. Emoji placeholder until LivePortrait rigs render a real face.
export function Avatar({
  glyph,
  size = 46,
  departed = false,
  glow = false,
}: {
  glyph: string;
  size?: number;
  departed?: boolean;
  glow?: boolean;
}) {
  const ring = departed ? colors.memory : colors.gold;
  return (
    <View
      style={[
        styles.a,
        { width: size, height: size, borderRadius: size / 2, borderColor: ring },
        glow && shadow.glow(ring),
      ]}
    >
      <Text style={{ fontSize: size * 0.48 }}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  a: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
