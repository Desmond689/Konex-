import { useState, useCallback } from 'react';

export function useModeration() {
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { queue, isLoading, refresh };
}

export default useModeration;
