/**
 * useFetchWithTiming hook
 * Stub implementation to prevent TypeScript errors
 */

import { useState, useEffect } from "react";

export function useFetchWithTiming<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): { data: T | null; loading: boolean; error: Error | null; timing: number } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [timing, setTiming] = useState(0);

  useEffect(() => {
    const executeFetch = async () => {
      setLoading(true);
      setError(null);
      const startTime = Date.now();

      try {
        const result = await fetchFn();
        setData(result);
        setTiming(Date.now() - startTime);
      } catch (err) {
        setError(err as Error);
        setTiming(Date.now() - startTime);
      } finally {
        setLoading(false);
      }
    };

    executeFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, timing };
}
