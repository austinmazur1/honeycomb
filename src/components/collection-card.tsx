import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { CollectionSummary } from "@/utils/collection-summaries";
import { pluralize } from "@/utils/string";

/** Grid tile for a collection: square collage of its newest thumbnails, name and count underneath. */
export function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/collections/${collection.id}`)}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <CoverCollage urls={collection.coverUrls} />
        <View style={styles.footer}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {collection.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {pluralize(collection.count, "save")}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

/**
 * 1 image fills the cover, 2 sit side by side, 3 are one tall plus two stacked, 4 are a 2×2 grid.
 */
function CoverCollage({ urls }: { urls: string[] }) {
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
  card: {
    borderRadius: Radius.card,
    overflow: "hidden",
  },
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
  footer: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
});
