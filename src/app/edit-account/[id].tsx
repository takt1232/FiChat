import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/card';
import { Spacing, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { Account } from '@/types';

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { getById, update, remove } = useAccounts();

  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const accountId = parseInt(id, 10);
      getById(accountId).then((acc) => {
        if (acc) {
          setAccount(acc);
          setName(acc.name);
          setBalance(acc.balance.toString());
        }
      });
    }, [id, getById]),
  );

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    const accountId = parseInt(id, 10);
    setSaving(true);
    try {
      await update(accountId, {
        name: name.trim(),
        balance: parseFloat(balance) || 0,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }, [name, balance, id, update]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const accountId = parseInt(id, 10);
            await remove(accountId);
            router.back();
          },
        },
      ],
    );
  }, [id, account, remove]);

  if (!account) return null;

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: 'Edit Account' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card>
          <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
            ACCOUNT NAME
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.border, color: theme.text }]}
            placeholder="Account name"
            placeholderTextColor={theme.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </Card>

        <Card>
          <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
            BALANCE
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
            {saving ? 'Saving...' : 'Save Changes'}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          style={[styles.deleteBtn, { borderColor: theme.expense }]}
        >
          <ThemedText type="smallBold" style={[styles.deleteText, { color: theme.expense }]}>
            Delete Account
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
  saveBtn: {
    paddingVertical: Spacing.lg,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  deleteBtn: {
    paddingVertical: Spacing.lg,
    borderRadius: Radii.button,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteText: {
    fontSize: 15,
  },
});
