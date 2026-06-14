import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/card';
import { AmountDisplay } from '@/components/amount-display';
import { Spacing, Radii } from '@/constants/theme';
import { formatDate } from '@/constants/format';
import { useTheme } from '@/hooks/use-theme';
import { RecurringRow, useRecurring } from '@/hooks/use-recurring';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FREQ_LABELS: Record<string, string> = {
  daily: 'Daily', weekly: 'Weekly',
  monthly: 'Monthly',
};

export default function EditRecurringScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { getById, update, remove } = useRecurring();

  const [recurring, setRecurring] = useState<RecurringRow | null>(null);

  useFocusEffect(
    useCallback(() => {
      getById(parseInt(id, 10)).then(setRecurring);
    }, [id, getById]),
  );

  const handleToggle = useCallback(async () => {
    if (!recurring) return;
    await update(parseInt(id, 10), { is_active: recurring.is_active ? 0 : 1 });
    setRecurring({ ...recurring, is_active: recurring.is_active ? 0 : 1 });
  }, [id, recurring, update]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Recurring', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await remove(parseInt(id, 10));
          router.back();
        },
      },
    ]);
  }, [id, remove]);

  if (!recurring) return null;

  const accountLabel =
    recurring.type === 'transfer'
      ? `${recurring.from_account_name ?? '?'} → ${recurring.to_account_name ?? '?'}`
      : recurring.type === 'income'
        ? recurring.to_account_name ?? ''
        : recurring.from_account_name ?? '';

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: recurring.label }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <ThemedText style={styles.icon}>{recurring.category_icon ?? '🔄'}</ThemedText>
          <ThemedText type="title">{recurring.label}</ThemedText>
          <AmountDisplay
            amount={recurring.type === 'expense' ? -recurring.amount : recurring.amount}
            showSign
            style={styles.amount}
          />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {FREQ_LABELS[recurring.frequency] || recurring.frequency}
            {recurring.frequency === 'weekly' && recurring.day_of_week
              ? ` · ${DAY_NAMES.filter((_, i) => (recurring.day_of_week! >> i) & 1).join(', ')}`
              : ''}
            {' · '}{accountLabel}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            Next due: {formatDate(recurring.next_due_date)}
          </ThemedText>
        </Card>

        <Pressable
          onPress={handleToggle}
          style={[styles.actionBtn, { backgroundColor: recurring.is_active ? theme.border : theme.accent }]}
        >
          <ThemedText type="smallBold" style={{ color: recurring.is_active ? theme.text : '#fff' }}>
            {recurring.is_active ? 'Pause' : 'Activate'}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          style={[styles.deleteBtn, { borderColor: theme.expense }]}
        >
          <ThemedText type="smallBold" style={{ color: theme.expense }}>
            Delete
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
  headerCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  icon: { fontSize: 40 },
  amount: { fontSize: 30 },
  actionBtn: {
    paddingVertical: Spacing.lg,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  deleteBtn: {
    paddingVertical: Spacing.lg,
    borderRadius: Radii.button,
    alignItems: 'center',
    borderWidth: 1,
  },
});
