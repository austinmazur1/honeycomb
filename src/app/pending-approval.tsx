import { useAuth } from '@clerk/expo';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function PendingApprovalScreen() {
  const { signOut } = useAuth();
  const theme = useTheme();
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

      <Pressable
        onPress={() => signOut()}
        style={[styles.button, { backgroundColor: theme.backgroundElement }]}>
        <Text style={[styles.buttonText, { color: theme.text }]}>Sign out</Text>
      </Pressable>
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
  button: {
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
