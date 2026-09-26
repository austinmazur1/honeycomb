import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable } from "react-native";

import { useTheme } from "@/hooks/use-theme";

type IconButtonProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  /** Required: there's no visible text for screen readers to fall back on. */
  label: string;
  onPress: () => void;
  size?: number;
};

export function IconButton({ icon, label, onPress, size = 22 }: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={size} color={theme.text} />
    </Pressable>
  );
}
