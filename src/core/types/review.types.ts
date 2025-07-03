/**
 * Review Types
 * 
 * Comprehensive type definitions for review and rating system including:
 * - Property reviews and ratings
 * - Review criteria and scoring
 * - Review statistics and analytics
 * - Review eligibility and permissions
 * 
 * @module @core/types/review
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { BaseEntity, EntityId } from './common.types';
import type { User } from './user.types';

// ========================================
// RATING TYPES
// ========================================

/**
 * Review rating criteria with individual scores
 */
export interface ReviewRating {
  /** Cleanliness rating (1-5) */
  cleanliness: number;
  /** Host communication rating (1-5) */
  communication: number;
  /** Check-in experience rating (1-5) */
  checkIn: number;
  /** Property accuracy rating (1-5) */
  accuracy: number;
  /** Location rating (1-5) */
  location: number;
  /** Value for money rating (1-5) */
  value: number;
}

/**
 * Overall rating scale type
 */
export type RatingScale = 1 | 2 | 3 | 4 | 5;

/**
 * Rating distribution for analytics
 */
export interface RatingDistribution {
  /** Number of 5-star ratings */
  5: number;
  /** Number of 4-star ratings */
  4: number;
  /** Number of 3-star ratings */
  3: number;
  /** Number of 2-star ratings */
  2: number;
  /** Number of 1-star ratings */
  1: number;
}

// ========================================
// REVIEW TYPES
// ========================================

/**
 * Review author information
 */
export interface ReviewAuthor {
  /** Author user ID */
  _id: string;
  /** Author's first name */
  firstName: string;
  /** Author's last name */
  lastName: string;
  /** Author's avatar URL */
  avatar?: string;
  /** Whether author is verified */
  isVerified?: boolean;
  /** Author's join date */
  joinedDate?: string;
}

/**
 * Host response to a review
 */
export interface ReviewResponse {
  /** Response content */
  content: string;
  /** Response date */
  date: string;
  /** Whether response is from host */
  isFromHost?: boolean;
  /** Response timestamp */
  timestamp?: string;
}

/**
 * Complete review interface
 */
export interface Review extends BaseEntity {
  /** Legacy MongoDB ID */
  _id: string;
  /** Associated property ID */
  property: string;
  /** Associated booking ID */
  booking: string;
  /** Review author information */
  author: ReviewAuthor;
  /** Host user ID */
  host: string;
  /** Overall rating (1-5) */
  overallRating: number;
  /** Individual rating criteria */
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
  /** Review text content */
  content: string;
  /** Host response to review */
  response?: ReviewResponse;
  /** Review photos */
  photos?: string[];
  /** Whether this is from a verified stay */
  isVerifiedStay: boolean;
  /** Whether review is publicly visible */
  isPublic: boolean;
  /** Review language */
  language?: string;
  /** Whether review is flagged */
  isFlagged?: boolean;
  /** Flag reason */
  flagReason?: string;
  /** Review helpful votes */
  helpfulVotes?: number;
  /** Whether review is featured */
  isFeatured?: boolean;
}

// ========================================
// REVIEW CREATION TYPES
// ========================================

/**
 * Data required to create a new review
 */
export interface CreateReviewData {
  /** Booking ID being reviewed */
  bookingId: string;
  /** Property ID being reviewed */
  propertyId: string;
  /** Overall rating (1-5) */
  overallRating: number;
  /** Cleanliness rating (1-5) */
  cleanliness: number;
  /** Communication rating (1-5) */
  communication: number;
  /** Check-in rating (1-5) */
  checkIn: number;
  /** Accuracy rating (1-5) */
  accuracy: number;
  /** Location rating (1-5) */
  location: number;
  /** Value rating (1-5) */
  value: number;
  /** Review text content */
  content: string;
  /** Optional review photos */
  photos?: string[];
  /** Whether to post anonymously */
  isAnonymous?: boolean;
  /** Review language */
  language?: string;
}

/**
 * Review update data for editing existing reviews
 */
export interface UpdateReviewData extends Partial<CreateReviewData> {
  /** Review ID to update */
  reviewId: string;
  /** Reason for update */
  updateReason?: string;
}

