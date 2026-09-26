import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

type SectionProps = {
  label: string;
  /** Right-aligned next to the label, e.g. a spinner or a "Done" button. */
  accessory?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** A small secondary-colored label above some content, as in forms and detail screens. */
export function Section({ label, accessory, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        {accessory}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
