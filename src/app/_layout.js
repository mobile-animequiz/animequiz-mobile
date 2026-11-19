import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '../styles/theme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { AccountProvider } from '../contexts/AccountContext';
import useReducedMotion from '../hooks/useReducedMotion';

function AppStack() {
  const { isReady, isAuthenticated } = useAuth();
  const reducedMotion = useReducedMotion();

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.backgroundTop },
          animation: reducedMotion ? 'none' : 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: reducedMotion ? 'none' : 'fade', gestureEnabled: false }} />
        <Stack.Protected guard={isReady && !isAuthenticated}>
          <Stack.Screen name="welcome" options={{ animation: reducedMotion ? 'none' : 'fade', gestureEnabled: false }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="create-account" />
          <Stack.Screen name="reset-password" />
        </Stack.Protected>
        <Stack.Protected guard={isReady && isAuthenticated}>
          <Stack.Screen name="home" options={{ animation: reducedMotion ? 'none' : 'fade', gestureEnabled: false }} />
          <Stack.Screen name="profile" />
          <Stack.Screen name="favorites" />
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
      <AccountProvider>
        <AppStack />
      </AccountProvider>
    </AuthProvider>
  );
}
