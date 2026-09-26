import { useRef, useState } from "react";
import type { TextInputProps } from "react-native";

import { useCreateCategory } from "@/hooks/use-categories";
import type { Category } from "@/lib/database.types";

type Options = {
  /** Called with the new category once it exists, e.g. to select it. */
  onCreated?: (category: Category) => void;
};

/**
 * State for an inline "new category" input: tap to start, type a name, and return or blur creates it.
 * An empty name just closes the input. Spread `inputProps` onto the TextInput.
 */
export function useNewCategoryInput({ onCreated }: Options = {}) {
  const createCategory = useCreateCategory();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setNameState] = useState("");
  // Mirrors `name` synchronously, and blocks re-entry, so return + blur can't create it twice.
  const nameRef = useRef("");
  const isSubmittingRef = useRef(false);

  function setName(next: string) {
    nameRef.current = next;
    setNameState(next);
  }

  function close() {
    setName("");
    setIsAdding(false);
  }

  async function submit() {
    if (isSubmittingRef.current) return;
    const trimmed = nameRef.current.trim();
    if (!trimmed) {
      close();
      return;
    }
    isSubmittingRef.current = true;
    try {
      const category = await createCategory.mutateAsync(trimmed);
      onCreated?.(category);
    } catch (error) {
      console.error("Failed to create category", error);
    } finally {
      isSubmittingRef.current = false;
      // Closing only now keeps the typed name on screen until the new category appears.
      close();
    }
  }

  const inputProps = {
    autoFocus: true,
    value: name,
    onChangeText: setName,
    onSubmitEditing: submit,
    onBlur: submit,
    editable: !createCategory.isPending,
  } satisfies TextInputProps;

  return {
    isAdding,
    start: () => setIsAdding(true),
    inputProps,
  };
}
