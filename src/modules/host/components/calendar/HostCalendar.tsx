/**
 * Host Calendar Component
 * Main calendar grid with horizontal swipe navigation
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  Pressable,
} from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import { CalendarMonth, CalendarDay } from "../../types/calendar";
import {
  generateCalendarDays,
  getMonthName,
  addMonths,
} from "../../utils/calendarUtils";
import CalendarDayComponent from "./CalendarDay";

const { width: screenWidth } = Dimensions.get("window");
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface HostCalendarProps {
  propertyId: string;
  calendarData?: CalendarMonth[];
  onDatePress: (date: string) => void;
  onDateLongPress?: (date: string) => void;
  selectedDates: string[];
  isRangeSelection?: boolean;
  onMonthChange?: (year: number, month: number) => void;
}

const HostCalendar: React.FC<HostCalendarProps> = ({
  propertyId,
  calendarData = [],
  onDatePress,
  onDateLongPress,
  selectedDates,
  isRangeSelection = false,
  onMonthChange,
}) => {
  const theme = useTheme();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Generate initial months if no data provided
  const months = useMemo(() => {
    if (calendarData.length > 0) {
      return calendarData;
    }

    // Generate 12 months starting from current month
    const currentDate = new Date();
    const generatedMonths: CalendarMonth[] = [];

    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(currentDate, i);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;

      generatedMonths.push({
        year,
        month,
        days: generateCalendarDays(year, month),
      });
    }

    return generatedMonths;
  }, [calendarData]);

  const currentMonth = months[currentMonthIndex];

  const handleMonthChange = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < months.length) {
        setCurrentMonthIndex(newIndex);
        const month = months[newIndex];
        onMonthChange?.(month.year, month.month);
      }
    },
    [months, onMonthChange]
  );

  const isDateInRange = useCallback(
    (date: string) => {
      if (!isRangeSelection || selectedDates.length < 2) return false;

      const sortedDates = [...selectedDates].sort();
      const startDate = new Date(sortedDates[0]);
      const endDate = new Date(sortedDates[sortedDates.length - 1]);
      const checkDate = new Date(date);

      return checkDate >= startDate && checkDate <= endDate;
    },
    [selectedDates, isRangeSelection]
  );

  const renderMonthHeader = () => (
    <View
      style={[styles.monthHeader, { backgroundColor: theme.colors.surface }]}
    >
      <Pressable
        style={styles.navButton}
        onPress={() => handleMonthChange(currentMonthIndex - 1)}
        disabled={currentMonthIndex === 0}
      >
        <Text
          style={[
            styles.navButtonText,
            {
              color:
                currentMonthIndex === 0
                  ? theme.text.disabled
                  : theme.colors.primary,
            },
          ]}
        >
          ‹
        </Text>
      </Pressable>

      <Text style={[styles.monthTitle, { color: theme.text.primary }]}>
        {getMonthName(currentMonth.month)} {currentMonth.year}
      </Text>

      <Pressable
        style={styles.navButton}
        onPress={() => handleMonthChange(currentMonthIndex + 1)}
        disabled={currentMonthIndex === months.length - 1}
      >
        <Text
          style={[
            styles.navButtonText,
            {
              color:
                currentMonthIndex === months.length - 1
                  ? theme.text.disabled
                  : theme.colors.primary,
            },
          ]}
        >
          ›
        </Text>
      </Pressable>
    </View>
  );

  const renderDaysOfWeekHeader = () => (
    <View style={styles.daysOfWeekHeader}>
      {DAYS_OF_WEEK.map((day) => (
        <Text
          key={day}
          style={[styles.dayOfWeekText, { color: theme.text.secondary }]}
        >
          {day}
        </Text>
      ))}
    </View>
  );

  const renderCalendarGrid = () => {
    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];

    // Add empty cells for days before the month starts
    const firstDayOfMonth = new Date(
      currentMonth.year,
      currentMonth.month - 1,
      1
    );
    const firstDayWeekday = firstDayOfMonth.getDay();

    for (let i = 0; i < firstDayWeekday; i++) {
      currentWeek.push({} as CalendarDay); // Empty day placeholder
    }

    // Add actual days of the month
    currentMonth.days.forEach((day) => {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Fill remaining cells in the last week
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push({} as CalendarDay);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return (
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              if (!day.date) {
                return <View key={dayIndex} style={styles.emptyDay} />;
              }

              return (
                <CalendarDayComponent
                  key={day.date}
                  day={day}
                  isSelected={selectedDates.includes(day.date)}
                  isInRange={isDateInRange(day.date)}
                  onPress={onDatePress}
                  onLongPress={onDateLongPress}
                />
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {renderMonthHeader()}
      {renderDaysOfWeekHeader()}

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: currentMonthIndex * screenWidth, y: 0 }}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / screenWidth
          );
          handleMonthChange(newIndex);
        }}
        style={styles.monthsScrollView}
      >
        {months.map((month, index) => (
          <View
            key={`${month.year}-${month.month}`}
            style={styles.monthContainer}
          >
            {index === currentMonthIndex && renderCalendarGrid()}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  navButton: {
    padding: 8,
    minWidth: 44,
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: "600",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  daysOfWeekHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
  monthsScrollView: {
    flex: 1,
  },
  monthContainer: {
    width: screenWidth,
    flex: 1,
  },
  calendarGrid: {
    paddingHorizontal: 4,
  },
  weekRow: {
    flexDirection: "row",
  },
  emptyDay: {
    flex: 1,
    aspectRatio: 1,
  },
});

export default HostCalendar;
