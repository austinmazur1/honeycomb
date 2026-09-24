import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText, ThemedView } from "@/components";
import { Spacing } from "@/constants/theme";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { useCreateSave } from "@/hooks/use-saves";
import { useTheme } from "@/hooks/use-theme";
import { fetchLinkMetadata } from "@/lib/link-metadata";
import { hasCaptionInsteadOfTitle, inferPlatform } from "@/lib/platform";

export default function AddSaveScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { categories } = useCategories();
  const createCategory = useCreateCategory();
  const createSave = useCreateSave();
  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const consumedShareIntent = useRef(false);

  function clearFetchedMetadata() {
    setThumbnailUrl(null);
    setDescription(null);
    setAuthorName(null);
  }

  function handleUrlChange(text: string) {
    setUrl(text);
    clearFetchedMetadata(); // a new URL means the old caption/author/thumbnail no longer apply
  }

  async function lookupMetadata(sourceUrl: string) {
    setThumbnailUrl(null);
    setDescription(null);
    setAuthorName(null);
    setIsFetchingMetadata(true);
    const metadata = await fetchLinkMetadata(sourceUrl);
    setIsFetchingMetadata(false);

    if (metadata.title) setTitle((current) => current || metadata.title!);
    if (metadata.thumbnailUrl) setThumbnailUrl(metadata.thumbnailUrl);
    if (metadata.description) setDescription(metadata.description);
    if (metadata.authorName) setAuthorName(metadata.authorName);
  }

  async function handleUrlBlur() {
    const trimmed = url.trim();
    if (!trimmed || title.trim()) return; // don't clobber a title the user already typed
    await lookupMetadata(trimmed);
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    setIsAddingCategory(false);
    setNewCategoryName("");
    if (!name) return;
    try {
      const category = await createCategory.mutateAsync(name);
      setCategoryId(category.id);
    } catch (error) {
      console.error("Failed to create category", error);
    }
  }

  async function handleSave() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || !user) return;
    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    try {
      await createSave.mutateAsync({
        owner_user_id: user.id,
        url: trimmedUrl,
        platform: inferPlatform(trimmedUrl),
        title: title.trim() || null,
        thumbnail_url: thumbnailUrl,
        description,
        author_name: authorName,
        category_id: categoryId,
        tags,
      });
      router.back();
    } catch (error) {
      console.error("Failed to save", error);
    }
  }

  // Prefill from the OS share sheet, once, the first time a share intent shows up.
  useEffect(() => {
    if (!hasShareIntent || consumedShareIntent.current) return;
    consumedShareIntent.current = true;
    const sharedUrl = shareIntent.webUrl ?? shareIntent.text ?? "";
    if (!sharedUrl) return;
    setUrl(sharedUrl);
    // The share sheet's "title" for social posts is the caption — don't use it as a title.
    if (shareIntent.meta?.title && !hasCaptionInsteadOfTitle(inferPlatform(sharedUrl))) {
      setTitle(shareIntent.meta.title);
    }
    lookupMetadata(sharedUrl);
  }, [hasShareIntent, shareIntent]);

  // Clear the native share buffer once this screen is done with it.
  useEffect(() => {
    return () => {
      resetShareIntent();
    };
  }, [resetShareIntent]);

  const canSave = url.trim().length > 0 && !createSave.isPending;

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + Spacing.six },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Link
        </ThemedText>
        <TextInput
          value={url}
          onChangeText={handleUrlChange}
          onBlur={handleUrlBlur}
          placeholder="https://..."
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={[
            styles.input,
            { backgroundColor: theme.backgroundElement, color: theme.text },
          ]}
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
          style={[
            styles.input,
            { backgroundColor: theme.backgroundElement, color: theme.text },
          ]}
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
          style={[
            styles.input,
            { backgroundColor: theme.backgroundElement, color: theme.text },
          ]}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary">
          Category
        </ThemedText>
        <View style={styles.chips}>
          <Pressable onPress={() => setCategoryId(null)}>
            <ThemedView
              type={
                categoryId === null ? "backgroundSelected" : "backgroundElement"
              }
              style={styles.chip}
            >
              <ThemedText type="small">None</ThemedText>
            </ThemedView>
          </Pressable>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => setCategoryId(category.id)}
            >
              <ThemedView
                type={
                  categoryId === category.id
                    ? "backgroundSelected"
                    : "backgroundElement"
                }
                style={styles.chip}
              >
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
        ]}
      >
        {createSave.isPending ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text style={[styles.saveButtonText, { color: theme.background }]}>
            Save
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  field: { gap: Spacing.one },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.one },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  saveButton: {
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  saveButtonText: { fontSize: 16, fontWeight: "600" },
});
