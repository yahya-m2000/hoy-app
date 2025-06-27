import { useState, useCallback } from "react";
import { RefreshControl, RefreshControlProps } from "react-native";
import { useTheme } from "@shared/hooks/useTheme";

/**
 * Hook to create a configured RefreshControl component with loading state
 * @param onRefresh - Function to call when the user pulls to refresh
 * @returns Object with refreshControl component and refreshing state
 */
export const useRefreshControl = (onRefresh: () => Promise<void>) => {
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  // Create refresh control props instead of JSX component
  const refreshControlProps: RefreshControlProps = {
    refreshing,
    onRefresh: handleRefresh,
    tintColor: theme.colors.primary,
    colors: [theme.colors.primary],
    progressBackgroundColor: theme.colors.white,
  };

  // Return props that can be used to create a RefreshControl component
  return {
    refreshing,
    refreshControl: <RefreshControl {...refreshControlProps} />,
  };
};
