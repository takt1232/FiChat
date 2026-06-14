import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useTransactions } from '@/hooks/use-transactions';
import { useCategories } from '@/hooks/use-categories';
import { Account, Category, TransactionType } from '@/types';

const TX_TYPES: { key: TransactionType; label: string }[] = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
  { key: 'transfer', label: 'Transfer' },
];

export default function AddTransactionScreen() {
  const theme = useTheme();
  const { create } = useTransactions();
  const { list: listAccounts } = useAccounts();
  const { list: listCategories } = useCategories();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [fromAccountId, setFromAccountId] = useState<number | null>(null);
  const [toAccountId, setToAccountId] = useState<number | null>(null);
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
    if (type === 'transfer' && (!fromAccountId || !toAccountId)) return;
    if (type !== 'transfer' && type === 'expense' && !fromAccountId) return;
    if (type !== 'transfer' && type === 'income' && !toAccountId) return;

    setSaving(true);
    try {
      await create({
        type,
        amount: parsed,
        category_id: type !== 'transfer' ? categoryId : null,
        note,
        date,
        from_account_id: type === 'expense' ? fromAccountId : type === 'transfer' ? fromAccountId : null,
        to_account_id: type === 'income' ? toAccountId : type === 'transfer' ? toAccountId : null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }, [amount, type, fromAccountId, toAccountId, categoryId, note, date, create]);

  const filteredCategories = categories.filter((c) => c.type === (type === 'transfer' ? 'expense' : type));

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle" style={styles.title}>Add Transaction</ThemedText>

        <View style={styles.typeRow}>
          {TX_TYPES.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => { setType(t.key); setCategoryId(null); }}
              style={[
                styles.typeBtn,
                {
                  backgroundColor: type === t.key ? theme.backgroundSelected : theme.backgroundElement,
                },
              ]}
            >
              <ThemedText
                type="smallBold"
                style={type === t.key ? { color: theme.text } : { color: theme.textSecondary }}
              >
                {t.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          placeholder="0.00"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        {type !== 'transfer' ? (
          <View style={styles.chipRow}>
            {filteredCategories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: categoryId === cat.id ? cat.color : theme.backgroundElement,
                  },
                ]}
              >
                <ThemedText type="small">
                  {cat.icon} {cat.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}

        {type === 'expense' || type === 'transfer' ? (
          <View style={styles.field}>
            <ThemedText type="smallBold">From Account</ThemedText>
            <View style={styles.chipRow}>
              {accounts.map((acc) => (
                <Pressable
                  key={acc.id}
                  onPress={() => setFromAccountId(fromAccountId === acc.id ? null : acc.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: fromAccountId === acc.id ? acc.color : theme.backgroundElement,
                    },
                  ]}
                >
                  <ThemedText type="small">{acc.icon} {acc.name}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {type === 'income' || type === 'transfer' ? (
          <View style={styles.field}>
            <ThemedText type="smallBold">To Account</ThemedText>
            <View style={styles.chipRow}>
              {accounts.map((acc) => (
                <Pressable
                  key={acc.id}
                  onPress={() => setToAccountId(toAccountId === acc.id ? null : acc.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: toAccountId === acc.id ? acc.color : theme.backgroundElement,
                    },
                  ]}
                >
                  <ThemedText type="small">{acc.icon} {acc.name}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          placeholder="Note (optional)"
          placeholderTextColor={theme.textSecondary}
          value={note}
          onChangeText={setNote}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.textSecondary}
          value={date}
          onChangeText={setDate}
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
            {saving ? 'Saving...' : 'Save Transaction'}
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
  typeRow: { flexDirection: 'row', gap: Spacing.one },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  input: {
    fontSize: 24,
    fontWeight: '700',
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  field: { gap: Spacing.one },
  saveBtn: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    marginTop: Spacing.two,
  },
});
