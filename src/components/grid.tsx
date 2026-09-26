import type { ReactElement } from "react";
import { FlatList, StyleSheet, View, type FlatListProps } from "react-native";

import { GRID_CELL_PADDING, GRID_COLUMNS, GRID_INSET } from "@/components/grid.constants";

export type GridProps<T> = Omit<FlatListProps<T>, "numColumns" | "renderItem"> & {
  renderItem: (item: T) => ReactElement;
};

/** Two-column tile grid lined up with the screen margin. Other props pass through to the FlatList. */
export function Grid<T>({ renderItem, contentContainerStyle, ...rest }: GridProps<T>) {
  return (
    <FlatList
      {...rest}
      numColumns={GRID_COLUMNS}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      renderItem={({ item }) => <View style={styles.cell}>{renderItem(item)}</View>}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: GRID_INSET },
  // Fixed-width cells with padding as the gutter, so an odd last tile doesn't stretch.
  cell: { width: `${100 / GRID_COLUMNS}%`, padding: GRID_CELL_PADDING },
});
