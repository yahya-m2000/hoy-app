import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Property } from "../utils/types";
import { PropertyService } from "../services/propertyService";

const propertyService = new PropertyService();

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fetchProperties = useCallback(async () => {
    try {
      setError(null);
      const data = await propertyService.getHostProperties();
      setProperties(data);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch properties"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  }, [fetchProperties]);

  const deleteProperty = useCallback(async (id: string) => {
    try {
      await propertyService.deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete property"
      );
    }
  }, []);
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Refresh when screen is focused (e.g., returning from add/edit property)
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        fetchProperties();
      }
    }, [fetchProperties, loading])
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

  const fetchProperty = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      setLoading(true);
      const data = await propertyService.getProperty(id);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch property");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return {
    property,
    loading,
    error,
    refetch: fetchProperty,
  };
};
