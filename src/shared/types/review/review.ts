/**
 * Review Types
 * Types for property reviews and ratings system
 */

export interface ReviewRating {
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
}

export interface ReviewResponse {
  content: string;
  date: string;
}

export interface Review {
  _id: string;
  property: string;
  booking: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  host: string;
  overallRating: number;
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
  content: string;
  response?: ReviewResponse;
  photos?: string[];
  isVerifiedStay: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  bookingId: string;
  propertyId: string;
  overallRating: number;
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
  content: string;
  photos?: string[];
  isAnonymous?: boolean;
}

export interface ReviewStats {
  count: number;
  averageRating: number;
  criteriaAverages: ReviewRating;
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewEligibility {
  canReview: boolean;
  hasReviewed: boolean;
  reason?: string;
}
