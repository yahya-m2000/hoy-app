/**
 * Hook for fetching host dashboard data
 */

import { useQuery } from "@tanstack/react-query";
import { HostDashboardService } from "@core/api/services/host/dashboard.service";
import type {
  HostDashboard,
  Reservation,
  DashboardMetrics,
} from "../types/dashboard.types";

const mapBookingToReservation = (booking: any): Reservation => {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Map booking status to reservation status
  const mapStatus = (
    status: string
  ): Reservation['status'] => {
    switch (status) {
      case "confirmed":
        return "upcoming";
      case "pending":
        return "pending";
      case "in-progress":
      case "in_progress":
        return "active";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  return {
    id: booking._id,
    guestName:
      booking.contactInfo?.name ||
      `${booking.userId?.firstName || ""} ${
        booking.userId?.lastName || ""
      }`.trim() ||
      "Guest",
    property: booking.propertyId?.name || "Property",
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    status: mapStatus(booking.bookingStatus),
    totalAmount: booking.totalPrice || 0,
    nights: nights > 0 ? nights : 1,
  };
};

export const useHostDashboard = () => {
  return useQuery<HostDashboard, Error, DashboardMetrics>({
    queryKey: ["hostDashboard"],
    queryFn: async () => {
      try {
        return await HostDashboardService.getDashboardData();
      } catch (error: any) {
        // Handle 403 errors gracefully - user doesn't have host permissions yet
        if (error?.response?.status === 403) {
          console.log("🔐 [useHostDashboard] User doesn't have host permissions yet - returning null for setup flow");
          // Return null data instead of throwing error so UI can show setup flow
          return null as any;
        }
        // Re-throw other errors
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 403 errors (user needs to complete setup)
      if (error?.response?.status === 403) {
        return false;
      }
      // Don't retry on auth errors (401)
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    select: (data) => {
      // If data is null (user doesn't have host permissions), return empty dashboard
      if (!data) {
        return {
          earnings: {
            thisMonth: 0,
            lastMonth: 0,
            thisYear: 0,
            chartData: [],
          },
          stats: {
            totalEarnings: 0,
            monthlyEarnings: 0,
            activeListings: 0,
            occupancyRate: 0,
            totalReservations: 0,
            averageRating: 0,
          },
          recentReservations: [],
        };
      }

      /**
       * The server response does not always include a nested `stats` or `earnings` object.
       * Fall back to the root‐level fields (e.g. `totalEarnings`, `thisMonthEarnings`, etc.)
       * to build a consistent `DashboardMetrics` object for the UI layer.
       */

      // ----------------------------------------
      // Earnings
      // ----------------------------------------
      const earningsSrc: any = (data as any).earningsData || (data as any).earnings || {};

      const earningsThisMonth =
        earningsSrc.thisMonth ?? (data as any).thisMonthEarnings ?? 0;
      const earningsLastMonth =
        earningsSrc.previousMonth ?? earningsSrc.lastMonth ?? 0;
      const earningsTotal =
        earningsSrc.totalEarnings ?? (data as any).totalEarnings ?? 0;

      // ----------------------------------------
      // Stats
      // ----------------------------------------
      const activeListings =
        (data as any).activePropertiesCount ?? (data as any).activeProperties ?? 0;

      const occupancyRate =
        (data as any).occupancyRate ?? (data as any).stats?.occupancyRate ?? 0;

      const totalReservations =
        ((data as any).pendingReservations ?? 0) +
        ((data as any).upcomingReservations ?? 0) +
        ((data as any).stats?.totalReservations ?? 0);

      const averageRating = (data as any).hostRating ?? (data as any).stats?.averageRating ?? 0;

      // ----------------------------------------
      // Recent reservations – ensure we have an array
      // ----------------------------------------
      const recentReservations = (
        (data as any).recentReservations || (data as any).reservations || []
      )
        .map(mapBookingToReservation)
        .sort(
          (a: Reservation, b: Reservation) =>
            new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
        );

      return {
        earnings: {
          thisMonth: earningsThisMonth,
          lastMonth: earningsLastMonth,
          thisYear: earningsTotal,
          chartData:
            earningsSrc.monthlyData?.map((d: any) => ({
              month: d.month,
              earnings: d.amount ?? d.earnings ?? 0,
            })) || [],
        },
        stats: {
          totalEarnings: earningsTotal,
          monthlyEarnings: earningsThisMonth,
          activeListings,
          occupancyRate,
          totalReservations,
          averageRating,
        },
        recentReservations,
      };
    },
  });
};

export default useHostDashboard;
