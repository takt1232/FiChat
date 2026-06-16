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
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/card';
import { PickerModal, PickerOption } from '@/components/picker-modal';
import { Spacing, Radii } from '@/constants/theme';
import { formatDate, computeNextDate } from '@/constants/format';
import { scheduleRecurringNotification } from '@/services/notifications';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useTransactions } from '@/hooks/use-transactions';
import { useCategories } from '@/hooks/use-categories';
import { useRecurring } from '@/hooks/use-recurring';
import { Account, Category, TransactionType } from '@/types';

const TX_TYPES: { key: TransactionType; label: string }[] = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
  { key: 'transfer', label: 'Transfer' },
];

export default function AddTransactionScreen() {
  const { recurringId } = useLocalSearchParams<{ recurringId?: string }>();
  const theme = useTheme();
  const { create } = useTransactions();
  const { list: listAccounts } = useAccounts();
  const { list: listCategories } = useCategories();
  const { getById: getRecurring, update: updateRecurring } = useRecurring();

  const [type, setType] = useState<TransactionType>('expense');
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
  const [recurringConfig, setRecurringConfig] = useState<{
    frequency: 'daily' | 'weekly' | 'monthly';
    day_of_week: number | null;
    day_of_month: number | null;
    notification_hour: number;
    notification_minute: number;
    notification_time: string;
    label: string;
  } | null>(null);

  useState(() => {
    listAccounts().then(setAccounts);
    listCategories().then(setCategories);
  });

  useFocusEffect(
    useCallback(() => {
      if (!recurringId) return;
      const id = parseInt(recurringId, 10);
      if (isNaN(id)) return;
      getRecurring(id).then((r) => {
        if (!r) return;
        setType(r.type);
        setAmount(r.amount.toString());
        setCategoryId(r.category_id);
        setFromAccountId(r.from_account_id);
        setToAccountId(r.to_account_id);
        setNote(r.note);
        const [h = '9', m = '0'] = (r.notification_time ?? '09:00').split(':');
        setRecurringConfig({
          frequency: r.frequency as 'daily' | 'weekly' | 'monthly',
          day_of_week: r.day_of_week,
          day_of_month: r.day_of_month,
          notification_hour: parseInt(h, 10),
          notification_minute: parseInt(m, 10),
          notification_time: r.notification_time ?? '09:00',
          label: r.label,
        });
      });
    }, [recurringId, getRecurring]),
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
    if (type === 'income' && !toAccountId) {
      Alert.alert('Please select an account');
      return;
    }
    if (type === 'expense' && !fromAccountId) {
      Alert.alert('Please select an account');
      return;
    }
    if (type === 'transfer' && (!fromAccountId || !toAccountId)) {
      Alert.alert('Please select both accounts');
      return;
    }

    setSaving(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      await create({
        type,
        amount: parsed,
        category_id: categoryId,
        note,
        date: dateStr,
        from_account_id: type === 'expense' ? fromAccountId : type === 'transfer' ? fromAccountId : null,
        to_account_id: type === 'income' ? toAccountId : type === 'transfer' ? toAccountId : null,
      });

      if (recurringId && recurringConfig) {
        const nextDate = computeNextDate(
          recurringConfig.frequency,
          recurringConfig.day_of_week,
          recurringConfig.day_of_month,
          recurringConfig.notification_hour,
          recurringConfig.notification_minute,
        );
        if (nextDate) {
          await updateRecurring(parseInt(recurringId, 10), { next_due_date: nextDate });
          scheduleRecurringNotification(
            parseInt(recurringId, 10),
            recurringConfig.label,
            nextDate,
            recurringConfig.notification_time,
          );
        }
      }

      router.back();
    } finally {
      setSaving(false);
    }
  }, [amount, type, date, fromAccountId, toAccountId, categoryId, note, create, recurringId, recurringConfig, updateRecurring]);

  const filteredCategories = categories.filter((c) => c.type === (type === 'transfer' ? 'expense' : type));

  const categoryOptions: PickerOption[] = filteredCategories.map((c) => ({
    id: c.id,
    label: c.name,
    icon: c.icon,
    color: c.color,
  }));

  const accountOptions: PickerOption[] = accounts.map((a) => ({
    id: a.id,
    label: a.name,
    icon: a.icon,
    color: a.color,
  }));

  const isExpense = type === 'expense';
  const isIncome = type === 'income';
  const isTransfer = type === 'transfer';

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.typeRow}>
            {TX_TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => {
                  setType(t.key);
                  setCategoryId(null);
                }}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor:
                      type === t.key ? theme.accent : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={{
                    color: type === t.key ? '#fff' : theme.textSecondary,
                  }}
                >
                  {t.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

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
                  color: categoryId ? theme.text : theme.textTertiary,
                }}
              >
                {categoryId
                  ? `${filteredCategories.find((c) => c.id === categoryId)?.icon} ${filteredCategories.find((c) => c.id === categoryId)?.name}`
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
                  color: fromAccountId ? theme.text : theme.textTertiary,
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
                  color: toAccountId ? theme.text : theme.textTertiary,
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
            <ThemedText>
              {formatDate(date.toISOString().split('T')[0])}
            </ThemedText>
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

          {recurringId && (
            <View style={styles.advanceNotice}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                This transaction was pre-filled from a recurring template. After saving, the next due date will be advanced automatically.
              </ThemedText>
            </View>
          )}

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[
              styles.saveBtn,
              { backgroundColor: theme.accent, opacity: saving ? 0.5 : 1 },
            ]}
          >
            <ThemedText type="smallBold" style={styles.saveText}>
              {saving ? 'Saving...' : 'Save Transaction'}
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
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.button,
    alignItems: 'center',
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
  advanceNotice: {
    padding: Spacing.lg,
    borderRadius: Radii.input,
    borderWidth: 1,
    borderColor: 'rgba(0,196,180,0.3)',
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
