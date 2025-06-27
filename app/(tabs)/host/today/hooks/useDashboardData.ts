import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@shared/constants";

interface DashboardData {
  totalEarnings: number;
  monthlyEarnings: number;
  activeListings: number;
  occupancyRate: number;
  totalReservations: number;
  averageRating: number;
}

interface TodaysActivity {
  checkIns: number;
  checkOuts: number;
  newReservations: number;
}

interface EarningsData {
  thisWeek: number;
  thisMonth: number;
  lastMonth: number;
  yearToDate: number;
  nextPayout: {
    amount: number;
    date: string;
  };
}

interface Reservation {
  id: string;
  guestName: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: "upcoming" | "active" | "completed" | "pending" | "cancelled";
  totalAmount: number;
  nights: number;
}

interface DashboardHookResult {
  dashboardData: DashboardData | null;
  todaysActivity: TodaysActivity | null;
  earningsData: EarningsData | null;
  recentReservations: Reservation[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const useDashboardData = (): DashboardHookResult => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [todaysActivity, setTodaysActivity] = useState<TodaysActivity | null>(
    null
  );
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Helper function to map booking status to reservation status
  const mapBookingStatusToReservationStatus = (
    bookingStatus: string
  ): "upcoming" | "active" | "completed" | "pending" | "cancelled" => {
    switch (bookingStatus) {
      case "confirmed":
        return "upcoming";
      case "pending":
        return "pending";
      case "in-progress":
        return "active";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  };
  const fetchDashboardData = useCallback(async () => {
    try {
      console.log("🚀 Starting dashboard data fetch...");
      setError(null);
      setLoading(true); // Try multiple token storage keys that might be used
      const tokenKeys = ["accessToken", "authToken", "token"];
      let token = null;

      for (const key of tokenKeys) {
        const storedToken = await AsyncStorage.getItem(key);
        if (storedToken) {
          console.log(`🔑 Found token in storage key: ${key}`);
          token = storedToken;
          break;
        }
      }

      console.log("🔑 Token from storage:", token ? "EXISTS" : "NOT FOUND");

      if (!token) {
        console.log("❌ No authentication token found in any storage key");
        throw new Error("Authentication required");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      console.log("📡 Making API call to:", `${API_BASE_URL}/host/dashboard`);

      // Fetch all dashboard data from the single endpoint
      const response = await fetch(`${API_BASE_URL}/host/dashboard`, {
        headers,
      });

      console.log("📊 API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ API Error:", errorText);
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Dashboard API Response:", result);

      // Set dashboard data from the response
      setDashboardData({
        totalEarnings: result.totalEarnings || 0,
        monthlyEarnings: result.thisMonthEarnings || 0,
        activeListings: result.activePropertiesCount || 0,
        occupancyRate: result.occupancyRate || 0,
        totalReservations: result.recentReservations?.length || 0,
        averageRating: result.hostRating || 0,
      });

      // Set earnings data from the response
      setEarningsData({
        thisWeek: result.earningsData?.thisWeek || 0,
        thisMonth: result.earningsData?.thisMonth || 0,
        lastMonth: result.earningsData?.previousMonth || 0,
        yearToDate: result.earningsData?.totalEarnings || 0,
        nextPayout: {
          amount: result.earningsData?.pendingPayouts || 0,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        },
      }); // Transform the reservations data to match our interface
      const transformedReservations: Reservation[] = (
        result.recentReservations || []
      ).map((booking: any) => {
        try {
          const checkInDate = new Date(booking.checkIn);
          const checkOutDate = new Date(booking.checkOut);

          // Validate dates
          if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            console.warn("Invalid dates in booking:", booking);
            // Use fallback dates
            const fallbackCheckIn = new Date();
            const fallbackCheckOut = new Date(Date.now() + 24 * 60 * 60 * 1000);

            const nights = Math.ceil(
              (fallbackCheckOut.getTime() - fallbackCheckIn.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return {
              id: booking._id || `booking-${Date.now()}`,
              guestName:
                booking.contactInfo?.name ||
                `${booking.userId?.firstName || ""} ${
                  booking.userId?.lastName || ""
                }`.trim() ||
                "Guest",
              property:
                booking.property?.name ||
                result.recentProperties?.[0]?.name ||
                "Property",
              checkIn: fallbackCheckIn.toISOString(),
              checkOut: fallbackCheckOut.toISOString(),
              status: mapBookingStatusToReservationStatus(
                booking.bookingStatus
              ),
              totalAmount: booking.totalPrice || 0,
              nights: nights > 0 ? nights : 1,
            };
          }

          const nights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          return {
            id: booking._id || `booking-${Date.now()}`,
            guestName:
              booking.contactInfo?.name ||
              `${booking.userId?.firstName || ""} ${
                booking.userId?.lastName || ""
              }`.trim() ||
              "Guest",
            property:
              booking.property?.name ||
              result.recentProperties?.[0]?.name ||
              "Property",
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            status: mapBookingStatusToReservationStatus(booking.bookingStatus),
            totalAmount: booking.totalPrice || 0,
            nights: nights > 0 ? nights : 1,
          };
        } catch (error) {
          console.warn("Error transforming reservation:", error, booking);
          // Return a fallback reservation
          const fallbackCheckIn = new Date();
          const fallbackCheckOut = new Date(Date.now() + 24 * 60 * 60 * 1000);

          return {
            id: booking._id || `booking-${Date.now()}`,
            guestName: "Guest",
            property: "Property",
            checkIn: fallbackCheckIn.toISOString(),
            checkOut: fallbackCheckOut.toISOString(),
            status: "upcoming" as const,
            totalAmount: 0,
            nights: 1,
          };
        }
      });

      setRecentReservations(transformedReservations); // Calculate today's activity from recent reservations
      const today = new Date().toDateString();
      const todaysCheckIns = (result.recentReservations || []).filter(
        (booking: any) => {
          try {
            const checkInDate = new Date(booking.checkIn);
            return (
              !isNaN(checkInDate.getTime()) &&
              checkInDate.toDateString() === today
            );
          } catch {
            return false;
          }
        }
      ).length;

      const todaysCheckOuts = (result.recentReservations || []).filter(
        (booking: any) => {
          try {
            const checkOutDate = new Date(booking.checkOut);
            return (
              !isNaN(checkOutDate.getTime()) &&
              checkOutDate.toDateString() === today
            );
          } catch {
            return false;
          }
        }
      ).length;

      const todaysNewReservations = (result.recentReservations || []).filter(
        (booking: any) => {
          try {
            const createdDate = new Date(booking.createdAt);
            return (
              !isNaN(createdDate.getTime()) &&
              createdDate.toDateString() === today
            );
          } catch {
            return false;
          }
        }
      ).length;
      setTodaysActivity({
        checkIns: todaysCheckIns,
        checkOuts: todaysCheckOuts,
        newReservations: todaysNewReservations,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = async () => {
    await fetchDashboardData();
  };
  useEffect(() => {
    console.log("🔄 useEffect triggered");
    // Always try to fetch dashboard data since other endpoints are working
    // This will handle cases where auth context is not properly updated
    console.log("✅ Attempting to fetch dashboard data...");
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    todaysActivity,
    earningsData,
    recentReservations,
    loading,
    error,
    refreshData,
  };
};
