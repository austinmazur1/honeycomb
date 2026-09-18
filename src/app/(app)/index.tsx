import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SaveCard } from '@/components/save-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCategories } from '@/hooks/use-categories';
import { useSaves } from '@/hooks/use-saves';
import { useTabScreenInsets } from '@/hooks/use-tab-screen-insets';
import type { Platform } from '@/lib/database.types';
import { PLATFORM_LABELS } from '@/lib/platform';

const PLATFORMS: Platform[] = ['instagram', 'x', 'youtube', 'linkedin', 'other'];

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useTabScreenInsets();
  const { saves, isLoading, refetch } = useSaves();
  const { categories } = useCategories();
  const [query, setQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null);

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return saves.filter((save) => {
      if (platformFilter && save.platform !== platformFilter) return false;
      if (!q) return true;
      const categoryName = save.category_id ? (categoryNameById.get(save.category_id) ?? '') : '';
      const haystack = [save.title, categoryName, ...save.tags].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [saves, query, platformFilter, categoryNameById]);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + Spacing.three }]}>
            <ThemedText type="title" style={styles.title}>
              Home
            </ThemedText>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search saves"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.search,
                { backgroundColor: theme.backgroundElement, color: theme.text },
              ]}
            />

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={PLATFORMS}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.chips}
              renderItem={({ item }) => {
                const selected = platformFilter === item;
                return (
                  <Pressable onPress={() => setPlatformFilter(selected ? null : item)}>
                    <ThemedView
                      type={selected ? 'backgroundSelected' : 'backgroundElement'}
                      style={styles.chip}>
                      <ThemedText type="small">{PLATFORM_LABELS[item]}</ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              }}
            />
          </View>
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
                {saves.length === 0
                  ? "Nothing saved yet — share a link from Instagram, X, YouTube or LinkedIn, or tap + to add one."
                  : 'No saves match your search.'}
              </ThemedText>
            </View>
          ) : null
        }
      />

      <Pressable
        onPress={() => router.push('/add')}
        style={[styles.fab, { backgroundColor: theme.text, bottom: insets.bottom }]}>
        <Text style={[styles.fabPlus, { color: theme.background }]}>+</Text>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: Spacing.six * 2 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, gap: Spacing.two },
  title: { fontSize: 32, lineHeight: 38 },
  search: {
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chips: { gap: Spacing.one, paddingVertical: Spacing.one },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  itemWrapper: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  empty: { padding: Spacing.four, alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabPlus: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
});
