import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

/**
 * Custom hook to monitor ZENVORA AI backend health & database status
 */
export const useHealth = (pollInterval = 10000) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to connect to ZENVORA AI backend');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    if (pollInterval > 0) {
      const intervalId = setInterval(fetchHealth, pollInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchHealth, pollInterval]);

  return { health, loading, error, refresh: fetchHealth };
};

export default useHealth;

