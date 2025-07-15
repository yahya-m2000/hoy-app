import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { host } from "@core/api/services";
import type { Property } from "@core/types/property.types";

// --------------------------
// Simple in-memory cache
// --------------------------
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedProperties: Property[] | null = null;
let lastFetchedAt = 0;
// Track an in-flight request so concurrent hooks share the same promise
let inFlightPromise: Promise<Property[]> | null = null;

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasInitialized = useRef(false);

  /**
   * Fetches properties from API or cache.
   * @param force If true, bypasses cache and forces a network call
   */
  const fetchProperties = useCallback(async (force: boolean = false) => {
    try {
      setError(null);
      const now = Date.now();
      const isCacheValid = !force && cachedProperties && now - lastFetchedAt < CACHE_TTL;
      if (isCacheValid) {
        setProperties(cachedProperties!);
        return;
      }

      // If another call is already fetching, await it
      if (inFlightPromise && !force) {
        const data = await inFlightPromise;
        setProperties(data);
        return;
      }

      // Make a new API call
      const apiCall = host.HostPropertyService.getProperties().then((res) => res.properties || []);
      inFlightPromise = apiCall;
      const data = await apiCall;
      inFlightPromise = null;

      // Update cache
      cachedProperties = data;
      lastFetchedAt = Date.now();

      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual refresh always bypasses cache
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProperties(true);
    setRefreshing(false);
  }, [fetchProperties]);

  const deleteProperty = useCallback(async (id: string) => {
    try {
      await host.HostPropertyService.deleteProperty(id);
      // update local + cache
      setProperties((prev) => prev.filter((p) => p._id !== id));
      if (cachedProperties) {
        cachedProperties = cachedProperties.filter((p) => p._id !== id);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to delete property");
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchProperties();
    }
  }, []);

  // When screen focuses, refresh only if cache is stale (older than TTL)
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastFetchedAt > CACHE_TTL) {
        fetchProperties();
      }
    }, [fetchProperties])
  );

  return {
    properties,
    loading,
    error,
    refreshing,
    refresh,
    deleteProperty,
    refetch: fetchProperties,
  };
};

export const useProperty = (id: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setLoading(true);
      const data = await host.HostPropertyService.getProperty(id);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch property");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchProperty();
    }
  }, []);

  return {
    property,
    loading,
    error,
    refetch: fetchProperty,
  };
};
