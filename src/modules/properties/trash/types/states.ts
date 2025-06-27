/**
 * State component types for Properties module
 * Contains types for property state-related components (loading, error, empty states)
 */

/**
 * Props for LoadingState component
 */
export interface LoadingStateProps {
  message?: string;
}

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}
