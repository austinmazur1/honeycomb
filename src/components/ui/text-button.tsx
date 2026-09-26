import { Pressable } from "react-native";

import { ThemedText } from "@/components/themed-text";

type TextButtonProps = {
  label: string;
  onPress: () => void;
};

/** Bold inline text action, e.g. "Done" next to a section label. */
export function TextButton({ label, onPress }: TextButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}
