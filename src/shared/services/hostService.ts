/**
 * Host Service API
 * Handles all API calls to host endpoints
 */
import api from "@shared/services/core/client";
import { PropertyType, HostDashboard, EarningsData } from "@shared/types";
import type { Reservation } from "@shared/types/booking/reservation";

// Helper interfaces for API responses
export interface HostPropertyResponse {
  id: string;
  title: string;
  location: string;
  locationString: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  isActive: boolean;
  occupancyRate?: number;
  bedrooms: number;
  bathrooms: number;
  hostId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostReservationResponse {
  id: string;
  guestId: string;
  guestName: string;
  guestPhoto?: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  guests: number;
  isPaid: boolean;
}

export interface HostEarningsResponse {
  totalEarnings: number;
  pendingPayouts: number;
  thisMonth: number;
  previousMonth: number;
  monthlyData: {
    month: string;
    amount: number;
  }[];
  transactions: {
    id: string;
    date: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    propertyId: string;
    propertyTitle: string;
    reservationId: string;
  }[];
}

export interface HostDashboardResponse {
  properties: HostPropertyResponse[];
  reservations: HostReservationResponse[];
  earnings: {
    totalEarnings: number;
    pendingPayouts: number;
    thisMonth: number;
    previousMonth: number;
  };
}

/**
 * Get host dashboard data
 */
export const getHostDashboard = async (): Promise<HostDashboard> => {
  const response = await api.get("/host/dashboard");
  return response.data as HostDashboard;
};

/**
 * Get host analytics/insights
 */
export const getHostAnalytics = async (period: string = "month") => {
  const response = await api.get("/host/analytics", { params: { period } });
  return response.data;
};

/**
 * Get properties for the current host
 */
export const getHostProperties = async (
  filter?: string
): Promise<PropertyType[]> => {
  const params = filter && filter !== "all" ? { status: filter } : {};
  const response = await api.get("/host/properties", { params });
  return response.data as PropertyType[];
};

/**
 * Get a single property by ID
 */
export const getHostProperty = async (id: string): Promise<PropertyType> => {
  const response = await api.get(`/host/properties/${id}`);
  return response.data as PropertyType;
};

/**
 * Create a new property
 */
export const createProperty = async (
  propertyData: Omit<PropertyType, "_id">
): Promise<PropertyType> => {
  const response = await api.post("/host/properties", propertyData);
  return response.data as PropertyType;
};

/**
 * Update an existing property
 */
export const updateProperty = async (
  id: string,
  propertyData: Partial<PropertyType>
): Promise<PropertyType> => {
  const response = await api.put(`/host/properties/${id}`, propertyData);
  return response.data as PropertyType;
};

/**
 * Delete a property
 */
export const deleteProperty = async (
  id: string
): Promise<{ success: boolean }> => {
  const response = await api.delete(`/host/properties/${id}`);
  return response.data as { success: boolean };
};

/**
 * Get host earnings data
 */
export const getHostEarnings = async (
  period: "week" | "month" | "year" | "all" = "month"
): Promise<EarningsData> => {
  const response = await api.get("/host/earnings", {
    params: { period },
  });
  return response.data as EarningsData;
};

/**
 * Get host earnings data (raw API response)
 */
export const getHostEarningsRaw = async (
  period: "week" | "month" | "year" | "all" = "month"
): Promise<HostEarningsResponse> => {
  const response = await api.get("/host/earnings", {
    params: { period },
  });
  return response.data as HostEarningsResponse;
};

/**
 * Get host reservations
 */
export const getHostReservations = async (
  status?: string
): Promise<Reservation[]> => {
  const params = status ? { status } : {};
  const response = await api.get("/host/reservations", { params });

  // API returns { data: Reservation[], pagination: any }
  // We need to extract the data array
  const apiResponse = response.data as any;

  // Handle both array and object responses
  if (Array.isArray(apiResponse)) {
    return apiResponse as Reservation[];
  }

  // Extract data from paginated response
  return (apiResponse?.data || []) as Reservation[];
};

/**
 * Get host reservations (raw API response)
 */
export const getHostReservationsRaw = async (
  status?: string
): Promise<HostReservationResponse[]> => {
  const params = status ? { status } : {};
  const response = await api.get("/host/reservations", { params });
  return response.data as HostReservationResponse[];
};

/**
 * Get reservation details by booking ID
 */
export const getReservationDetails = async (
  bookingId: string
): Promise<Reservation> => {
  const response = await api.get(`/host/reservations/${bookingId}`);
  return response.data as Reservation;
};

/**
 * Update reservation status
 */
export const updateReservationStatus = async (
  bookingId: string,
  status: string
): Promise<{ success: boolean }> => {
  const response = await api.patch(`/host/reservations/${bookingId}/status`, {
    status,
  });
  return response.data as { success: boolean };
};

/**
 * Get host messages/conversations
 */
export const getHostMessages = async () => {
  const response = await api.get("/host/messages");
  return response.data;
};

/**
 * Get host settings
 */
export const getHostSettings = async () => {
  const response = await api.get("/host/settings");
  return response.data;
};

/**
 * Update host settings
 */
export const updateHostSettings = async (settings: any) => {
  const response = await api.put("/host/settings", settings);
  return response.data;
};

/**
 * Get current user profile (for settings page)
 */
export const getUserProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData: any) => {
  const response = await api.put("/users/me", profileData);
  return response.data;
};

