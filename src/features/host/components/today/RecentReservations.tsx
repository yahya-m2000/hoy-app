import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@core/hooks";
import { spacing } from "@core/design";

interface Reservation {
  id: string;
  guestName: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: "upcoming" | "active" | "completed" | "pending" | "cancelled";
  totalAmount: number;
  nights: number;
}

interface RecentReservationsProps {
  reservations: Reservation[];
  onReservationPress?: (reservation: Reservation) => void;
  onViewAllPress?: () => void;
}

const RecentReservations: React.FC<RecentReservationsProps> = ({
  reservations,
  onReservationPress,
  onViewAllPress,
}) => {
  const { theme } = useTheme();

  const getStatusColor = (status: Reservation["status"]) => {
    switch (status) {
      case "upcoming":
      case "active":
        return "#00A699"; // Airbnb teal
      case "completed":
        return "#767676"; // Gray
      case "pending":
        return "#FFB400"; // Orange
      case "cancelled":
        return "#C13515"; // Red
      default:
        return "#767676";
    }
  };

  const getStatusText = (status: Reservation["status"]) => {
    switch (status) {
      case "upcoming":
        return "Confirmed";
      case "active":
        return "Current guest";
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (!reservations || reservations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Reservations</Text>
        <View style={[styles.emptyCard, { backgroundColor: "#FFFFFF" }]}>
          <Text style={styles.emptyText}>No recent reservations</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservations</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.reservationsList}>
        {reservations.slice(0, 3).map((reservation) => (
          <TouchableOpacity
            key={reservation.id}
            style={[styles.reservationCard, { backgroundColor: "#FFFFFF" }]}
            onPress={() => onReservationPress?.(reservation)}
          >
            <View style={styles.reservationHeader}>
              <Text style={styles.guestName}>{reservation.guestName}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(reservation.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(reservation.status)}
                </Text>
              </View>
            </View>

            <View style={styles.reservationDetails}>
              <Text style={styles.dateRange}>
                {formatDate(reservation.checkIn)} -
                {formatDate(reservation.checkOut)}
              </Text>
              <Text style={styles.amount}>${reservation.totalAmount}</Text>
            </View>

            <Text style={styles.propertyName}>{reservation.property}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  viewAllText: {
    fontSize: 16,
    color: "#FF5A5F", // Airbnb red
    fontWeight: "500",
  },
  reservationsList: {
    gap: spacing.sm,
  },
  reservationCard: {
    padding: spacing.lg,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  reservationDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  dateRange: {
    fontSize: 14,
    color: "#717171",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  propertyName: {
    fontSize: 14,
    color: "#717171",
  },
  emptyCard: {
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#717171",
  },
});

export default RecentReservations;
