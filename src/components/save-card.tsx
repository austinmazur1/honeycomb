import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Save } from '@/lib/database.types';
import { PLATFORM_LABELS } from '@/lib/platform';

export function SaveCard({ save }: { save: Save }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/save/${save.id}`)}>
      <ThemedView type="backgroundElement" style={styles.card}>
        {save.thumbnail_url ? (
          <Image source={{ uri: save.thumbnail_url }} style={styles.thumbnail} contentFit="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
        )}

        <View style={styles.body}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {save.title || save.url}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {PLATFORM_LABELS[save.platform]}
          </ThemedText>
          {save.tags.length > 0 && (
            <View style={styles.tags}>
              {save.tags.slice(0, 3).map((tag) => (
                <ThemedView key={tag} type="backgroundSelected" style={styles.tagPill}>
                  <ThemedText type="small">{tag}</ThemedText>
                </ThemedView>
              ))}
            </View>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
    alignItems: 'center',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  thumbnailPlaceholder: {
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.half,
  },
  tagPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 999,
  },
});
