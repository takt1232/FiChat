import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AmountDisplay } from '@/components/amount-display';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Account } from '@/types';

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
}

export function AccountCard({ account, onPress }: AccountCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderLeftColor: account.color,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.icon}>{account.icon}</ThemedText>
        <View style={styles.headerInfo}>
          <ThemedText type="default" style={styles.name}>
            {account.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ textTransform: 'capitalize' }}>
            {account.type}
          </ThemedText>
        </View>
      </View>
      <AmountDisplay amount={account.balance} style={styles.balance} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderLeftWidth: 4,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    fontSize: 24,
  },
  headerInfo: {
    gap: 2,
  },
  name: {
    fontWeight: '600',
  },
  balance: {
    fontSize: 20,
    textAlign: 'right',
  },
});
