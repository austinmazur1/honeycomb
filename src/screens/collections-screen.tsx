import { useMemo } from "react";
import { StyleSheet } from "react-native";

import {
  CollectionCard,
  Grid,
  NewCollectionTile,
  ScreenTitle,
  ThemedView,
} from "@/components";
import { GRID_CELL_PADDING } from "@/components/grid.constants";
import { Spacing } from "@/constants/theme";
import { useCategories } from "@/hooks/use-categories";
import { useSaves } from "@/hooks/use-saves";
import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import {
  summarizeCollections,
  type CollectionSummary,
} from "@/utils/collection-summaries";

type GridItem =
  | { kind: "collection"; collection: CollectionSummary }
  | { kind: "new" };

export default function CollectionsScreen() {
  const insets = useTabScreenInsets();
  const { categories } = useCategories();
  const { saves } = useSaves();

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
            <NewCollectionTile />
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
});
