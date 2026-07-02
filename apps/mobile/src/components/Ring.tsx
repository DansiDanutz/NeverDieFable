import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme';

// The Memory Completeness ring — the number that drives the daily habit.
export function Ring({
  value,
  size = 150,
  tint = colors.gold,
  caption = 'complete',
}: {
  value: number; // 0..1
  size?: number;
  tint?: string;
  caption?: string;
}) {
  const r = 50;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <SvgGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={tint} />
            <Stop offset="1" stopColor={tint === colors.gold ? '#D98F3C' : '#8E6FD1'} />
          </SvgGradient>
        </Defs>
        <Circle cx="60" cy="60" r={r} fill="none" stroke={colors.border} strokeWidth="10" />
        <Circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ringg)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 60 60)"
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: size * 0.2, fontWeight: '800' }}>{Math.round(pct * 100)}%</Text>
        <Text style={{ color: colors.textDim, fontSize: size * 0.07 }}>{caption}</Text>
      </View>
    </View>
  );
}
