/**
 * useUserFeedback Hook
 * 
 * React Query hook for fetching user feedback with pagination,
 * filtering, and infinite scroll support.
 * 
 * @module @features/account/hooks/useUserFeedback
 */

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { FeedbackService } from "@core/api/services/feedback";
import type { 
  Feedback,
  FeedbackListResponse,
  UseUserFeedbackReturn 
} from "@core/types/feedback.types";
import { logger } from "@core/utils/sys/log";

interface UseUserFeedbackOptions {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  enabled?: boolean;
}

/**
 * Hook for fetching user feedback with pagination
 * 
 * @param options - Query options and filters
 * @returns UseUserFeedbackReturn - Query state and functions
 */
export const useUserFeedback = (options: UseUserFeedbackOptions = {}): UseUserFeedbackReturn => {
  const {
    page = 1,
    limit = 10,
    type,
    category,
    status,
    priority,
    sortBy = "createdAt",
    sortOrder = "desc",
    enabled = true
  } = options;

  const query = useQuery({
    queryKey: [
      'feedback',
      'user',
      {
        page,
        limit,
        type,
        category,
        status,
        priority,
        sortBy,
        sortOrder
      }
    ],
    queryFn: () => {
      logger.log("Fetching user feedback:", { page, limit, type, category });
      return FeedbackService.getUserFeedback({
        page,
        limit,
        type,
        category,
        status,
        priority,
        sortBy,
        sortOrder
      });
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const refetch = async () => {
    await query.refetch();
  };

  return {
    feedback: query.data?.feedback || [],
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch,
    hasMore: query.data ? query.data.page < query.data.totalPages : false,
    loadMore: async () => {
      // This would be used with infinite query implementation
      // For now, just refetch
      await refetch();
    }
  };
};

/**
 * Hook for infinite scroll user feedback
 * 
 * @param options - Query options and filters
 * @returns Infinite query result
 */
export const useUserFeedbackInfinite = (options: Omit<UseUserFeedbackOptions, 'page'> = {}) => {
  const {
    limit = 10,
    type,
    category,
    status,
    priority,
    sortBy = "createdAt",
    sortOrder = "desc",
    enabled = true
  } = options;

  return useInfiniteQuery({
    queryKey: [
      'feedback',
      'user',
      'infinite',
      {
        limit,
        type,
        category,
        status,
        priority,
        sortBy,
        sortOrder
      }
    ],
    queryFn: ({ pageParam = 1 }) => {
      logger.log("Fetching user feedback (infinite):", { page: pageParam, limit });
      return FeedbackService.getUserFeedback({
        page: pageParam,
        limit,
        type,
        category,
        status,
        priority,
        sortBy,
        sortOrder
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.page >= lastPage.totalPages) {
        return undefined;
      }
      return lastPage.page + 1;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    initialPageParam: 1,
  });
};

export default useUserFeedback; 