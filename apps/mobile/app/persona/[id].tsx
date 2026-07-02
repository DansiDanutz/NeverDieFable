import { Audio } from 'expo-av';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, ApiPersona } from '@/api';
import { Avatar } from '@/components/Avatar';
import { colors, spacing, type } from '@/theme';

type Msg = { role: 'me' | 'them'; text: string; citations?: string[] };

// PERSONA CHAT — one surface for every conversation: with yourself,
// with a departed loved one, with the Companion. Replies arrive as text
// and, when the persona has a cloned voice, are spoken aloud.
export default function PersonaChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [persona, setPersona] = useState<ApiPersona | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    api
      .listPersonas()
      .then((r) => {
        const p = r.personas.find((x) => x.id === id) ?? null;
        setPersona(p);
        setMessages([
          {
            role: 'them',
            text:
              p?.kind === 'departed'
                ? `Hello, my dear. It's me — or rather, the memory of me, kept alive by everything you all saved. Ask me anything.`
                : `Hello, me. What shall we remember today?`,
          },
        ]);
      })
      .catch(() =>
        setMessages([{ role: 'them', text: '⚠ Backend not reachable — start services/api and set EXPO_PUBLIC_API_URL.' }]),
      );
  }, [id]);

  const playAudio = async (b64: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({
        uri: `data:audio/mpeg;base64,${b64}`,
      });
      await sound.playAsync();
    } catch {
      // voice is best-effort; the text already arrived
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    setMessages((m) => [...m, { role: 'me', text }]);
    setBusy(true);
    try {
      const r = await api.chat(String(id), text);
      setMessages((m) => [...m, { role: 'them', text: r.text, citations: r.citations }]);
      if (r.audio_b64) void playAudio(r.audio_b64);
    } catch {
      setMessages((m) => [...m, { role: 'them', text: '… I could not reach my memories just now. Try again?' }]);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  const departed = persona?.kind === 'departed';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: persona?.name ?? '…' }} />

      <View style={styles.stage}>
        <Avatar glyph={departed ? '🕯️' : '🧠'} size={92} departed={departed} glow />
        <Text style={[type.dim, { marginTop: 10 }]}>
          {departed
            ? persona?.has_voice
              ? '🕯️ a living memory · speaks in their own voice'
              : '🕯️ a living memory'
            : 'your digital mind'}
        </Text>
      </View>

      <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={{ padding: spacing.m }}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'me' ? styles.mine : styles.theirs]}>
            <Text style={[type.body, m.role === 'me' && { color: colors.bg }]}>{m.text}</Text>
            {m.citations && m.citations.length > 0 && (
              <Text style={styles.cite}>from: {m.citations.slice(0, 2).join(' · ')}</Text>
            )}
          </View>
        ))}
        {busy && <Text style={[type.dim, { marginLeft: 4 }]}>remembering…</Text>}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Say something…"
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
  bubble: { borderRadius: 16, padding: 12, marginBottom: 10, maxWidth: '84%' },
  mine: { backgroundColor: colors.gold, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  cite: { color: colors.textDim, fontSize: 11, marginTop: 6 },
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
