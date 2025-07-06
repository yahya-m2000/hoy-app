/**
 * Calendar Scroll Handlers
 * 
 * Utilities for handling scroll behavior in calendar components
 * 
 * @module @features/calendar/utils/scrollHandlers
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import type { MonthViewData } from "./calendarUtils";

export interface ScrollHandlerParams {
  lastScrollY: React.MutableRefObject<number>;
  scrollDirection: React.MutableRefObject<"up" | "down" | null>;
}

export interface ScrollEndHandlerParams {
  isScrolling: React.MutableRefObject<boolean>;
  pendingFocusUpdate: React.MutableRefObject<NodeJS.Timeout | null>;
  currentHeaderMonthIndex: number;
  monthPositions: { position: number; height: number }[];
  monthsData: MonthViewData[];
  setCurrentHeaderMonthIndex: (index: number) => void;
  onCurrentMonthChange?: (month: Date) => void;
}

/**
 * Handle scroll events - pure free scroll, no focus changes
 */
export const createScrollHandler = (params: ScrollHandlerParams) => {
  return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { lastScrollY, scrollDirection } = params;

    const offsetY = event.nativeEvent.contentOffset.y;

    // Only track scroll direction, no focus changes
    const direction = offsetY > lastScrollY.current ? "down" : "up";
    scrollDirection.current = direction;
    lastScrollY.current = offsetY;
  };
};

/**
 * Handle scroll end events - only update header after scrolling completely stops
 */
export const createScrollEndHandler = (params: ScrollEndHandlerParams) => {
  return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {
      isScrolling,
      pendingFocusUpdate,
      currentHeaderMonthIndex,
      monthPositions,
      monthsData,
      setCurrentHeaderMonthIndex,
      onCurrentMonthChange,
    } = params;

    isScrolling.current = false; // Mark scrolling as ended

    // Clear any pending header updates
    if (pendingFocusUpdate.current) {
      clearTimeout(pendingFocusUpdate.current);
      pendingFocusUpdate.current = null;
    }

    const offsetY = event.nativeEvent.contentOffset.y;

    // Find the closest month position for header updates only
    let targetIndex = currentHeaderMonthIndex;
    let closestDistance = Infinity;

    // Check all months to find the truly closest one
    for (let i = 0; i < monthPositions.length; i++) {
      const distance = Math.abs(offsetY - monthPositions[i].position);
      if (distance < closestDistance) {
        closestDistance = distance;
        targetIndex = i;
      }
    }

    // Only update header title, no visual changes to calendar
    if (targetIndex !== currentHeaderMonthIndex) {
      setCurrentHeaderMonthIndex(targetIndex);
      const newHeaderMonth = monthsData[targetIndex]?.month;
      if (newHeaderMonth && onCurrentMonthChange) {
        onCurrentMonthChange(newHeaderMonth);
      }
    }
  };
};

/**
 * Simple scroll handler for basic scroll tracking
 */
export const createSimpleScrollHandler = (
  onScroll?: (offsetY: number) => void
) => {
  return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    onScroll?.(offsetY);
  };
};

/**
 * Debounced scroll handler for performance optimization
 */
export const createDebouncedScrollHandler = (
  onScroll: (offsetY: number) => void,
  delay: number = 16 // ~60fps
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      onScroll(offsetY);
    }, delay);
  };
};