/**
 * Update user password
 */
export const updateUserPassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.put("/users/me/password", passwordData);
  return response.data;
};

/**
 * Get user preferences
 */
export const getUserPreferences = async () => {
  const response = await api.get("/users/me/preferences");
  return response.data;
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (preferences: any) => {
  const response = await api.put("/users/me/preferences", preferences);
  return response.data;
};

/**
 * Get host notifications
 */
export const getHostNotifications = async () => {
  const response = await api.get("/host/notifications");
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: string) => {
  const response = await api.patch(
    `/host/notifications/${notificationId}/read`
  );
  return response.data;
};

/**
 * Get host analytics/insights
 */
export const getHostInsights = async (period: string = "month") => {
  const response = await api.get("/host/insights", { params: { period } });
  return response.data;
};

/**
 * Get property availability calendar
 */
export const getPropertyAvailability = async (
  propertyId: string,
  startDate?: string,
  endDate?: string
) => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get(
    `/host/properties/${propertyId}/availability`,
    { params }
  );
  return response.data;
};

/**
 * Update property availability
 */
export const updatePropertyAvailability = async (
  propertyId: string,
  availabilityData: any
) => {
  const response = await api.put(
    `/host/properties/${propertyId}/availability`,
    availabilityData
  );
  return response.data;
};

/**
 * Get property pricing
 */
export const getPropertyPricing = async (propertyId: string) => {
  const response = await api.get(`/host/properties/${propertyId}/pricing`);
  return response.data;
};

/**
 * Update property pricing
 */
export const updatePropertyPricing = async (
  propertyId: string,
  pricingData: any
) => {
  const response = await api.put(
    `/host/properties/${propertyId}/pricing`,
    pricingData
  );
  return response.data;
};

/**
 * Get property reviews
 */
export const getPropertyReviews = async (
  propertyId: string,
  page: number = 1,
  limit: number = 10
) => {
  const response = await api.get(`/host/properties/${propertyId}/reviews`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Respond to a review
 */
export const respondToReview = async (reviewId: string, response: string) => {
  const apiResponse = await api.post(`/host/reviews/${reviewId}/respond`, {
    response,
  });
  return apiResponse.data;
};

/**
 * Get booking requests (pending reservations)
 */
export const getBookingRequests = async () => {
  const response = await api.get("/host/reservations", {
    params: { status: "pending" },
  });

  // Handle paginated response
  const apiResponse = response.data as any;
  if (Array.isArray(apiResponse)) {
    return apiResponse;
  }
  return apiResponse?.data || [];
};

/**
 * Accept a booking request
 */
export const acceptBookingRequest = async (bookingId: string) => {
  const response = await api.patch(`/host/reservations/${bookingId}/status`, {
    status: "confirmed",
  });
  return response.data;
};

/**
 * Decline a booking request
 */
export const declineBookingRequest = async (
  bookingId: string,
  reason?: string
) => {
  const response = await api.patch(`/host/reservations/${bookingId}/status`, {
    status: "cancelled",
    reason,
  });
  return response.data;
};

/**
 * Send message to guest
 */
export const sendMessageToGuest = async (
  bookingId: string,
  message: string
) => {
  const response = await api.post(`/host/reservations/${bookingId}/messages`, {
    message,
  });
  return response.data;
};

/**
 * Get messages for a booking
 */
export const getBookingMessages = async (bookingId: string) => {
  const response = await api.get(`/host/reservations/${bookingId}/messages`);
  return response.data;
};

/**
 * Upload property images
 */
export const uploadPropertyImages = async (
  propertyId: string,
  images: any[]
) => {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append(`images`, image);
  });

  const response = await api.post(
    `/host/properties/${propertyId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * Delete property image
 */
export const deletePropertyImage = async (
  propertyId: string,
  imageId: string
) => {
  const response = await api.delete(
    `/host/properties/${propertyId}/images/${imageId}`
  );
  return response.data;
};

/**
 * Get host payout information
 */
export const getHostPayouts = async (status?: string) => {
  const params = status ? { status } : {};
  const response = await api.get("/host/payouts", { params });
  return response.data;
};

/**
 * Update payout method
 */
export const updatePayoutMethod = async (payoutData: any) => {
  const response = await api.put("/host/payout-methods", payoutData);
  return response.data;
};

/**
 * Get tax documents
 */
export const getTaxDocuments = async (year?: number) => {
  const params = year ? { year } : {};
  const response = await api.get("/host/tax-documents", { params });
  return response.data;
};

// Legacy function names for backward compatibility
export const fetchHostDashboard = getHostDashboard;
export const fetchHostProperties = getHostProperties;
export const fetchHostPropertyDetails = getHostProperty;
export const createHostProperty = createProperty;
export const updateHostProperty = updateProperty;
export const deleteHostProperty = deleteProperty;
export const fetchHostEarnings = getHostEarningsRaw; // Use raw version for backward compatibility
export const fetchHostReservations = getHostReservationsRaw; // Use raw version for backward compatibility
export const fetchHostMessages = getHostMessages;
