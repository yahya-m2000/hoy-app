/**
 * Review Services
 * 
 * Centralized exports for all review-related services.
 * 
 * Service Classes:
 * - ReviewService - Review creation, management, and reporting
 * 
 * @module @core/api/services/review
 * @author Hoy Development Team
 * @version 1.0.0
 */

// Export service class
export { ReviewService } from './review.service';

// Re-export types from core types for convenience
export type {
  Review,
  CreateReviewData,
  ReviewStats,
} from '@core/types/review.types';

// Export legacy functions for backward compatibility
export {
  createReview,
  getPropertyReviews,
  getPropertyReviewStats,
  checkReviewEligibility,
  respondToReview,
  reportReview,
} from './review.service'; 