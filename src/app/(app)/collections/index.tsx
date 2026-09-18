import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCategories } from '@/hooks/use-categories';
import { useSaves } from '@/hooks/use-saves';
import { useTabScreenInsets } from '@/hooks/use-tab-screen-insets';

export default function CollectionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useTabScreenInsets();
  const { categories, createCategory } = useCategories();
  const { saves } = useSaves();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const countByCategoryId = useMemo(() => {
    const counts = new Map<string, number>();
    let uncategorized = 0;
    for (const save of saves) {
      if (save.category_id) {
        counts.set(save.category_id, (counts.get(save.category_id) ?? 0) + 1);
      } else {
        uncategorized += 1;
      }
    }
    return { counts, uncategorized };
  }, [saves]);

  const rows = useMemo(
    () => [
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        count: countByCategoryId.counts.get(category.id) ?? 0,
      })),
      { id: 'uncategorized', name: 'Uncategorized', count: countByCategoryId.uncategorized },
    ],
    [categories, countByCategoryId],
  );

  async function handleAddCategory() {
    const name = newName.trim();
    if (!name) {
      setIsAdding(false);
      return;
    }
    try {
      await createCategory(name);
    } catch (error) {
      console.error('Failed to create category', error);
    }
    setNewName('');
    setIsAdding(false);
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom },
        ]}
        ListHeaderComponent={
          <ThemedText type="title" style={styles.title}>
            Collections
          </ThemedText>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/collections/${item.id}`)}>
            <ThemedView type="backgroundElement" style={styles.row}>
              <ThemedText type="smallBold">{item.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.count}
              </ThemedText>
            </ThemedView>
          </Pressable>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {isAdding ? (
              <TextInput
                autoFocus
                value={newName}
                onChangeText={setNewName}
                onSubmitEditing={handleAddCategory}
                onBlur={handleAddCategory}
                placeholder="Category name"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { backgroundColor: theme.backgroundElement, color: theme.text },
                ]}
              />
            ) : (
              <Pressable onPress={() => setIsAdding(true)}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="smallBold">+ New category</ThemedText>
                </ThemedView>
              </Pressable>
            )}
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  title: { fontSize: 32, lineHeight: 38, marginBottom: Spacing.two },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 14,
    marginBottom: Spacing.two,
  },
  footer: { marginTop: Spacing.one },
  input: {
    borderRadius: 14,
    padding: Spacing.three,
    fontSize: 16,
  },
});
