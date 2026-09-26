import type { ReactNode } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radius, Spacing } from "@/constants/theme";

type PillProps = {
  label: string;
  selected?: boolean;
  /** Dims the label, e.g. for placeholders like "No category". */
  muted?: boolean;
  /** `medium` is taller, for standalone filter rows. */
  size?: "small" | "medium";
  /** Rendered after the label, e.g. a remove "✕". */
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Rounded label chip. Pressable only when `onPress` is given. */
export function Pill({
  label,
  selected = false,
  muted = false,
  size = "small",
  trailing,
  onPress,
  accessibilityLabel,
  style,
}: PillProps) {
  const pill = (
    <ThemedView
      type={selected ? "backgroundSelected" : "backgroundElement"}
      style={[styles.pill, size === "medium" && styles.medium, style]}
    >
      <ThemedText
        type={selected ? "smallBold" : "small"}
        themeColor={muted ? "textSecondary" : "text"}
      >
        {label}
      </ThemedText>
      {trailing}
    </ThemedView>
  );

  if (!onPress) return pill;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
    >
      {pill}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  medium: { paddingVertical: Spacing.two },
});
