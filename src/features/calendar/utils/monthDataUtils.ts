import { generateCleanMonthMatrix } from "./dateUtils";
import { CalendarBookingData } from "@core/types/booking.types";
import { getBookingsForMonth, getBookingsForPropertyMonth } from "./mockData";

export interface MonthViewData {
  month: Date;
  matrix: any[][];
  bookings: CalendarBookingData[];
  key: string;
}

// Global cache for month data to prevent regeneration
const monthDataCache = new Map<string, MonthViewData>();
const monthsArrayCache = { months: null as Date[] | null };
const monthPositionsCache = new Map<string, any[]>();

/**
 * Generate array of months with stable reference (heavily cached)
 * Uses current date as center, expanded range to ensure all navigable months are covered
 */
export const generateStableMonthsArray = (): Date[] => {
  // Return cached months if available
  if (monthsArrayCache.months) {
    return monthsArrayCache.months;
  }

  const now = new Date();
  const baseMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const months = [];
  for (let i = -12; i <= 12; i++) {
    // 25 months total
    const month = new Date(
      baseMonth.getFullYear(),
      baseMonth.getMonth() + i,
      1
    );
    months.push(month);
  }

  // Cache the result
  monthsArrayCache.months = months;
  return months;
};

/**
 * Generate month data with matrix and bookings (heavily cached)
 */
export const generateMonthsData = (
  months: Date[],
  propertyId?: string
): MonthViewData[] => {
  return months.map((month) => {
    const key = `month-${month.getFullYear()}-${month.getMonth()}-${
      propertyId || "all"
    }`;

    // Return cached data if available
    if (monthDataCache.has(key)) {
      return monthDataCache.get(key)!;
    }

    // Generate new data
    const matrix = generateCleanMonthMatrix(month);
    const bookings = propertyId
      ? getBookingsForPropertyMonth(month, propertyId)
      : getBookingsForMonth(month);

    const monthData: MonthViewData = {
      month,
      matrix,
      bookings,
      key,
    };

    // Cache the result
    monthDataCache.set(key, monthData);
    return monthData;
  });
};

/**
 * Calculate month positions for header updates during free scroll (cached)
 */
export const calculateMonthPositions = (
  monthsData: MonthViewData[],
  dayHeight: number,
  monthSpacing: number
) => {
  const cacheKey = `${monthsData.length}_${dayHeight}_${monthSpacing}`;

  // Return cached positions if available
  if (monthPositionsCache.has(cacheKey)) {
    return monthPositionsCache.get(cacheKey)!;
  }

  const monthTitleHeight = 40; // Should match the title height in MemoizedMonth
  let cumulativeHeight = 0;

  const positions = monthsData.map((monthData) => {
    const totalMonthHeight =
      monthData.matrix.length * dayHeight + monthTitleHeight + monthSpacing;

    const position = cumulativeHeight;
    cumulativeHeight += totalMonthHeight;

    return {
      position,
      height: totalMonthHeight,
    };
  });

  // Cache the result
  monthPositionsCache.set(cacheKey, positions);
  return positions;
};

// Optional: Clear cache function for memory management
export const clearMonthDataCache = () => {
  monthDataCache.clear();
  monthsArrayCache.months = null;
  monthPositionsCache.clear();
};
