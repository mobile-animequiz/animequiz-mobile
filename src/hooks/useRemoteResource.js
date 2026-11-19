import { useEffect, useState, useCallback } from 'react';
export default function useRemoteResource(key, load) {
  const [generation, setGeneration] = useState(0);
  const [resource, setResource] = useState(null);
  const requestKey = String(key) + ':' + generation;
  useEffect(() => {
    let active = true;
    load().then((data) => { if (active) setResource({ key: requestKey, data, error: null }); })
      .catch((error) => { if (active) setResource({ key: requestKey, data: null, error: error.message }); });
    return () => { active = false; };
  }, [requestKey, load]);
  const refresh = useCallback(() => setGeneration((value) => value + 1), []);
  const current = resource?.key === requestKey ? resource : null;
  return { data: current?.data ?? null, error: current?.error ?? null, loading: !current, refresh };
}
