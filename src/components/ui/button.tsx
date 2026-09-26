import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** `primary` is high-contrast (inverted); `secondary` sits on the element background. */
  variant?: "primary" | "secondary";
  disabled?: boolean;
  /** Shows a spinner in place of the label. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Full-width call-to-action button. */
export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const background = variant === "primary" ? theme.text : theme.backgroundElement;
  const foreground = variant === "primary" ? theme.background : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      style={[styles.button, { backgroundColor: background }, style]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <Text style={[styles.label, { color: foreground }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 16, fontWeight: "600" },
});
