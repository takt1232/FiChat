import { useState, useCallback } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/card';
import { PickerModal, PickerOption } from '@/components/picker-modal';
import { Spacing, Radii } from '@/constants/theme';
import { formatDate } from '@/constants/format';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useTransactions, TransactionRow } from '@/hooks/use-transactions';
import { Account, Category } from '@/types';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { getById, update, remove } = useTransactions();
  const { list: listAccounts } = useAccounts();
  const { list: listCategories } = useCategories();

  const [tx, setTx] = useState<TransactionRow | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [fromAccountId, setFromAccountId] = useState<number | null>(null);
  const [toAccountId, setToAccountId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    'category' | 'fromAccount' | 'toAccount' | null
  >(null);

  useFocusEffect(
    useCallback(() => {
      const txId = parseInt(id, 10);
      Promise.all([
        getById(txId),
        listAccounts(),
        listCategories(),
      ]).then(([transaction, accs, cats]) => {
        if (!transaction) return;
        setTx(transaction);
        setAmount(transaction.amount.toString());
        setNote(transaction.note ?? '');
        setDate(new Date(transaction.date + 'T00:00:00'));
        setCategoryId(transaction.category_id);
        setFromAccountId(transaction.from_account_id);
        setToAccountId(transaction.to_account_id);
        setAccounts(accs);
        setCategories(cats);
      });
    }, [id, getById, listAccounts, listCategories]),
  );

  const handleDateChange = useCallback(
    (_: DateTimePickerChangeEvent, selected: Date) => {
      setShowDatePicker(Platform.OS === 'ios');
      setDate(selected);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      Alert.alert('Invalid amount');
      return;
    }
    if (tx?.type === 'income' && !toAccountId) {
      Alert.alert('Please select an account');
      return;
    }
    if (tx?.type === 'expense' && !fromAccountId) {
      Alert.alert('Please select an account');
      return;
    }
    if (tx?.type === 'transfer' && (!fromAccountId || !toAccountId)) {
      Alert.alert('Please select both accounts');
      return;
    }

    setSaving(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      await update(parseInt(id, 10), {
        amount: parsed,
        category_id: categoryId,
        note,
        date: dateStr,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }, [amount, tx, toAccountId, fromAccountId, categoryId, note, date, id, update]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure? This will also adjust the account balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await remove(parseInt(id, 10));
            router.back();
          },
        },
      ],
    );
  }, [id, remove]);

  if (!tx) return null;

  const isExpense = tx.type === 'expense';
  const isIncome = tx.type === 'income';
  const isTransfer = tx.type === 'transfer';

  const categoryOptions: PickerOption[] = categories
    .filter((c) => c.type === (isTransfer ? 'expense' : tx.type))
    .map((c) => ({ id: c.id, label: c.name, icon: c.icon, color: c.color }));

  const accountOptions: PickerOption[] = accounts.map((a) => ({
    id: a.id,
    label: a.name,
    icon: a.icon,
    color: a.color,
  }));

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: 'Edit Transaction' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            <ThemedText
              type="hero"
              style={[styles.currencySign, { color: theme.textTertiary }]}
            >
              ₱
            </ThemedText>
          </Card>

          {!isTransfer && (
            <Pressable
              onPress={() => setPickerTarget('category')}
              style={[styles.pickerBtn, { backgroundColor: theme.border }]}
            >
              <ThemedText
                style={{
                  color: categoryId
                    ? theme.text
                    : theme.textTertiary,
                }}
              >
                {categoryId
                  ? `${categories.find((c) => c.id === categoryId)?.icon} ${categories.find((c) => c.id === categoryId)?.name}`
                  : 'Select category'}
              </ThemedText>
            </Pressable>
          )}

          {(isExpense || isTransfer) && (
            <Pressable
              onPress={() => setPickerTarget('fromAccount')}
              style={[styles.pickerBtn, { backgroundColor: theme.border }]}
            >
              <ThemedText
                style={{
                  color: fromAccountId
                    ? theme.text
                    : theme.textTertiary,
                }}
              >
                {fromAccountId
                  ? `${accounts.find((a) => a.id === fromAccountId)?.icon} ${accounts.find((a) => a.id === fromAccountId)?.name}`
                  : 'Select from account'}
              </ThemedText>
            </Pressable>
          )}

          {(isIncome || isTransfer) && (
            <Pressable
              onPress={() => setPickerTarget('toAccount')}
              style={[styles.pickerBtn, { backgroundColor: theme.border }]}
            >
              <ThemedText
                style={{
                  color: toAccountId
                    ? theme.text
                    : theme.textTertiary,
                }}
              >
                {toAccountId
                  ? `${accounts.find((a) => a.id === toAccountId)?.icon} ${accounts.find((a) => a.id === toAccountId)?.name}`
                  : 'Select to account'}
              </ThemedText>
            </Pressable>
          )}

          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[styles.pickerBtn, { backgroundColor: theme.border }]}
          >
            <ThemedText>{formatDate(date.toISOString().split('T')[0])}</ThemedText>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onValueChange={handleDateChange}
            />
          )}

          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.border, color: theme.text },
            ]}
            placeholder="Add a note..."
            placeholderTextColor={theme.textTertiary}
            value={note}
            onChangeText={setNote}
            multiline
          />

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
            <ThemedText
              type="smallBold"
              style={[styles.deleteText, { color: theme.expense }]}
            >
              Delete Transaction
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        visible={pickerTarget === 'category'}
        title="Select Category"
        options={categoryOptions}
        selectedId={categoryId}
        onSelect={setCategoryId}
        onClose={() => setPickerTarget(null)}
      />
      <PickerModal
        visible={pickerTarget === 'fromAccount'}
        title="Select From Account"
        options={accountOptions}
        selectedId={fromAccountId}
        onSelect={setFromAccountId}
        onClose={() => setPickerTarget(null)}
      />
      <PickerModal
        visible={pickerTarget === 'toAccount'}
        title="Select To Account"
        options={accountOptions}
        selectedId={toAccountId}
        onSelect={setToAccountId}
        onClose={() => setPickerTarget(null)}
      />
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
  pickerBtn: {
    padding: Spacing.lg,
    borderRadius: Radii.input,
  },
  textInput: {
    fontSize: 15,
    padding: Spacing.lg,
    borderRadius: Radii.input,
    minHeight: 80,
    textAlignVertical: 'top',
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
