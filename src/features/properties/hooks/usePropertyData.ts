/**
 * usePropertyData Hook
 * Custom hook for fetching and managing property data
 */

import { useState, useEffect, useCallback } from "react";
import { PropertyType } from "@core/types/property.types";

/**
 * Hook for fetching property data
 * @param propertyId The ID of the property to fetch
 * @returns Object containing property data and loading state
 */
export const usePropertyData = (propertyId?: string) => {
  const [property, setProperty] = useState<PropertyType | null>(null);
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
          _id: propertyId,
          title: "Sample Property",
          name: "Sample Property",
          description: "A sample property description",
          type: "apartment",
          propertyType: "entire_place",
          status: "published",
          guestAccessType: "entire_place",
          hostType: "individual",
          tags: ["Modern", "Cozy"],
          address: {
            street: "123 Sample St",
            city: "Sample City",
            state: "",
            postalCode: "",
            country: "Sample Country",
          },
          coordinates: { latitude: 0, longitude: 0 },
          hostId: "host123",
          host: "host123",
          hostName: "",
          hostImage: "",
          price: {
            amount: 100,
            currency: "USD",
            period: "night",
          },
          currency: "USD",
          weekdayPrice: 100,
          weekendPrice: 120,
          discounts: {
            newListingPromo: false,
            lastMinuteDiscount: false,
            weeklyDiscount: { enabled: false, percentage: 0 },
            monthlyDiscount: { enabled: false, percentage: 0 }
          },
          images: ["https://example.com/image1.jpg"],
          amenities: ["WiFi", "Kitchen"],
          maxGuests: 4,
          bedrooms: 2,
          beds: 2,
          bathrooms: 1,
          rating: 0,
          reviewCount: 0,
          isActive: true,
          isFeatured: false,
          isSuperHost: false,
          isWishlisted: false,
          checkInExperiences: [],
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