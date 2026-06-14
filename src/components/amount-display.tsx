import { StyleSheet, Text, type TextProps } from 'react-native';
import { formatCurrency } from '@/constants/currency';
import { useTheme } from '@/hooks/use-theme';
import { ThemeColor } from '@/constants/theme';

interface AmountDisplayProps extends TextProps {
  amount: number;
  showSign?: boolean;
  themeColor?: ThemeColor;
}

export function AmountDisplay({ amount, showSign, themeColor, style, ...rest }: AmountDisplayProps) {
  const theme = useTheme();
  const isNegative = amount < 0;

  const color = isNegative ? '#E74C3C' : '#2ECC71';

  return (
    <Text
      style={[
        styles.amount,
        { color: themeColor ? theme[themeColor] : color },
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
