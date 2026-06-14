import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useGoals } from '@/hooks/use-goals';

const GOAL_ICONS = [
  { icon: '🎯', color: '#3498DB' },
  { icon: '🏠', color: '#E74C3C' },
  { icon: '🚗', color: '#2ECC71' },
  { icon: '✈️', color: '#F39C12' },
  { icon: '🎓', color: '#9B59B6' },
  { icon: '💻', color: '#1ABC9C' },
  { icon: '🏋️', color: '#E67E22' },
  { icon: '💰', color: '#27AE60' },
];

export default function AddGoalScreen() {
  const theme = useTheme();
  const { create } = useGoals();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selected, setSelected] = useState(GOAL_ICONS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const targetAmount = parseFloat(target);
    if (!name.trim() || !targetAmount || targetAmount <= 0) return;
    setSaving(true);
    try {
      await create({
        name: name.trim(),
        target_amount: targetAmount,
        icon: selected.icon,
        color: selected.color,
        deadline: deadline || null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }, [name, target, deadline, selected, create]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle" style={styles.title}>Add Goal</ThemedText>

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          placeholder="Goal Name"
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          placeholder="Target Amount (₱)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          value={target}
          onChangeText={setTarget}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          placeholder="Deadline YYYY-MM-DD (optional)"
          placeholderTextColor={theme.textSecondary}
          value={deadline}
          onChangeText={setDeadline}
        />

        <View style={styles.field}>
          <ThemedText type="smallBold">Icon</ThemedText>
          <View style={styles.chipRow}>
            {GOAL_ICONS.map((g) => (
              <Pressable
                key={g.icon}
                onPress={() => setSelected(g)}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: selected.icon === g.icon ? g.color : theme.backgroundElement,
                  },
                ]}
              >
                <ThemedText style={styles.iconEmoji}>{g.icon}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveBtn,
            { backgroundColor: theme.text, opacity: saving ? 0.5 : 1 },
          ]}
        >
          <ThemedText
            type="smallBold"
            style={{ color: theme.background, textAlign: 'center' }}
          >
            {saving ? 'Saving...' : 'Save Goal'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  title: { marginBottom: Spacing.two },
  input: {
    fontSize: 16,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  field: { gap: Spacing.one },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22 },
  saveBtn: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    marginTop: Spacing.two,
  },
});
