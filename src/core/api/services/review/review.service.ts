/**
 * Review Service
 * 
 * Comprehensive service for review operations including:
 * - Creating and managing property reviews
 * - Review eligibility verification
 * - Review statistics and analytics
 * - Host responses to reviews
 * 
 * @module @core/api/services/review
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import { REVIEW_ENDPOINTS } from "@core/api/endpoints";
import { logErrorWithContext } from "@core/utils/sys/error";
import type {
  Review,
  CreateReviewData,
  ReviewStats,
} from "@core/types/review.types";

/**
 * Main review service class for all review-related operations
 */
export class ReviewService {
  /**
   * Create a new review for a property
   * 
   * @param data - Review creation data
   * @returns Promise<Review> - Created review
   * @throws Error if review creation fails
   */
  static async createReview(data: CreateReviewData): Promise<Review> {
    try {
      const response = await api.post(
        REVIEW_ENDPOINTS.CREATE(data.propertyId),
        data
      );
      return (response.data as any).data as Review;
    } catch (error: any) {
      logErrorWithContext("ReviewService.createReview", error);
      throw error;
    }
  }
  /**
   * Get all reviews for a property
   * 
   * @param propertyId - Property identifier
   * @returns Promise<Review[]> - Array of property reviews
   * @throws Error if fetching reviews fails
   */
  static async getPropertyReviews(propertyId: string): Promise<Review[]> {
    try {
      const response = await api.get(
        REVIEW_ENDPOINTS.PROPERTY_REVIEWS(propertyId)
      );
      return (response.data as any).data as Review[];
    } catch (error: any) {
      logErrorWithContext("ReviewService.getPropertyReviews", error);
      throw error;
    }
  }

  /**
   * Get review statistics for a property
   * 
   * @param propertyId - Property identifier
   * @returns Promise<ReviewStats> - Review statistics
   * @throws Error if fetching stats fails
   */
  static async getPropertyReviewStats(
    propertyId: string
  ): Promise<ReviewStats> {
    try {
      const response = await api.get(REVIEW_ENDPOINTS.PROPERTY_STATS(propertyId));
      return response.data as ReviewStats;
    } catch (error: any) {
      logErrorWithContext("ReviewService.getPropertyReviewStats", error);
      throw error;
    }
  }
  /**
   * Check if user can review a specific booking
   * 
   * @param bookingId - Booking identifier
   * @returns Promise with review eligibility status
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
    } catch (error: any) {
      logErrorWithContext("ReviewService.checkReviewEligibility", error);
      return {
        canReview: false,
        hasReviewed: false,
        reason: "Unable to check eligibility",
      };
    }
  }

  /**
   * Respond to a review as a host
   * 
   * @param reviewId - Review identifier
   * @param content - Response content
   * @returns Promise<Review> - Updated review with response
   * @throws Error if response fails
   */
  static async respondToReview(
    reviewId: string,
    content: string
  ): Promise<Review> {
    try {
      const response = await api.post(REVIEW_ENDPOINTS.RESPOND(reviewId), {
        content,
      });
      return response.data as Review;
    } catch (error: any) {
      logErrorWithContext("ReviewService.respondToReview", error);
      throw error;
    }
  }

  /**
   * Report an inappropriate review
   * 
   * @param reviewId - Review identifier
   * @param reason - Report reason
   * @param details - Optional additional details
   * @throws Error if report fails
   */
  static async reportReview(
    reviewId: string,
    reason: string,
    details?: string
  ): Promise<void> {
    try {
      await api.post(REVIEW_ENDPOINTS.REPORT(reviewId), {
        reason,
        details,
      });
    } catch (error: any) {
      logErrorWithContext("ReviewService.reportReview", error);
      throw error;
    }
  }
}

// ========================================
// LEGACY FUNCTION EXPORTS
// ========================================

/**
 * Create a new review for a property
 * @deprecated Use ReviewService.createReview instead
 */
export const createReview = ReviewService.createReview;

/**
 * Get all reviews for a property
 * @deprecated Use ReviewService.getPropertyReviews instead
 */
export const getPropertyReviews = ReviewService.getPropertyReviews;

/**
 * Get review statistics for a property
 * @deprecated Use ReviewService.getPropertyReviewStats instead
 */
export const getPropertyReviewStats = ReviewService.getPropertyReviewStats;

/**
 * Check if user can review a specific booking
 * @deprecated Use ReviewService.checkReviewEligibility instead
 */
export const checkReviewEligibility = ReviewService.checkReviewEligibility;

/**
 * Respond to a review as a host
 * @deprecated Use ReviewService.respondToReview instead
 */
export const respondToReview = ReviewService.respondToReview;

/**
 * Report an inappropriate review
 * @deprecated Use ReviewService.reportReview instead
 */
export const reportReview = ReviewService.reportReview;
