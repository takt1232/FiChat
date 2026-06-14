import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AmountDisplay } from '@/components/amount-display';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TransactionRow } from '@/hooks/use-transactions';

interface TransactionItemProps {
  transaction: TransactionRow;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const theme = useTheme();

  const typeLabel =
    transaction.type === 'income' ? '→' :
    transaction.type === 'expense' ? '←' : '⇄';

  const accountLabel =
    transaction.type === 'transfer'
      ? `${transaction.from_account_name ?? '?'} → ${transaction.to_account_name ?? '?'}`
      : transaction.type === 'income'
        ? transaction.to_account_name ?? ''
        : transaction.from_account_name ?? '';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.icon}>
            {transaction.category_icon ?? '📄'}
          </ThemedText>
        </View>
        <View style={styles.info}>
          <ThemedText type="default" style={styles.categoryName}>
            {transaction.category_name ?? (transaction.note || 'Untitled')}
          </ThemedText>
          {accountLabel ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {accountLabel}
            </ThemedText>
          ) : null}
          {transaction.note ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {transaction.note}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <View style={styles.right}>
        <AmountDisplay
          amount={transaction.type === 'expense' ? -transaction.amount : transaction.amount}
          showSign
        />
        <ThemedText type="small" themeColor="textSecondary">
          {typeLabel} {transaction.date}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
