import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

/** Centered secondary text for lists with nothing to show. */
export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <ThemedText themeColor="textSecondary">{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { padding: Spacing.four, alignItems: "center" },
});
