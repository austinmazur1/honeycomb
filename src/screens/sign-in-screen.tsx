import { useSSO } from '@clerk/expo/experimental';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ThemedText, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';

export default function SignInScreen() {
  const { startSSOFlow } = useSSO();
  const [pendingStrategy, setPendingStrategy] = useState<'oauth_google' | 'oauth_apple' | null>(
    null,
  );
  const insets = useSafeAreaInsets();

  const signInWith = useCallback(
    async (strategy: 'oauth_google' | 'oauth_apple') => {
      setPendingStrategy(strategy);
      try {
        await startSSOFlow({ strategy });
      } catch (error) {
        console.error(`${strategy} sign-in failed`, error);
      } finally {
        setPendingStrategy(null);
      }
    },
    [startSSOFlow],
  );

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + Spacing.three },
      ]}>
      <View style={styles.hero}>
        <ThemedText type="title">Honeycomb</ThemedText>
        <ThemedText themeColor="textSecondary">
          Save what matters from Instagram, X, LinkedIn and YouTube — organized, searchable, never
          lost in a chat thread again.
        </ThemedText>
      </View>

      <View style={styles.buttons}>
        <Button
          variant="secondary"
          label="Continue with Google"
          onPress={() => signInWith('oauth_google')}
          disabled={pendingStrategy !== null}
          loading={pendingStrategy === 'oauth_google'}
        />
        <Button
          label="Continue with Apple"
          onPress={() => signInWith('oauth_apple')}
          disabled={pendingStrategy !== null}
          loading={pendingStrategy === 'oauth_apple'}
        />
      </View>
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
  buttons: {
    gap: Spacing.two,
  },
});
