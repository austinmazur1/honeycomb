import { getShareExtensionKey } from "expo-share-intent";

/**
 * expo-share-intent delivers shared content as a deep link containing
 * `dataUrl=<scheme>ShareKey`. ShareIntentProvider (mounted in _layout.tsx)
 * picks up the actual payload on its own via its native-module listener —
 * this just has to route the app to the save form instead of 404ing on the
 * raw deep link.
 */
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      console.log("Redirecting to /add from share intent deep link", path);
      return "/add?fromShare=1";
    }
    return path;
  } catch {
    return "/";
  }
}
