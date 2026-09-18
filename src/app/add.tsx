import { useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/use-categories';
import { useTheme } from '@/hooks/use-theme';
import { fetchLinkMetadata } from '@/lib/link-metadata';
import { inferPlatform } from '@/lib/platform';
import { useSupabaseClient } from '@/lib/supabase';

// TODO(milestone 5): when arriving via the OS share sheet, expo-share-intent's
// useShareIntentContext() will prefill `url`/`title`/`thumbnailUrl` here instead
// of the user typing a URL manually. The form/save logic below is unchanged either way.

export default function AddSaveScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const { categories, createCategory } = useCategories();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleUrlBlur() {
    const trimmed = url.trim();
    if (!trimmed || title.trim()) return; // don't clobber a title the user already typed

    setIsFetchingMetadata(true);
    const metadata = await fetchLinkMetadata(trimmed);
    setIsFetchingMetadata(false);

    if (metadata.title) setTitle(metadata.title);
    if (metadata.thumbnailUrl) setThumbnailUrl(metadata.thumbnailUrl);
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    setIsAddingCategory(false);
    setNewCategoryName('');
    if (!name) return;
    try {
      const category = await createCategory(name);
      setCategoryId(category.id);
    } catch (error) {
      console.error('Failed to create category', error);
    }
  }

  async function handleSave() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || !user) return;

    setIsSaving(true);
    const tags = tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const { error } = await supabase.from('saves').insert({
      owner_user_id: user.id,
      url: trimmedUrl,
      platform: inferPlatform(trimmedUrl),
      title: title.trim() || null,
      thumbnail_url: thumbnailUrl,
      category_id: categoryId,
      tags,
    });

    setIsSaving(false);
    if (error) {
      console.error('Failed to save', error);
      return;
    }
    router.back();
  }

  const canSave = url.trim().length > 0 && !isSaving;

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
      keyboardShouldPersistTaps="handled">
      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Link
        </ThemedText>
        <TextInput
          value={url}
          onChangeText={setUrl}
          onBlur={handleUrlBlur}
          placeholder="https://..."
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.rowBetween}>
          <ThemedText type="small" themeColor="textSecondary">
            Title
          </ThemedText>
          {isFetchingMetadata && <ActivityIndicator size="small" />}
        </View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What is this?"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Tags (comma separated)
        </ThemedText>
        <TextInput
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="bjj, technique, guard-pass"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Category
        </ThemedText>
        <View style={styles.chips}>
          <Pressable onPress={() => setCategoryId(null)}>
            <ThemedView
              type={categoryId === null ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.chip}>
              <ThemedText type="small">None</ThemedText>
            </ThemedView>
          </Pressable>
          {categories.map((category) => (
            <Pressable key={category.id} onPress={() => setCategoryId(category.id)}>
              <ThemedView
                type={categoryId === category.id ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.chip}>
                <ThemedText type="small">{category.name}</ThemedText>
              </ThemedView>
            </Pressable>
          ))}
          {!isAddingCategory && (
            <Pressable onPress={() => setIsAddingCategory(true)}>
              <ThemedView type="backgroundElement" style={styles.chip}>
                <ThemedText type="small">+ New</ThemedText>
              </ThemedView>
            </Pressable>
          )}
        </View>
        {isAddingCategory && (
          <TextInput
            autoFocus
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            onSubmitEditing={handleAddCategory}
            onBlur={handleAddCategory}
            placeholder="New category name"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              { backgroundColor: theme.backgroundElement, color: theme.text },
            ]}
          />
        )}
      </View>

      <Pressable
        onPress={handleSave}
        disabled={!canSave}
        style={[
          styles.saveButton,
          { backgroundColor: theme.text, opacity: canSave ? 1 : 0.5 },
        ]}>
        {isSaving ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text style={[styles.saveButtonText, { color: theme.background }]}>Save</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  field: { gap: Spacing.one },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: {
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: 999 },
  saveButton: {
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  saveButtonText: { fontSize: 16, fontWeight: '600' },
});
