/**
 * usePropertyData Hook
 * Custom hook for fetching and managing property data
 */

import { useState, useEffect, useCallback } from "react";
import { Property } from "../types/property.types";

/**
 * Hook for fetching property data
 * @param propertyId The ID of the property to fetch
 * @returns Object containing property data and loading state
 */
export const usePropertyData = (propertyId?: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) {
      setError("Property ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Replace with actual API call
      // const response = await api.properties.getById(propertyId);
      // setProperty(response.data);
      
      // Mock data for now
      setTimeout(() => {
        setProperty({
          id: propertyId,
          title: "Sample Property",
          description: "A sample property description",
          location: {
            address: "123 Sample St",
            city: "Sample City",
            country: "Sample Country",
          },
          hostId: "host123",
          price: 100,
          images: ["https://example.com/image1.jpg"],
          amenities: ["WiFi", "Kitchen"],
          maxGuests: 4,
          bedrooms: 2,
          beds: 2,
          baths: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Failed to fetch property");
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, fetchProperty]);

  const refetch = useCallback(() => {
    fetchProperty();
  }, [fetchProperty]);

  return {
    property,
    loading,
    error,
    refetch,
  };
}; 