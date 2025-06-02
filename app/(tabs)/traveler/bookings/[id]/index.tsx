/**
 * Dynamic booking details screen
 * Shows detailed information about a specific booking
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

// Context
import { useTheme } from "@common-context/ThemeContext";

// Components
import CustomHeader from "@common-components/CustomHeader";

// Hooks
import { useBookingById } from "@common-hooks/useBookings";

// Constants
import { fontSize } from "@constants/typography";
import { spacing } from "@constants/spacing";
import { radius } from "@constants/radius";

// Types
interface Property {
  _id: string;
  title?: string;
  name?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  images?: string[];
  photos?: string[];
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  hostName?: string;
}

const getStatusColor = (status: string, isDark: boolean) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "#22c55e";
    case "pending":
      return "#f59e0b";
    case "completed":
      return "#3b82f6";
    case "cancelled":
      return "#ef4444";
    default:
      return isDark ? "#6b7280" : "#9ca3af";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "checkmark-circle";
    case "pending":
      return "time";
    case "completed":
      return "checkmark-done-circle";
    case "cancelled":
      return "close-circle";
    default:
      return "help-circle";
  }
};

export default function BookingDetailsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Get booking data
  const { data: booking, isLoading, error, refetch } = useBookingById(id);

  const handleBackPress = () => {
    router.back();
  };

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: () => {
            // TODO: Implement booking cancellation
            console.log("Cancel booking:", id);
          },
        },
      ]
    );
  };

  const handleContactHost = () => {
    // TODO: Implement contact host functionality
    console.log("Contact host");
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? theme.colors.grayPalette[900] : theme.white }]}>
        <CustomHeader title="Booking Details" onBackPress={handleBackPress} />
        <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: isDark ? theme.white : theme.black }]}>
              Loading booking details...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? theme.colors.grayPalette[900] : theme.white }]}>
        <CustomHeader title="Booking Details" onBackPress={handleBackPress} />
        <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={[styles.errorTitle, { color: isDark ? theme.white : theme.black }]}>
              Booking Not Found
            </Text>
            <Text style={[styles.errorText, { color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600] }]}>
              {error?.message || "The booking you're looking for doesn't exist or has been removed."}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={() => refetch()}
            >
              <Text style={[styles.retryButtonText, { color: theme.white }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  const property = typeof booking.propertyId === 'object' ? booking.propertyId as any : null;
  
  if (!property) {
    // Handle case where property data is not populated
    return (
      <View style={[styles.container, { backgroundColor: isDark ? theme.colors.grayPalette[900] : theme.white }]}>
        <CustomHeader title="Booking Details" onBackPress={handleBackPress} />
        <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#ef4444" />
            <Text style={[styles.errorTitle, { color: isDark ? theme.white : theme.black }]}>
              Property Data Unavailable
            </Text>
            <Text style={[styles.errorText, { color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600] }]}>
              The property information for this booking is not available.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const propertyImage = property.images?.[0] || property.photos?.[0];
  const totalGuests = booking.guests.adults + (booking.guests.children || 0);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme.colors.grayPalette[900] : theme.white }]}>
      <CustomHeader title="Booking Details" onBackPress={handleBackPress} />
      
      <ScrollView 
        style={[styles.content, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Header */}
        <View style={[styles.propertySection, { backgroundColor: isDark ? theme.colors.grayPalette[800] : theme.white }]}>
          {propertyImage && (
            <Image source={{ uri: propertyImage }} style={styles.propertyImage} />
          )}
          <View style={styles.propertyInfo}>
            <Text style={[styles.propertyTitle, { color: isDark ? theme.white : theme.black }]}>
              {property.title || property.name || "Property"}
            </Text>
            <Text style={[styles.propertyLocation, { color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600] }]}>
              {property.address.city}, {property.address.state}
            </Text>
            <Text style={[styles.propertyType, { color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600] }]}>
              {property.propertyType} • {property.bedrooms} bed • {property.bathrooms} bath
            </Text>
          </View>
        </View>

        {/* Booking Status */}
        <View style={[styles.section, { backgroundColor: isDark ? theme.colors.grayPalette[800] : theme.white }]}>
          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(booking.bookingStatus)} 
              size={24} 
              color={getStatusColor(booking.bookingStatus, isDark)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(booking.bookingStatus, isDark) }]}>
              {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
            </Text>
          </View>
        </View>

        {/* Trip Details */}
        <View style={[styles.section, { backgroundColor: isDark ? theme.colors.grayPalette[800] : theme.white }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.white : theme.black }]}>
            Trip Details
          </Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={20} color={isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600]} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600] }]}>
                  Check-in
                </Text>
                <Text style={[styles.detailValue, { color: isDark ? theme.white : theme.black }]}>
                  {formatDate(booking.checkIn)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color={isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600]} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600] }]}>
                  Check-out
                </Text>
                <Text style={[styles.detailValue, { color: isDark ? theme.white : theme.black }]}>
                  {formatDate(booking.checkOut)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="people" size={20} color={isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600]} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600] }]}>
                  Guests
                </Text>
                <Text style={[styles.detailValue, { color: isDark ? theme.white : theme.black }]}>
                  {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="card" size={20} color={isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600]} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600] }]}>
                  Total Price
                </Text>
                <Text style={[styles.detailValue, { color: isDark ? theme.white : theme.black }]}>
                  ${booking.totalPrice}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { backgroundColor: isDark ? theme.colors.grayPalette[800] : theme.white }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.white : theme.black }]}>
            Contact Information
          </Text>
            <View style={styles.contactInfo}>
            <Ionicons name="person" size={20} color={isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600]} />
            <Text style={[styles.contactText, { color: isDark ? theme.white : theme.black }]}>
              {booking.contactInfo?.name || 'N/A'}
            </Text>
          </View>
          
          <View style={styles.contactInfo}>
            <Ionicons name="mail" size={20} color={isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600]} />
            <Text style={[styles.contactText, { color: isDark ? theme.white : theme.black }]}>
              {booking.contactInfo?.email || 'N/A'}
            </Text>
          </View>
          
          {booking.contactInfo?.phone && (
            <View style={styles.contactInfo}>
              <Ionicons name="call" size={20} color={isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600]} />
              <Text style={[styles.contactText, { color: isDark ? theme.white : theme.black }]}>
                {booking.contactInfo.phone}
              </Text>
            </View>
          )}
        </View>

        {/* Special Requests */}
        {booking.specialRequests && (
          <View style={[styles.section, { backgroundColor: isDark ? theme.colors.grayPalette[800] : theme.white }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? theme.white : theme.black }]}>
              Special Requests
            </Text>
            <Text style={[styles.specialRequests, { color: isDark ? theme.colors.grayPalette[300] : theme.colors.grayPalette[700] }]}>
              {booking.specialRequests}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { borderColor: isDark ? theme.colors.grayPalette[600] : theme.colors.grayPalette[300] }]}
            onPress={handleContactHost}
          >
            <Ionicons name="chatbubble" size={20} color={isDark ? theme.white : theme.black} />
            <Text style={[styles.secondaryButtonText, { color: isDark ? theme.white : theme.black }]}>
              Contact Host
            </Text>
          </TouchableOpacity>

          {booking.bookingStatus.toLowerCase() === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelBooking}
            >
              <Ionicons name="close" size={20} color={theme.white} />
              <Text style={[styles.cancelButtonText, { color: theme.white }]}>
                Cancel Booking
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginTop: spacing.md,
    textAlign: "center",
  },
  errorText: {
    fontSize: fontSize.md,
    marginTop: spacing.sm,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  propertySection: {
    margin: spacing.md,
    borderRadius: radius.lg,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  propertyInfo: {
    padding: spacing.lg,
  },
  propertyTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  propertyType: {
    fontSize: fontSize.sm,
  },
  section: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: radius.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: spacing.md,
  },
  detailTextContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  contactText: {
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
    flex: 1,
  },
  specialRequests: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  actionButtons: {
    padding: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
});
