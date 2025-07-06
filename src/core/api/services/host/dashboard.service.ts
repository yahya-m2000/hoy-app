/**
 * Host Dashboard Service
 * 
 * Comprehensive service for host dashboard operations organized into
 * focused service classes for better maintainability:
 * - HostDashboardService - Main dashboard data aggregation
 * - HostPropertyService - Property management operations
 * - HostReservationService - Reservation management
 * - HostEarningsService - Earnings and analytics
 * 
 * @module @core/api/services/host
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import type {
  PropertyType,
  HostDashboard,
  EarningsData,
  Reservation,
} from "@core/types";
import { logger } from "@core/utils/sys/log";
import { logErrorWithContext } from "src/core/utils/sys/error";

// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * Host property API response structure
 */
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

/**
 * Host reservation API response structure
 */
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

/**
 * Host earnings API response structure
 */
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

/**
 * Complete dashboard data response
 */
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

// ========================================
// HOST DASHBOARD SERVICE
// ========================================

/**
 * Main dashboard data operations and analytics
 */
export class HostDashboardService {
  /**
   * Get complete host dashboard data including properties, reservations, and earnings summary
   * 
   * @returns Promise<HostDashboard> - Aggregated dashboard data
   * @throws Will throw error if dashboard data cannot be retrieved
   */
  static async getDashboardData(): Promise<HostDashboard> {
    try {
      const response = await api.get<{ success: boolean; data: HostDashboard }>("/host/dashboard");
      const respData = response.data;
      const dashboard: HostDashboard = respData && typeof respData === "object" && "data" in respData
        ? respData.data
        : respData;
        console.log("🔍 getDashboardData: dashboard", dashboard);
      return dashboard as HostDashboard;
    } catch (error) {
      logErrorWithContext("getDashboardData", error);
      throw error;
    }
  }
  /**
   * Get host analytics for specified period with performance metrics
   * 
   * @param period - Analytics period ("week" | "month" | "year" | "all")
   * @returns Promise<any> - Analytics data including occupancy, revenue, and performance metrics
   */
  static async getAnalytics(period: "week" | "month" | "year" | "all" = "month") {
    try {
      const response = await api.get<{ data: any }>("/host/analytics", { 
        params: { period } 
      });
      return response.data.data;
    } catch (error: any) {
      logger.error("Error fetching host analytics:", error);
      return null;
    }
  }

  /**
   * Get host insights for specified period with recommendations and trends
   * 
   * @param period - Insights period ("week" | "month" | "year" | "all")
   * @returns Promise<any> - Insights data with recommendations and market trends
   */
  static async getInsights(period: "week" | "month" | "year" | "all" = "month") {
    try {
      const response = await api.get<{ data: any }>("/host/insights", { 
        params: { period } 
      });
      return response.data.data;
    } catch (error: any) {
      logger.error("Error fetching host insights:", error);
      return null;
    }
  }

  /**
   * Get host performance summary with key metrics
   * 
   * @returns Promise<any> - Performance summary including ratings, response times, etc.
   */
  static async getPerformanceSummary() {
    try {
      const response = await api.get<{ data: any }>("/host/performance");
      return response.data.data;
    } catch (error: any) {
      logger.error("Error fetching performance summary:", error);
      return null;
    }
  }
}



// ========================================
// HOST RESERVATION SERVICE
// ========================================

/**
 * Reservation and booking management for hosts
 */
export class HostReservationService {
  /**
   * Get all reservations for the host with optional status filtering
   * 
   * @param status - Optional reservation status filter
   * @returns Promise<Reservation[]> - Array of reservations
   */
  static async getReservations(status?: string): Promise<Reservation[]> {
    try {
      const params = status ? { status } : {};
      const response = await api.get<{ data: Reservation[] }>("/host/reservations", { params });
      return response.data.data || [];
    } catch (error: any) {
      logger.error("Error fetching host reservations:", error);
      return [];
    }
  }

  /**
   * Get raw reservation data from API
   * 
   * @param status - Optional reservation status filter
   * @returns Promise<HostReservationResponse[]> - Raw reservation data
   */
  static async getReservationsRaw(status?: string): Promise<HostReservationResponse[]> {
    try {
      const params = status ? { status } : {};
      const response = await api.get<{ data: HostReservationResponse[] }>("/host/reservations", { params });
      return response.data.data || [];
    } catch (error: any) {
      logger.error("Error fetching raw reservation data:", error);
      return [];
    }
  }

  /**
   * Get detailed information for a specific reservation
   * 
   * @param bookingId - Booking/Reservation ID
   * @returns Promise<Reservation> - Detailed reservation information
   * @throws Will throw error if reservation not found
   */
  static async getReservationDetails(bookingId: string): Promise<Reservation> {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    const response = await api.get<{ data: Reservation }>(`/host/reservations/${bookingId}`);
    return response.data.data;
  }

