import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AmountDisplay } from '@/components/amount-display';
import { IconContainer } from '@/components/icon-container';
import { Card } from '@/components/card';
import { Spacing } from '@/constants/theme';
import { formatDate } from '@/constants/format';
import { useTheme } from '@/hooks/use-theme';
import { RecurringRow } from '@/hooks/use-recurring';

interface RecurringCardProps {
  recurring: RecurringRow;
  onPress?: () => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FREQ_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function RecurringCard({ recurring, onPress }: RecurringCardProps) {
  const theme = useTheme();
  const categoryColor = '#00C4B4';

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          style={[
            styles.container,
            pressed && { backgroundColor: theme.cardSelected },
            !recurring.is_active && { opacity: 0.5 },
          ]}
        >
          <IconContainer
            icon={recurring.category_icon ?? '🔄'}
            color={categoryColor}
            size={40}
          />
          <View style={styles.info}>
            <ThemedText style={styles.label} numberOfLines={1}>
              {recurring.label}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.subtitle, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {FREQ_LABELS[recurring.frequency] ?? recurring.frequency}
              {recurring.frequency === 'weekly' && recurring.day_of_week
                ? ` · ${DAY_NAMES.filter((_, i) => (recurring.day_of_week! >> i) & 1).join(', ')}`
                : ''}
              {recurring.from_account_name || recurring.to_account_name
                ? ` · ${recurring.from_account_name ?? recurring.to_account_name}`
                : ''}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textTertiary }}
            >
              Next: {formatDate(recurring.next_due_date)}
            </ThemedText>
          </View>
          <View style={styles.right}>
            <AmountDisplay
              amount={recurring.type === 'expense' ? -recurring.amount : recurring.amount}
              showSign
              style={styles.value}
            />
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
  },
  subtitle: {
    fontSize: 13,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  value: {
    fontSize: 15,
  },
});
