import { t } from '../i18n/runtime';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { apiGet } from '../services/apiClient';
import { getSelectedApiVersion, setSelectedApiVersion } from '../services/apiVersion';

const ApiVersionContext = createContext(null);

export function ApiVersionProvider({ children }) {
  const [version, setVersion] = useState(getSelectedApiVersion);
  const [isChecking, setIsChecking] = useState(false);
  const [connection, setConnection] = useState(null);
  const [error, setError] = useState(null);
  const checking = useRef(false);

  const switchVersion = useCallback(async (nextVersion) => {
    if (checking.current) return;
    checking.current = true;
    setIsChecking(true);
    setError(null);
    setConnection(null);
    try {
      const status = await apiGet('api/versioned/status', {
        skipAuth: true, headers: { 'X-API-Version': nextVersion },
      });
      if (status?.version !== nextVersion) throw new Error('A API não confirmou a versão selecionada.');
      if (nextVersion === '2' && status.questionMedia !== true) {
        throw new Error('O servidor ainda está com a V2 antiga. Atualize a API para carregar imagens nas questões.');
      }
      setSelectedApiVersion(nextVersion);
      setVersion(nextVersion);
      setConnection(t('apiConnected', { version: nextVersion }));
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível verificar a API.');
    } finally {
      checking.current = false;
      setIsChecking(false);
    }
  }, []);

  const value = useMemo(() => ({ version, switchVersion, isChecking, connection, error }),
    [version, switchVersion, isChecking, connection, error]);
  return <ApiVersionContext.Provider value={value}>{children}</ApiVersionContext.Provider>;
}

export function useApiVersion() {
  const context = useContext(ApiVersionContext);
  if (!context) throw new Error('useApiVersion exige ApiVersionProvider.');
  return context;
}
