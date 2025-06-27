/**
 * Review Service
 * Handles property reviews and ratings API calls
 */

import api from "../core/client";
import { REVIEW_ENDPOINTS } from "@shared/constants";
import type {
  Review,
  CreateReviewData,
  ReviewStats,
} from "@shared/types/review";

export class ReviewService {
  /**
   * Create a new review for a property
   */
  static async createReview(data: CreateReviewData): Promise<Review> {
    const response = await api.post(
      REVIEW_ENDPOINTS.CREATE(data.propertyId),
      data
    );
    return (response.data as any).data as Review;
  }
  /**
   * Get all reviews for a property
   */
  static async getPropertyReviews(propertyId: string): Promise<Review[]> {
    const response = await api.get(
      REVIEW_ENDPOINTS.PROPERTY_REVIEWS(propertyId)
    );
    return (response.data as any).data as Review[];
  }

  /**
   * Get review statistics for a property
   */
  static async getPropertyReviewStats(
    propertyId: string
  ): Promise<ReviewStats> {
    const response = await api.get(REVIEW_ENDPOINTS.PROPERTY_STATS(propertyId));
    return response.data as ReviewStats;
  }
  /**
   * Check if user can review a specific booking
   */
  static async checkReviewEligibility(bookingId: string): Promise<{
    canReview: boolean;
    hasReviewed: boolean;
    reason?: string;
  }> {
    try {
      const response = await api.get(REVIEW_ENDPOINTS.ELIGIBILITY(bookingId));
      return (response.data as any).data as {
        canReview: boolean;
        hasReviewed: boolean;
        reason?: string;
      };
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      return {
        canReview: false,
        hasReviewed: false,
        reason: "Unable to check eligibility",
      };
    }
  }

  /**
   * Respond to a review as a host
   */
  static async respondToReview(
    reviewId: string,
    content: string
  ): Promise<Review> {
    const response = await api.post(REVIEW_ENDPOINTS.RESPOND(reviewId), {
      content,
    });
    return response.data as Review;
  }

  /**
   * Report an inappropriate review
   */
  static async reportReview(
    reviewId: string,
    reason: string,
    details?: string
  ): Promise<void> {
    await api.post(REVIEW_ENDPOINTS.REPORT(reviewId), {
      reason,
      details,
    });
  }
}
