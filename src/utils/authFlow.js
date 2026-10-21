import { Alert } from 'react-native';
import { router } from 'expo-router';

// Single place that decides what happens after the auth flow finishes: the player lands on
// Home and the auth screens are cleared from the history, so "back" (or the Android back
// button) never returns to Welcome / Log In.
export function handleAuthSuccess() {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace('/home');
}

export function showAuthError(message) {
  Alert.alert('Something went wrong', message);
}
