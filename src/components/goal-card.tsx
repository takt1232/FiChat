import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AmountDisplay } from '@/components/amount-display';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Goal } from '@/types';

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const theme = useTheme();
  const progress = Math.min(goal.current_amount / goal.target_amount, 1);
  const progressPercent = Math.round(progress * 100);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.icon}>{goal.icon}</ThemedText>
        <View style={styles.headerInfo}>
          <ThemedText type="default" style={styles.name}>
            {goal.name}
          </ThemedText>
          {goal.deadline ? (
            <ThemedText type="small" themeColor="textSecondary">
              Due {goal.deadline}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.amounts}>
          <AmountDisplay amount={goal.current_amount} style={styles.currentAmount} />
          <ThemedText type="small" themeColor="textSecondary">
            of {goal.target_amount.toLocaleString()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%` as any,
                backgroundColor: goal.color,
              },
            ]}
          />
        </View>
        <ThemedText type="small" style={[styles.percent, { color: goal.color }]}>
          {progressPercent}%
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: '600',
  },
  amounts: {
    alignItems: 'flex-end',
  },
  currentAmount: {
    fontSize: 18,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percent: {
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
});
