import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TextField } from "@/components/ui/text-field";
import { Radius, Spacing } from "@/constants/theme";
import { useNewCategoryInput } from "@/hooks/use-new-category-input";
import { useTheme } from "@/hooks/use-theme";

/** Dashed "New collection" grid tile that turns into a name input when tapped. */
export function NewCollectionTile() {
  const theme = useTheme();
  const newCategory = useNewCategoryInput();

  if (newCategory.isAdding) {
    return (
      <ThemedView type="backgroundElement" style={styles.tile}>
        <TextField
          {...newCategory.inputProps}
          placeholder="Collection name"
          style={styles.input}
        />
      </ThemedView>
    );
  }

  return (
    <Pressable onPress={newCategory.start} style={styles.hitArea}>
      <View
        style={[
          styles.tile,
          styles.idle,
          { borderColor: theme.backgroundSelected },
        ]}
      >
        <Ionicons name="add" size={28} color={theme.textSecondary} />
        <ThemedText type="small" themeColor="textSecondary">
          New collection
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitArea: { flex: 1 },
  // Stretches to match a neighbouring card's height; minHeight covers a tile alone on its row.
  tile: {
    flex: 1,
    minHeight: 160,
    borderRadius: Radius.card,
    justifyContent: "center",
    padding: Spacing.three,
  },
  idle: {
    alignItems: "center",
    gap: Spacing.one,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  input: { textAlign: "center" },
});
