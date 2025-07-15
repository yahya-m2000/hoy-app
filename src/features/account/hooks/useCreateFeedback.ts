/**
 * useCreateFeedback Hook
 * 
 * React Query hook for creating feedback with proper state management,
 * error handling, and loading states.
 * 
 * @module @features/account/hooks/useCreateFeedback
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FeedbackService } from "@core/api/services/feedback";
import type { 
  CreateFeedbackData, 
  Feedback,
  UseCreateFeedbackReturn 
} from "@core/types/feedback.types";
import { logger } from "@core/utils/sys/log";

/**
 * Hook for creating feedback
 * 
 * @returns UseCreateFeedbackReturn - Mutation state and functions
 */
export const useCreateFeedback = (): UseCreateFeedbackReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateFeedbackData): Promise<Feedback> => {
      logger.log("Creating feedback with data:", { 
        type: data.type, 
        category: data.category,
        isAnonymous: data.isAnonymous 
      });
      return FeedbackService.createFeedback(data);
    },
    onSuccess: (data: Feedback) => {
      logger.log("Feedback created successfully:", data._id);
      
      // Invalidate user feedback queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['feedback', 'user']
      });
      
      // Optionally add the new feedback to the cache
      queryClient.setQueryData(['feedback', data._id], data);
    },
    onError: (error: Error) => {
      logger.error("Failed to create feedback:", error);
    }
  });

  return {
    createFeedback: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
};

export default useCreateFeedback; 