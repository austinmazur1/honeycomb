import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CategoryPicker,
  EditableText,
  TagEditor,
  ThemedText,
  ThemedView,
} from "@/components";
import { Spacing } from "@/constants/theme";
import { useCategories } from "@/hooks/use-categories";
import { useDeleteSave, useUpdateSave } from "@/hooks/use-saves";
import { useTheme } from "@/hooks/use-theme";
import type { Save } from "@/lib/database.types";
import { fetchLinkMetadata } from "@/lib/link-metadata";
import { PLATFORM_LABELS } from "@/lib/platform";
import { queryKeys } from "@/lib/query-keys";
import { useSupabaseClient } from "@/lib/supabase";
import { fetchSave } from "@/lib/supabase-queries";
import { displayHost } from "@/utils/string";

/** Keeps very tall images from pushing everything else off screen; the viewer shows them in full. */
const MIN_IMAGE_ASPECT_RATIO = 9 / 16;
const DESCRIPTION_PREVIEW_LINES = 4;
const DESCRIPTION_COLLAPSE_THRESHOLD = 240;

type SavePatch = Partial<Omit<Save, "id" | "owner_user_id" | "created_at">>;

export default function SaveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const supabase = useSupabaseClient();
  const { categories } = useCategories();
  const updateSave = useUpdateSave(id);
  const deleteSave = useDeleteSave();

  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // `supabase` is a stable module-level singleton, not a cache-differentiating value.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const { data: save, isPending: isLoading } = useQuery({
    queryKey: queryKeys.save(id),
    queryFn: () => fetchSave(supabase, id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!save) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText themeColor="textSecondary">
          This save could not be found.
        </ThemedText>
      </ThemedView>
    );
  }

  const current = save;
  const sourceLabel =
    current.platform === "other"
      ? displayHost(current.url)
      : PLATFORM_LABELS[current.platform];
  const category = categories.find((c) => c.id === current.category_id);
  const openLabel =
    current.platform === "other"
      ? `Open ${sourceLabel}`
      : `Open in ${sourceLabel}`;
  const showImage = !!current.thumbnail_url && !imageFailed;
  const isLongDescription =
    (current.description?.length ?? 0) > DESCRIPTION_COLLAPSE_THRESHOLD;

  function patch(changes: SavePatch) {
    updateSave.mutate(changes, {
      onError: (error) => {
        console.error("Failed to update save", error);
        Alert.alert("Couldn't save changes", "Please try again.");
      },
    });
  }

  async function handleOpen() {
    try {
      await Linking.openURL(current.url);
    } catch (error) {
      console.error("Failed to open link", error);
    }
  }

  async function handleShare() {
    try {
      await Share.share(
        Platform.OS === "ios"
          ? { url: current.url }
          : { message: current.url, title: current.title ?? undefined },
      );
    } catch (error) {
      console.error("Failed to share save", error);
    }
  }

  async function handleRefreshPreview() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const metadata = await fetchLinkMetadata(current.url);
    setIsRefreshing(false);

    const changes: SavePatch = {};
    if (metadata.thumbnailUrl) changes.thumbnail_url = metadata.thumbnailUrl;
    if (metadata.description) changes.description = metadata.description;
    if (metadata.authorName) changes.author_name = metadata.authorName;
    if (metadata.raw) changes.raw_metadata = metadata.raw;
    // The title belongs to the user; only fill it in if they never set one.
    if (metadata.title && !current.title) changes.title = metadata.title;

    if (Object.keys(changes).length === 0) {
      Alert.alert(
        "Nothing new",
        `Couldn't fetch a fresh preview from ${sourceLabel}.`,
      );
      return;
    }
    // expo-image won't fire onLoad again for the same URL, so keep the measured size unless it changed.
    if (
      changes.thumbnail_url &&
      changes.thumbnail_url !== current.thumbnail_url
    ) {
      setImageFailed(false);
      setImageAspectRatio(null);
    }
    patch(changes);
  }

  async function handleDelete() {
    // Leave first: deleting drops this screen's cached query, which would flash a spinner here.
    router.back();
    try {
      await deleteSave.mutateAsync(current.id);
    } catch (error) {
      console.error("Failed to delete save", error);
      Alert.alert("Couldn't delete", "Please try again.");
    }
  }

  function confirmDelete() {
    if (Platform.OS === "web") {
      if (globalThis.confirm?.("Delete this save? This can't be undone.")) {
        void handleDelete();
      }
      return;
    }
    Alert.alert("Delete this save?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: handleDelete },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: sourceLabel,
          // iOS gets native toolbar items below; SF Symbols aren't available elsewhere.
          headerRight:
            Platform.OS === "ios"
              ? undefined
              : () => (
                  <View style={styles.headerActions}>
                    <HeaderIconButton
                      icon="share-outline"
                      label="Share"
                      onPress={handleShare}
                    />
                    <HeaderIconButton
                      icon="refresh"
                      label="Refresh preview"
                      onPress={handleRefreshPreview}
                    />
                    <HeaderIconButton
                      icon="trash-outline"
                      label="Delete save"
                      onPress={confirmDelete}
                    />
                  </View>
                ),
        }}
      />
      {Platform.OS === "ios" && (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon="square.and.arrow.up"
            accessibilityLabel="Share"
            onPress={handleShare}
          />
          <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="More actions">
            <Stack.Toolbar.MenuAction
              icon="arrow.clockwise"
              onPress={handleRefreshPreview}
            >
              Refresh preview
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="trash"
              destructive
              onPress={confirmDelete}
            >
              Delete save
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      )}

      {/* iOS handles the keyboard via automaticallyAdjustKeyboardInsets; Android needs the resize. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "android" ? "height" : undefined}
      >
        <ScrollView
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + Spacing.five },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
        >
          {/* The image is the way into the post; the badge makes that discoverable. */}
          <Pressable
            onPress={handleOpen}
            accessibilityRole="link"
            accessibilityLabel={openLabel}
          >
            {showImage ? (
              <Image
                source={{ uri: current.thumbnail_url! }}
                style={[
                  styles.image,
                  {
                    backgroundColor: theme.backgroundElement,
                    aspectRatio: Math.max(
                      imageAspectRatio ?? 4 / 5,
                      MIN_IMAGE_ASPECT_RATIO,
                    ),
                  },
                ]}
                contentFit="contain"
                transition={150}
                onLoad={(event) =>
                  setImageAspectRatio(event.source.width / event.source.height)
                }
                onError={() => setImageFailed(true)}
              />
            ) : (
              <ThemedView
                type="backgroundElement"
                style={styles.imagePlaceholder}
              >
                <ThemedText type="subtitle" themeColor="textSecondary">
                  {sourceLabel}
                </ThemedText>
              </ThemedView>
            )}
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>{openLabel}</Text>
              <Ionicons
                name="arrow-up-outline"
                size={14}
                color="#fff"
                style={styles.openBadgeIcon}
              />
            </View>
          </Pressable>

          <View style={styles.section}>
            <EditableText
              type="subtitle"
              value={current.title}
              fallback={current.author_name ?? undefined}
              placeholder="Add a title"
              onSave={(title) => patch({ title })}
            />
            <View style={styles.metaRow}>
              <ThemedText type="small" themeColor="textSecondary">
                {formatMeta(current, sourceLabel)}
              </ThemedText>
              {isRefreshing && <ActivityIndicator size="small" />}
            </View>
          </View>

          {current.description ? (
            <Pressable
              disabled={!isLongDescription}
              onPress={() => setIsDescriptionExpanded((expanded) => !expanded)}
              style={styles.section}
            >
              <ThemedText
                themeColor="textSecondary"
                numberOfLines={
                  isLongDescription && !isDescriptionExpanded
                    ? DESCRIPTION_PREVIEW_LINES
                    : undefined
                }
              >
                {current.description}
              </ThemedText>
              {isLongDescription && (
                <ThemedText type="smallBold">
                  {isDescriptionExpanded ? "Less" : "More"}
                </ThemedText>
              )}
            </Pressable>
          ) : null}

          <Section
            label="Category"
            onDone={
              isEditingCategory ? () => setIsEditingCategory(false) : undefined
            }
          >
            {isEditingCategory ? (
              <CategoryPicker
                selectedId={current.category_id}
                onSelect={(categoryId) => {
                  setIsEditingCategory(false);
                  if (categoryId !== current.category_id)
                    patch({ category_id: categoryId });
                }}
              />
            ) : (
              <Pressable
                onPress={() => setIsEditingCategory(true)}
                style={styles.pillRow}
              >
                <ThemedView type="backgroundElement" style={styles.pill}>
                  <ThemedText
                    type="small"
                    themeColor={category ? "text" : "textSecondary"}
                  >
                    {category?.name ?? "No category"}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            )}
          </Section>

          <Section
            label="Tags"
            onDone={isEditingTags ? () => setIsEditingTags(false) : undefined}
          >
            {isEditingTags ? (
              <TagEditor
                tags={current.tags}
                onChange={(tags) => patch({ tags })}
              />
            ) : (
              <Pressable
                onPress={() => setIsEditingTags(true)}
                style={styles.pillRow}
              >
                {current.tags.length > 0 ? (
                  current.tags.map((tag) => (
                    <ThemedView
                      key={tag}
                      type="backgroundElement"
                      style={styles.pill}
                    >
                      <ThemedText type="small">{tag}</ThemedText>
                    </ThemedView>
                  ))
                ) : (
                  <ThemedView type="backgroundElement" style={styles.pill}>
                    <ThemedText type="small" themeColor="textSecondary">
                      + Add tags
                    </ThemedText>
                  </ThemedView>
                )}
              </Pressable>
            )}
          </Section>

          <Section label="Notes">
            <EditableText
              multiline
              value={current.notes}
              placeholder="Add a note — why did you save this?"
              onSave={(notes) => patch({ notes })}
            />
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

/** "@author · Instagram · Saved Sep 3" (year shown only when it isn't this year). */
function formatMeta(save: Save, sourceLabel: string): string {
  const savedAt = new Date(save.created_at);
  const date = savedAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      savedAt.getFullYear() === new Date().getFullYear()
        ? undefined
        : "numeric",
  });
  return [save.author_name, sourceLabel, `Saved ${date}`]
    .filter(Boolean)
    .join(" · ");
}

function Section({
  label,
  onDone,
  children,
}: {
  label: string;
  onDone?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        {onDone && (
          <Pressable onPress={onDone} hitSlop={8}>
            <ThemedText type="smallBold">Done</ThemedText>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityLabel={label}>
      <Ionicons name={icon} size={22} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: Spacing.three, gap: Spacing.four },
  image: { width: "100%", borderRadius: 14 },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  openBadge: {
    position: "absolute",
    right: Spacing.two,
    bottom: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  openBadgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  // Rotated up-arrow reads as the familiar "opens elsewhere" ↗.
  openBadgeIcon: { transform: [{ rotate: "45deg" }] },
  section: { gap: Spacing.two },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.one },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
});
