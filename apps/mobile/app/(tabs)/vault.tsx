import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/Card';
import { recentVault } from '@/mock';
import { colors, spacing, type } from '@/theme';

// VAULT — store everything, ask anything.
// The search bar is the product: natural questions over your whole life,
// answered with cited sources (services/ai/memory.py).
export default function VaultScreen() {
  const [query, setQuery] = useState('');
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.search}
        placeholder='Ask anything… “photos with Mom at the sea”'
        placeholderTextColor={colors.textDim}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        // TODO: onSubmitEditing → api.askVault(query)
      />

      <View style={styles.filters}>
        {['All', 'Photos', 'Voices', 'Meetings', 'Documents', '🔐 Secrets'].map((f, i) => (
          <Text key={f} style={[styles.filter, i === 0 && styles.filterActive]}>{f}</Text>
        ))}
      </View>

      <Text style={[type.label, { marginBottom: spacing.s }]}>Recent</Text>
      {recentVault.map((v) => (
        <Card key={v.id}>
          <View style={styles.row}>
            <Text style={{ fontSize: 22 }}>{v.icon}</Text>
            <View style={{ flex: 1, marginLeft: spacing.m }}>
              <Text style={type.body}>{v.title}</Text>
              <Text style={[type.dim, { marginTop: 2 }]}>
                {v.when}
                {v.people.length > 0 ? ` · with ${v.people.join(', ')}` : ''}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.m, paddingBottom: spacing.xl },
  search: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    color: colors.text,
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: spacing.m,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.l },
  filter: {
    color: colors.textDim,
    fontSize: 13,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterActive: { color: colors.bg, backgroundColor: colors.gold, borderColor: colors.gold, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
