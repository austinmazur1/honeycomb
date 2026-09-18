import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, Spacing } from '@/constants/theme';

/**
 * NativeTabs floats over content rather than reserving space for itself, so
 * screens inside the (app) tab group need to pad for it manually — same
 * pattern the original template used (see the deleted explore.tsx).
 */
export function useTabScreenInsets() {
  const insets = useSafeAreaInsets();
  return {
    top: insets.top,
    bottom: insets.bottom + BottomTabInset + Spacing.three,
  };
}
