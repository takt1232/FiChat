import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AmountDisplay } from '@/components/amount-display';
import { AccountCard } from '@/components/account-card';
import { GoalCard } from '@/components/goal-card';
import { TransactionItem } from '@/components/transaction-item';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useTransactions, TransactionRow } from '@/hooks/use-transactions';
import { useGoals } from '@/hooks/use-goals';
import { Account, Goal } from '@/types';

export default function DashboardScreen() {
  const theme = useTheme();
  const { totalBalance, list: listAccounts } = useAccounts();
  const { listRecent } = useTransactions();
  const { list: listGoals } = useGoals();

  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTx, setRecentTx] = useState<TransactionRow[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const load = useCallback(async () => {
    setTotal(await totalBalance());
    setAccounts(await listAccounts());
    setRecentTx(await listRecent(5));
    setGoals(await listGoals());
  }, [totalBalance, listAccounts, listRecent, listGoals]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.three }]}
    >
      <View style={styles.header}>
        <ThemedText type="subtitle">Dashboard</ThemedText>
        <Pressable
          style={[styles.fab, { backgroundColor: theme.text }]}
          onPress={() => router.push('/add-transaction')}
        >
          <ThemedText style={[styles.fabText, { color: theme.background }]}>+</ThemedText>
        </Pressable>
      </View>

      <ThemedView type="backgroundElement" style={styles.totalCard}>
        <ThemedText type="small" themeColor="textSecondary">Total Balance</ThemedText>
        <AmountDisplay amount={total} style={styles.totalAmount} />
      </ThemedView>

      {accounts.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="default" style={styles.sectionTitle}>Accounts</ThemedText>
            <Pressable onPress={() => router.push('/(tabs)/accounts')}>
              <ThemedText type="small" themeColor="textSecondary">See All</ThemedText>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountScroll}>
            {accounts.map((acc) => (
              <View key={acc.id} style={styles.accountCardWrapper}>
                <AccountCard
                  account={acc}
                  onPress={() => router.push(`/account/${acc.id}`)}
                />
              </View>
            ))}
            <Pressable
              style={[styles.addCard, { backgroundColor: theme.backgroundElement }]}
              onPress={() => router.push('/add-account')}
            >
              <ThemedText style={styles.addIcon}>+</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">Add</ThemedText>
            </Pressable>
          </ScrollView>
        </View>
      ) : (
        <Pressable
          style={[styles.emptyBtn, { backgroundColor: theme.backgroundElement }]}
          onPress={() => router.push('/add-account')}
        >
          <ThemedText type="default">Create your first account</ThemedText>
        </Pressable>
      )}

      {recentTx.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="default" style={styles.sectionTitle}>Recent Transactions</ThemedText>
          </View>
          <View style={styles.txList}>
            {recentTx.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </View>
        </View>
      ) : null}

      {goals.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="default" style={styles.sectionTitle}>Goals</ThemedText>
            <Pressable onPress={() => router.push('/(tabs)/goals')}>
              <ThemedText type="small" themeColor="textSecondary">See All</ThemedText>
            </Pressable>
          </View>
          {goals.slice(0, 3).map((g) => (
            <GoalCard key={g.id} goal={g} onPress={() => router.push(`/goal/${g.id}`)} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
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
  totalCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  totalAmount: { fontSize: 36 },
  section: { gap: Spacing.two },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontWeight: '600' },
  accountScroll: { gap: Spacing.two, paddingVertical: Spacing.one },
  accountCardWrapper: { width: 200 },
  addCard: {
    width: 80,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  addIcon: { fontSize: 24, color: '#999' },
  txList: { gap: Spacing.one },
  emptyBtn: {
    padding: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
