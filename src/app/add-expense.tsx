import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/card';
import { Spacing, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useTransactions } from '@/hooks/use-transactions';
import { useCategories } from '@/hooks/use-categories';
import { Account, Category } from '@/types';

export default function AddExpenseScreen() {
  const theme = useTheme();
  const { create } = useTransactions();
  const { list: listAccounts } = useAccounts();
  const { list: listCategories } = useCategories();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [fromAccountId, setFromAccountId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useState(() => {
    listAccounts().then(setAccounts);
    listCategories().then(setCategories);
  });

  const handleSave = useCallback(async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    if (!fromAccountId) return;

    setSaving(true);
    try {
      await create({
        type: 'expense',
        amount: parsed,
        category_id: categoryId,
        note,
        date,
        from_account_id: fromAccountId,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }, [amount, fromAccountId, categoryId, note, date, create]);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: 'Add Expense' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={styles.amountCard}>
          <TextInput
            style={[styles.amountInput, { color: theme.text }]}
            placeholder="0.00"
            placeholderTextColor={theme.textTertiary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
          <ThemedText type="hero" style={[styles.currencySign, { color: theme.textTertiary }]}>₱</ThemedText>
        </Card>

        {expenseCategories.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="smallBold" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              CATEGORY
            </ThemedText>
            <View style={styles.chipRow}>
              {expenseCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: categoryId === cat.id ? cat.color : theme.border,
                    },
                  ]}
                >
                  <ThemedText type="small">
                    {cat.icon} {cat.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText type="smallBold" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            FROM ACCOUNT
          </ThemedText>
          <View style={styles.chipRow}>
            {accounts.map((acc) => (
              <Pressable
                key={acc.id}
                onPress={() => setFromAccountId(fromAccountId === acc.id ? null : acc.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: fromAccountId === acc.id ? acc.color : theme.border,
                  },
                ]}
              >
                <ThemedText type="small">{acc.icon} {acc.name}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            NOTE
          </ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.border, color: theme.text }]}
            placeholder="Add a note..."
            placeholderTextColor={theme.textTertiary}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            DATE
          </ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.border, color: theme.text }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textTertiary}
            value={date}
            onChangeText={setDate}
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveBtn,
            { backgroundColor: theme.accent, opacity: saving ? 0.5 : 1 },
          ]}
        >
          <ThemedText type="smallBold" style={styles.saveText}>
            {saving ? 'Saving...' : 'Save Expense'}
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
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    minWidth: 200,
    fontVariant: ['tabular-nums'],
  },
  currencySign: {
    fontSize: 28,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
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
  textInput: {
    fontSize: 15,
    padding: Spacing.lg,
    borderRadius: Radii.input,
  },
  saveBtn: {
    paddingVertical: Spacing.lg,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
