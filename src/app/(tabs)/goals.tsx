import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GoalCard } from '@/components/goal-card';
import { SectionHeader } from '@/components/section-header';
import { Card } from '@/components/card';
import { Header } from '@/components/header';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useGoals } from '@/hooks/use-goals';
import { Goal } from '@/types';

export default function GoalsScreen() {
  const theme = useTheme();
  const { list } = useGoals();
  const [goals, setGoals] = useState<Goal[]>([]);

  useFocusEffect(useCallback(() => { list().then(setGoals); }, [list]));

  const completed = goals.filter((g) => g.current_amount >= g.target_amount).length;
  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + g.current_amount, 0) / goals.reduce((s, g) => s + g.target_amount, 0) * 100)
    : 0;

  return (
    <ThemedView style={styles.screen}>
      <Header />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.three }]}
      >

        {goals.length > 0 && (
          <Card elevated style={styles.summaryCard}>
            <ThemedText type="hero" style={[styles.summaryPercent, { color: theme.accent }]}>
              {totalProgress}%
              <ThemedText type="small" style={{ color: theme.textSecondary }}> overall</ThemedText>
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {completed} of {goals.length} goals completed
            </ThemedText>
          </Card>
        )}

        {goals.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="default" style={{ color: theme.textSecondary }}>
              No goals yet.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.section}>
            <SectionHeader label={`${goals.length} Goals`} />
            <View style={styles.list}>
              {goals.map((g) => (
                <GoalCard key={g.id} goal={g} onPress={() => router.push(`/goal/${g.id}`)} />
              ))}
            </View>
          </View>
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
    paddingTop: Spacing.four,
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.xs,
  },
  summaryPercent: {
    fontSize: 34,
  },
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  empty: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
