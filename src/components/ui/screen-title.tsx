import { StyleSheet } from "react-native";

import { ThemedText, type ThemedTextProps } from "@/components/themed-text";

/** Large heading at the top of a tab screen. */
export function ScreenTitle({ style, ...rest }: ThemedTextProps) {
  return <ThemedText type="title" style={[styles.title, style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: { fontSize: 32, lineHeight: 38 },
});
