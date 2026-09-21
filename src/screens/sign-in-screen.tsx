import { useSSO } from '@clerk/expo/experimental';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SignInScreen() {
  const { startSSOFlow } = useSSO();
  const [pendingStrategy, setPendingStrategy] = useState<'oauth_google' | 'oauth_apple' | null>(
    null,
  );
  const theme = useTheme();
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
        <Pressable
          onPress={() => signInWith('oauth_google')}
          disabled={pendingStrategy !== null}
          style={[styles.button, { backgroundColor: theme.backgroundElement }]}>
          {pendingStrategy === 'oauth_google' ? (
            <ActivityIndicator />
          ) : (
            <Text style={[styles.buttonText, { color: theme.text }]}>Continue with Google</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => signInWith('oauth_apple')}
          disabled={pendingStrategy !== null}
          style={[styles.button, { backgroundColor: theme.text }]}>
          {pendingStrategy === 'oauth_apple' ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.background }]}>
              Continue with Apple
            </Text>
          )}
        </Pressable>
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
