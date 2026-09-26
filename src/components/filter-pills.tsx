import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { Pill } from "@/components/ui/pill";
import { Spacing } from "@/constants/theme";

type FilterPillsProps<T extends string> = {
  options: readonly T[];
  selected: T | null;
  /** Called with `null` when the selection is cleared (tapping the active pill, or the "all" pill). */
  onSelect: (value: T | null) => void;
  getLabel?: (value: T) => string;
  /** Adds a leading pill, e.g. "All", that clears the selection. */
  allLabel?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/** Horizontally scrolling single-select filter row. Renders nothing without options. */
export function FilterPills<T extends string>({
  options,
  selected,
  onSelect,
  getLabel = (value) => value,
  allLabel,
  contentContainerStyle,
}: FilterPillsProps<T>) {
  if (options.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, contentContainerStyle]}
    >
      {allLabel !== undefined && (
        <Pill
          size="medium"
          label={allLabel}
          selected={selected === null}
          onPress={() => onSelect(null)}
        />
      )}
      {options.map((option) => (
        <Pill
          key={option}
          size="medium"
          label={getLabel(option)}
          selected={selected === option}
          onPress={() => onSelect(selected === option ? null : option)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two, paddingHorizontal: Spacing.three },
});
