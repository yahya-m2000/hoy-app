import type { HostDashboard } from "@core/types";

export type { HostDashboard };

export interface HostDashboardResponse {
  activePropertiesCount: number;
  earningsData: {
    monthlyData: Array<{
      month: string;
      earnings: number;
    }>;
    pendingPayouts: number;
    previousMonth: number;
    thisMonth: number;
    totalEarnings: number;
    transactions: Array<{
      id: string;
      amount: number;
      date: string;
      status: 'pending' | 'completed' | 'failed';
      type: 'payout' | 'refund' | 'earnings';
    }>;
  };
  recentReservations: Array<{
    _id: string;
    checkIn: string;
    checkOut: string;
    bookingStatus: 'confirmed' | 'pending' | 'in-progress' | 'completed' | 'cancelled';
    totalPrice: number;
    propertyId?: {
      _id: string;
      name: string;
    };
    userId?: {
      _id: string;
      firstName?: string;
      lastName?: string;
    };
    contactInfo?: {
      name: string;
      email: string;
      phone?: string;
    };
  }>;
  thisMonthEarnings: number;
  totalEarnings: number;
  hostRating?: number;
  occupancyRate?: number;
}

export interface Reservation {
  id: string;
  guestName: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: 'upcoming' | 'active' | 'completed' | 'pending' | 'cancelled';
  totalAmount: number;
  nights: number;
}

export interface EarningsData {
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  chartData: Array<{
    month: string;
    earnings: number;
  }>;
}

export interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  activeListings: number;
  occupancyRate: number;
  totalReservations: number;
  averageRating: number;
}

export interface DashboardMetrics {
  earnings: EarningsData;
  stats: DashboardStats;
  recentReservations: Reservation[];
} 