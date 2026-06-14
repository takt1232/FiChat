import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AmountDisplay } from '@/components/amount-display';
import { IconContainer } from '@/components/icon-container';
import { Card } from '@/components/card';
import { Spacing, Radii } from '@/constants/theme';
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
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          style={[
            styles.card,
            pressed && { backgroundColor: theme.cardSelected },
          ]}
        >
          <View style={styles.row}>
            <IconContainer icon={goal.icon} color={goal.color} size={40} />
            <View style={styles.info}>
              <ThemedText style={styles.name}>{goal.name}</ThemedText>
              {goal.deadline ? (
                <ThemedText type="small" style={[styles.deadline, { color: theme.textSecondary }]}>
                  Due {goal.deadline}
                </ThemedText>
              ) : null}
            </View>
            <View style={styles.amounts}>
              <AmountDisplay amount={goal.current_amount} style={styles.current} accent />
              <ThemedText type="small" style={[styles.target, { color: theme.textTertiary }]}>
                of ₱{goal.target_amount.toLocaleString()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.progressRow}>
            <View style={[styles.track, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.fill,
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
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: '600',
    fontSize: 15,
  },
  deadline: {
    fontSize: 13,
  },
  amounts: {
    alignItems: 'flex-end',
  },
  current: {
    fontSize: 16,
  },
  target: {
    fontSize: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: Radii.progress,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.progress,
  },
  percent: {
    fontWeight: '700',
    fontSize: 12,
    width: 32,
    textAlign: 'right',
  },
});
