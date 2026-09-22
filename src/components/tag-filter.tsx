import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';

type TagFilterProps = {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
};

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TagPill label="All" selected={selectedTag === null} onPress={() => onSelectTag(null)} />
      {tags.map((tag) => (
        <TagPill
          key={tag}
          label={tag}
          selected={selectedTag === tag}
          onPress={() => onSelectTag(selectedTag === tag ? null : tag)}
        />
      ))}
    </ScrollView>
  );
}

function TagPill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView type={selected ? 'backgroundSelected' : 'backgroundElement'} style={styles.pill}>
        <ThemedText type={selected ? 'smallBold' : 'small'}>{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two, paddingHorizontal: Spacing.three },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
});
