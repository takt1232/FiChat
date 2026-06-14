import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccountCard } from '@/components/account-card';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAccounts } from '@/hooks/use-accounts';
import { Account } from '@/types';

export default function AccountsScreen() {
  const theme = useTheme();
  const { list } = useAccounts();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useFocusEffect(useCallback(() => { list().then(setAccounts); }, [list]));

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Accounts</ThemedText>
          <Pressable
            style={[styles.fab, { backgroundColor: theme.text }]}
            onPress={() => router.push('/add-account')}
          >
            <ThemedText style={[styles.fabText, { color: theme.background }]}>+</ThemedText>
          </Pressable>
        </View>

        {accounts.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.empty}>
            <ThemedText type="default" themeColor="textSecondary">
              No accounts yet. Tap + to add one.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.list}>
            {accounts.map((acc) => (
              <AccountCard
                key={acc.id}
                account={acc}
                onPress={() => router.push(`/account/${acc.id}`)}
              />
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
  list: { gap: Spacing.two },
  empty: {
    padding: Spacing.six,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
});
