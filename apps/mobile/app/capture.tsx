import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '@/api';
import { Card } from '@/components/Card';
import { colors, spacing, type } from '@/theme';

// CAPTURE — one modal for keeping anything. Files upload straight to the
// private vault bucket via one-time signed URLs.
export default function Capture() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  const finish = (msg: string) => {
    setStatus(msg);
    setTimeout(() => router.back(), 1200);
  };

  const keepPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (res.canceled || !res.assets[0]) return;
    const a = res.assets[0];
    setStatus('Encrypting & uploading…');
    try {
      await api.uploadItem({
        kind: a.type === 'video' ? 'video' : 'photo',
        title: a.fileName ?? 'Photo',
        uri: a.uri,
        mimeType: a.mimeType ?? 'image/jpeg',
      });
      finish('✓ Kept forever');
    } catch {
      setStatus('⚠ Upload failed — is the backend running?');
    }
  };

  const keepDocument = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.canceled || !res.assets[0]) return;
    const a = res.assets[0];
    setStatus('Encrypting & uploading…');
    try {
      const isAudio = (a.mimeType ?? '').startsWith('audio');
      await api.uploadItem({
        kind: isAudio ? 'audio' : 'document',
        title: a.name,
        uri: a.uri,
        mimeType: a.mimeType ?? 'application/octet-stream',
      });
      finish('✓ Kept forever');
    } catch {
      setStatus('⚠ Upload failed — is the backend running?');
    }
  };

  const OPTIONS = [
    { icon: '🖼️', title: 'Photo or video', detail: 'From your gallery. Faces are recognized and filed by person.', action: keepPhoto },
    { icon: '📄', title: 'Document or audio file', detail: 'Files, voicemails, exports. A voicemail of a loved one can become their voice.', action: keepDocument },
    { icon: '🎙️', title: 'Record a conversation', detail: 'Coming next: on-phone transcription, filed with who said what.', action: undefined },
    { icon: '🔐', title: 'A secret', detail: 'Coming next: sealed even from us; opens only for whom you choose.', action: undefined },
    { icon: '🕰️', title: 'Time capsule', detail: 'Coming next: a message delivered by your avatar at the moment you pick.', action: undefined },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {status && (
        <Card style={{ borderColor: colors.gold }}>
          <Text style={type.body}>{status}</Text>
        </Card>
      )}
      {OPTIONS.map((o) => (
        <Card key={o.title} onPress={o.action} style={o.action ? undefined : { opacity: 0.5 }}>
          <Text style={type.body}>
            {o.icon}  {o.title}
          </Text>
          <Text style={[type.dim, { marginTop: 4 }]}>{o.detail}</Text>
        </Card>
      ))}
      <Text style={[type.dim, { marginTop: spacing.s }]}>
        🔒 Uploads go straight to your private vault. Only you hold the key.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xl, backgroundColor: colors.bg },
});
