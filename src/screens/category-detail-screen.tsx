import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { SaveCard, TagFilter, ThemedText, ThemedView } from '@/components';
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

  const isUncategorized = categoryId === 'uncategorized';
  const category = categories.find((c) => c.id === categoryId);
  const title = isUncategorized ? 'Uncategorized' : (category?.name ?? 'Collection');

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
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom }]}
        ListHeaderComponent={
          tags.length > 0 ? (
            <View style={styles.tagFilter}>
              <TagFilter tags={tags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <SaveCard save={item} />
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <ThemedText themeColor="textSecondary">
                {selectedTag ? `No saves tagged "${selectedTag}".` : 'Nothing here yet.'}
              </ThemedText>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: Spacing.three },
  itemWrapper: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.two },
  tagFilter: { marginBottom: Spacing.two },
  empty: { padding: Spacing.four, alignItems: 'center' },
});
