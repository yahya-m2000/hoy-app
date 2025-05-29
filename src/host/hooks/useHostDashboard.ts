/**
 * Custom hook for host dashboard data and operations
 */
import { useQuery } from "@tanstack/react-query";
import { getHostDashboard } from "../services/hostService";
import { HostDashboard } from "../../common/types/dashboard";

export const useHostDashboard = () => {
  // Query for dashboard data
  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery<HostDashboard>({
    queryKey: ["hostDashboard"],
    queryFn: getHostDashboard,
    select: (data) => ({
      ...data,
      // Transform data for UI if needed
      popularProperties: data.popularProperties.map((prop) => ({
        ...prop,
        id: prop.id,
        image: prop.image || "https://picsum.photos/500/300?random=1",
      })),
      recentReservations: data.recentReservations.map((res) => ({
        ...res,
        propertyImage:
          res.propertyImage || "https://picsum.photos/500/300?random=2",
        guests: 2, // Default to 2 guests if not provided
      })),
    }),
  });

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate number of days between two dates
  const calculateDays = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get upcoming reservations - temporarily mock the status filter
  const upcomingReservations = dashboardData?.recentReservations
    ?.slice(0, 3) // Just get the first three reservations for now
    .map((res) => ({
      ...res,
      // Ensure all required properties
      guests: res.guests || 2,
    }));

  return {
    dashboardData,
    isLoading,
    refetch,
    formatDate,
    calculateDays,
    upcomingReservations,
  };
};
