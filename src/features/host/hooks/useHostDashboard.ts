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
    queryFn: HostDashboardService.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
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
