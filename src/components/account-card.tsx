import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AmountDisplay } from '@/components/amount-display';
import { IconContainer } from '@/components/icon-container';
import { Card } from '@/components/card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Account } from '@/types';

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
  compact?: boolean;
}

export function AccountCard({ account, onPress, compact }: AccountCardProps) {
  const theme = useTheme();

  if (compact) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <Card
            style={[
              styles.compactCard,
              pressed && { backgroundColor: theme.cardSelected },
            ]}
          >
            <IconContainer icon={account.icon} color={account.color} size={36} />
            <View style={styles.compactInfo}>
              <ThemedText style={styles.compactName} numberOfLines={1}>{account.name}</ThemedText>
              <AmountDisplay amount={account.balance} style={styles.compactBalance} />
            </View>
          </Card>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          style={[
            styles.card,
            pressed && { backgroundColor: theme.cardSelected },
          ]}
        >
          <View style={styles.row}>
            <IconContainer icon={account.icon} color={account.color} size={40} />
            <View style={styles.info}>
              <ThemedText style={styles.name}>{account.name}</ThemedText>
              <ThemedText type="small" style={[styles.type, { color: theme.textSecondary }]}>
                {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
              </ThemedText>
            </View>
            <AmountDisplay amount={account.balance} style={styles.balance} accent />
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: {
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
  type: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  balance: {
    fontSize: 17,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  compactInfo: {
    flex: 1,
    gap: 2,
  },
  compactName: {
    fontWeight: '600',
    fontSize: 14,
  },
  compactBalance: {
    fontSize: 15,
  },
});
