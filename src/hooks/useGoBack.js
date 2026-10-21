import { useRouter } from 'expo-router';

// Returns a "back" handler that never dead-ends: when there is no previous
// screen (e.g. the app was opened through a deep link) it falls back to Welcome.
export default function useGoBack(fallbackRoute = '/welcome') {
  const router = useRouter();

  return function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute);
    }
  };
}
