/**
 * Host settings type definitions
 */

export interface HostSettings {
  id: string;
  userId: string;
  displayName: string;
  about: string;
  email: string;
  phone: string;
  languages: string[];
  responseRate: number;
  responseTime: string;
  profilePhoto: string;
  verifications: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    address: boolean;
  };
  paymentSettings: {
    payoutMethod: "bank" | "paypal" | "venmo" | "other";
    accountDetails: {
      type: string;
      accountNumber?: string;
      routingNumber?: string;
      accountHolderName?: string;
      bankName?: string;
      email?: string;
    };
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    newBookings: boolean;
    bookingUpdates: boolean;
    messages: boolean;
    reviews: boolean;
    promotions: boolean;
  };
  preferences: {
    currency: string;
    language: string;
    timezone: string;
    instantBookingEnabled: boolean;
    automaticReviewReminders: boolean;
    automaticMessagingEnabled: boolean;
  };
}
