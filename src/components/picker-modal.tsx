import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export interface PickerOption {
  id: number;
  label: string;
  icon: string;
  color?: string;
}

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}

export function PickerModal({
  visible,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
}: PickerModalProps) {
  const theme = useTheme();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search
        ? options.filter((o) =>
            o.label.toLowerCase().includes(search.toLowerCase()),
          )
        : options,
    [options, search],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.card }]}
          onPress={() => {}}
        >
          <View style={styles.handle} />
          <ThemedText
            type="subtitle"
            style={[styles.title, { color: theme.text }]}
          >
            {title}
          </ThemedText>
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: theme.border, color: theme.text },
            ]}
            placeholder="Search..."
            placeholderTextColor={theme.textTertiary}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const selected = item.id === selectedId;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  style={[
                    styles.option,
                    selected && { backgroundColor: theme.accent + "20" },
                  ]}
                >
                  <ThemedText style={styles.optionIcon}>
                    {item.icon}
                  </ThemedText>
                  <View style={styles.optionInfo}>
                    <ThemedText
                      type="default"
                      style={[
                        styles.optionLabel,
                        selected && { color: theme.accent },
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                  </View>
                  {selected && (
                    <ThemedText style={{ color: theme.accent }}>
                      ✓
                    </ThemedText>
                  )}
                </Pressable>
              );
            }}
            contentContainerStyle={styles.list}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.md,
  },
  searchInput: {
    fontSize: 15,
    padding: Spacing.md,
    borderRadius: Radii.input,
    marginBottom: Spacing.sm,
  },
  list: {
    gap: 2,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.input,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontWeight: "600",
  },
});
