import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { login as authenticate, logout as clearSession, register as createAccount, signInWithProvider } from '../services/authService';
import { setUnauthorizedHandler } from '../services/apiClient';
import { clearAccessToken, getAccessToken } from '../services/authStorage';
import { getCurrentUser as fetchCurrentUser } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [restoreGeneration, setRestoreGeneration] = useState(0);
  const activeTokenRef = useRef(null);

  const invalidateSession = useCallback(async (rejectedToken) => {
    // A delayed 401 from a previous session must not log out a newer session.
    if (!activeTokenRef.current || activeTokenRef.current !== rejectedToken) return;
    activeTokenRef.current = null;
    setToken(null);
    setUser(null);
    try {
      await clearAccessToken();
    } catch {
      // The client no longer considers this session authenticated.
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const unregister = setUnauthorizedHandler(invalidateSession);

    async function restoreSession() {
      try {
        const savedToken = await getAccessToken();
        if (!isMounted || !savedToken) return;
        activeTokenRef.current = savedToken;

        // Do not expose protected routes before the backend verifies the session.
        const currentUser = await fetchCurrentUser();
        if (!currentUser?.id) {
          await invalidateSession(savedToken);
          throw new Error('A API não retornou um usuário válido.');
        }
        if (isMounted && activeTokenRef.current === savedToken) {
          setUser(currentUser);
          setToken(savedToken);
        }
      } catch (failure) {
        // On 401 apiClient clears the invalid JWT. On network failure, keep the
        // JWT in SecureStore for a later launch, but do not mark it verified.
        if (isMounted) {
          setToken(null);
          setUser(null);
          setSessionError(failure?.message ?? null);
        }
      } finally {
        if (isMounted) setIsReady(true);
      }
    }

    restoreSession();
    return () => {
      isMounted = false;
      unregister();
    };
  }, [invalidateSession, restoreGeneration]);

  const retryRestore = useCallback(() => {
    setSessionError(null);
    setIsReady(false);
    setRestoreGeneration((value) => value + 1);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const requestToken = activeTokenRef.current;
    setIsUserLoading(true);
    try {
      const currentUser = await fetchCurrentUser();
      if (!currentUser?.id) {
        await invalidateSession(requestToken);
        throw new Error('A API não retornou um usuário válido.');
      }
      if (activeTokenRef.current !== requestToken) return null;
      setUser(currentUser);
      return currentUser;
    } finally {
      setIsUserLoading(false);
    }
  }, [invalidateSession]);

  const activateSession = useCallback(async (session) => {
    activeTokenRef.current = session.token;
    setToken(session.token);
    setUser(session.user);
    try {
      await refreshCurrentUser();
    } catch (error) {
      if (error?.status === 401 || error?.status === 404 || !activeTokenRef.current) throw error;
      // A newly issued JWT remains usable during temporary network failures.
    }
    return session;
  }, [refreshCurrentUser]);

  const signIn = useCallback(async (credentials) => {
    const session = await authenticate(credentials);
    return activateSession(session);
  }, [activateSession]);

  const signUp = useCallback(async (data) => {
    const session = await createAccount(data);
    return activateSession(session);
  }, [activateSession]);

  const signInWithGoogle = useCallback(async () => {
    const session = await signInWithProvider('google');
    return session ? activateSession(session) : null;
  }, [activateSession]);

  const signOut = useCallback(async () => {
    await clearSession();
    activeTokenRef.current = null;
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isReady,
    isUserLoading,
    sessionError,
    retryRestore,
    isAuthenticated: Boolean(token && user),
    refreshCurrentUser,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }), [token, user, isReady, isUserLoading, sessionError, retryRestore, refreshCurrentUser, signIn, signUp, signInWithGoogle, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  return context;
}
