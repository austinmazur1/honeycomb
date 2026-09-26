import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import {
  CollectionCard,
  Grid,
  ScreenTitle,
  TextField,
  ThemedText,
  ThemedView,
} from "@/components";
import { GRID_CELL_PADDING } from "@/components/grid.constants";
import { Radius, Spacing } from "@/constants/theme";
import { useCategories } from "@/hooks/use-categories";
import { useNewCategoryInput } from "@/hooks/use-new-category-input";
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
  const { saves } = useSaves();
  const newCategory = useNewCategoryInput();

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

  function renderNewTile() {
    if (newCategory.isAdding) {
      return (
        <ThemedView type="backgroundElement" style={styles.newTile}>
          <TextField
            {...newCategory.inputProps}
            placeholder="Collection name"
            style={styles.input}
          />
        </ThemedView>
      );
    }
    return (
      <Pressable onPress={newCategory.start} style={styles.newTileHit}>
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
      <Grid
        data={items}
        keyExtractor={(item) =>
          item.kind === "collection" ? item.collection.id : "new"
        }
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom,
        }}
        ListHeaderComponent={
          <ScreenTitle style={styles.title}>Collections</ScreenTitle>
        }
        renderItem={(item) =>
          item.kind === "collection" ? (
            <CollectionCard collection={item.collection} />
          ) : (
            renderNewTile()
          )
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // The grid pads its cells, not the header; match the tiles' edge.
  title: { marginBottom: Spacing.two, paddingHorizontal: GRID_CELL_PADDING },
  newTileHit: { flex: 1 },
  // Stretches to match a neighbouring card's height; minHeight covers a tile alone on its row.
  newTile: {
    flex: 1,
    minHeight: 160,
    borderRadius: Radius.card,
    justifyContent: "center",
    padding: Spacing.three,
  },
  newTileIdle: {
    alignItems: "center",
    gap: Spacing.one,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  input: { textAlign: "center" },
});
