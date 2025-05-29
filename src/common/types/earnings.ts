/**
 * Earnings and transaction type definitions
 */

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  type: "payout" | "earning" | "refund" | "fee";
  status: "completed" | "pending" | "failed" | "processing";
  propertyId?: string;
  propertyTitle?: string;
  reservationId?: string;
  description?: string;
  paymentMethod?: string;
}

export interface EarningsData {
  summary: {
    totalEarnings: number;
    pendingPayouts: number;
    completedPayouts: number;
    totalFees: number;
    netEarnings: number;
  };
  chartData: {
    labels: string[];
    earnings: number[];
    occupancyRates: number[];
  };
  transactions: Transaction[];
  payoutMethods: {
    id: string;
    type: "bank" | "paypal" | "venmo" | "other";
    name: string;
    isDefault: boolean;
    lastFour?: string;
    accountHolderName?: string;
  }[];
}
