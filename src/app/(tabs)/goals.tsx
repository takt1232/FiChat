import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GoalCard } from '@/components/goal-card';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useGoals } from '@/hooks/use-goals';
import { Goal } from '@/types';

export default function GoalsScreen() {
  const theme = useTheme();
  const { list } = useGoals();
  const [goals, setGoals] = useState<Goal[]>([]);

  useFocusEffect(useCallback(() => { list().then(setGoals); }, [list]));

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Goals</ThemedText>
          <Pressable
            style={[styles.fab, { backgroundColor: theme.text }]}
            onPress={() => router.push('/add-goal')}
          >
            <ThemedText style={[styles.fabText, { color: theme.background }]}>+</ThemedText>
          </Pressable>
        </View>

        {goals.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.empty}>
            <ThemedText type="default" themeColor="textSecondary">
              No goals yet. Tap + to set one.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.list}>
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onPress={() => router.push(`/goal/${g.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { fontSize: 22, fontWeight: '600', marginTop: -2 },
  list: { gap: Spacing.two },
  empty: {
    padding: Spacing.six,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
});
