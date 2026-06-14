import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useThemeMode } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
            name={mode === 'light' ? { ios: 'moon', android: 'dark_mode' } : { ios: 'sun.max', android: 'light_mode' }}
            tintColor={theme.textSecondary}
            size={20}
          />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <SymbolView
            name={{ ios: 'bell', android: 'notifications' }}
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
