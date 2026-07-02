import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { api, LegacyRule, LegacyState } from '@/api';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { legacyRules as demoRules } from '@/mock';
import { colors, spacing, type } from '@/theme';

// LEGACY — "if I die, everything remains". Live protocol status, rules,
// verifiers. A check-in fires on open (passive: any activity resets the clock).
const STAGE_UI: Record<string, { color: string; label: string }> = {
  active: { color: colors.life, label: '🟢 Active — all is well' },
  unreachable: { color: colors.gold, label: '🟡 Checking in with you' },
  verification: { color: colors.gold, label: '🟠 Verification in progress' },
  grace: { color: colors.danger, label: '🟠 Grace period — you can still abort' },
  unsealed: { color: colors.memory, label: '🕊️ Legacy delivered' },
};

const DELIVERY: Record<string, string> = {
  by_avatar: '🧠 Delivered in person, by your avatar',
  raw: '📦 Delivered as files',
  time_capsule: '🕰️ Time capsule — plays at the moment you chose',
};

export default function LegacyScreen() {
  const [state, setState] = useState<LegacyState | null>(null);
  const [rules, setRules] = useState<LegacyRule[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Passive check-in resets the death-detection clock, then load state.
    api.legacyCheckin().catch(() => {});
    Promise.all([api.legacyState(), api.legacyRules()])
      .then(([s, r]) => { setState(s); setRules(r.rules); })
      .catch(() => {
        setOffline(true);
        setRules(demoRules.map((d) => ({
          id: d.id, heir_name: d.who, trigger: d.when, delivery: d.how as LegacyRule['delivery'],
          note: null, executed_at: null,
        })));
      });
  }, []);

  const stage = state ? STAGE_UI[state.stage] ?? STAGE_UI.active : STAGE_UI.active;

  return (
    <Screen>
      <Card variant="life" style={{ borderColor: stage.color }}>
        <Text style={[type.label, { color: stage.color }]}>Protocol status</Text>
        <Text style={[type.h2, { marginTop: 6 }]}>{stage.label}</Text>
        <Text style={[type.dim, { marginTop: 6 }]}>
          {state
            ? `${state.verifiers} trusted verifier${state.verifiers === 1 ? '' : 's'} · ${state.quorum}-of-quorum · ${state.grace_days}-day grace. No one can trigger this while you live.`
            : 'Check-in is automatic when you open the app. Your family can never be locked out.'}
        </Text>
      </Card>
      {offline && (
        <Text style={[type.dim, { color: colors.gold, marginBottom: spacing.s }]}>⚠ Example data — backend not reachable.</Text>
      )}

      <Text style={[type.label, { marginTop: spacing.m, marginBottom: spacing.s }]}>Who receives what</Text>
      {(rules ?? []).map((r) => (
        <Card key={r.id}>
          <Text style={type.body}>{r.heir_name ?? 'An heir'}</Text>
          <Text style={[type.dim, { marginTop: 4 }]}>{r.trigger.replace('_', ' ')}</Text>
          <Text style={styles.how}>{DELIVERY[r.delivery] ?? r.delivery}</Text>
          {r.executed_at && <Text style={[type.dim, { color: colors.memory, marginTop: 4 }]}>✓ delivered</Text>}
        </Card>
      ))}
      {rules?.length === 0 && (
        <Card variant="gold">
          <Text style={type.body}>＋ Add your first rule</Text>
          <Text style={[type.dim, { marginTop: 4 }]}>
            Any item, folder or secret → any person → any moment. Delivered raw, by your avatar,
            or as a time capsule.
          </Text>
        </Card>
      )}

      <Text style={[type.label, { marginTop: spacing.m, marginBottom: spacing.s }]}>Trusted verifiers</Text>
      <Card>
        <Text style={type.dim}>
          {state && state.verifiers > 0
            ? `${state.verifiers} chosen · ${state.quorum} must confirm, then ${state.grace_days} days of grace, before anything unseals.`
            : 'Add 3 people you trust. A quorum must confirm, then a grace period, before anything is ever delivered.'}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  how: { color: colors.gold, fontSize: 13, marginTop: 8 },
});
