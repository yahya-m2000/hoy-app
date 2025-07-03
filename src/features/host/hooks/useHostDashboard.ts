/**
 * Hook for fetching host dashboard data
 */

import { useQuery } from "@tanstack/react-query";
import { HostDashboard } from "@core/types";

export const useHostDashboard = () => {
  return useQuery<HostDashboard>({
    queryKey: ["hostDashboard"],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      const mockData: HostDashboard = {
        totalEarnings: 0,
        pendingPayouts: 0,
        thisMonth: 0,
        lastMonth: 0,
        properties: {
          total: 0,
          active: 0,
          inactive: 0,
          occupancyRate: 0,
        },
        earnings: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          lastMonth: 0,
          thisYear: 0,
          yearToDate: 0,
          upcoming: 0,
        },
        stats: {
          totalProperties: 0,
          activeProperties: 0,
          totalReservations: 0,
          pendingReservations: 0,
          totalEarnings: 0,
          pendingPayouts: 0,
          averageRating: 0,
          totalReviews: 0,
          occupancyRate: 0,
        },
        recentReservations: [],
        recentReviews: [],
        popularProperties: [],
        earningsOverview: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          thisYear: 0,
        },
        upcomingPayouts: [],
      };
      return mockData;
    },
  });
};

export default useHostDashboard;
