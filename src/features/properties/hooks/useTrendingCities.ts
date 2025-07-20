import { useState, useEffect, useCallback } from "react";
import api from "src/core/api/client";

export type TrendingCity = { city: string; country?: string; score?: number };

export function useTrendingCities() {
  const [trendingCities, setTrendingCities] = useState<TrendingCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/cities/trending");
      console.log('Trending cities API response:', res);
      if (res && typeof res.data === 'object' && res.data !== null && Array.isArray((res.data as any).data)) {
        setTrendingCities((res.data as any).data);
      } else {
        setTrendingCities([]);
      }
    } catch (err: any) {
      console.error('Error fetching trending cities:', err);
      setTrendingCities([]);
      setError(err?.message || "Failed to load trending cities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingCities();
  }, [fetchTrendingCities]);

  return { trendingCities, loading, error, refetch: fetchTrendingCities };
} 