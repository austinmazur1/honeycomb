import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, CategoryPicker, Section, TextField } from "@/components";
import { Spacing } from "@/constants/theme";
import { useCreateSave } from "@/hooks/use-saves";
import { useTheme } from "@/hooks/use-theme";
import { fetchLinkMetadata } from "@/lib/link-metadata";
import { hasCaptionInsteadOfTitle, inferPlatform } from "@/lib/platform";
import { parseTags } from "@/utils/tags";

export default function AddSaveScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const createSave = useCreateSave();
  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
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

  async function handleSave() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || !user) return;
    const tags = parseTags(tagsText);
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
      <Section label="Link" style={styles.field}>
        <TextField
          value={url}
          onChangeText={handleUrlChange}
          onBlur={handleUrlBlur}
          placeholder="https://..."
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </Section>

      <Section
        label="Title"
        accessory={isFetchingMetadata && <ActivityIndicator size="small" />}
        style={styles.field}
      >
        <TextField
          value={title}
          onChangeText={setTitle}
          placeholder="What is this?"
        />
      </Section>

      <Section label="Tags (comma separated)" style={styles.field}>
        <TextField
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="bjj, technique, guard-pass"
          autoCapitalize="none"
        />
      </Section>

      <Section label="Category" style={styles.field}>
        <CategoryPicker selectedId={categoryId} onSelect={setCategoryId} />
      </Section>

      <Button
        label="Save"
        onPress={handleSave}
        disabled={!canSave}
        loading={createSave.isPending}
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
      />
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
  saveButton: { marginTop: Spacing.two },
  saveButtonDisabled: { opacity: 0.5 },
});
