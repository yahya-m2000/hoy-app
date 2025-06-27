/**
 * Calendar Day Component
 * Individual day cell in the calendar with booking pills and pricing
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CalendarDay } from "../../types/calendar";
import { formatPrice } from "../../utils/calendarUtils";
import { useTheme } from "../../../../shared/hooks/useTheme";
import Avatar from "../../../../shared/components/common/Avatar";

interface CalendarDayProps {
  day: CalendarDay;
  isSelected: boolean;
  isInRange: boolean;
  onPress: (date: string) => void;
  onLongPress?: (date: string) => void;
}

const CalendarDayComponent: React.FC<CalendarDayProps> = ({
  day,
  isSelected,
  isInRange,
  onPress,
  onLongPress,
}) => {
  const theme = useTheme();

  const handlePress = () => {
    onPress(day.date);
  };

  const handleLongPress = () => {
    onLongPress?.(day.date);
  };

  const dayNumber = new Date(day.date).getDate();
  const isToday =
    new Date(day.date).toDateString() === new Date().toDateString();
  const isPast = new Date(day.date) < new Date();

  // Calculate final price with promotions
  const finalPrice = day.promotionPercentage
    ? day.price * (1 - day.promotionPercentage / 100)
    : day.customPrice || day.price;

  const containerStyles = [
    styles.container,
    {
      backgroundColor: isSelected
        ? theme.colors.primary
        : isInRange
        ? theme.colors.primaryLight
        : "transparent",
      borderColor: isToday ? theme.colors.primary : "transparent",
    },
    isPast && styles.pastDay,
    day.isBlocked && styles.blockedDay,
  ];

  const textStyles = [
    styles.dayNumber,
    {
      color: isSelected
        ? theme.colors.white
        : isPast
        ? theme.text.disabled
        : theme.text.primary,
    },
    isToday && { fontWeight: "bold" as const },
  ];

  return (
    <Pressable
      style={containerStyles}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={isPast}
    >
      <Text style={textStyles}>{dayNumber}</Text>

      {/* Booking pill */}
      {day.booking && (
        <View
          style={[
            styles.bookingPill,
            { backgroundColor: theme.colors.success },
          ]}
        >
          <Avatar
            source={day.booking.guest.avatar}
            name={`${day.booking.guest.firstName} ${day.booking.guest.lastName}`}
            size={16}
            style={styles.guestAvatar}
          />
          <Text style={[styles.guestInitials, { color: theme.colors.white }]}>
            {day.booking.guest.firstName[0]}
            {day.booking.guest.lastName[0]}
          </Text>
        </View>
      )}

      {/* Blocked indicator */}
      {day.isBlocked && (
        <View
          style={[
            styles.blockedIndicator,
            { backgroundColor: theme.colors.error },
          ]}
        >
          <Text style={[styles.blockedText, { color: theme.colors.white }]}>
            ✕
          </Text>
        </View>
      )}

      {/* Price display */}
      {!day.booking && !day.isBlocked && day.isAvailable && (
        <View style={styles.priceContainer}>
          {day.promotionPercentage && (
            <Text
              style={[styles.originalPrice, { color: theme.text.secondary }]}
            >
              {formatPrice(day.price, day.currency)}
            </Text>
          )}
          <Text style={[styles.price, { color: theme.text.primary }]}>
            {formatPrice(finalPrice, day.currency)}
          </Text>
          {day.promotionPercentage && (
            <View
              style={[
                styles.promotionBadge,
                { backgroundColor: theme.colors.success },
              ]}
            >
              <Text
                style={[styles.promotionText, { color: theme.colors.white }]}
              >
                -{day.promotionPercentage}%
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Unavailable indicator */}
      {!day.isAvailable && !day.booking && !day.isBlocked && (
        <View style={styles.unavailableContainer}>
          <Text
            style={[styles.unavailableText, { color: theme.text.disabled }]}
          >
            N/A
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 60,
    position: "relative",
  },
  pastDay: {
    opacity: 0.5,
  },
  blockedDay: {
    opacity: 0.7,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "500",
    position: "absolute",
    top: 4,
    left: 4,
  },
  bookingPill: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  guestAvatar: {
    position: "absolute",
  },
  guestInitials: {
    fontSize: 8,
    fontWeight: "bold",
  },
  blockedIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  blockedText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  priceContainer: {
    position: "absolute",
    bottom: 2,
    left: 2,
    right: 2,
    alignItems: "center",
  },
  originalPrice: {
    fontSize: 8,
    textDecorationLine: "line-through",
  },
  price: {
    fontSize: 10,
    fontWeight: "600",
  },
  promotionBadge: {
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 1,
  },
  promotionText: {
    fontSize: 6,
    fontWeight: "bold",
  },
  unavailableContainer: {
    position: "absolute",
    bottom: 4,
  },
  unavailableText: {
    fontSize: 10,
    fontWeight: "500",
  },
});

export default CalendarDayComponent;
