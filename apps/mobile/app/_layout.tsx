import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { colors } from '@/theme';

export default function RootLayout() {
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="persona/[id]" options={{ title: '' }} />
        <Stack.Screen name="garden/new" options={{ title: 'New Garden', presentation: 'modal' }} />
        <Stack.Screen name="capture" options={{ title: 'Keep something', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
