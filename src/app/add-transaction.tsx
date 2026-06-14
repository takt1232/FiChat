import { useState, useCallback, useMemo } from 'react';
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
import { formatDate } from '@/constants/format';
import { formatCurrency } from '@/constants/currency';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useTransactions } from '@/hooks/use-transactions';
import { useCategories } from '@/hooks/use-categories';
import { useRecurring } from '@/hooks/use-recurring';
import { scheduleRecurringNotification } from '@/services/notifications';
import { Account, Category, TransactionType, RecurringFrequency } from '@/types';

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
  const { getById: getRecurring, create: createRecurring } = useRecurring();

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
  const [repeatFreq, setRepeatFreq] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [repeatHour, setRepeatHour] = useState(9);
  const [repeatMinute, setRepeatMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    'category' | 'fromAccount' | 'toAccount' | null
  >(null);

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

  const timeStr = useMemo(
    () => `${String(repeatHour).padStart(2, '0')}:${String(repeatMinute).padStart(2, '0')}`,
    [repeatHour, repeatMinute],
  );

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const computeNextDueDate = useCallback(() => {
    if (repeatFreq === 'none') return null;
    const now = new Date();
    const time = new Date(now);
    time.setHours(repeatHour, repeatMinute, 0, 0);

    if (repeatFreq === 'daily') {
      const next = new Date(now);
      next.setHours(repeatHour, repeatMinute, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      return next.toISOString().split('T')[0];
    }

    if (repeatFreq === 'weekly') {
      if (selectedDays.size === 0) return null;
      const today = now.getDay();
      const sorted = [...selectedDays].sort((a, b) => a - b);
      for (const d of sorted) {
        let diff = d - today;
        if (diff < 0) diff += 7;
        const next = new Date(now);
        next.setDate(next.getDate() + diff);
        next.setHours(repeatHour, repeatMinute, 0, 0);
        if (next > now) return next.toISOString().split('T')[0];
      }
      const next = new Date(now);
      next.setDate(next.getDate() + (7 - today + sorted[0]));
      next.setHours(repeatHour, repeatMinute, 0, 0);
      return next.toISOString().split('T')[0];
    }

    if (repeatFreq === 'monthly') {
      const dayOfMonth = date.getDate();
      const next = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, repeatHour, repeatMinute, 0, 0);
      if (next <= now) next.setMonth(next.getMonth() + 1);
      return next.toISOString().split('T')[0];
    }

    return null;
  }, [repeatFreq, selectedDays, date, repeatHour, repeatMinute]);

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

    if (repeatFreq !== 'none') {
      if (repeatFreq === 'weekly' && selectedDays.size === 0) {
        Alert.alert('Please select at least one day');
        return;
      }
      if (repeatFreq === 'monthly' && (date.getDate() < 1 || date.getDate() > 28)) {
        Alert.alert('Please select a valid day of month (1-28) on the date picker');
        return;
      }
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

      if (repeatFreq !== 'none' && !recurringId) {
        const nextDue = computeNextDueDate();
        if (!nextDue) {
          Alert.alert('Could not compute next due date');
          setSaving(false);
          return;
        }
        const daysOfWeek =
          repeatFreq === 'weekly'
            ? [...selectedDays].reduce((mask, d) => mask | (1 << d), 0)
            : 0;
        const created = await createRecurring({
          label: note || `${type.charAt(0).toUpperCase() + type.slice(1)} - ${formatCurrency(parsed)}`,
          type,
          amount: parsed,
          category_id: categoryId,
          from_account_id: type === 'expense' ? fromAccountId : type === 'transfer' ? fromAccountId : null,
          to_account_id: type === 'income' ? toAccountId : type === 'transfer' ? toAccountId : null,
          note,
          frequency: repeatFreq as RecurringFrequency,
          day_of_week: daysOfWeek || null,
          next_due_date: nextDue,
        });
        if (created) {
          scheduleRecurringNotification(created, note || 'Untitled', nextDue, timeStr);
        }
      }

      router.back();
    } finally {
      setSaving(false);
    }
  }, [amount, type, date, fromAccountId, toAccountId, categoryId, note, create, repeatFreq, recurringId, selectedDays, computeNextDueDate, timeStr]);

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

          {!recurringId && (
            <>
              <View style={styles.repeatLabel}>
                <ThemedText type="smallBold">Repeat</ThemedText>
              </View>
              <View style={styles.freqRow}>
                {(['none', 'daily', 'weekly', 'monthly'] as const).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setRepeatFreq(f)}
                    style={[
                      styles.freqBtn,
                      {
                        backgroundColor:
                          repeatFreq === f ? theme.accent : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{
                        color: repeatFreq === f ? '#fff' : theme.textSecondary,
                      }}
                    >
                      {f === 'none' ? 'None' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {repeatFreq === 'weekly' && (
                <View style={styles.dayRow}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (label, i) => (
                      <Pressable
                        key={i}
                        onPress={() => toggleDay(i)}
                        style={[
                          styles.dayPill,
                          {
                            backgroundColor: selectedDays.has(i)
                              ? theme.accent
                              : theme.border,
                          },
                        ]}
                      >
                        <ThemedText
                          type="smallBold"
                          style={{
                            color: selectedDays.has(i)
                              ? '#fff'
                              : theme.textSecondary,
                          }}
>
                          {label}
                        </ThemedText>
                      </Pressable>
                    ),
                  )}
                </View>
              )}

              {repeatFreq !== 'none' && (
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  style={[styles.pickerBtn, { backgroundColor: theme.border }]}
                >
                  <ThemedText>{timeStr}</ThemedText>
                </Pressable>
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={
                    new Date(
                      2024,
                      0,
                      1,
                      repeatHour,
                      repeatMinute,
                    )
                  }
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onValueChange={(
                    _: DateTimePickerChangeEvent,
                    selected?: Date,
                  ) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (selected) {
                      setRepeatHour(selected.getHours());
                      setRepeatMinute(selected.getMinutes());
                    }
                  }}
                />
              )}
            </>
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
  repeatLabel: { marginTop: Spacing.sm },
  freqRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  freqBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  dayRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dayPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
