import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { legacyRules } from '@/mock';
import { colors, spacing, type } from '@/theme';

// LEGACY — "if I die, everything remains". The protocol status, the rules
// (who gets what, when, how), verifiers and time capsules.
// (docs/LEGACY_PROTOCOL.md)
export default function LegacyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.statusCard}>
        <Text style={[type.label, { color: colors.life }]}>Protocol status</Text>
        <Text style={[type.h2, { marginTop: 6 }]}>🟢 Active — all is well</Text>
        <Text style={[type.dim, { marginTop: 6 }]}>
          Check-in: automatic when you open the app · 3 trusted verifiers · 14-day grace
          period. Your family can never be locked out, and no one can trigger this while
          you live.
        </Text>
      </Card>

      <Text style={[type.label, { marginTop: spacing.m, marginBottom: spacing.s }]}>
        Who receives what
      </Text>
      {legacyRules.map((r) => (
        <Card key={r.id}>
          <Text style={type.body}>{r.what}</Text>
          <Text style={[type.dim, { marginTop: 4 }]}>
            → {r.who} · {r.when}
          </Text>
          <Text style={styles.how}>
            {r.how === 'by_avatar' && '🧠 Delivered in person, by your avatar'}
            {r.how === 'raw' && '📦 Delivered as files'}
            {r.how === 'time_capsule' && '🕰️ Time capsule — plays at the moment you chose'}
          </Text>
        </Card>
      ))}

      <Card style={{ borderColor: colors.goldSoft }}>
        <Text style={type.body}>＋ Add a rule</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>
          Any item, folder or secret → any person → any moment. Delivered raw, by your
          avatar, or as a time capsule.
        </Text>
      </Card>

      <Text style={[type.label, { marginTop: spacing.m, marginBottom: spacing.s }]}>Verifiers</Text>
      <Card>
        <Text style={type.body}>Maria · Dan · Notary Popescu</Text>
        <Text style={[type.dim, { marginTop: 4 }]}>
          2 of 3 must confirm, then 14 days of grace, before anything unseals.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xl },
  statusCard: { borderColor: colors.life, backgroundColor: colors.surface },
  how: { color: colors.gold, fontSize: 13, marginTop: 8 },
});
