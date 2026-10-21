import { useState } from 'react';

import { signInWithProvider } from '../services/authService';
import { handleAuthSuccess, showAuthError } from '../utils/authFlow';

// Shared by every screen that offers "Continue with <provider>" buttons.
// `loadingProvider` holds the provider being processed (or null), so only the
// tapped button shows a spinner while all of them are disabled.
export default function useSocialSignIn() {
  const [loadingProvider, setLoadingProvider] = useState(null);

  async function signIn(provider) {
    if (loadingProvider) {
      return;
    }

    setLoadingProvider(provider);
    try {
      await signInWithProvider(provider);
      handleAuthSuccess();
    } catch (error) {
      showAuthError(error.message);
    } finally {
      setLoadingProvider(null);
    }
  }

  return { loadingProvider, signIn };
}
