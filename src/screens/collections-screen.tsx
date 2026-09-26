import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";

import { CollectionCard, ThemedText, ThemedView } from "@/components";
import { Spacing } from "@/constants/theme";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { useSaves } from "@/hooks/use-saves";
import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import { useTheme } from "@/hooks/use-theme";
import {
  summarizeCollections,
  type CollectionSummary,
} from "@/utils/collection-summaries";

type GridItem =
  | { kind: "collection"; collection: CollectionSummary }
  | { kind: "new" };

export default function CollectionsScreen() {
  const theme = useTheme();
  const insets = useTabScreenInsets();
  const { categories } = useCategories();
  const createCategory = useCreateCategory();
  const { saves } = useSaves();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const items = useMemo<GridItem[]>(
    () => [
      ...summarizeCollections(categories, saves).map((collection) => ({
        kind: "collection" as const,
        collection,
      })),
      { kind: "new" },
    ],
    [categories, saves],
  );

  async function handleAddCategory() {
    const name = newName.trim();
    if (!name) {
      setIsAdding(false);
      return;
    }
    try {
      await createCategory.mutateAsync(name);
    } catch (error) {
      console.error("Failed to create category", error);
    }
    setNewName("");
    setIsAdding(false);
  }

  function renderNewTile() {
    if (isAdding) {
      return (
        <ThemedView type="backgroundElement" style={styles.newTile}>
          <TextInput
            autoFocus
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={handleAddCategory}
            onBlur={handleAddCategory}
            placeholder="Collection name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
          />
        </ThemedView>
      );
    }
    return (
      <Pressable onPress={() => setIsAdding(true)} style={styles.newTileHit}>
        <View
          style={[
            styles.newTile,
            styles.newTileIdle,
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

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) =>
          item.kind === "collection" ? item.collection.id : "new"
        }
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top + Spacing.three,
            paddingBottom: insets.bottom,
          },
        ]}
        ListHeaderComponent={
          <ThemedText type="title" style={styles.title}>
            Collections
          </ThemedText>
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            {item.kind === "collection" ? (
              <CollectionCard collection={item.collection} />
            ) : (
              renderNewTile()
            )}
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.three - Spacing.one },
  title: {
    fontSize: 32,
    lineHeight: 38,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  // Half-width cells with padding as the gutter, so an odd last tile doesn't stretch.
  itemWrapper: { width: "50%", padding: Spacing.one },
  newTileHit: { flex: 1 },
  // Stretches to match a neighbouring card's height; minHeight covers a tile alone on its row.
  newTile: {
    flex: 1,
    minHeight: 160,
    borderRadius: 14,
    justifyContent: "center",
    padding: Spacing.three,
  },
  newTileIdle: {
    alignItems: "center",
    gap: Spacing.one,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  input: { fontSize: 16, textAlign: "center" },
});
