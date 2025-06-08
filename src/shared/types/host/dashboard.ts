/**
 * Dashboard type definitions for host interface
 */

export interface HostDashboard {
  // Direct access properties that components expect
  totalEarnings?: number;
  pendingPayouts?: number;
  thisMonth?: number;
  lastMonth?: number;

  // Properties section that components expect
  properties?: {
    total?: number;
    active?: number;
    inactive?: number;
    occupancyRate?: number;
  } & {
    length?: number;
    filter?: (fn: (p: any) => boolean) => any[];
    reduce?: (fn: (sum: any, p: any) => any, initial: any) => any;
  };

  // Earnings section that components expect
  earnings?: {
    thisMonth?: number;
    lastMonth?: number;
    yearToDate?: number;
    upcoming?: number;
  };

  stats: {
    totalProperties: number;
    activeProperties: number;
    totalReservations: number;
    pendingReservations: number;
    totalEarnings: number;
    pendingPayouts: number;
    averageRating: number;
    totalReviews: number;
    occupancyRate: number;
  };
  recentReservations: RecentReservation[];
  recentReviews: {
    id: string;
    guestName: string;
    guestPhoto?: string;
    propertyId: string;
    propertyTitle: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  popularProperties: {
    id: string;
    title: string;
    location: string;
    image: string;
    rating: number;
    reviewCount: number;
    occupancyRate: number;
  }[];
  earningsOverview: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  upcomingPayouts: {
    id: string;
    amount: number;
    date: string;
    status: "pending" | "processing" | "completed";
  }[];
}

export interface RecentReservation {
  id: string;
  guestName: string;
  guestPhoto?: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  guests?: number;
}
