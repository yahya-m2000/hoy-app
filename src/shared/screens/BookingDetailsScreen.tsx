import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@shared/hooks/useTheme";
import { StatusBar } from "expo-status-bar";
import {
  fontSize,
  fontWeight,
  radius,
  spacing,
  Icon,
  iconSize,
} from "src/shared";
import { mockDetailedBookings } from "../../../app/(tabs)/host/calendar/utils/mockData";

export default function BookingDetailsScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  // Find the booking by ID
  const booking = useMemo(() => {
    return mockDetailedBookings.find((b) => b._id === bookingId);
  }, [bookingId]);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#10B981"; // green
      case "completed":
        return "#6B7280"; // gray
      case "cancelled":
        return "#EF4444"; // red
      default:
        return theme.colors.primary;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10B981"; // green
      case "pending":
        return "#F59E0B"; // amber
      case "failed":
        return "#EF4444"; // red
      default:
        return theme.colors.secondary;
    }
  };

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon
              name="arrow-back"
              size={iconSize.md}
              color={theme.colors.black}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.black }]}>
            Booking Details
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon
            name="alert-circle"
            size={iconSize.xl}
            color={theme.colors.error}
          />
          <Text style={[styles.errorText, { color: theme.colors.black }]}>
            Booking not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Property Information */}
        <View style={[styles.section, { backgroundColor: "#F9FAFB" }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
            Property
          </Text>
          <Text style={[styles.propertyName, { color: theme.colors.black }]}>
            {booking.propertyId.name}
          </Text>
          <Text style={[styles.propertyAddress, { color: "#6B7280" }]}>
            {booking.propertyId.address.street},
            {booking.propertyId.address.city},{booking.propertyId.address.state}
            {booking.propertyId.address.postalCode}
          </Text>
          <View style={styles.propertyDetails}>
            <View style={styles.propertyDetailItem}>
              <Icon name="bed" size={iconSize.sm} color="#6B7280" />
              <Text style={[styles.propertyDetailText, { color: "#6B7280" }]}>
                {booking.propertyId.bedrooms} bed
                {booking.propertyId.bedrooms !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.propertyDetailItem}>
              <Icon name="people" size={iconSize.sm} color="#6B7280" />
              <Text style={[styles.propertyDetailText, { color: "#6B7280" }]}>
                {booking.propertyId.maxGuests} guests max
              </Text>
            </View>
          </View>
        </View>

        {/* Guest Information */}
        <View style={[styles.section, { backgroundColor: "#F9FAFB" }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
            Guest Information
          </Text>
          <Text style={[styles.guestName, { color: theme.colors.black }]}>
            {booking.contactInfo.name}
          </Text>

          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleEmail(booking.contactInfo.email)}
            >
              <Icon
                name="mail"
                size={iconSize.sm}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.contactText, { color: theme.colors.primary }]}
              >
                {booking.contactInfo.email}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleCall(booking.contactInfo.phone)}
            >
              <Icon
                name="call"
                size={iconSize.sm}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.contactText, { color: theme.colors.primary }]}
              >
                {booking.contactInfo.phone}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.guestCounts}>
            <View style={styles.guestCountItem}>
              <Text
                style={[styles.guestCountNumber, { color: theme.colors.black }]}
              >
                {booking.guests.adults}
              </Text>
              <Text style={[styles.guestCountLabel, { color: "#6B7280" }]}>
                Adult{booking.guests.adults !== 1 ? "s" : ""}
              </Text>
            </View>
            {booking.guests.children > 0 && (
              <View style={styles.guestCountItem}>
                <Text
                  style={[
                    styles.guestCountNumber,
                    { color: theme.colors.black },
                  ]}
                >
                  {booking.guests.children}
                </Text>
                <Text style={[styles.guestCountLabel, { color: "#6B7280" }]}>
                  Child{booking.guests.children !== 1 ? "ren" : ""}
                </Text>
              </View>
            )}
            {booking.guests.infants > 0 && (
              <View style={styles.guestCountItem}>
                <Text
                  style={[
                    styles.guestCountNumber,
                    { color: theme.colors.black },
                  ]}
                >
                  {booking.guests.infants}
                </Text>
                <Text style={[styles.guestCountLabel, { color: "#6B7280" }]}>
                  Infant{booking.guests.infants !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Booking Information */}
        <View style={[styles.section, { backgroundColor: "#F9FAFB" }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
            Booking Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: "#6B7280" }]}>
              Check-in
            </Text>
            <View style={styles.infoValueContainer}>
              <Text style={[styles.infoValue, { color: theme.colors.black }]}>
                {formatDate(booking.checkIn)}
              </Text>
              <Text style={[styles.infoTime, { color: "#6B7280" }]}>
                {formatTime(booking.checkIn)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: "#6B7280" }]}>
              Check-out
            </Text>
            <View style={styles.infoValueContainer}>
              <Text style={[styles.infoValue, { color: theme.colors.black }]}>
                {formatDate(booking.checkOut)}
              </Text>
              <Text style={[styles.infoTime, { color: "#6B7280" }]}>
                {formatTime(booking.checkOut)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: "#6B7280" }]}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(booking.bookingStatus) },
              ]}
            >
              <Text style={styles.statusText}>
                {booking.bookingStatus.charAt(0).toUpperCase() +
                  booking.bookingStatus.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: "#6B7280" }]}>
              Payment
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getPaymentStatusColor(booking.paymentStatus),
                },
              ]}
            >
              <Text style={styles.statusText}>
                {booking.paymentStatus.charAt(0).toUpperCase() +
                  booking.paymentStatus.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: "#6B7280" }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalAmount, { color: theme.colors.black }]}>
              ${booking.totalPrice.toLocaleString()}
            </Text>
          </View>

          {booking.specialRequests && (
            <View style={styles.specialRequestsContainer}>
              <Text style={[styles.infoLabel, { color: "#6B7280" }]}>
                Special Requests
              </Text>
              <Text
                style={[
                  styles.specialRequestsText,
                  { color: theme.colors.black },
                ]}
              >
                {booking.specialRequests}
              </Text>
            </View>
          )}
        </View>

        {/* Booking ID */}
        <View style={[styles.section, { backgroundColor: "#F9FAFB" }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.black }]}>
            Reference
          </Text>
          <Text style={[styles.bookingId, { color: "#6B7280" }]}>
            Booking ID: {booking._id}
          </Text>
          <Text style={[styles.createdDate, { color: "#6B7280" }]}>
            Created: {formatDate(booking.createdAt)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  propertyName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  propertyAddress: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  propertyDetails: {
    flexDirection: "row",
    gap: spacing.md,
  },
  propertyDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  propertyDetailText: {
    fontSize: fontSize.sm,
  },
  guestName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  contactRow: {
    marginBottom: spacing.sm,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  contactText: {
    fontSize: fontSize.sm,
  },
  guestCounts: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  guestCountItem: {
    alignItems: "center",
  },
  guestCountNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  guestCountLabel: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  infoValueContainer: {
    alignItems: "flex-end",
    flex: 2,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  infoTime: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    color: "white",
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  totalAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  specialRequestsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  specialRequestsText: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  bookingId: {
    fontSize: fontSize.sm,
    fontFamily: "monospace",
  },
  createdDate: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
