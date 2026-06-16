import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Radii } from '@/constants/theme';
import { useThemeMode } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';
import { scheduleTestNotification } from '@/services/notifications';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Header() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { theme: mode, toggleTheme } = useThemeMode();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNotifyNow = async () => {
    setShowDropdown(false);
    await scheduleTestNotification('FiChat Test', 'This is a test notification', 1);
  };

  const handleTestBackground = async () => {
    setShowDropdown(false);
    await scheduleTestNotification('FiChat Test', 'Background notification test', 30);
    Alert.alert(
      'Scheduled',
      'Notification scheduled in 30 seconds. Close or background the app now to test.',
    );
  };

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
        <Pressable onPress={() => setShowDropdown(true)} style={styles.iconBtn}>
          <SymbolView
            name={{ ios: 'bell', android: 'notifications' }}
            tintColor={theme.textSecondary}
            size={20}
          />
        </Pressable>
      </View>

      <Modal visible={showDropdown} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setShowDropdown(false)}>
          <View style={[styles.dropdown, { backgroundColor: theme.card, top: insets.top + 70, right: Spacing.three }]}>
            <Pressable onPress={handleNotifyNow} style={[styles.dropdownItem, { borderBottomColor: theme.border }]}>
              <SymbolView
                name={{ ios: 'bell.badge', android: 'notifications_active' }}
                tintColor={theme.text}
                size={18}
              />
              <ThemedText style={styles.dropdownText}>Notify Now</ThemedText>
            </Pressable>
            <Pressable onPress={handleTestBackground} style={styles.dropdownItem}>
              <SymbolView
                name={{ ios: 'timer', android: 'timer' }}
                tintColor={theme.text}
                size={18}
              />
              <ThemedText style={styles.dropdownText}>Test in 30s</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  backdrop: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    borderRadius: Radii.input,
    paddingVertical: Spacing.sm,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownText: {
    fontSize: 15,
  },
});
