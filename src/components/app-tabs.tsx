import { router } from 'expo-router';
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Children, type ReactElement } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { Colors, Radii, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <FloatingDock>
          <TabTrigger name="index" href="/(tabs)" asChild>
            <TabButton icon={{ ios: 'house', android: 'home', web: 'house' }} label="Dashboard" />
          </TabTrigger>
          <TabTrigger name="accounts" href="/(tabs)/accounts" asChild>
            <TabButton icon={{ ios: 'wallet.pass', android: 'account_balance', web: 'wallet' }} label="Accounts" />
          </TabTrigger>
          <TabTrigger name="goals" href="/(tabs)/goals" asChild>
            <TabButton icon={{ ios: 'target', android: 'flag', web: 'flag' }} label="Goals" />
          </TabTrigger>
        </FloatingDock>
      </TabList>
    </Tabs>
  );
}

function FloatingDock(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const children = Children.toArray(props.children) as ReactElement[];

  return (
    <View style={styles.container}>
      <View style={[styles.dock, { backgroundColor: colors.card }]}>
        {children[0]}
        {children[1]}
        <Pressable
          style={[styles.fab, { backgroundColor: colors.accent }]}
          onPress={() => router.push('/add-transaction')}
        >
          <SymbolView name="plus" tintColor="#fff" size={22} weight="bold" />
        </Pressable>
        {children[2]}
      </View>
    </View>
  );
}

function TabButton({
  icon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: Record<string, string>; label: string }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [styles.tabBtn, pressed && { opacity: 0.6 }]}
    >
      <SymbolView
        tintColor={isFocused ? colors.accent : colors.textTertiary}
        name={icon as any}
        size={22}
        weight={isFocused ? 'bold' : 'medium'}
      />
      <View
        style={[
          styles.dot,
          { backgroundColor: isFocused ? colors.accent : 'transparent' },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    pointerEvents: 'box-none',
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    maxWidth: 400,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.card + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
