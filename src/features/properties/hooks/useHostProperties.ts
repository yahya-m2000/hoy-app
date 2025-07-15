/**
 * Custom hook to fetch and manage host properties
 * Fetches properties belonging to the current host user
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Property } from "@core/types/property.types";
import { HostPropertyService } from "@core/api/services/host";
import { logErrorWithContext } from "@core/utils/sys/error";

export interface UseHostPropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  refreshProperties: () => Promise<void>;
}

/**
 * Hook for fetching host properties
 * Uses the /host/properties endpoint to get all properties belonging to the current host
 */
export function useHostProperties(): UseHostPropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await HostPropertyService.getProperties();
      setProperties(response.properties || []);
      setError(null);
    } catch (err: any) {
      logErrorWithContext("useHostProperties.fetchProperties", err);
      
      // Handle 403 errors gracefully - user doesn't have host permissions yet
      if (err?.response?.status === 403) {
        console.log("🔐 [useHostProperties] User doesn't have host permissions yet - returning empty properties");
        setProperties([]);
        setError(null);
        return;
      }
      
      let errorMessage = "Unable to load your properties";
      if (err instanceof Error) {
        if (err.message.includes("Network Error")) {
          errorMessage = "Network connection error. Please check your internet connection and try again.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProperties = useCallback(async () => {
    await fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchProperties();
    }
  }, []);

  return {
    properties,
    loading,
    error,
    fetchProperties,
    refreshProperties,
  };
} 