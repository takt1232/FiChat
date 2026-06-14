import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionItem } from '@/components/transaction-item';
import { SectionHeader } from '@/components/section-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TransactionRow, useTransactions } from '@/hooks/use-transactions';

function groupByDate(transactions: TransactionRow[]): Record<string, TransactionRow[]> {
  const groups: Record<string, TransactionRow[]> = {};
  for (const tx of transactions) {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  }
  return groups;
}

export default function HistoryScreen() {
  const theme = useTheme();
  const { list } = useTransactions();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      list().then(setTransactions);
    }, [list]),
  );

  const grouped = groupByDate(transactions);

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: 'Transaction History' }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
