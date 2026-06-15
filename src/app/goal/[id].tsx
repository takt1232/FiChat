import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AmountDisplay } from '@/components/amount-display';
import { Card } from '@/components/card';
import { Spacing, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useGoals } from '@/hooks/use-goals';
import { Goal } from '@/types';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { getById, updateProgress } = useGoals();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [addAmount, setAddAmount] = useState('');

  useFocusEffect(
    useCallback(() => {
      getById(parseInt(id, 10)).then(setGoal);
    }, [id, getById]),
  );

  const handleAdd = useCallback(async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) return;
    await updateProgress(parseInt(id, 10), amount);
    setAddAmount('');
    const updated = await getById(parseInt(id, 10));
    setGoal(updated);
  }, [addAmount, id, updateProgress, getById]);

  if (!goal) return null;

  const progress = Math.min(goal.current_amount / goal.target_amount, 1);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
  const progressPercent = Math.round(progress * 100);

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: goal.name }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <ThemedText style={styles.icon}>{goal.icon}</ThemedText>
          <ThemedText type="title" style={styles.name}>{goal.name}</ThemedText>
          {goal.deadline ? (
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Due {goal.deadline}
            </ThemedText>
          ) : null}
        </Card>

        <Card style={styles.progressCard}>
          <View style={styles.amountRow}>
            <AmountDisplay amount={goal.current_amount} style={styles.currentAmount} accent />
            <ThemedText type="default" style={{ color: theme.textSecondary }}>
              of ₱{goal.target_amount.toLocaleString()}
            </ThemedText>
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.track, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${progressPercent}%` as any, backgroundColor: goal.color },
                ]}
              />
            </View>
            <ThemedText type="smallBold" style={[styles.percent, { color: goal.color }]}>
              {progressPercent}%
            </ThemedText>
          </View>

          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            {remaining > 0
              ? `₱${remaining.toLocaleString()} remaining`
              : 'Goal completed!'}
          </ThemedText>
        </Card>

        {remaining > 0 && (
          <Card style={styles.addCard}>
            <ThemedText type="default" style={styles.addTitle}>Add Progress</ThemedText>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.border, color: theme.text }]}
                placeholder="Amount"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                value={addAmount}
                onChangeText={setAddAmount}
              />
              <Pressable
                onPress={handleAdd}
                style={[styles.addBtn, { backgroundColor: goal.color }]}
              >
                <ThemedText type="smallBold" style={{ color: '#fff' }}>Add</ThemedText>
              </Pressable>
            </View>
          </Card>
        )}
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
  icon: { fontSize: 48 },
  name: { fontSize: 24, textAlign: 'center' },
  progressCard: {
    gap: Spacing.lg,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  currentAmount: { fontSize: 28 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: Radii.progress,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.progress,
  },
  percent: {
    fontSize: 14,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  addCard: {
    gap: Spacing.md,
  },
  addTitle: {
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: Spacing.md,
    borderRadius: Radii.input,
  },
  addBtn: {
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
