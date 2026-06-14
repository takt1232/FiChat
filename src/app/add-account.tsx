import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { AccountType } from '@/types';
import { ACCOUNT_ICONS } from '@/constants/categories';

export default function AddAccountScreen() {
  const theme = useTheme();
  const { create } = useAccounts();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [balance, setBalance] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ACCOUNT_ICONS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await create({
        name: name.trim(),
        type,
        balance: parseFloat(balance) || 0,
        icon: selectedIcon.icon,
        color: selectedIcon.color,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }, [name, type, balance, selectedIcon, create]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle" style={styles.title}>Add Account</ThemedText>

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          placeholder="Account Name"
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.field}>
          <ThemedText type="smallBold">Account Type</ThemedText>
          <View style={styles.chipRow}>
            {ACCOUNT_ICONS.map((a) => (
              <Pressable
                key={a.type}
                onPress={() => { setType(a.type as AccountType); setSelectedIcon(a); }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: type === a.type ? a.color : theme.backgroundElement,
                  },
                ]}
              >
                <ThemedText type="small">{a.icon} {a.type}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          placeholder="Initial Balance (₱0.00)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          value={balance}
          onChangeText={setBalance}
        />

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveBtn,
            { backgroundColor: theme.text, opacity: saving ? 0.5 : 1 },
          ]}
        >
          <ThemedText
            type="smallBold"
            style={{ color: theme.background, textAlign: 'center' }}
          >
            {saving ? 'Saving...' : 'Save Account'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { marginBottom: Spacing.two },
  input: {
    fontSize: 16,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  field: { gap: Spacing.one },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  saveBtn: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    marginTop: Spacing.two,
  },
});
