import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import type { MonthViewData } from "./monthDataUtils";

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
