import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Carga datos de la API cada vez que la pantalla recibe foco.
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setError(null); setData(await fn()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  return { data, setData, error, loading, reload: load };
}
