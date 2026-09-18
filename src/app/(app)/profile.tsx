import { useAuth, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTabScreenInsets } from '@/hooks/use-tab-screen-insets';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const theme = useTheme();
  const insets = useTabScreenInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom },
      ]}>
      <View style={styles.hero}>
        {user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]} />
        )}
        <ThemedText type="subtitle">{user?.fullName ?? 'You'}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {user?.primaryEmailAddress?.emailAddress}
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
    alignItems: 'center',
    gap: Spacing.one,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: Spacing.two,
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
