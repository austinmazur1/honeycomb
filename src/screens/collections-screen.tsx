import { useMemo, useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import { useIsFocused } from "expo-router";

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
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
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
  const listRef = useRef<FlatList<GridItem>>(null);
  // Tab screens stay mounted, so ignore a keyboard opened on another tab.
  const isFocused = useIsFocused();
  const openKeyboardHeight = useKeyboardHeight();
  const keyboardHeight = isFocused ? openKeyboardHeight : 0;

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
        ref={listRef}
        data={items}
        keyExtractor={(item) =>
          item.kind === "collection" ? item.collection.id : "new"
        }
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.three,
          // The keyboard covers the tab bar, so it replaces the tab inset rather than adding to it.
          paddingBottom: Math.max(insets.bottom, keyboardHeight + Spacing.three),
        }}
        // The only input here is the "New collection" tile, which is always last. Scroll once the
        // keyboard padding has grown the content: scrolling any earlier targets the old, shorter end.
        onContentSizeChange={() => {
          if (keyboardHeight > 0) listRef.current?.scrollToEnd({ animated: true });
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
