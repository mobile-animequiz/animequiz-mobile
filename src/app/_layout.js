import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../styles/theme';

// Root navigator. Every screen draws its own header (see ScreenHeader), so the
// native header is hidden. Splash / Welcome / Home fade in and cannot be swiped back
// (Home is the root once the player is signed in).
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.backgroundTop },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="home" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
    </>
  );
}
