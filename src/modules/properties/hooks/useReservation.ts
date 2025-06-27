/**
 * useReservation Hook
 * Custom hook for managing property reservations
 */

import { useState, useCallback } from "react";
import { ReservationRequest, AvailabilityData } from "../types/reservation.types";
import { validateReservationRequest } from "../utils/validation";

/**
 * Hook for managing property reservations
 * @param propertyId The ID of the property to reserve
 * @returns Object containing reservation data and functions
 */
export const useReservation = (propertyId: string) => {
  const [availabilityData, setAvailabilityData] = useState<Record<string, AvailabilityData>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<ReservationRequest>({
    propertyId,
    checkIn: "",
    checkOut: "",
    guests: {
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0,
    },
  });

  // Fetch availability data for the property
  const fetchAvailability = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);

    try {
      // Replace with actual API call
      // const response = await api.properties.getAvailability(propertyId, startDate, endDate);
      // setAvailabilityData(response.data);
      
      // Mock data for now
      setTimeout(() => {
        const mockData: Record<string, AvailabilityData> = {};
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          const dateString = date.toISOString().split("T")[0];
          mockData[dateString] = {
            date: dateString,
            available: Math.random() > 0.3, // 70% chance of being available
            price: Math.floor(Math.random() * 50) + 100, // Random price between 100-150
          };
        }
        
        setAvailabilityData(mockData);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Failed to fetch availability");
      setLoading(false);
    }
  }, [propertyId]);

  // Update reservation data
  const updateReservation = useCallback((data: Partial<ReservationRequest>) => {
    setReservationData((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  // Check if dates are available
  const checkAvailability = useCallback((checkIn: string, checkOut: string): boolean => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    for (
      let date = new Date(checkInDate);
      date < checkOutDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateString = date.toISOString().split("T")[0];
      const dayData = availabilityData[dateString];
      
      if (!dayData || !dayData.available) {
        return false;
      }
    }
    
    return true;
  }, [availabilityData]);

  // Calculate total price for the reservation
  const calculateTotalPrice = useCallback((): number => {
    if (!reservationData.checkIn || !reservationData.checkOut) {
      return 0;
    }

    const checkInDate = new Date(reservationData.checkIn);
    const checkOutDate = new Date(reservationData.checkOut);
    let totalPrice = 0;
    
    for (
      let date = new Date(checkInDate);
      date < checkOutDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateString = date.toISOString().split("T")[0];
      const dayData = availabilityData[dateString];
      
      if (dayData && dayData.price) {
        totalPrice += dayData.price;
      }
    }
    
    return totalPrice;
  }, [availabilityData, reservationData.checkIn, reservationData.checkOut]);

  // Submit the reservation
  const submitReservation = useCallback(async () => {
    const validation = validateReservationRequest(reservationData);
    
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0] || "Invalid reservation data");
      return null;
    }
    
    if (!checkAvailability(reservationData.checkIn, reservationData.checkOut)) {
      setError("Selected dates are not available");
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call
      // const response = await api.reservations.create(reservationData);
      // return response.data;
      
      // Mock response for now
      return new Promise((resolve) => {
        setTimeout(() => {
          setLoading(false);
          resolve({
            id: `res-${Date.now()}`,
            ...reservationData,
            status: "confirmed",
            totalPrice: calculateTotalPrice(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }, 1000);
      });
    } catch (err) {
      setError("Failed to create reservation");
      setLoading(false);
      return null;
    }
  }, [reservationData, checkAvailability, calculateTotalPrice]);

  return {
    availabilityData,
    reservationData,
    loading,
    error,
    fetchAvailability,
    updateReservation,
    checkAvailability,
    calculateTotalPrice,
    submitReservation,
  };
}; 