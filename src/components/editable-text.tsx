import { Ionicons } from "@expo/vector-icons";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText, type ThemedTextProps } from "@/components/themed-text";
import { TextButton } from "@/components/ui/text-button";
import { TextField } from "@/components/ui/text-field";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type EditableTextProps = {
  value: string | null;
  /** Shown (dimmed) in place of an empty `value` when not editing, e.g. the author for a missing title. */
  fallback?: string;
  placeholder: string;
  onSave: (value: string | null) => void;
  /** Allow line breaks. Without it, text still wraps but return saves. */
  multiline?: boolean;
  type?: ThemedTextProps["type"];
};

/**
 * Text that turns into an input when tapped. Saves on blur, return, or unmount (e.g. the screen
 * is dismissed mid-edit). Clearing the text saves `null`.
 */
export function EditableText({
  value,
  fallback,
  placeholder,
  onSave,
  multiline = false,
  type = "default",
}: EditableTextProps) {
  const theme = useTheme();
  const [draft, setDraftState] = useState<string | null>(null);
  // Mirrors `draft` synchronously so blur + Done (or blur + unmount) can't save twice.
  const draftRef = useRef<string | null>(null);

  function setDraft(next: string | null) {
    draftRef.current = next;
    setDraftState(next);
  }

  function save(text: string) {
    const next = text.trim() || null;
    if (next !== (value?.trim() || null)) onSave(next);
  }

  function commit() {
    const text = draftRef.current;
    if (text === null) return;
    setDraft(null);
    save(text);
  }

  const flushOnUnmount = useEffectEvent(() => {
    const text = draftRef.current;
    if (text !== null) save(text);
  });
  useEffect(() => () => flushOnUnmount(), []);

  if (draft !== null) {
    return (
      <View style={styles.editing}>
        <TextField
          autoFocus
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={multiline ? undefined : commit}
          // Single-line fields still wrap long text, but return saves instead of adding a newline.
          multiline
          submitBehavior={multiline ? "newline" : "blurAndSubmit"}
          placeholder={placeholder}
          returnKeyType={multiline ? "default" : "done"}
          style={[
            multiline && styles.multiline,
            type === "subtitle" && styles.subtitleInput,
          ]}
        />
        {multiline && (
          <View style={styles.done}>
            <TextButton label="Done" onPress={commit} />
          </View>
        )}
      </View>
    );
  }

  const trimmed = value?.trim();
  return (
    <Pressable
      onPress={() => setDraft(value ?? "")}
      accessibilityRole="button"
      accessibilityHint="Tap to edit"
      style={styles.display}
    >
      <ThemedText
        type={type}
        themeColor={trimmed ? "text" : "textSecondary"}
        style={styles.text}
      >
        {trimmed || fallback || placeholder}
      </ThemedText>
      <Ionicons
        name="pencil"
        size={14}
        color={theme.textSecondary}
        style={styles.pencil}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  display: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.two },
  text: { flexShrink: 1 },
  pencil: { marginTop: 6 },
  editing: { gap: Spacing.one },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  subtitleInput: { fontSize: 32, fontWeight: "600" },
  done: { alignSelf: "flex-end" },
});
