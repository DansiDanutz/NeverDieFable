import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { registerForDailyNudge } from '@/push';
import { colors } from '@/theme';

export default function RootLayout() {
  // Enroll this device for the daily ritual nudge (idempotent, best-effort).
  useEffect(() => {
    void registerForDailyNudge();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="persona/[id]" options={{ title: '' }} />
        <Stack.Screen name="garden/new" options={{ title: 'New Garden', presentation: 'modal' }} />
        <Stack.Screen name="capture" options={{ title: 'Keep something', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
