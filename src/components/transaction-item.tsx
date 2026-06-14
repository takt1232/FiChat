import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AmountDisplay } from '@/components/amount-display';
import { IconContainer } from '@/components/icon-container';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TransactionRow } from '@/hooks/use-transactions';
import { Card } from '@/components/card';

interface TransactionItemProps {
  transaction: TransactionRow;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const theme = useTheme();
  const categoryColor = '#00C4B4';

  const accountLabel =
    transaction.type === 'transfer'
      ? `${transaction.from_account_name ?? '?'} → ${transaction.to_account_name ?? '?'}`
      : transaction.type === 'income'
        ? transaction.to_account_name ?? ''
        : transaction.from_account_name ?? '';

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          style={[
            styles.container,
            pressed && { backgroundColor: theme.cardSelected },
          ]}
        >
          <IconContainer
            icon={transaction.category_icon ?? '📄'}
            color={categoryColor}
            size={40}
          />
          <View style={styles.info}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {transaction.category_name ?? (transaction.note || 'Untitled')}
            </ThemedText>
            {accountLabel ? (
              <ThemedText type="small" style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                {accountLabel}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.right}>
            <AmountDisplay
              amount={transaction.type === 'expense' ? -transaction.amount : transaction.amount}
              showSign
              style={styles.value}
            />
            <ThemedText type="small" style={[styles.date, { color: theme.textTertiary }]}>
              {transaction.date}
            </ThemedText>
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
  name: {
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
  date: {
    fontSize: 12,
  },
});
