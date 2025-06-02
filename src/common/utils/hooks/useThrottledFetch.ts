/**
 * useThrottledFetch hook
 * Stub implementation to prevent TypeScript errors
 */

import { useState, useCallback, useRef } from "react";

export function useThrottledFetch<T>(
  fetchFn: () => Promise<T>,
  throttleMs: number = 1000
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetch: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastFetchTime = useRef(0);

  const fetch = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTime.current < throttleMs) {
      return;
    }

    lastFetchTime.current = now;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, throttleMs]);

  return { data, loading, error, fetch };
}
