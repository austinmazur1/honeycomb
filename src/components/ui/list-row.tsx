import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radius, Spacing } from "@/constants/theme";

type ListRowProps = {
  title: string;
  /** Right-aligned secondary text, e.g. a count. */
  detail?: string | number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Full-width tappable row card. */
export function ListRow({ title, detail, onPress, style }: ListRowProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <ThemedView type="backgroundElement" style={[styles.row, style]}>
        <ThemedText type="smallBold">{title}</ThemedText>
        {detail !== undefined && (
          <ThemedText type="small" themeColor="textSecondary">
            {detail}
          </ThemedText>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
    borderRadius: Radius.card,
  },
});
