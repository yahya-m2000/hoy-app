/**
 * Calendar component types
 */

export interface CalendarProps {
  blockedDates?: Date[];
  bookingRanges?: { start: Date; end: Date }[];
  onDateSelect?: (startDate: Date, endDate?: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  enableRangeSelection?: boolean;
  propertyId?: string;
}

export interface CalendarDateProps {
  date: Date;
  isSelected: boolean;
  isBlocked: boolean;
  isInRange: boolean;
  isInBookingRange: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  onPress: (date: Date) => void;
  cellWidth: number;
}

export interface CalendarHeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export interface CalendarWeekHeaderProps {
  cellWidth: number;
}
