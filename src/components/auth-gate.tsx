import { useAuth } from "@clerk/expo";
import { Stack } from "expo-router";

import { useProfile } from "@/hooks/use-profile";

/** Root stack that routes to sign-in, pending approval, or the app based on auth and approval state. */
export function AuthGate() {
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
