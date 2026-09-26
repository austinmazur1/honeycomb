import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

// Android only emits the "did" events; iOS's "will" events let layout move with the keyboard.
const SHOW_EVENT = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
const HIDE_EVENT = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

/** Height of the on-screen keyboard, or 0 while it's hidden. */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, (event) =>
      setHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener(HIDE_EVENT, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
