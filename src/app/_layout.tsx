import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { ShareIntentProvider } from "expo-share-intent";
import * as SplashScreen from "expo-splash-screen";
import { useState } from "react";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { useProfile } from "@/hooks/use-profile";

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 2 },
        },
      }),
  );
  return (
    <ShareIntentProvider options={{ debug: __DEV__ }}>
      <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AnimatedSplashOverlay />
          <QueryClientProvider client={queryClient}>
            <AuthGate />
          </QueryClientProvider>
        </ThemeProvider>
      </ClerkProvider>
    </ShareIntentProvider>
  );
}
