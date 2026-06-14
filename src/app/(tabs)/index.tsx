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
import { Card } from '@/components/card';
import { SectionHeader } from '@/components/section-header';
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
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.three }]}
      >
        <Card elevated style={styles.totalCard}>
          <ThemedText type="small" style={[styles.totalLabel, { color: theme.textSecondary }]}>
            Total Balance
          </ThemedText>
          <AmountDisplay amount={total} style={styles.totalAmount} accent />
        </Card>

        {accounts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Accounts" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountScroll}>
              {accounts.map((acc) => (
                <View key={acc.id} style={styles.accountWrapper}>
                  <AccountCard
                    account={acc}
                    compact
                    onPress={() => router.push(`/account/${acc.id}`)}
                  />
                </View>
              ))}
              <Pressable
                style={[styles.addAccountBtn, { backgroundColor: theme.border }]}
                onPress={() => router.push('/add-account')}
              >
                <ThemedText style={[styles.addAccountIcon, { color: theme.textSecondary }]}>+</ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        )}

        {recentTx.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Recent Transactions" />
            <View style={styles.txList}>
              {recentTx.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </View>
          </View>
        )}

        {goals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Goals" />
            <View style={styles.goalList}>
              {goals.slice(0, 3).map((g) => (
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
  totalCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.xs,
  },
  totalLabel: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  totalAmount: {
    fontSize: 40,
  },
  section: {
    gap: Spacing.md,
  },
  accountScroll: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  accountWrapper: {
    width: 180,
  },
  addAccountBtn: {
    width: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAccountIcon: {
    fontSize: 22,
    fontWeight: '600',
  },
  txList: {
    gap: Spacing.sm,
  },
  goalList: {
    gap: Spacing.sm,
  },
});
