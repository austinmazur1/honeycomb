import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import {
  EmptyState,
  FilterPills,
  SaveGrid,
  ScreenTitle,
  TextField,
  ThemedView,
} from "@/components";
import { Spacing } from "@/constants/theme";
import { useCategories } from "@/hooks/use-categories";
import { useSaves } from "@/hooks/use-saves";
import { useTabScreenInsets } from "@/hooks/use-tab-screen-insets";
import { useTheme } from "@/hooks/use-theme";
import type { Platform } from "@/lib/database.types";
import { PLATFORM_LABELS, PLATFORMS } from "@/lib/platform.constants";
import { filterSaves } from "@/utils/filter-saves";

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useTabScreenInsets();
  const { saves, isLoading, isFetching, refetch } = useSaves();
  const { categories } = useCategories();
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null);

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filtered = useMemo(
    () => filterSaves(saves, query, platformFilter, categoryNameById),
    [saves, query, platformFilter, categoryNameById],
  );

  return (
    <ThemedView style={styles.container}>
      <SaveGrid
        saves={filtered}
        // Leave room for the FAB so it doesn't sit on the last row's footer.
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.six + Spacing.three,
        }}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <View
            style={[styles.header, { paddingTop: insets.top + Spacing.three }]}
          >
            <ScreenTitle>Home</ScreenTitle>

            <TextField
              value={query}
              onChangeText={setQuery}
              placeholder="Search saves"
            />

            <FilterPills
              options={PLATFORMS}
              selected={platformFilter}
              onSelect={setPlatformFilter}
              getLabel={(platform) => PLATFORM_LABELS[platform]}
              contentContainerStyle={styles.platformFilter}
            />
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              message={
                saves.length === 0
                  ? "Nothing saved yet — share a link from Instagram, X, YouTube or LinkedIn, or tap + to add one."
                  : "No saves match your search."
              }
            />
          ) : null
        }
      />

      <Pressable
        onPress={() => router.push("/add")}
        style={[
          styles.fab,
          { backgroundColor: theme.text, bottom: insets.bottom },
        ]}
      >
        <Text style={[styles.fabPlus, { color: theme.background }]}>+</Text>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
    gap: Spacing.two,
  },
  // The header already lines up with the screen margin, so drop FilterPills' own inset.
  platformFilter: { paddingHorizontal: 0, paddingVertical: Spacing.one },
  fab: {
    position: "absolute",
    right: Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabPlus: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "400",
  },
});
