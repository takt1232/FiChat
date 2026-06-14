import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AmountDisplay } from '@/components/amount-display';
import { Spacing } from '@/constants/theme';
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

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: goal.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView type="backgroundElement" style={styles.header}>
          <ThemedText style={styles.icon}>{goal.icon}</ThemedText>
          <ThemedText type="title" style={styles.name}>{goal.name}</ThemedText>
          {goal.deadline ? (
            <ThemedText type="small" themeColor="textSecondary">
              Due {goal.deadline}
            </ThemedText>
          ) : null}
        </ThemedView>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <AmountDisplay amount={goal.current_amount} style={styles.currentAmount} />
            <ThemedText type="default" themeColor="textSecondary">
              of {goal.target_amount.toLocaleString()}
            </ThemedText>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.round(progress * 100)}%` as any, backgroundColor: goal.color },
                ]}
              />
            </View>
            <ThemedText type="smallBold" style={[styles.percent, { color: goal.color }]}>
              {Math.round(progress * 100)}%
            </ThemedText>
          </View>

          <ThemedText type="small" themeColor="textSecondary">
            {remaining > 0
              ? `${remaining.toLocaleString()} remaining`
              : 'Goal completed!'}
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.addSection}>
          <ThemedText type="default" style={{ fontWeight: '600' }}>Add Progress</ThemedText>
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSelected, color: theme.text }]}
              placeholder="Amount"
              placeholderTextColor={theme.textSecondary}
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
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  header: {
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  icon: { fontSize: 48 },
  name: { fontSize: 24, textAlign: 'center' },
  progressSection: { gap: Spacing.two },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.one },
  currentAmount: { fontSize: 28 },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  progressBarBg: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  percent: { width: 44, textAlign: 'right', fontSize: 16 },
  addSection: { padding: Spacing.three, borderRadius: Spacing.two, gap: Spacing.two },
  addRow: { flexDirection: 'row', gap: Spacing.two },
  input: {
    flex: 1,
    fontSize: 16,
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  addBtn: {
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
