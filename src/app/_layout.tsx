import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { useProfile } from "@/hooks/use-profile";
import { ShareIntentProvider } from "expo-share-intent/build/ShareIntentProvider";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env and fill it in.",
  );
}

function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();

  // Avoid flashing "pending approval" while the profile row is still loading.
  if (!isLoaded || (isSignedIn && profileLoading)) {
    return null;
  }

  const isApproved = isSignedIn && profile?.is_approved === true;
  const isPending =
    isSignedIn && profile != null && profile.is_approved === false;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={isPending}>
        <Stack.Screen name="pending-approval" />
      </Stack.Protected>
      <Stack.Protected guard={isApproved}>
        <Stack.Screen name="(app)" />
        <Stack.Screen
          name="add"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Save Link",
          }}
        />
        <Stack.Screen
          name="save/[id]"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Details",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ShareIntentProvider options={{ debug: __DEV__ }}>
      <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AnimatedSplashOverlay />
          <AuthGate />
        </ThemeProvider>
      </ClerkProvider>
    </ShareIntentProvider>
  );
}
