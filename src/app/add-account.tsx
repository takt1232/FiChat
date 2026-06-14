import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/card';
import { Spacing, Radii } from '@/constants/theme';
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
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card>
          <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
            ACCOUNT NAME
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.border, color: theme.text }]}
            placeholder="e.g. BDO Savings"
            placeholderTextColor={theme.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </Card>

        <Card>
          <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
            TYPE
          </ThemedText>
          <View style={styles.chipRow}>
            {ACCOUNT_ICONS.map((a) => (
              <Pressable
                key={a.type}
                onPress={() => { setType(a.type as AccountType); setSelectedIcon(a); }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: type === a.type ? a.color : theme.border,
                  },
                ]}
              >
                <ThemedText type="small">{a.icon} {a.type}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
            INITIAL BALANCE
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.border, color: theme.text }]}
            placeholder="0.00"
            placeholderTextColor={theme.textTertiary}
            keyboardType="decimal-pad"
            value={balance}
            onChangeText={setBalance}
          />
        </Card>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveBtn,
            { backgroundColor: theme.accent, opacity: saving ? 0.5 : 1 },
          ]}
        >
          <ThemedText type="smallBold" style={styles.saveText}>
            {saving ? 'Saving...' : 'Save Account'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  input: {
    fontSize: 15,
    padding: Spacing.lg,
    borderRadius: Radii.input,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.button,
  },
  saveBtn: {
    paddingVertical: Spacing.lg,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
