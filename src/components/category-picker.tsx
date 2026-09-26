import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Pill, TextField } from "@/components";
import { Spacing } from "@/constants/theme";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";

type CategoryPickerProps = {
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
};

/** Chip row of the user's categories, with "None" and an inline "+ New" that creates and selects one. */
export function CategoryPicker({ selectedId, onSelect }: CategoryPickerProps) {
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
        <Pill
          label="None"
          selected={selectedId === null}
          onPress={() => onSelect(null)}
        />
        {categories.map((category) => (
          <Pill
            key={category.id}
            label={category.name}
            selected={selectedId === category.id}
            onPress={() => onSelect(category.id)}
          />
        ))}
        {!isAdding && (
          <Pill
            label="+ New"
            onPress={() => setIsAdding(true)}
          />
        )}
      </View>
      {isAdding && (
        <TextField
          autoFocus
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleAddCategory}
          onBlur={handleAddCategory}
          placeholder="New category name"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.one },
});
