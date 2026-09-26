import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/**
 * 1 image fills the cover, 2 sit side by side, 3 are one tall plus two stacked, 4 are a 2×2 grid.
 */
export function CoverCollage({ urls }: { urls: string[] }) {
  const theme = useTheme();

  if (urls.length === 0) {
    return (
      <ThemedView type="backgroundSelected" style={[styles.cover, styles.emptyCover]}>
        <Ionicons name="folder-outline" size={32} color={theme.textSecondary} />
      </ThemedView>
    );
  }

  const columns =
    urls.length === 4 ? [[urls[0], urls[2]], [urls[1], urls[3]]] : [[urls[0]], urls.slice(1)].filter((c) => c.length > 0);

  return (
    <View style={[styles.cover, styles.collage]}>
      {columns.map((column, i) => (
        <View key={i} style={styles.column}>
          {column.map((url, j) => (
            <Image key={j} source={{ uri: url }} style={styles.cell} contentFit="cover" transition={150} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: "100%",
    aspectRatio: 1,
  },
  emptyCover: {
    alignItems: "center",
    justifyContent: "center",
  },
  collage: {
    flexDirection: "row",
    gap: Spacing.half,
  },
  column: {
    flex: 1,
    gap: Spacing.half,
  },
  cell: {
    flex: 1,
  },
});
