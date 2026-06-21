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
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/card';
import { PickerModal, PickerOption } from '@/components/picker-modal';
import { Spacing, Radii } from '@/constants/theme';
import { computeNextDate } from '@/constants/format';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useRecurring } from '@/hooks/use-recurring';
import { scheduleRecurringNotification } from '@/services/notifications';
import { Account, Category, TransactionType, RecurringFrequency } from '@/types';

const TX_TYPES: { key: TransactionType; label: string }[] = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
  { key: 'transfer', label: 'Transfer' },
];

export default function AddRecurringScreen() {
  const theme = useTheme();
  const { create } = useRecurring();
  const { list: listAccounts } = useAccounts();
  const { list: listCategories } = useCategories();

  const [label, setLabel] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [dayOfMonth, setDayOfMonth] = useState(new Date().getDate().toString());
  const [notificationHour, setNotificationHour] = useState(9);
  const [notificationMinute, setNotificationMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [fromAccountId, setFromAccountId] = useState<number | null>(null);
  const [toAccountId, setToAccountId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    'category' | 'fromAccount' | 'toAccount' | null
  >(null);

  useState(() => {
    listAccounts().then(setAccounts);
    listCategories().then(setCategories);
  });

  const timeStr = useMemo(
    () => `${String(notificationHour).padStart(2, '0')}:${String(notificationMinute).padStart(2, '0')}`,
    [notificationHour, notificationMinute],
  );

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const daysOfWeekMask = useMemo(
    () => [...selectedDays].reduce((mask, d) => mask | (1 << d), 0),
    [selectedDays],
  );

  const handleSave = useCallback(async () => {
    if (!label.trim()) {
      Alert.alert('Please enter a label');
      return;
    }
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

    if (frequency === 'weekly' && selectedDays.size === 0) {
      Alert.alert('Please select at least one day');
      return;
    }

    const nextDue = computeNextDate(
      frequency,
      daysOfWeekMask || null,
      parseInt(dayOfMonth, 10) || 1,
      notificationHour,
      notificationMinute,
    );
    if (!nextDue) {
      Alert.alert('Could not compute next due date');
      return;
    }

    setSaving(true);
    try {
      const newId = await create({
        label: label.trim(),
        type,
        amount: parsed,
        category_id: categoryId,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        note,
        frequency,
        day_of_week: daysOfWeekMask || null,
        next_due_date: nextDue,
        notification_time: timeStr,
        day_of_month: frequency === 'monthly' ? parseInt(dayOfMonth, 10) || 1 : null,
      });

      scheduleRecurringNotification(newId, label.trim(), nextDue, timeStr);

      router.back();
    } finally {
      setSaving(false);
    }
  }, [label, type, amount, frequency, selectedDays, dayOfMonth, notificationHour, notificationMinute,
      categoryId, fromAccountId, toAccountId, note, create, daysOfWeekMask, timeStr]);

  const filteredCategories = categories.filter((c) => c.type === (type === 'transfer' ? 'expense' : type));
  const isExpense = type === 'expense';
  const isIncome = type === 'income';
  const isTransfer = type === 'transfer';

  const categoryOptions: PickerOption[] = filteredCategories.map((c) => ({
    id: c.id, label: c.name, icon: c.icon, color: c.color,
  }));
  const accountOptions: PickerOption[] = accounts.map((a) => ({
    id: a.id, label: a.name, icon: a.icon, color: a.color,
  }));
  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: 'Add Recurring' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
              LABEL
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.border, color: theme.text }]}
              placeholder="e.g. Netflix, Transport"
              placeholderTextColor={theme.textTertiary}
              value={label}
              onChangeText={setLabel}
            />
          </Card>

          <View style={styles.typeRow}>
            {TX_TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => { setType(t.key); setCategoryId(null); }}
                style={[
                  styles.typeBtn,
                  { backgroundColor: type === t.key ? theme.accent : theme.border },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={{ color: type === t.key ? '#fff' : theme.textSecondary }}
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
            <ThemedText type="hero" style={[styles.currencySign, { color: theme.textTertiary }]}>₱</ThemedText>
          </Card>

          {!isTransfer && (
            <Pressable
              onPress={() => setPickerTarget('category')}
              style={[styles.pickerBtn, { backgroundColor: theme.border }]}
            >
              <ThemedText style={{ color: categoryId ? theme.text : theme.textTertiary }}>
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
              <ThemedText style={{ color: fromAccountId ? theme.text : theme.textTertiary }}>
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
              <ThemedText style={{ color: toAccountId ? theme.text : theme.textTertiary }}>
                {toAccountId
                  ? `${accounts.find((a) => a.id === toAccountId)?.icon} ${accounts.find((a) => a.id === toAccountId)?.name}`
                  : 'Select to account'}
              </ThemedText>
            </Pressable>
          )}

          <View style={styles.repeatLabel}>
            <ThemedText type="smallBold">Repeat</ThemedText>
          </View>
          <View style={styles.freqRow}>
            {(['daily', 'weekly', 'monthly'] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFrequency(f)}
                style={[
                  styles.freqBtn,
                  { backgroundColor: frequency === f ? theme.accent : theme.border },
                ]}
              >
                <ThemedText
                  type="smallBold"
                  style={{ color: frequency === f ? '#fff' : theme.textSecondary }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {frequency === 'weekly' && (
            <View style={styles.dayRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, i) => (
                <Pressable
                  key={i}
                  onPress={() => toggleDay(i)}
                  style={[
                    styles.dayPill,
                    { backgroundColor: selectedDays.has(i) ? theme.accent : theme.border },
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={{ color: selectedDays.has(i) ? '#fff' : theme.textSecondary }}
                  >
                    {label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}

          {frequency === 'monthly' && (
            <Card>
              <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
                DAY OF MONTH
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.border, color: theme.text }]}
                placeholder="1"
                placeholderTextColor={theme.textTertiary}
                keyboardType="number-pad"
                value={dayOfMonth}
                onChangeText={setDayOfMonth}
              />
            </Card>
          )}

          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={[styles.pickerBtn, { backgroundColor: theme.border }]}
          >
            <ThemedText>{timeStr}</ThemedText>
          </Pressable>

          {showTimePicker && (
            <DateTimePicker
              value={new Date(2024, 0, 1, notificationHour, notificationMinute)}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onValueChange={(_: DateTimePickerChangeEvent, selected?: Date) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selected) {
                  setNotificationHour(selected.getHours());
                  setNotificationMinute(selected.getMinutes());
                }
              }}
            />
          )}

          <Card>
            <ThemedText type="smallBold" style={[styles.label, { color: theme.textSecondary }]}>
              NOTE
            </ThemedText>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.border, color: theme.text }]}
              placeholder="Add a note..."
              placeholderTextColor={theme.textTertiary}
              value={note}
              onChangeText={setNote}
              multiline
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
              {saving ? 'Saving...' : 'Save Recurring'}
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
