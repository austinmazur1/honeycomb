import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText, ThemedView } from "@/components";
import { Spacing } from "@/constants/theme";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { useTheme } from "@/hooks/use-theme";

type CategoryPickerProps = {
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
};

/** Chip row of the user's categories, with "None" and an inline "+ New" that creates and selects one. */
export function CategoryPicker({ selectedId, onSelect }: CategoryPickerProps) {
  const theme = useTheme();
  const { categories } = useCategories();
  const createCategory = useCreateCategory();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  async function handleAddCategory() {
    const name = newName.trim();
    setIsAdding(false);
    setNewName("");
    if (!name) return;
    try {
      const category = await createCategory.mutateAsync(name);
      onSelect(category.id);
    } catch (error) {
      console.error("Failed to create category", error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.chips}>
        <Chip
          label="None"
          selected={selectedId === null}
          onPress={() => onSelect(null)}
        />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            selected={selectedId === category.id}
            onPress={() => onSelect(category.id)}
          />
        ))}
        {!isAdding && (
          <Chip
            label="+ New"
            selected={false}
            onPress={() => setIsAdding(true)}
          />
        )}
      </View>
      {isAdding && (
        <TextInput
          autoFocus
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleAddCategory}
          onBlur={handleAddCategory}
          placeholder="New category name"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            { backgroundColor: theme.backgroundElement, color: theme.text },
          ]}
        />
      )}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView
        type={selected ? "backgroundSelected" : "backgroundElement"}
        style={styles.chip}
      >
        <ThemedText type="small">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.one },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
