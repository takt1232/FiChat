import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemeMode } from '@/context/ThemeContext';
import { SymbolView } from 'expo-symbols';

export function Header() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { theme: mode, toggleTheme } = useThemeMode();

  return (
    <ThemedView style={[styles.header, { paddingTop: Spacing.md + insets.top }]}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <ThemedText style={styles.avatarText}>JD</ThemedText>
        </View>
        <ThemedText style={styles.name}>John Doe</ThemedText>
      </View>
      <View style={styles.right}>
        <Pressable onPress={toggleTheme} style={styles.iconBtn}>
          <SymbolView
            name={mode === 'light' ? 'moon' : 'sun.max'}
            tintColor={theme.textSecondary}
            size={20}
          />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <SymbolView
            name="bell"
            tintColor={theme.textSecondary}
            size={20}
          />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
