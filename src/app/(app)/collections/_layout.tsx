import { Stack } from 'expo-router';

export default function CollectionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[categoryId]" options={{ headerShown: true }} />
    </Stack>
  );
}
