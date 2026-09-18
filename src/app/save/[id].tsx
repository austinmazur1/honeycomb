import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Save } from '@/lib/database.types';
import { PLATFORM_LABELS, isEmbeddable } from '@/lib/platform';
import { useSupabaseClient } from '@/lib/supabase';

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;
    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.pathname.startsWith('/shorts/')) {
      videoId = parsed.pathname.split('/')[2];
    } else {
      videoId = parsed.searchParams.get('v');
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

function getTweetEmbedHtml(rawMetadata: Record<string, unknown> | null): string | null {
  const html = rawMetadata && typeof rawMetadata.html === 'string' ? rawMetadata.html : null;
  if (!html) return null;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:8px;">${html}<script async src="https://platform.twitter.com/widgets.js"></script></body></html>`;
}

export default function SaveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const supabase = useSupabaseClient();

  const [save, setSave] = useState<Save | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase.from('saves').select('*').eq('id', id).single();
      if (cancelled) return;
      if (error) console.error('Failed to load save', error);
      setSave(data ?? null);
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, supabase]);

  async function handleDelete() {
    if (!save) return;
    const { error } = await supabase.from('saves').delete().eq('id', save.id);
    if (error) {
      console.error('Failed to delete save', error);
      return;
    }
    router.back();
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
        <ThemedText themeColor="textSecondary">This save could not be found.</ThemedText>
      </ThemedView>
    );
  }

  const embeddable = isEmbeddable(save.platform);
  const youTubeEmbedUrl = save.platform === 'youtube' ? getYouTubeEmbedUrl(save.url) : null;
  const tweetEmbedHtml = save.platform === 'x' ? getTweetEmbedHtml(save.raw_metadata) : null;

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.three }]}>
      <Stack.Screen options={{ title: PLATFORM_LABELS[save.platform] }} />

      {embeddable && youTubeEmbedUrl ? (
        <WebView
          source={{ uri: youTubeEmbedUrl }}
          style={styles.embed}
          allowsFullscreenVideo
          javaScriptEnabled
        />
      ) : embeddable && tweetEmbedHtml ? (
        <WebView source={{ html: tweetEmbedHtml }} style={styles.embed} javaScriptEnabled />
      ) : (
        <Pressable
          onPress={() => Linking.openURL(save.url)}
          style={[styles.openButton, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.openButtonText, { color: theme.text }]}>
            Open in {PLATFORM_LABELS[save.platform]}
          </Text>
        </Pressable>
      )}

      <View style={styles.body}>
        <ThemedText type="subtitle">{save.title || save.url}</ThemedText>
        {save.tags.length > 0 && (
          <View style={styles.tags}>
            {save.tags.map((tag) => (
              <ThemedView key={tag} type="backgroundElement" style={styles.tagPill}>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.three, gap: Spacing.three },
  embed: { width: '100%', height: 260, borderRadius: 14 },
  openButton: {
    borderRadius: 14,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonText: { fontSize: 16, fontWeight: '600' },
  body: { gap: Spacing.two },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  tagPill: { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: 999 },
  deleteButton: { alignItems: 'center', paddingVertical: Spacing.three },
  deleteButtonText: { color: '#E5484D', fontSize: 15, fontWeight: '600' },
});
