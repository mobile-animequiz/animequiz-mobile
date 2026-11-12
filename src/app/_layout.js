import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../styles/theme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function AppStack() {
  const { isReady, isAuthenticated } = useAuth();

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
        <Stack.Protected guard={isReady && !isAuthenticated}>
          <Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="create-account" />
          <Stack.Screen name="reset-password" />
        </Stack.Protected>
        <Stack.Protected guard={isReady && isAuthenticated}>
          <Stack.Screen name="home" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="profile" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="result" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppStack />
    </AuthProvider>
  );
}
