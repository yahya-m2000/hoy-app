/**
 * Feedback Services
 * 
 * Centralized exports for all feedback-related services.
 * 
 * Service Classes:
 * - FeedbackService - Main feedback operations
 * 
 * @module @core/api/services/feedback
 * @author Hoy Development Team
 * @version 1.0.0
 */

// Export service class and all its functions
export { FeedbackService } from './feedback.service';

// Export individual functions for backward compatibility
export {
  createFeedback,
  getUserFeedback,
  getFeedbackById,
  getFeedbackOptions,
  validateFeedbackData,
  getFeedbackStats
} from './feedback.service';

// Default export
export { default } from './feedback.service'; 