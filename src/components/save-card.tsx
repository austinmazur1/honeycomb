import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Save } from '@/lib/database.types';
import { PLATFORM_ICONS } from '@/lib/platform.constants';
import { displayHost } from '@/utils/string';

/** Image-first grid tile: 4:5 image with a one-line source strip underneath. */
export function SaveCard({ save }: { save: Save }) {
  const router = useRouter();
  const theme = useTheme();
  const source = save.author_name || displayHost(save.url);

  return (
    <Pressable onPress={() => router.push(`/save/${save.id}`)}>
      <ThemedView type="backgroundElement" style={styles.card}>
        {save.thumbnail_url ? (
          <Image source={{ uri: save.thumbnail_url }} style={styles.media} contentFit="cover" transition={150} />
        ) : (
          // No image to lead with, so let the text fill the tile instead of a blank box.
          <ThemedView type="backgroundSelected" style={[styles.media, styles.textTile]}>
            <ThemedText type="smallBold" numberOfLines={6}>
              {save.description || save.title || displayHost(save.url)}
            </ThemedText>
          </ThemedView>
        )}

        <View style={styles.footer}>
          <Ionicons name={PLATFORM_ICONS[save.platform]} size={14} color={theme.textSecondary} />
          <ThemedText
            type="small"
            themeColor={save.title ? 'text' : 'textSecondary'}
            numberOfLines={1}
            style={styles.footerText}
          >
            {save.title || source}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    aspectRatio: 4 / 5,
  },
  textTile: {
    padding: Spacing.three,
    justifyContent: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  footerText: {
    flex: 1,
  },
});
