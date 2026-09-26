import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, FilterPills, SaveGrid, ThemedView } from '@/components';
import { GRID_INSET } from '@/components/grid.constants';
import { UNCATEGORIZED_ID, UNCATEGORIZED_LABEL } from '@/constants/collections';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/use-categories';
import { useSaves } from '@/hooks/use-saves';
import { useTabScreenInsets } from '@/hooks/use-tab-screen-insets';

export default function CategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const insets = useTabScreenInsets();
  const { saves, isLoading } = useSaves();
  const { categories } = useCategories();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);
  if (categoryId !== prevCategoryId) {
    setPrevCategoryId(categoryId);
    setSelectedTag(null);
  }

  const isUncategorized = categoryId === UNCATEGORIZED_ID;
  const category = categories.find((c) => c.id === categoryId);
  const title = isUncategorized ? UNCATEGORIZED_LABEL : (category?.name ?? 'Collection');

  const categorySaves = useMemo(
    () =>
      saves.filter((save) => (isUncategorized ? save.category_id === null : save.category_id === categoryId)),
    [saves, categoryId, isUncategorized],
  );

  const tags = useMemo(() => {
    const unique = new Set<string>();
    for (const save of categorySaves) {
      for (const tag of save.tags) unique.add(tag);
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [categorySaves]);

  const filtered = useMemo(
    () => (selectedTag ? categorySaves.filter((save) => save.tags.includes(selectedTag)) : categorySaves),
    [categorySaves, selectedTag],
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title }} />
      <SaveGrid
        saves={filtered}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom }]}
        ListHeaderComponent={
          tags.length > 0 ? (
            <View style={styles.tagFilter}>
              <FilterPills options={tags} selected={selectedTag} onSelect={setSelectedTag} allLabel="All" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState message={selectedTag ? `No saves tagged "${selectedTag}".` : 'Nothing here yet.'} />
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: Spacing.three },
  // FilterPills brings its own horizontal padding; cancel the grid's so they line up.
  tagFilter: { marginBottom: Spacing.one, marginHorizontal: -GRID_INSET },
});
