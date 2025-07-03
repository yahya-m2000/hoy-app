import { useState, useCallback, useMemo } from "react";

/**
 * Optimized hook for managing which month is currently displayed in the header
 * - Uses memoization to prevent unnecessary recalculations
 * - Provides stable callback references
 */
export const useMonthNavigation = (initialMonthIndex: number = 12) => {
  const [currentHeaderMonthIndex, setCurrentHeaderMonthIndex] =
    useState(initialMonthIndex);

  // Memoized setter to prevent recreation on every render
  const updateHeaderMonthIndex = useCallback((index: number) => {
    setCurrentHeaderMonthIndex(index);
  }, []);

  // Memoized navigation state
  const navigationState = useMemo(() => ({
    currentHeaderMonthIndex,
    setCurrentHeaderMonthIndex: updateHeaderMonthIndex,
  }), [currentHeaderMonthIndex, updateHeaderMonthIndex]);

  return navigationState;
};
