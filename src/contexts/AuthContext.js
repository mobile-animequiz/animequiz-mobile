import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { login as authenticate, logout as clearSession, register as createAccount } from '../services/authService';
import { getAccessToken } from '../services/authStorage';
import { getCurrentUser as fetchCurrentUser } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      let savedToken = null;
      try {
        savedToken = await getAccessToken();
        if (isMounted && savedToken) setToken(savedToken);
      } catch {
        // A failed secure-storage read must not block access to the welcome flow.
      } finally {
        if (isMounted) setIsReady(true);
      }

      if (savedToken) {
        fetchCurrentUser()
          .then((currentUser) => {
            if (isMounted) setUser(currentUser);
          })
          .catch(() => {
            // Keep the saved session; a temporary profile/network failure must not erase it.
          });
      }
    }

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    setIsUserLoading(true);
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      return currentUser;
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  const signIn = useCallback(async (credentials) => {
    const session = await authenticate(credentials);
    setToken(session.token);
    setUser(session.user);
    try {
      await refreshCurrentUser();
    } catch {
      // Login remains valid even if the profile endpoint is temporarily unavailable.
    }
    return session;
  }, [refreshCurrentUser]);

  const signUp = useCallback(async (data) => {
    const session = await createAccount(data);
    setToken(session.token);
    setUser(session.user);
    try {
      await refreshCurrentUser();
    } catch {
      // Account creation remains successful if profile loading is temporarily unavailable.
    }
    return session;
  }, [refreshCurrentUser]);

  const signOut = useCallback(async () => {
    await clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isReady,
    isUserLoading,
    isAuthenticated: Boolean(token),
    refreshCurrentUser,
    signIn,
    signUp,
    signOut,
  }), [token, user, isReady, isUserLoading, refreshCurrentUser, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  }
  return context;
}
