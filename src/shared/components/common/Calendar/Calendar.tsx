import React, { useState, useEffect, useMemo, useRef } from "react";
import { Dimensions, TouchableOpacity, View, StyleSheet } from "react-native";
import { Container, Icon, Text } from "@shared/components/base";
import { CalendarProps } from "./Calendar.types";
import { useCalendar } from "../../../context/CalendarContext";
import { useTheme } from "../../../hooks/useTheme";
import { useToast } from "../../../context/ToastContext";
import { iconSize, spacing, radius } from "src/shared";

const { width: screenWidth } = Dimensions.get("window");

const Calendar: React.FC<CalendarProps> = ({
  blockedDates = [],
  bookingRanges = [],
  onDateSelect,
  initialStartDate,
  initialEndDate,
  minDate,
  maxDate,
  enableRangeSelection = false,
  propertyId,
}) => {
  const { state, actions } = useCalendar();
  const { theme, isDark } = useTheme();
  const { showToast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const previousPropertyIdRef = useRef<string | undefined>(undefined);
  const [forceUpdateKey, setForceUpdateKey] = useState(Date.now());

  // Add state for internal warning message
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to show warning within the calendar
  const showWarning = (message: string, duration = 5000) => {
    setWarningMessage(message);

    // Clear any existing timer
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Auto-hide after duration
    warningTimerRef.current = setTimeout(() => {
      setWarningMessage(null);
    }, duration);

    // Also try to show toast if outside modal
    try {
      showToast({
        type: "warning",
        message,
      });
    } catch (error) {
      console.error("Error showing toast:", error);
    }
  };

  // Update current property when propertyId prop changes
  useEffect(() => {
    if (propertyId !== previousPropertyIdRef.current) {
      actions.setCurrentProperty(propertyId || null);
      previousPropertyIdRef.current = propertyId;
    }
  }, [propertyId, actions]);

  // Force refresh booked dates on every mount when propertyId is available
  useEffect(() => {
    if (propertyId) {
      // Force refresh the booked dates for this property
      actions.refreshBookedDates(propertyId);

      // Also invalidate any cached availability data
      actions.invalidateCache(propertyId);
    }
  }, [propertyId, actions]);

  // Cell width calculation for responsive design
  const cellWidth = useMemo(() => {
    const padding = 32; // Total horizontal padding
    return (screenWidth - padding) / 7;
  }, []);

  // Cleanup warning timers on unmount
  useEffect(() => {
    return () => {
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, []);

  // Merge external and context-based data
  const allBlockedDates = useMemo(() => {
    const contextBlocked = state.blockDates || [];
    // Only include actual blocked dates, NOT booked dates
    const dates = [...blockedDates, ...contextBlocked];
    return dates.filter(
      (date, index, arr) =>
        arr.findIndex((d) => d.getTime() === date.getTime()) === index
    );
  }, [blockedDates, state.blockDates]);

  // Separate booked dates for display purposes
  const allBookedDates = useMemo(() => {
    return state.bookedDates.map((dateStr) => new Date(dateStr));
  }, [state.bookedDates]);

  const allBookingRanges = useMemo(() => {
    return [...bookingRanges];
  }, [bookingRanges]);

  // Initialize selected dates from props
  useEffect(() => {
    if (initialStartDate || initialEndDate) {
      actions.setSelectedDates(
        initialStartDate || null,
        initialEndDate || null
      );
    }
  }, [initialStartDate, initialEndDate, actions]);

  // Generate calendar days for the current month (Monday start)
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Calculate starting day of calendar (Monday = 1, Sunday = 0)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to 6, others to dayOfWeek - 1
    startDate.setDate(firstDay.getDate() - mondayOffset);

    const days: Date[] = [];
    const current = new Date(startDate);

    // Only generate days that are in the current month
    while (current <= lastDay) {
      if (current >= firstDay) {
        days.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const handleDatePress = async (date: Date) => {
    // Always allow current day selection regardless of other constraints
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const isCurrentDay = selectedDate.getTime() === today.getTime();

    // Check if date is blocked or booked (but allow current day even if blocked/booked)
    if ((isDateBlocked(date) || isDateBooked(date)) && !isCurrentDay) {
      // Show warning message instead of silently ignoring
      const isBooked = isDateBooked(date);
      const warningMessage = isBooked
        ? "This date is already booked. Please select an available date."
        : "This date is blocked by the host. Please select an available date.";

      showWarning(warningMessage);

      return;
    }

    // Check min/max date constraints (but allow current day)
    if (minDate && date < minDate && !isCurrentDay) {
      showWarning(
        "This date is outside the allowed booking period. Please select a date within the allowed range."
      );
      return;
    }

    if (maxDate && date > maxDate && !isCurrentDay) {
      showWarning(
        "This date is too far in the future. Please select a date within the allowed booking period."
      );
      return;
    }

    // Don't allow selection of past dates (but explicitly allow current day)
    if (isPastDate(date) && !isCurrentDay) {
      showWarning(
        "You cannot select dates in the past. Please select a current or future date."
      );
      return;
    }

    if (enableRangeSelection) {
      const { start, end } = state.selectedDates;

      if (!start || (start && end)) {
        // Start new selection
        actions.setSelectedDates(date, null);
      } else if (start && !end) {
        // Complete the range
        if (date >= start) {
          // Check for overlaps in the selected range
          const { hasOverlap, overlappedDates } = hasDateRangeOverlap(
            start,
            date
          );

          if (hasOverlap) {
            const bookedCount = overlappedDates.filter((d) =>
              isDateBooked(d)
            ).length;
            const blockedCount = overlappedDates.filter((d) =>
              isDateBlocked(d)
            ).length;

            let message = "";
            if (bookedCount > 0 && blockedCount > 0) {
              message = `Your selection includes dates that are unavailable (${bookedCount} booked, ${blockedCount} blocked). Please select a different range.`;
            } else if (bookedCount > 0) {
              message = `Your selection includes ${bookedCount} already booked ${
                bookedCount === 1 ? "date" : "dates"
              }. Please select a different range.`;
            } else {
              message = `Your selection includes ${blockedCount} blocked ${
                blockedCount === 1 ? "date" : "dates"
              }. Please select a different range.`;
            }

            showWarning(message, 5000); // Extend duration for this more important message

            // Reset selection to start over
            actions.setSelectedDates(null, null);
            return;
          }

          actions.setSelectedDates(start, date);
          // Trigger callback immediately when range is complete
          if (onDateSelect) {
            onDateSelect(start, date);
          }
          return; // Exit early to avoid duplicate callback
        } else {
          // If selected date is before start, make it the new start
          actions.setSelectedDates(date, null);
        }
      }
    } else {
      actions.setSelectedDates(date, null);
      // Trigger callback immediately for single selection
      if (onDateSelect) {
        onDateSelect(date, undefined);
      }
      return; // Exit early to avoid duplicate callback
    }
  };

  const isDateBlocked = (date: Date): boolean => {
    return allBlockedDates.some(
      (blockedDate) => date.toDateString() === blockedDate.toDateString()
    );
  };

  const isDateBooked = (date: Date): boolean => {
    return allBookedDates.some(
      (bookedDate) => date.toDateString() === bookedDate.toDateString()
    );
  };

  // Check if a date range overlaps with any booked or blocked dates
  const hasDateRangeOverlap = (
    startDate: Date,
    endDate: Date
  ): { hasOverlap: boolean; overlappedDates: Date[] } => {
    const overlappedDates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      if (isDateBlocked(current) || isDateBooked(current)) {
        overlappedDates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return {
      hasOverlap: overlappedDates.length > 0,
      overlappedDates,
    };
  };

  const isDateSelected = (date: Date): boolean => {
    const { start, end } = state.selectedDates;
    if (!start) return false;

    if (!enableRangeSelection) {
      return date.toDateString() === start.toDateString();
    }

    if (!end) {
      return date.toDateString() === start.toDateString();
    }

    return date >= start && date <= end;
  };

  const isDateInRange = (date: Date): boolean => {
    const { start, end } = state.selectedDates;
    if (!enableRangeSelection || !start || !end) {
      return false;
    }
    return date > start && date < end;
  };

  const isDateInBookingRange = (date: Date): boolean => {
    return allBookingRanges.some(
      (range) => date >= range.start && date <= range.end
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today; // Only block dates before today, allow current day
  };

  // Refresh data once when component mounts or propertyId changes
  useEffect(() => {
    if (propertyId) {
      // Update once on mount or when propertyId changes
      setForceUpdateKey(Date.now());
    }
  }, [propertyId]);

  return (
    <Container
      backgroundColor={theme.background}
      key={`calendar-container-${forceUpdateKey}`}
    >
      {/* Warning Message */}
      {warningMessage && (
        <Container
          style={internalStyles.warningContainer}
          backgroundColor={
            isDark ? "rgba(255, 180, 0, 0.1)" : "rgba(255, 180, 0, 0.1)"
          }
          padding="md"
          marginHorizontal="md"
          marginBottom="md"
          borderRadius="md"
          borderWidth={1}
          borderColor={theme.colors.warning}
        >
          <Container flexDirection="row" alignItems="center">
            <Icon
              name="warning"
              size={20}
              color={theme.colors.warning}
              style={{ marginRight: 8 }}
            />
            <Text
              variant="body"
              color={isDark ? theme.colors.warning : theme.colors.warning}
              style={{ flex: 1 }}
            >
              {warningMessage}
            </Text>
            <TouchableOpacity
              onPress={() => setWarningMessage(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={18} color={theme.colors.warning} />
            </TouchableOpacity>
          </Container>
        </Container>
      )}

      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={() => navigateMonth("prev")}
        onNextMonth={() => navigateMonth("next")}
        theme={theme}
        isDark={isDark}
      />

      <CalendarWeekHeader cellWidth={cellWidth} theme={theme} />

      <Container marginBottom="md">
        <Container flexDirection="row" flexWrap="wrap" justifyContent="center">
          {calendarDays.map((date, index) => (
            <CalendarDate
              key={index}
              date={date}
              isSelected={isDateSelected(date)}
              isBlocked={isDateBlocked(date)}
              isBooked={isDateBooked(date)}
              isInRange={isDateInRange(date)}
              isInBookingRange={isDateInBookingRange(date)}
              isToday={isToday(date)}
              isCurrentMonth={isCurrentMonth(date)}
              isPastDate={isPastDate(date)}
              onPress={handleDatePress}
              cellWidth={cellWidth}
              theme={theme}
              isDark={isDark}
            />
          ))}
        </Container>
      </Container>

      {/* Calendar Legend - positioned below calendar */}
      <CalendarLegend theme={theme} isDark={isDark} />
    </Container>
  );
};

// Simple CalendarLegend component
const CalendarLegend: React.FC<{ theme: any; isDark: boolean }> = ({
  theme,
  isDark,
}) => {
  const legendItems = [
    {
      color: "transparent",
      borderColor: theme.colors.gray[300],
      label: "Available",
      showBorder: true,
    },
    {
      color: theme.colors.tertiary,
      label: "Booked",
      showBorder: false,
    },
    {
      color: theme.colors.gray[400],
      label: "Blocked",
      showBorder: false,
    },
    {
      color: theme.colors.primary,
      borderColor: theme.colors.primary,
      label: "Selected",
      showBorder: true,
    },
  ];

  return (
    <Container
      flexDirection="row"
      justifyContent="space-around"
      alignItems="center"
      paddingVertical="sm"
    >
      {legendItems.map((item, index) => (
        <Container
          key={index}
          flexDirection="row"
          alignItems="center"
          flex={1}
          justifyContent="center"
        >
          <Container
            width={12}
            height={12}
            borderRadius="sm"
            marginRight="xxs"
            backgroundColor={item.color}
            borderWidth={item.showBorder ? 1 : 0}
            borderColor={item.borderColor || "transparent"}
          >
            {""}
          </Container>
          <Text variant="caption" color={theme.text.secondary} size="xs">
            {item.label}
          </Text>
        </Container>
      ))}
    </Container>
  );
};

// Simple CalendarHeader component
const CalendarHeader: React.FC<{
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  theme: any;
  isDark: boolean;
}> = ({ currentMonth, onPreviousMonth, onNextMonth, theme, isDark }) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <Container
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      marginBottom="md"
      paddingHorizontal="sm"
    >
      <TouchableOpacity
        onPress={onPreviousMonth}
        style={{ padding: spacing.md }}
      >
        <Icon
          name="arrow-back-outline"
          color={theme.colors.primary}
          size={iconSize.sm}
        />
      </TouchableOpacity>

      <Text color={theme.text.primary} size="lg" weight="medium">
        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
      </Text>

      <TouchableOpacity onPress={onNextMonth} style={{ padding: spacing.md }}>
        <Icon
          name="arrow-forward-outline"
          color={theme.colors.primary}
          size={iconSize.sm}
        />
      </TouchableOpacity>
    </Container>
  );
};

// Simple CalendarWeekHeader component
const CalendarWeekHeader: React.FC<{ cellWidth: number; theme: any }> = ({
  cellWidth,
  theme,
}) => {
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <Container
      flexDirection="row"
      paddingBottom="sm"
      marginBottom="sm"
      justifyContent="center"
    >
      {weekDays.map((day, index) => (
        <Container key={index} width={cellWidth} alignItems="center">
          <Text color={theme.text.secondary} size="sm" weight="medium">
            {day}
          </Text>
        </Container>
      ))}
    </Container>
  );
};

// Simple CalendarDate component
const CalendarDate: React.FC<{
  date: Date;
  isSelected: boolean;
  isBlocked: boolean;
  isBooked: boolean;
  isInRange: boolean;
  isInBookingRange: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  isPastDate: boolean;
  onPress: (date: Date) => void;
  cellWidth: number;
  theme: any;
  isDark: boolean;
}> = ({
  date,
  isSelected,
  isBlocked,
  isBooked,
  isInRange,
  isInBookingRange,
  isToday,
  isCurrentMonth,
  isPastDate,
  onPress,
  cellWidth,
  theme,
  isDark,
}) => {
  const getDateStyle = () => {
    let backgroundColor = "transparent";
    let borderColor = "transparent";
    let borderWidth = 0;
    const cellSize = cellWidth * 0.7; // Make cells smaller for better spacing
    const borderRadius = cellSize / 2; // Make it perfectly round

    if (isSelected) {
      backgroundColor = theme.colors.primary;
    } else if (isInRange) {
      backgroundColor = theme.colors.primaryLight;
    } else if (isInBookingRange) {
      backgroundColor = theme.colors.tertiary;
    } else if (isBooked) {
      backgroundColor = theme.colors.tertiary; // Use tertiary color for booked dates
    } else if (isBlocked) {
      backgroundColor = theme.colors.gray[400]; // Use gray for blocked dates
    } else if (!isCurrentMonth) {
      // Add subtle border for dates outside current month
      borderColor = theme.colors.gray[200];
      borderWidth = 1;
    }

    // Add a dashed border for unavailable dates
    if ((isBlocked || isBooked) && !isSelected) {
      borderColor = isBooked ? theme.colors.tertiary : theme.colors.gray[400];
      borderWidth = 1;
    }

    return {
      alignItems: "center" as const,
      justifyContent: "center" as const,
      margin: 1, // Reduced margin for tighter spacing
      width: cellSize,
      height: cellSize,
      backgroundColor,
      borderColor,
      borderWidth,
      borderRadius,
    };
  };
  const getTextStyle = () => {
    let color = theme.text.primary;
    let fontWeight: "normal" | "bold" | "600" | "400" = "400";
    let textDecorationLine: "none" | "line-through" = "none";

    if (isSelected) {
      color = "#fff";
      fontWeight = "bold";
    } else if (isPastDate) {
      color = theme.colors.gray[400];
      textDecorationLine = "line-through";
    } else if (!isCurrentMonth) {
      color = theme.colors.gray[300];
    } else if (isInBookingRange) {
      color = "#fff";
      fontWeight = "600";
    } else if (isBooked) {
      color = "#fff";
      fontWeight = "600";
    } else if (isBlocked) {
      color = "#fff";
      fontWeight = "600";
    }
    // Available days use normal text color

    return {
      fontSize: 16,
      color,
      fontWeight,
      textDecorationLine,
    };
  };

  const isDisabledState = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    // Never disable current day
    if (currentDate.getTime() === today.getTime()) {
      return false;
    }

    // Disable blocked dates, booked dates, and past dates
    return isBlocked || isBooked || isPastDate;
  };

  const disabled = isDisabledState();

  return (
    <TouchableOpacity
      style={getDateStyle()}
      onPress={() => onPress(date)}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text style={getTextStyle()}>{date.getDate()}</Text>
    </TouchableOpacity>
  );
};

export default Calendar;

// Additional internal styles for the calendar
const internalStyles = StyleSheet.create({
  warningContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
