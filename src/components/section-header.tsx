import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SectionHeaderProps {
  label: string;
}

export function SectionHeader({ label }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText
        type="smallBold"
        style={[styles.label, { color: theme.textSecondary }]}
      >
        {label.toUpperCase()}
      </ThemedText>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
