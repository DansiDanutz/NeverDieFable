import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/theme';

type Variant = 'default' | 'gold' | 'memory' | 'life' | 'dashed';

export function Card({
  children,
  onPress,
  variant = 'default',
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  style?: ViewStyle;
}) {
  const v = variantStyle[variant];
  const body = <View style={[styles.card, v, style]}>{children}</View>;
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.m + 2,
    padding: spacing.m,
    marginBottom: spacing.s + 4,
    ...shadow.card,
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
});

const variantStyle: Record<Variant, ViewStyle> = {
  default: {},
  gold: { borderColor: colors.goldLine, backgroundColor: colors.surface },
  memory: { borderColor: 'rgba(181,146,230,0.4)' },
  life: { borderColor: 'rgba(121,201,160,0.4)' },
  dashed: { borderStyle: 'dashed', borderColor: colors.memory, backgroundColor: 'transparent', ...noShadow() },
};

function noShadow(): ViewStyle {
  return { shadowOpacity: 0, elevation: 0 };
}
