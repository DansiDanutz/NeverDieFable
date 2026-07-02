import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/api';
import { colors } from '@/theme';

// VOICE ENROLLMENT — the moment a memory learns to speak.
// One clean sample (~30–60s of the person talking) is enough for an instant
// clone; from then on every chat reply is spoken in their own voice. For a
// departed loved one this is the sample recovered from a voicemail or home
// video; for yourself, you simply read the prompt aloud.
//
// Tap to record, tap to stop → the clip uploads to /personas/{id}/voice/clone
// and the persona speaks from the very next message.

type State = 'idle' | 'recording' | 'uploading' | 'done' | 'error';

const PROMPTS = {
  self: 'Read this aloud, unhurried:\n“This is my voice, kept so my mind can\nalways speak to the people I love.”',
  departed:
    'Play or hold up a clear recording of their\nvoice — a voicemail, a home video, a\nvoice note. 30 seconds of clean speech is\nenough to bring it back.',
};

export function VoiceEnroll({
  personaId,
  departed,
  onEnrolled,
}: {
  personaId: string;
  departed: boolean;
  onEnrolled: () => void;
}) {
  const [state, setState] = useState<State>('idle');
  const [elapsed, setElapsed] = useState(0);
  const rec = useRef<Audio.Recording | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      rec.current?.stopAndUnloadAsync().catch(() => {});
    },
    [],
  );

  const start = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setState('error');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const r = new Audio.Recording();
      await r.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await r.startAsync();
      rec.current = r;
      setElapsed(0);
      setState('recording');
      timer.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      setState('error');
    }
  };

  const stop = async () => {
    if (timer.current) clearInterval(timer.current);
    const r = rec.current;
    rec.current = null;
    if (!r) return;
    setState('uploading');
    try {
      await r.stopAndUnloadAsync();
      const uri = r.getURI();
      if (!uri) throw new Error('no recording');
      await api.cloneVoice(personaId, uri, 'audio/m4a');
      setState('done');
      onEnrolled();
    } catch {
      setState('error');
    }
  };

  const accent = departed ? colors.memory : colors.gold;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  if (state === 'done') {
    return (
      <Text style={[styles.note, { color: accent }]}>
        ✓ Voice enrolled — they’ll speak from the next message.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      {state === 'idle' && (
        <Text style={styles.prompt}>{departed ? PROMPTS.departed : PROMPTS.self}</Text>
      )}
      {state === 'recording' && (
        <Text style={[styles.timer, { color: accent }]}>● {mm}:{ss}</Text>
      )}
      {state === 'error' && (
        <Text style={styles.err}>Couldn’t capture that — check mic access and try again.</Text>
      )}

      <Text
        style={[
          styles.btn,
          { borderColor: accent, color: accent },
          state === 'recording' && { backgroundColor: accent, color: colors.bg },
        ]}
        onPress={
          state === 'idle' || state === 'error'
            ? start
            : state === 'recording'
              ? stop
              : undefined
        }
      >
        {state === 'idle' && (departed ? '🎙️ Give them their voice back' : '🎙️ Teach me your voice')}
        {state === 'recording' && '■ Stop & bring the voice to life'}
        {state === 'uploading' && 'Cloning the voice…'}
        {state === 'error' && '🎙️ Try again'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 12, paddingHorizontal: 24 },
  prompt: {
    color: colors.textDim,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 12,
  },
  timer: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  btn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 18,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
    textAlign: 'center',
  },
  note: { fontSize: 12.5, marginTop: 12, fontWeight: '600', textAlign: 'center' },
  err: { color: colors.danger, fontSize: 12, textAlign: 'center', marginBottom: 10 },
});
