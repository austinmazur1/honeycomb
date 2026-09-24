import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

import { ThemedText, ThemedView } from "@/components";
import { Spacing } from "@/constants/theme";
import { useDeleteSave } from "@/hooks/use-saves";
import { useTheme } from "@/hooks/use-theme";
import { PLATFORM_LABELS, isEmbeddable } from "@/lib/platform";
import { queryKeys } from "@/lib/query-keys";
import { useSupabaseClient } from "@/lib/supabase";
import { fetchSave } from "@/lib/supabase-queries";
import { getTweetEmbedHtml, getYouTubeEmbedUrl } from "@/utils/embed";

export default function SaveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const supabase = useSupabaseClient();
  const deleteSave = useDeleteSave();

  // `supabase` is a stable module-level singleton, not a cache-differentiating value.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const { data: save, isPending: isLoading } = useQuery({
    queryKey: queryKeys.save(id),
    queryFn: () => fetchSave(supabase, id!),
    enabled: !!id,
  });

  async function handleDelete() {
    if (!save) return;
    try {
      await deleteSave.mutateAsync(save.id);
      router.back();
    } catch (error) {
      console.error("Failed to delete save", error);
    }
  }

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

  const embeddable = isEmbeddable(save.platform);
  const youTubeEmbedUrl =
    save.platform === "youtube" ? getYouTubeEmbedUrl(save.url) : null;
  const tweetEmbedHtml =
    save.platform === "x" ? getTweetEmbedHtml(save.raw_metadata) : null;

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + Spacing.three },
      ]}
    >
      <Stack.Screen options={{ title: PLATFORM_LABELS[save.platform] }} />

      {embeddable && youTubeEmbedUrl ? (
        <WebView
          source={{ uri: youTubeEmbedUrl }}
          style={styles.embed}
          allowsFullscreenVideo
          javaScriptEnabled
        />
      ) : embeddable && tweetEmbedHtml ? (
        <WebView
          source={{ html: tweetEmbedHtml }}
          style={styles.embed}
          javaScriptEnabled
        />
      ) : (
        <Pressable
          onPress={() => Linking.openURL(save.url)}
          style={[
            styles.openButton,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <Text style={[styles.openButtonText, { color: theme.text }]}>
            Open in {PLATFORM_LABELS[save.platform]}
          </Text>
        </Pressable>
      )}

      <View style={styles.body}>
        <ThemedText type="subtitle">{save.title || save.author_name || save.url}</ThemedText>
        {save.description ? (
          <ThemedText themeColor="textSecondary">{save.description}</ThemedText>
        ) : null}
        {save.tags.length > 0 && (
          <View style={styles.tags}>
            {save.tags.map((tag) => (
              <ThemedView
                key={tag}
                type="backgroundElement"
                style={styles.tagPill}
              >
                <ThemedText type="small">{tag}</ThemedText>
              </ThemedView>
            ))}
          </View>
        )}
      </View>

      <Pressable onPress={handleDelete} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete save</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: Spacing.three, gap: Spacing.three },
  embed: { width: "100%", height: 260, borderRadius: 14 },
  openButton: {
    borderRadius: 14,
    paddingVertical: Spacing.four,
    alignItems: "center",
    justifyContent: "center",
  },
  openButtonText: { fontSize: 16, fontWeight: "600" },
  body: { gap: Spacing.two },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.one },
  tagPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 999,
  },
  deleteButton: { alignItems: "center", paddingVertical: Spacing.three },
  deleteButtonText: { color: "#E5484D", fontSize: 15, fontWeight: "600" },
});
