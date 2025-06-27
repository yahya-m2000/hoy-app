/**
 * Review Types
 * Type definitions for review-related entities
 */

import { User } from "../../../shared/types/user";

// Review rating categories
export interface ReviewRatings {
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
}

// Basic review type
export interface Review {
  id: string;
  propertyId: string;
  reservationId: string;
  guestId: string;
  guest?: User;
  ratings: ReviewRatings;
  overallRating: number;
  comment: string;
  response?: {
    hostId: string;
    comment: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Review summary for property
export interface ReviewSummary {
  propertyId: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  };
}

// Review creation request
export interface ReviewRequest {
  propertyId: string;
  reservationId: string;
  ratings: ReviewRatings;
  comment: string;
} 