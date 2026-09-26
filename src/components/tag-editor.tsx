import { useEffect, useEffectEvent, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Pill, TextField, ThemedText } from "@/components";
import { Spacing } from "@/constants/theme";
import { mergeTags, parseTags } from "@/utils/tags";

type TagEditorProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

/**
 * Removable tag pills plus an input; a comma, return, blur, or unmount (e.g. the parent's
 * Done button hides this before the input blurs) turns the typed text into tags.
 */
export function TagEditor({ tags, onChange }: TagEditorProps) {
  const [draft, setDraftState] = useState("");
  // Mirrors `draft` synchronously so submit + blur (or blur + unmount) can't add twice.
  const draftRef = useRef("");

  function setDraft(next: string) {
    draftRef.current = next;
    setDraftState(next);
  }

  function addTags(text: string) {
    const added = parseTags(text);
    if (added.length === 0) return;
    const next = mergeTags(tags, added);
    if (next.length !== tags.length) onChange(next);
  }

  function commit(text: string) {
    setDraft("");
    addTags(text);
  }

  const flushOnUnmount = useEffectEvent(() => addTags(draftRef.current));
  useEffect(() => () => flushOnUnmount(), []);

  function handleChangeText(text: string) {
    const lastComma = text.lastIndexOf(",");
    if (lastComma === -1) {
      setDraft(text);
      return;
    }
    // Everything before the last comma is finished; keep editing whatever follows it.
    commit(text.slice(0, lastComma));
    setDraft(text.slice(lastComma + 1).trimStart());
  }

  return (
    <View style={styles.container}>
      {tags.length > 0 && (
        <View style={styles.pills}>
          {tags.map((tag) => (
            <Pill
              key={tag}
              label={tag}
              onPress={() => onChange(tags.filter((t) => t !== tag))}
              accessibilityLabel={`Remove tag ${tag}`}
              trailing={
                <ThemedText type="small" themeColor="textSecondary">
                  ✕
                </ThemedText>
              }
              style={styles.pill}
            />
          ))}
        </View>
      )}
      <TextField
        autoFocus
        value={draft}
        onChangeText={handleChangeText}
        onSubmitEditing={() => commit(draftRef.current)}
        onBlur={() => commit(draftRef.current)}
        placeholder="Add tags, separated by commas"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.one },
  // Tighter than the default so the trailing ✕ doesn't make removable pills look oversized.
  pill: { paddingHorizontal: Spacing.two },
});