/**
 * Host response data
 */
export interface CreateReviewResponseData {
  /** Review ID to respond to */
  reviewId: string;
  /** Response content */
  content: string;
  /** Response language */
  language?: string;
}

// ========================================
// REVIEW STATISTICS TYPES
// ========================================

/**
 * Review statistics for a property or host
 */
export interface ReviewStats {
  /** Total number of reviews */
  count: number;
  /** Average overall rating */
  averageRating: number;
  /** Average ratings by criteria */
  criteriaAverages: ReviewRating;
  /** Rating distribution */
  distribution?: RatingDistribution;
  /** Recent reviews trend */
  recentTrend?: 'improving' | 'declining' | 'stable';
  /** Percentage of 5-star reviews */
  fiveStarPercentage?: number;
  /** Response rate from host */
  responseRate?: number;
  /** Average response time in days */
  averageResponseTime?: number;
}

/**
 * Detailed review analytics
 */
export interface ReviewAnalytics extends ReviewStats {
  /** Reviews by month */
  monthlyBreakdown: Array<{
    month: string;
    count: number;
    averageRating: number;
  }>;
  /** Most common keywords in reviews */
  commonKeywords: Array<{
    word: string;
    frequency: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  /** Guest satisfaction score */
  satisfactionScore: number;
  /** Improvement suggestions */
  suggestions: string[];
}

// ========================================
// REVIEW ELIGIBILITY TYPES
// ========================================

/**
 * Review eligibility check result
 */
export interface ReviewEligibility {
  /** Whether user can leave a review */
  canReview: boolean;
  /** Whether user has already reviewed */
  hasReviewed: boolean;
  /** Reason if cannot review */
  reason?: string;
  /** Days remaining to leave review */
  daysRemaining?: number;
  /** Booking status affecting eligibility */
  bookingStatus?: string;
}

/**
 * Review permissions for different user roles
 */
export interface ReviewPermissions {
  /** Can create reviews */
  canCreate: boolean;
  /** Can edit own reviews */
  canEdit: boolean;
  /** Can delete own reviews */
  canDelete: boolean;
  /** Can respond to reviews (hosts) */
  canRespond: boolean;
  /** Can flag inappropriate reviews */
  canFlag: boolean;
  /** Can moderate reviews (admins) */
  canModerate: boolean;
}

// ========================================
// REVIEW SEARCH & FILTER TYPES
// ========================================

/**
 * Review search and filter parameters
 */
export interface ReviewSearchParams {
  /** Property ID to filter by */
  propertyId?: string;
  /** Host ID to filter by */
  hostId?: string;
  /** Minimum rating filter */
  minRating?: number;
  /** Maximum rating filter */
  maxRating?: number;
  /** Date range filter */
  dateFrom?: string;
  dateTo?: string;
  /** Search query in review content */
  query?: string;
  /** Filter by verified stays only */
  verifiedOnly?: boolean;
  /** Filter by reviews with photos */
  withPhotos?: boolean;
  /** Sort order */
  sortBy?: 'date' | 'rating' | 'helpful';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Language filter */
  language?: string;
}

/**
 * Review list item for search results
 */
export interface ReviewListItem {
  /** Review ID */
  id: EntityId;
  /** Property ID */
  propertyId: EntityId;
  /** Guest/author information */
  author: ReviewAuthor;
  /** Overall rating */
  rating: number;
  /** Review comment/text */
  comment: string;
  /** Creation date */
  createdAt: string;
  /** Optional response from host */
  response?: ReviewResponse;
  /** Helpful count */
  helpfulCount?: number;
  /** Whether current user found it helpful */
  isHelpful?: boolean;
}

// ========================================
// SIMPLE REVIEW TYPES (from features/properties)
// ========================================

/**
 * Review rating categories - simplified version
 */
export interface ReviewRatings {
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
}

/**
 * Basic review type - simplified for property components
 */
export interface SimpleReview {
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

/**
 * Review summary for property
 */
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

/**
 * Review creation request
 */
export interface ReviewRequest {
  propertyId: string;
  reservationId: string;
  ratings: ReviewRatings;
  comment: string;
}
