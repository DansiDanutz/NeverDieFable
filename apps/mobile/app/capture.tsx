import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/Card';
import { colors, spacing, type } from '@/theme';

// CAPTURE — one modal for keeping anything. Everything is encrypted
// on-device before upload; live recordings transcribe on the phone
// (whisper.cpp) and only encrypted text syncs by default.
const OPTIONS = [
  { icon: '📷', title: 'Photo or scan', detail: 'Camera, document scanner, or import from your gallery.' },
  { icon: '🎙️', title: 'Record a conversation', detail: 'Meetings and calls — transcribed on your phone, filed by the AI with who said what.' },
  { icon: '🎤', title: 'Voice note', detail: 'A thought, a story, a memory. Also teaches your voice to your Mind.' },
  { icon: '📄', title: 'Document or email', detail: 'Files, mail archives, WhatsApp exports — bulk import supported.' },
  { icon: '🔐', title: 'A secret', detail: 'Sealed even from us. Opens only for whom you choose, when you choose.' },
  { icon: '🕰️', title: 'Time capsule', detail: 'A message for the future — delivered by your avatar at the moment you pick.' },
];

export default function Capture() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {OPTIONS.map((o) => (
        <Card key={o.title}>
          <Text style={type.body}>
            {o.icon}  {o.title}
          </Text>
          <Text style={[type.dim, { marginTop: 4 }]}>{o.detail}</Text>
        </Card>
      ))}
      <Text style={[type.dim, { marginTop: spacing.s }]}>
        🔒 Encrypted on this phone before it goes anywhere. Only you hold the key.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xl, backgroundColor: colors.bg },
});
