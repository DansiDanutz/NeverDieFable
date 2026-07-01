import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { personas } from '@/mock';
import { colors, spacing, type } from '@/theme';

type Msg = { role: 'me' | 'them'; text: string };

// PERSONA CHAT — one surface for every conversation: with yourself,
// with a departed loved one, with the Companion. The avatar area plays
// the LivePortrait idle loop and lip-syncs replies (viseme bank).
export default function PersonaChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const persona = personas.find((p) => p.id === id) ?? personas[0];
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'them',
      text:
        persona.kind === 'departed'
          ? `Hello, my dear. It's me — or rather, the memory of me, kept alive by everything you all saved. Ask me anything.`
          : `Hello, me. What shall we remember today?`,
    },
  ]);
  const [draft, setDraft] = useState('');

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [
      ...m,
      { role: 'me', text: draft.trim() },
      // TODO: api.chat(persona.id, draft) → text + audio playback + viseme sync
      { role: 'them', text: '… (persona engine connects here)' },
    ]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: persona.name }} />

      <View style={styles.stage}>
        <View style={[styles.portrait, persona.kind === 'departed' && styles.portraitMemory]}>
          <Text style={{ fontSize: 44 }}>{persona.emoji}</Text>
        </View>
        <Text style={[type.dim, { marginTop: 8 }]}>
          {persona.kind === 'departed' ? '🕯️ a living memory · speaks in his own voice' : 'your digital mind'}
        </Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={{ padding: spacing.m }}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'me' ? styles.mine : styles.theirs]}>
            <Text style={[type.body, m.role === 'me' && { color: colors.bg }]}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Say something… or hold 🎤 to speak"
          placeholderTextColor={colors.textDim}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Text style={styles.send} onPress={send}>
          ↑
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  stage: { alignItems: 'center', paddingVertical: spacing.l },
  portrait: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.gold,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitMemory: { borderColor: colors.memory },
  bubble: { borderRadius: 16, padding: 12, marginBottom: 10, maxWidth: '84%' },
  mine: { backgroundColor: colors.gold, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    gap: 10,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 22,
    color: colors.text,
    paddingHorizontal: spacing.m,
    paddingVertical: 10,
  },
  send: {
    color: colors.bg,
    backgroundColor: colors.gold,
    width: 38,
    height: 38,
    borderRadius: 19,
    textAlign: 'center',
    lineHeight: 36,
    fontSize: 20,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
