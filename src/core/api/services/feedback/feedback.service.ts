/**
 * Feedback Service
 * 
 * Handles all feedback-related API operations including:
 * - Creating feedback (authenticated and anonymous)
 * - Retrieving user feedback
 * - Getting feedback options
 * - Comprehensive error handling
 * - Request queuing and retry logic
 * 
 * @module @core/api/services/feedback
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { api } from "@core/api/client";
import { logErrorWithContext } from "@core/utils/sys/error";
import { logger } from "@core/utils/sys/log";
import type {
  Feedback,
  CreateFeedbackData,
  FeedbackApiResponse,
  FeedbackListResponse,
  FeedbackTypeOption,
  FeedbackCategoryOption,
  FeedbackPriorityOption
} from "@core/types/feedback.types";

// API Endpoints
const FEEDBACK_ENDPOINTS = {
  BASE: "/feedback",
  CREATE: "/feedback",
  USER_FEEDBACK: "/feedback/me",
  FEEDBACK_BY_ID: (id: string) => `/feedback/${id}`,
  OPTIONS: "/feedback/options",
} as const;

// Configuration
const REQUEST_QUEUE_DELAY = 300; // ms between requests
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Request queue to prevent server overload
 */
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          logger.error("Request queue error:", error);
        }
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, REQUEST_QUEUE_DELAY));
      }
    }
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

/**
 * Retry wrapper for API calls
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRY_ATTEMPTS
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof Error && 'response' in error) {
        const response = (error as any).response;
        if (response?.status >= 400 && response?.status < 500) {
          throw error;
        }
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Main feedback service class
 */
