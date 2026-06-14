import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AmountDisplay } from '@/components/amount-display';
import { TransactionItem } from '@/components/transaction-item';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useTransactions, TransactionRow } from '@/hooks/use-transactions';
import { Account } from '@/types';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { getById } = useAccounts();
  const { listByAccount } = useTransactions();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      const accountId = parseInt(id, 10);
      getById(accountId).then(setAccount);
      listByAccount(accountId).then(setTransactions);
    }, [id, getById, listByAccount]),
  );

  if (!account) return null;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: account.name }} />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView type="backgroundElement" style={styles.header}>
          <ThemedText style={styles.icon}>{account.icon}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ textTransform: 'capitalize' }}>
            {account.type}
          </ThemedText>
          <AmountDisplay amount={account.balance} style={styles.balance} />
        </ThemedView>

        <ThemedText type="default" style={styles.sectionTitle}>Transactions</ThemedText>
        {transactions.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No transactions yet.
          </ThemedText>
        ) : (
          <View style={styles.txList}>
            {transactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
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
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  icon: { fontSize: 40 },
  balance: { fontSize: 28 },
  sectionTitle: { fontWeight: '600', marginTop: Spacing.one },
  txList: { gap: Spacing.one },
});
