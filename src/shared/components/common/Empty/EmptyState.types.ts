/**
 * EmptyState component types
 */

export interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  minimized?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}