export class FeedbackService {
  /**
   * Create new feedback
   * 
   * @param data - Feedback creation data
   * @returns Promise<Feedback> - Created feedback
   * @throws Error if feedback creation fails
   */
  static async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    try {
      logger.log("Creating feedback:", { type: data.type, category: data.category });

      return await requestQueue.add(async () => {
        return await withRetry(async () => {
          const response = await api.post<FeedbackApiResponse>(
            FEEDBACK_ENDPOINTS.CREATE,
            data,
            {
              timeout: DEFAULT_TIMEOUT,
            }
          );

          if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || "Failed to create feedback");
          }

          logger.log("Feedback created successfully:", response.data.data._id);
          return response.data.data;
        });
      });
    } catch (error: any) {
      logErrorWithContext("FeedbackService.createFeedback", error);
      throw new Error(error.response?.data?.message || "Failed to create feedback");
    }
  }

  /**
   * Get current user's feedback
   * 
   * @param filters - Optional filters for feedback
   * @returns Promise<FeedbackListResponse> - User's feedback with pagination
   * @throws Error if retrieval fails
   */
  static async getUserFeedback(filters: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    status?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}): Promise<FeedbackListResponse["data"]> {
    try {
      logger.log("Getting user feedback:", filters);

      return await requestQueue.add(async () => {
        return await withRetry(async () => {
          const params = new URLSearchParams();
          
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, value.toString());
            }
          });

          const response = await api.get<FeedbackListResponse>(
            `${FEEDBACK_ENDPOINTS.USER_FEEDBACK}?${params.toString()}`,
            {
              timeout: DEFAULT_TIMEOUT,
            }
          );

          if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || "Failed to get user feedback");
          }

          logger.log("User feedback retrieved:", response.data.data.feedback.length);
          return response.data.data;
        });
      });
    } catch (error: any) {
      logErrorWithContext("FeedbackService.getUserFeedback", error);
      throw new Error(error.response?.data?.message || "Failed to get user feedback");
    }
  }

  /**
   * Get feedback by ID
   * 
   * @param id - Feedback ID
   * @returns Promise<Feedback> - Feedback details
   * @throws Error if retrieval fails
   */
  static async getFeedbackById(id: string): Promise<Feedback> {
    try {
      logger.log("Getting feedback by ID:", id);

      return await requestQueue.add(async () => {
        return await withRetry(async () => {
          const response = await api.get<FeedbackApiResponse>(
            FEEDBACK_ENDPOINTS.FEEDBACK_BY_ID(id),
            {
              timeout: DEFAULT_TIMEOUT,
            }
          );

          if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || "Feedback not found");
          }

          logger.log("Feedback retrieved:", response.data.data._id);
          return response.data.data;
        });
      });
    } catch (error: any) {
      logErrorWithContext("FeedbackService.getFeedbackById", error);
      throw new Error(error.response?.data?.message || "Failed to get feedback");
    }
  }

  /**
   * Get feedback form options
   * 
   * @returns Promise<FeedbackOptions> - Available feedback types, categories, and priorities
   * @throws Error if retrieval fails
   */
  static async getFeedbackOptions(): Promise<{
    types: FeedbackTypeOption[];
    categories: FeedbackCategoryOption[];
    priorities: FeedbackPriorityOption[];
  }> {
    try {
      logger.log("Getting feedback options");

      return await requestQueue.add(async () => {
        return await withRetry(async () => {
          const response = await api.get<{
            success: boolean;
            data: {
              types: FeedbackTypeOption[];
              categories: FeedbackCategoryOption[];
              priorities: FeedbackPriorityOption[];
            };
          }>(FEEDBACK_ENDPOINTS.OPTIONS, {
            timeout: DEFAULT_TIMEOUT,
          });

          if (!response.data.success || !response.data.data) {
            throw new Error("Failed to get feedback options");
          }

          logger.log("Feedback options retrieved");
          return response.data.data;
        });
      });
    } catch (error: any) {
      logErrorWithContext("FeedbackService.getFeedbackOptions", error);
      throw new Error(error.response?.data?.message || "Failed to get feedback options");
    }
  }

  /**
   * Validate feedback data before submission
   * 
   * @param data - Feedback data to validate
   * @returns Object with validation results
   */
  static validateFeedbackData(data: Partial<CreateFeedbackData>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Required fields
    if (!data.type) {
      errors.type = "Feedback type is required";
    }
    if (!data.category) {
      errors.category = "Feedback category is required";
    }
    if (!data.subject?.trim()) {
      errors.subject = "Subject is required";
    } else if (data.subject.length < 5) {
      errors.subject = "Subject must be at least 5 characters";
    } else if (data.subject.length > 200) {
      errors.subject = "Subject cannot exceed 200 characters";
    }
    if (!data.description?.trim()) {
      errors.description = "Description is required";
    } else if (data.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (data.description.length > 5000) {
      errors.description = "Description cannot exceed 5000 characters";
    }

    // Anonymous feedback validation
    if (data.isAnonymous && !data.email?.trim()) {
      errors.email = "Email is required for anonymous feedback";
    }

    // Optional field length validation
    if (data.steps && data.steps.length > 2000) {
      errors.steps = "Steps cannot exceed 2000 characters";
    }
    if (data.expectedBehavior && data.expectedBehavior.length > 1000) {
      errors.expectedBehavior = "Expected behavior cannot exceed 1000 characters";
    }
    if (data.actualBehavior && data.actualBehavior.length > 1000) {
      errors.actualBehavior = "Actual behavior cannot exceed 1000 characters";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get feedback statistics (for admin users)
   * 
   * @param filters - Optional filters for statistics
   * @returns Promise<FeedbackStats> - Feedback statistics
   * @throws Error if retrieval fails
   */
  static async getFeedbackStats(filters: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string;
  } = {}): Promise<any> {
    try {
      logger.log("Getting feedback statistics:", filters);

      return await requestQueue.add(async () => {
        return await withRetry(async () => {
          const params = new URLSearchParams();
          
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, value.toString());
            }
          });

          const response = await api.get<{
            success: boolean;
            data: any;
          }>(`${FEEDBACK_ENDPOINTS.BASE}/stats?${params.toString()}`, {
            timeout: DEFAULT_TIMEOUT,
          });

          if (!response.data.success || !response.data.data) {
            throw new Error("Failed to get feedback statistics");
          }

          logger.log("Feedback statistics retrieved");
          return response.data.data;
        });
      });
    } catch (error: any) {
      logErrorWithContext("FeedbackService.getFeedbackStats", error);
      throw new Error(error.response?.data?.message || "Failed to get feedback statistics");
    }
  }
}

// Export individual functions for backward compatibility
export const {
  createFeedback,
  getUserFeedback,
  getFeedbackById,
  getFeedbackOptions,
  validateFeedbackData,
  getFeedbackStats
} = FeedbackService;

export default FeedbackService; 