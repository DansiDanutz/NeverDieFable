import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '@/theme';

function icon(glyph: string) {
  return ({ focused }: { focused: boolean }) => (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{glyph}</Text>
      {focused && (
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: colors.gold,
            marginTop: 3,
            shadowColor: colors.gold,
            shadowOpacity: 0.9,
            shadowRadius: 6,
          }}
        />
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'rgba(11,14,22,0.92)',
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 8,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: icon('☀️') }} />
      <Tabs.Screen name="vault" options={{ tabBarIcon: icon('🗄️') }} />
      <Tabs.Screen name="mind" options={{ tabBarIcon: icon('🧠') }} />
      <Tabs.Screen name="garden" options={{ tabBarIcon: icon('🌳') }} />
      <Tabs.Screen name="legacy" options={{ tabBarIcon: icon('🕊️') }} />
    </Tabs>
  );
}
