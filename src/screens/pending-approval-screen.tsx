import { useAuth } from '@clerk/expo';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ThemedText, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';

export default function PendingApprovalScreen() {
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + Spacing.three },
      ]}>
      <View style={styles.hero}>
        <ThemedText type="title" style={styles.emoji}>
          🍯
        </ThemedText>
        <ThemedText type="subtitle">You&apos;re in</ThemedText>
        <ThemedText themeColor="textSecondary">
          Honeycomb is invite-only while it&apos;s early. We&apos;ll let you know as soon as your
          account is approved.
        </ThemedText>
      </View>

      <Button variant="secondary" label="Sign out" onPress={() => signOut()} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  hero: {
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 40,
  },
});
