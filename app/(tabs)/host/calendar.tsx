/**
 * Calendar Tab Screen for Host Mode
 * Displays monthly calendar view with reservation highlights
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";
import { useTheme } from "@shared/context/ThemeContext";
// import { getHostReservations } from "@modules/properties";
import type { Reservation } from "@shared/types/booking/reservation";
import { LoadingSpinner } from "@shared/components";
import { format, parseISO } from "date-fns";
import { getHostReservations } from "@shared/services/hostService";
interface CalendarMarking {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dotColor?: string;
  customStyles?: any;
}

interface DateInfo {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

const CalendarScreen = () => {
  const { theme, isDark } = useTheme();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDateReservations, setSelectedDateReservations] = useState<
    Reservation[]
  >([]);
  const [markedDates, setMarkedDates] = useState<
    Record<string, CalendarMarking>
  >({});

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await getHostReservations();
      setReservations(response);
    } catch (error) {
      console.error("Error loading reservations:", error);
      Alert.alert("Error", "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  const generateMarkedDates = useCallback(() => {
    const marked: Record<string, CalendarMarking> = {};

    reservations.forEach((reservation) => {
      const checkInDate = reservation.checkIn;
      const checkOutDate = reservation.checkOut;

      // Mark check-in dates
      if (!marked[checkInDate]) {
        marked[checkInDate] = {};
      }
      marked[checkInDate] = {
        ...marked[checkInDate],
        marked: true,
        dotColor: theme.colors.success, // Green for check-ins
      };

      // Mark check-out dates
      if (!marked[checkOutDate]) {
        marked[checkOutDate] = {};
      }
      marked[checkOutDate] = {
        ...marked[checkOutDate],
        marked: true,
        dotColor: theme.colors.error, // Red for check-outs
      };
    });

    setMarkedDates(marked);
  }, [reservations, theme]);

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (reservations.length > 0) {
      generateMarkedDates();
    }
  }, [reservations, generateMarkedDates]);

  const onDayPress = (day: DateInfo) => {
    const dateString = day.dateString;

    // Find reservations for the selected date
    const dateReservations = reservations.filter(
      (reservation) =>
        reservation.checkIn === dateString ||
        reservation.checkOut === dateString
    );

    setSelectedDate(dateString);
    setSelectedDateReservations(dateReservations);

    // Update marked dates with selection
    const updatedMarked = { ...markedDates };

    // Remove previous selection
    Object.keys(updatedMarked).forEach((date) => {
      if (updatedMarked[date].selected) {
        delete updatedMarked[date].selected;
        delete updatedMarked[date].selectedColor;
      }
    });

    // Add new selection
    updatedMarked[dateString] = {
      ...updatedMarked[dateString],
      selected: true,
      selectedColor: theme.colors.primary,
    };

    setMarkedDates(updatedMarked);
  };

  const formatSelectedDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "EEEE, MMMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getReservationTypeForDate = (
    reservation: Reservation,
    date: string
  ) => {
    if (reservation.checkIn === date) return "Check-in";
    if (reservation.checkOut === date) return "Check-out";
    return "";
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <RNCalendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              calendarBackground: isDark ? theme.colors.gray[800] : theme.white,
              textSectionTitleColor: isDark
                ? theme.colors.gray[300]
                : theme.colors.gray[600],
              dayTextColor: isDark
                ? theme.colors.gray[100]
                : theme.colors.gray[900],
              todayTextColor: theme.colors.primary,
              selectedDayTextColor: theme.white,
              monthTextColor: isDark
                ? theme.colors.gray[100]
                : theme.colors.gray[900],
              selectedDayBackgroundColor: theme.colors.primary,
              arrowColor: theme.colors.primary,
              disabledArrowColor: isDark
                ? theme.colors.gray[600]
                : theme.colors.gray[400],
              textDisabledColor: isDark
                ? theme.colors.gray[600]
                : theme.colors.gray[400],
              textInactiveColor: isDark
                ? theme.colors.gray[500]
                : theme.colors.gray[400],
            }}
            style={styles.calendar}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={[styles.legendTitle, { color: theme.text.primary }]}>
            Legend
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.success },
                ]}
              />
              <Text
                style={[styles.legendText, { color: theme.text.secondary }]}
              >
                Check-in
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.colors.error },
                ]}
              />
              <Text
                style={[styles.legendText, { color: theme.text.secondary }]}
              >
                Check-out
              </Text>
            </View>
          </View>
        </View>

        {/* Selected Date Details */}
        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <Text
              style={[styles.selectedDateTitle, { color: theme.text.primary }]}
            >
              {formatSelectedDate(selectedDate)}
            </Text>

            {selectedDateReservations.length > 0 ? (
              <View style={styles.reservationsList}>
                {selectedDateReservations.map((reservation) => (
                  <View
                    key={`${reservation.id}-${selectedDate}`}
                    style={[
                      styles.reservationItem,
                      {
                        backgroundColor: isDark
                          ? theme.colors.gray[800]
                          : theme.colors.gray[50],
                        borderColor: isDark
                          ? theme.colors.gray[700]
                          : theme.colors.gray[200],
                      },
                    ]}
                  >
                    <View style={styles.reservationHeader}>
                      <Text
                        style={[
                          styles.guestName,
                          { color: theme.text.primary },
                        ]}
                      >
                        {reservation.guestName}
                      </Text>
                      <Text
                        style={[
                          styles.reservationType,
                          {
                            color:
                              getReservationTypeForDate(
                                reservation,
                                selectedDate
                              ) === "Check-in"
                                ? theme.colors.success
                                : theme.colors.error,
                          },
                        ]}
                      >
                        {getReservationTypeForDate(reservation, selectedDate)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.propertyTitle,
                        { color: theme.text.secondary },
                      ]}
                    >
                      {reservation.propertyTitle}
                    </Text>
                    <Text
                      style={[
                        styles.reservationDates,
                        { color: theme.text.secondary },
                      ]}
                    >
                      {format(parseISO(reservation.checkIn), "MMM dd")} -{" "}
                      {format(parseISO(reservation.checkOut), "MMM dd")}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text
                style={[
                  styles.noReservationsText,
                  { color: theme.text.secondary },
                ]}
              >
                No reservations for this date
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  calendar: {
    borderRadius: 12,
  },
  legendContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: "row",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
  },
  selectedDateContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  reservationsList: {
    gap: 12,
  },
  reservationItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "600",
  },
  reservationType: {
    fontSize: 14,
    fontWeight: "500",
  },
  propertyTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  reservationDates: {
    fontSize: 13,
  },
  noReservationsText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
});

export default CalendarScreen;
