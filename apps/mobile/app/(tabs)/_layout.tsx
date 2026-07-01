import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { colors } from '@/theme';

function icon(glyph: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{glyph}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textDim,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('☀️') }} />
      <Tabs.Screen name="vault" options={{ title: 'Vault', tabBarIcon: icon('🗄️') }} />
      <Tabs.Screen name="mind" options={{ title: 'My Mind', tabBarIcon: icon('🧠') }} />
      <Tabs.Screen name="garden" options={{ title: 'Garden', tabBarIcon: icon('🌳') }} />
      <Tabs.Screen name="legacy" options={{ title: 'Legacy', tabBarIcon: icon('🕊️') }} />
    </Tabs>
  );
}
