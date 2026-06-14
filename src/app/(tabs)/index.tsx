import { AccountCard } from "@/components/account-card";
import { AmountDisplay } from "@/components/amount-display";
import { Card } from "@/components/card";
import { GoalCard } from "@/components/goal-card";
import { Header } from "@/components/header";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TransactionItem } from "@/components/transaction-item";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useAccounts } from "@/hooks/use-accounts";
import { useGoals } from "@/hooks/use-goals";
import { useTheme } from "@/hooks/use-theme";
import { TransactionRow, useTransactions } from "@/hooks/use-transactions";
import { Account, Goal } from "@/types";
import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function DashboardScreen() {
  const theme = useTheme();
  const { totalBalance, list: listAccounts } = useAccounts();
  const { listRecent, getMonthlySummary } = useTransactions();
  const { list: listGoals } = useGoals();

  const [total, setTotal] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTx, setRecentTx] = useState<TransactionRow[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const load = useCallback(async () => {
    setTotal(await totalBalance());
    setAccounts(await listAccounts());
    const [tx, summary] = await Promise.all([
      listRecent(5),
      getMonthlySummary(),
    ]);
    setRecentTx(tx);
    setGoals(await listGoals());
  }, [totalBalance, listAccounts, listRecent, getMonthlySummary, listGoals]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ThemedView style={styles.screen}>
      <Header />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BottomTabInset + Spacing.three },
        ]}
      >
        <Card style={styles.totalCard}>
          <View
            style={[
              {
                display: "flex",
                flexDirection: "row",
                gap: Spacing.md,
                alignContent: "center",
              },
            ]}
          >
            <ThemedText
              type="small"
              style={[styles.totalLabel, { color: theme.textSecondary }]}
            >
              Total Balance
            </ThemedText>
            <Pressable>
              <SymbolView
                name={{ ios: "eye", android: "visibility" }}
                tintColor={theme.textSecondary}
                size={14}
              />
            </Pressable>
          </View>
          <AmountDisplay
            amount={total}
            style={[styles.totalAmount, { color: theme.text }]}
          />
          <View style={styles.actionRow}>
            <Pressable
              style={[
                styles.actionBtn,
                { backgroundColor: theme.income + "20" },
              ]}
              onPress={() => router.push("/add-income")}
            >
              <SymbolView
                name={{ ios: "plus.circle", android: "add_circle" }}
                tintColor={theme.income}
                size={14}
              />
              <ThemedText
                type="smallBold"
                style={{ color: theme.income }}
              >
                + Income
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.actionBtn,
                { backgroundColor: theme.expense + "20" },
              ]}
              onPress={() => router.push("/add-expense")}
            >
              <SymbolView
                name={{ ios: "minus.circle", android: "remove_circle" }}
                tintColor={theme.expense}
                size={14}
              />
              <ThemedText
                type="smallBold"
                style={{ color: theme.expense }}
              >
                + Expense
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.border }]}
              onPress={() => router.push("/history")}
            >
              <SymbolView
                name={{ ios: "clock", android: "history" }}
                tintColor={theme.textSecondary}
                size={14}
              />
              <ThemedText
                type="smallBold"
                style={{ color: theme.textSecondary }}
              >
                History
              </ThemedText>
            </Pressable>
          </View>
        </Card>

        {accounts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Accounts" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.accountScroll}
            >
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
                style={[
                  styles.addAccountBtn,
                  { backgroundColor: theme.border },
                ]}
                onPress={() => router.push("/add-account")}
              >
                <ThemedText
                  style={[
                    styles.addAccountIcon,
                    { color: theme.textSecondary },
                  ]}
                >
                  +
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        )}

        {recentTx.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Recent Transactions" />
            <View style={styles.txList}>
              {recentTx.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onPress={() => router.push(`/edit-transaction/${tx.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        {goals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Goals" />
            <View style={styles.goalList}>
              {goals.slice(0, 3).map((g) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onPress={() => router.push(`/goal/${g.id}`)}
                />
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
    gap: Spacing.xs,
  },
  totalLabel: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  totalAmount: {
    fontSize: 32,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.half,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
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
    alignItems: "center",
    justifyContent: "center",
  },
  addAccountIcon: {
    fontSize: 22,
    fontWeight: "600",
  },
  txList: {
    gap: Spacing.sm,
  },
  goalList: {
    gap: Spacing.sm,
  },
});
