import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { CoverCollage } from "@/components/cover-collage";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radius, Spacing } from "@/constants/theme";
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

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    overflow: "hidden",
  },
  footer: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
});
