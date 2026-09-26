import { useAuth, useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText, ThemedView } from '@/components';
import { Radius, Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/use-categories';
import { useDeleteAccount } from '@/hooks/use-profile';
import { useSaves } from '@/hooks/use-saves';
import { useTabScreenInsets } from '@/hooks/use-tab-screen-insets';
import { useTheme } from '@/hooks/use-theme';
import { pluralize } from '@/utils/string';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const theme = useTheme();
  const insets = useTabScreenInsets();
  const { saves } = useSaves();
  const { categories } = useCategories();
  const deleteAccount = useDeleteAccount();

  const tagCount = useMemo(() => new Set(saves.flatMap((save) => save.tags)).size, [saves]);
  const stats = [
    { label: saves.length === 1 ? 'Save' : 'Saves', value: saves.length },
    { label: categories.length === 1 ? 'Collection' : 'Collections', value: categories.length },
    { label: tagCount === 1 ? 'Tag' : 'Tags', value: tagCount },
  ];
  const memberSince = user?.createdAt?.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  const appVersion = Constants.expoConfig?.version;

  async function handleDeleteAccount() {
    try {
      await deleteAccount.mutateAsync();
    } catch (error) {
      console.error('Failed to delete account', error);
      Alert.alert("Couldn't delete your account", 'Please try again.');
    }
  }

  function confirmDeleteAccount() {
    const title = 'Delete your account?';
    const message = `This permanently deletes your account, ${pluralize(saves.length, 'save')} and ${pluralize(categories.length, 'collection')}. This can't be undone.`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`${title}\n\n${message}`)) {
        void handleDeleteAccount();
      }
      return;
    }
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete account', style: 'destructive', onPress: handleDeleteAccount },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      {/* Fits on most phones; scrolls only on small screens or large text sizes. */}
      <ScrollView
        alwaysBounceVertical={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.five, paddingBottom: insets.bottom },
        ]}>
        <View style={styles.hero}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]} />
          )}
          <ThemedText type="subtitle" style={styles.name}>
            {user?.fullName ?? 'You'}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {user?.primaryEmailAddress?.emailAddress}
          </ThemedText>
        </View>

        <View style={styles.stats}>
          {stats.map((stat) => (
            <ThemedView key={stat.label} type="backgroundElement" style={styles.stat}>
              <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {stat.label}
              </ThemedText>
            </ThemedView>
          ))}
        </View>
        {memberSince && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.memberSince}>
            Member since {memberSince}
          </ThemedText>
        )}

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
            ACCOUNT
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.group}>
            <Pressable
              onPress={() => signOut()}
              disabled={deleteAccount.isPending}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.backgroundSelected }]}>
              <Ionicons name="log-out-outline" size={20} color={theme.text} />
              <ThemedText style={styles.rowLabel}>Sign out</ThemedText>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />
            <Pressable
              onPress={confirmDeleteAccount}
              disabled={deleteAccount.isPending}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.backgroundSelected }]}>
              <Ionicons name="trash-outline" size={20} color={theme.destructive} />
              <ThemedText themeColor="destructive" style={styles.rowLabel}>
                Delete account
              </ThemedText>
              {deleteAccount.isPending && <ActivityIndicator size="small" />}
            </Pressable>
          </ThemedView>
        </View>

        {appVersion && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
            Honeycomb {appVersion}
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.three },
  hero: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: Spacing.three,
  },
  name: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.five,
  },
  stat: {
    flex: 1,
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 700,
  },
  memberSince: {
    textAlign: 'center',
    marginTop: Spacing.three,
  },
  section: { marginTop: Spacing.five },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  group: {
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  rowLabel: { flex: 1 },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.three + 20 + Spacing.three,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
