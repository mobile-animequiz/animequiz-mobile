import { useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n/runtime';
import { handleAuthSuccess, showAuthError } from '../utils/authFlow';

// Shared by every screen that offers "Continue with <provider>" buttons.
// `loadingProvider` holds the provider being processed (or null), so only the
// tapped button shows a spinner while all of them are disabled.
export default function useSocialSignIn() {
  const { signInWithGoogle } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState(null);

  async function signIn(provider) {
    if (loadingProvider) {
      return;
    }

    setLoadingProvider(provider);
    try {
      const session = await signInWithGoogle();
      if (session) handleAuthSuccess();
    } catch (error) {
      showAuthError(error.status === 409 ? t('googleConflict') : error.message);
    } finally {
      setLoadingProvider(null);
    }
  }

  return { loadingProvider, signIn };
}
