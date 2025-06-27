import { useRef, useCallback } from "react";
import { ScrollView } from "react-native";

/**
 * Hook for managing scroll behavior (free scroll version)
 */
export const useScrollBehavior = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollY = useRef<number>(0);
  const scrollDirection = useRef<"up" | "down" | null>(null);
  const isScrolling = useRef<boolean>(false);
  const pendingFocusUpdate = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll begin
  const handleScrollBegin = useCallback(() => {
    isScrolling.current = true;
    // Clear any pending focus updates when scrolling begins
    if (pendingFocusUpdate.current) {
      clearTimeout(pendingFocusUpdate.current);
      pendingFocusUpdate.current = null;
    }
  }, []);

  // Cleanup pending timeouts
  const cleanupTimeouts = useCallback(() => {
    if (pendingFocusUpdate.current) {
      clearTimeout(pendingFocusUpdate.current);
      pendingFocusUpdate.current = null;
    }
  }, []);

  return {
    scrollViewRef,
    lastScrollY,
    scrollDirection,
    isScrolling,
    pendingFocusUpdate,
    handleScrollBegin,
    cleanupTimeouts,
  };
};
