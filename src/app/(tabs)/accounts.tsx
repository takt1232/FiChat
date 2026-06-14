import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccountCard } from '@/components/account-card';
import { SectionHeader } from '@/components/section-header';
import { Card } from '@/components/card';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { Account } from '@/types';

export default function AccountsScreen() {
  const theme = useTheme();
  const { list, totalBalance } = useAccounts();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      list().then(setAccounts);
      totalBalance().then(setTotal);
    }, [list, totalBalance]),
  );

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + Spacing.three }]}
      >
        <View style={styles.header}>
          <ThemedText type="title">Accounts</ThemedText>
        </View>

        {accounts.length > 0 && (
          <Card elevated style={styles.summaryCard}>
            <ThemedText type="small" style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Combined Balance
            </ThemedText>
            <ThemedText type="hero" style={[styles.summaryAmount, { color: theme.accent }]}>
              ₱{total.toLocaleString()}
            </ThemedText>
          </Card>
        )}

        {accounts.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText type="default" style={{ color: theme.textSecondary }}>
              No accounts yet.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.section}>
            <SectionHeader label={`${accounts.length} Accounts`} />
            <View style={styles.list}>
              {accounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  account={acc}
                  onPress={() => router.push(`/account/${acc.id}`)}
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
  header: {
    paddingTop: Spacing.sm,
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.xs,
  },
  summaryLabel: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  summaryAmount: {
    fontSize: 34,
  },
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  empty: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
  },
});
