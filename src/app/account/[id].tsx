import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AmountDisplay } from '@/components/amount-display';
import { TransactionItem } from '@/components/transaction-item';
import { Card } from '@/components/card';
import { SectionHeader } from '@/components/section-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useTransactions, TransactionRow } from '@/hooks/use-transactions';
import { Account } from '@/types';

function groupByDate(transactions: TransactionRow[]): Record<string, TransactionRow[]> {
  const groups: Record<string, TransactionRow[]> = {};
  for (const tx of transactions) {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  }
  return groups;
}

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

  const grouped = groupByDate(transactions);

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: account.name }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card elevated style={styles.headerCard}>
          <ThemedText style={styles.icon}>{account.icon}</ThemedText>
          <ThemedText type="small" style={[styles.type, { color: theme.textSecondary }]}>
            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
          </ThemedText>
          <AmountDisplay amount={account.balance} style={styles.balance} accent />
        </Card>

        {transactions.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="default" style={{ color: theme.textSecondary }}>
              No transactions yet.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.section}>
            {Object.entries(grouped).map(([date, txs]) => (
              <View key={date} style={styles.dateGroup}>
                <SectionHeader label={date} />
                <View style={styles.txList}>
                  {txs.map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))}
                </View>
              </View>
            ))}
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
    paddingTop: Spacing.three,
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  icon: { fontSize: 40 },
  type: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  balance: { fontSize: 30 },
  section: {
    gap: Spacing.lg,
  },
  dateGroup: {
    gap: Spacing.md,
  },
  txList: {
    gap: Spacing.sm,
  },
  empty: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
