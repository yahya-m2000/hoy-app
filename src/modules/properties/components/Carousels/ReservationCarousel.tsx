/**
 * Reservation Carousel Component
 * Horizontal scrollable list of reservation cards
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";
import { useTheme } from "@shared/context";
import type { Reservation } from "@shared/types/booking/reservation";

interface ReservationCarouselProps {
  reservations: Reservation[];
  emptyMessage?: string;
  onReservationPress?: (reservation: Reservation) => void;
}

const ReservationCarousel: React.FC<ReservationCarouselProps> = ({
  reservations,
  emptyMessage = "No reservations found",
  onReservationPress,
}) => {
  const { theme, isDark } = useTheme();

  if (reservations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.gray[500] }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return theme.colors.warning;
      case "confirmed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      case "completed":
        return theme.colors.info;
      default:
        return theme.colors.gray[500];
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd");
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {reservations.map((reservation) => (
        <TouchableOpacity
          key={reservation.id}
          style={[
            styles.card,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
            },
          ]}
          onPress={() => onReservationPress?.(reservation)}
        >
          {/* Property Image */}
          {reservation.propertyImage && (
            <Image
              source={{ uri: reservation.propertyImage }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          )}

          {/* Reservation Details */}
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.guestName,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                },
              ]}
              numberOfLines={1}
            >
              {reservation.guestName}
            </Text>

            <Text
              style={[
                styles.propertyTitle,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
              numberOfLines={1}
            >
              {reservation.propertyTitle}
            </Text>

            <Text
              style={[
                styles.dates,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[500],
                },
              ]}
            >
              {formatDate(reservation.checkIn)} -{" "}
              {formatDate(reservation.checkOut)}
            </Text>

            <View style={styles.footer}>
              <Text
                style={[
                  styles.guestCount,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[500],
                  },
                ]}
              >
                {reservation.guestCount} guest
                {reservation.guestCount !== 1 ? "s" : ""}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(reservation.status) },
                ]}
              >
                <Text style={[styles.statusText, { color: theme.white }]}>
                  {reservation.status.charAt(0).toUpperCase() +
                    reservation.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginBottom: 16,
  },
  container: {
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  card: {
    width: 280,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  propertyImage: {
    width: "100%",
    height: 120,
  },
  cardContent: {
    padding: 12,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  dates: {
    fontSize: 13,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guestCount: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ReservationCarousel;
