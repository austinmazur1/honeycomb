import { StyleSheet, View } from "react-native";

import { Pill, TextField } from "@/components";
import { Spacing } from "@/constants/theme";
import { useCategories } from "@/hooks/use-categories";
import { useNewCategoryInput } from "@/hooks/use-new-category-input";

type CategoryPickerProps = {
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
};

/** Chip row of the user's categories, with "None" and an inline "+ New" that creates and selects one. */
export function CategoryPicker({ selectedId, onSelect }: CategoryPickerProps) {
  const { categories } = useCategories();
  const newCategory = useNewCategoryInput({
    onCreated: (category) => onSelect(category.id),
  });

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
        {!newCategory.isAdding && (
          <Pill label="+ New" onPress={newCategory.start} />
        )}
      </View>
      {newCategory.isAdding && (
        <TextField {...newCategory.inputProps} placeholder="New category name" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.one },
});
