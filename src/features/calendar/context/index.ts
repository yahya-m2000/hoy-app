/**
 * Calendar Context Exports
 * 
 * Unified calendar state management with all functionality consolidated
 * into a single CalendarStateContext.
 */

// Main consolidated context
export {
  CalendarProvider,
  useCalendarState,
  useSelectedProperty,
  useViewMode,
  useCurrentMonth,
  useSelectedDates,
  useCalendarUI,
  useCalendarBookings,
  useCalendarAvailability,
  useCalendarDateSelection,
} from './CalendarContext';

// Types
export type {
  Property,
  DateRange,
  PropertyDates,
  CalendarState,
  CalendarContextType,
} from './CalendarContext';
