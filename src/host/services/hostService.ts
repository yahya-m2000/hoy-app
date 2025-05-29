/**
 * Host Service API
 * Handles all API calls to host endpoints
 */
import api from "../../common/services/api";
import { PropertyType } from "../../common/types/property";
import { HostDashboard } from "../../common/types/dashboard";
import { Reservation } from "../../common/types/reservation";
import { EarningsData } from "../../common/types/earnings";

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
  return response.data as Reservation[];
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
