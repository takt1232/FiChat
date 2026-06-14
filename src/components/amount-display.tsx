import { StyleSheet, Text, type TextProps } from 'react-native';
import { formatCurrency } from '@/constants/currency';
import { useTheme } from '@/hooks/use-theme';

interface AmountDisplayProps extends TextProps {
  amount: number;
  showSign?: boolean;
  accent?: boolean;
}

export function AmountDisplay({ amount, showSign, accent, style, ...rest }: AmountDisplayProps) {
  const theme = useTheme();
  const isNegative = amount < 0;

  const color = accent
    ? theme.accent
    : isNegative
      ? theme.expense
      : theme.income;

  return (
    <Text
      style={[
        styles.amount,
        { color },
        style,
      ]}
      {...rest}
    >
      {showSign && isNegative ? '- ' : ''}{formatCurrency(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
