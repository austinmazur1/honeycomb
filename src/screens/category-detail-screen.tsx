import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { SaveCard, ThemedText, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/use-categories';
import { useSaves } from '@/hooks/use-saves';
import { useTabScreenInsets } from '@/hooks/use-tab-screen-insets';

export default function CategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const insets = useTabScreenInsets();
  const { saves, isLoading } = useSaves();
  const { categories } = useCategories();

  const isUncategorized = categoryId === 'uncategorized';
  const category = categories.find((c) => c.id === categoryId);
  const title = isUncategorized ? 'Uncategorized' : (category?.name ?? 'Collection');

  const filtered = useMemo(
    () =>
      saves.filter((save) => (isUncategorized ? save.category_id === null : save.category_id === categoryId)),
    [saves, categoryId, isUncategorized],
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title }} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom }]}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <SaveCard save={item} />
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <ThemedText themeColor="textSecondary">Nothing here yet.</ThemedText>
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
  empty: { padding: Spacing.four, alignItems: 'center' },
});
