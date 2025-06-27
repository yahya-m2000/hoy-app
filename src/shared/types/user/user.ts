/**
 * User type definitions for the Hoy application
 */
export interface User {
  id: string;
  _id?: string; // Legacy field for compatibility
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "host" | "admin";
  joinedDate: string;
  avatarUrl?: string;
  profileImage?: string;
  profilePicture?: string;
  phoneNumber?: string;
}

export interface ExtendedUser {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "host" | "admin";
  joinedDate: string;
  avatarUrl?: string;
  profileImage?: string;
  createdAt?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  phone?: string;
  hostType?: "individual" | "organization";
  isSuperHost?: boolean;
  responseRate?: string;
  responseTime?: string;
  propertyCount?: number;
  averageRating?: number;
  reviewCount?: number;
  totalRatingScore?: number; // Sum of all ratings across all properties
  totalReviewCount?: number; // Total number of reviews across all properties
}