  /**
   * Update reservation status (accept, decline, cancel, etc.)
   * 
   * @param bookingId - Booking/Reservation ID
   * @param status - New status to set
   * @returns Promise<{ success: boolean }> - Update confirmation
   * @throws Will throw error if status update fails
   */
  static async updateReservationStatus(
    bookingId: string,
    status: string
  ): Promise<{ success: boolean }> {
    if (!bookingId || !status) {
      throw new Error("Booking ID and status are required");
    }

    const response = await api.patch<{ success: boolean }>(`/host/reservations/${bookingId}/status`, { status });
    return response.data;
  }

  /**
   * Get pending booking requests requiring host action
   * 
   * @returns Promise<any> - Array of pending booking requests
   */
  static async getBookingRequests() {
    try {
      const response = await api.get<{ data: any }>("/host/booking-requests");
      return response.data.data || [];
    } catch (error: any) {
      logger.error("Error fetching booking requests:", error);
      return [];
    }
  }

  /**
   * Accept a booking request
   * 
   * @param bookingId - Booking ID to accept
   * @returns Promise<any> - Acceptance confirmation
   */
  static async acceptBookingRequest(bookingId: string) {
    try {
      const response = await api.post<{ data: any }>(`/host/booking-requests/${bookingId}/accept`);
      return response.data.data;
    } catch (error: any) {
      logger.error("Error accepting booking request:", error);
      throw error;
    }
  }

  /**
   * Decline a booking request with optional reason
   * 
   * @param bookingId - Booking ID to decline
   * @param reason - Optional decline reason
   * @returns Promise<any> - Decline confirmation
   */
  static async declineBookingRequest(bookingId: string, reason?: string) {
    try {
      const data = reason ? { reason } : {};
      const response = await api.post<{ data: any }>(`/host/booking-requests/${bookingId}/decline`, data);
      return response.data.data;
    } catch (error: any) {
      logger.error("Error declining booking request:", error);
      throw error;
    }
  }
}

// ========================================
// HOST EARNINGS SERVICE
// ========================================

/**
 * Earnings, payouts, and financial data management
 */
export class HostEarningsService {
  /**
   * Get earnings data for specified period with detailed breakdown
   * 
   * @param period - Earnings period to analyze
   * @returns Promise<EarningsData> - Comprehensive earnings information
   */
  static async getEarnings(
    period: "week" | "month" | "year" | "all" = "month"
  ): Promise<EarningsData> {
    try {
      const response = await api.get<{ data: EarningsData }>("/host/earnings", { 
        params: { period } 
      });
      return response.data.data;
    } catch (error: any) {
      logger.error("Error fetching host earnings:", error);
      throw error;
    }
  }

  /**
   * Get raw earnings data from API
   * 
   * @param period - Earnings period to analyze
   * @returns Promise<HostEarningsResponse> - Raw earnings data
   */
  static async getEarningsRaw(
    period: "week" | "month" | "year" | "all" = "month"
  ): Promise<HostEarningsResponse> {
    try {
      const response = await api.get<{ data: HostEarningsResponse }>("/host/earnings", { 
        params: { period } 
      });
      return response.data.data;
    } catch (error: any) {
      logger.error("Error fetching raw earnings data:", error);
      throw error;
    }
  }

  /**
   * Get payout information and history
   * 
   * @param status - Optional payout status filter
   * @returns Promise<any> - Payout history and pending payouts
   */
  static async getPayouts(status?: string) {
    try {
      const params = status ? { status } : {};
      const response = await api.get<{ data: any }>("/host/payouts", { params });
      return response.data.data;
    } catch (error: any) {
      logger.error("Error fetching payout information:", error);
      return null;
    }
  }

  /**
   * Update payout method settings
   * 
   * @param payoutData - New payout method configuration
   * @returns Promise<any> - Updated payout settings
   */
  static async updatePayoutMethod(payoutData: any) {
    try {
      const response = await api.put<{ data: any }>("/host/payout-method", payoutData);
      return response.data.data;
    } catch (error: any) {
      logger.error("Error updating payout method:", error);
      throw error;
    }
  }

  /**
   * Get tax documents for specified year
   * 
   * @param year - Tax year (defaults to current year)
   * @returns Promise<any> - Available tax documents
   */
  static async getTaxDocuments(year?: number) {
    try {
      const currentYear = new Date().getFullYear();
      const taxYear = year || currentYear;
      
      const response = await api.get<{ data: any }>("/host/tax-documents", { 
        params: { year: taxYear } 
      });
      return response.data.data;    
    } catch (error: any) {
      logger.error("Error fetching tax documents:", error);
      return null;
    }
  }
}

// ========================================
// LEGACY EXPORTS (for backward compatibility)
// ========================================

export const getDashboardData = HostDashboardService.getDashboardData;
export const getAnalytics = HostDashboardService.getAnalytics;
export const getInsights = HostDashboardService.getInsights;
export const getReservations = HostReservationService.getReservations;
export const getReservationDetails = HostReservationService.getReservationDetails;
export const updateReservationStatus = HostReservationService.updateReservationStatus;
export const getEarnings = HostEarningsService.getEarnings;
export const getPayouts = HostEarningsService.getPayouts;
