/**
 * Booking Details screen for the Hoy application
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
  Image,
  Alert,
  Share,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import {
  useBookingDetails,
  useCancelBooking,
} from "../../src/hooks/useBookings";
import { useToast } from "../../src/context/ToastContext";
import { format } from "date-fns";
import { fontSize } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
import { formatCurrency } from "../../src/utils/formatters";

// Interface for property data nested in booking
interface PropertyData {
  _id: string;
  name?: string;
  title?: string;
  city?: string;
  country?: string;
  images?: string[];
  price?: number;
  hostId?: string;
  hostName?: string;
  hostImage?: string;
}

// Interface for booking data
interface Booking {
  _id: string;
  userId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children?: number;
    infants?: number;
    pets?: number;
  };
  totalPrice: number;
  paymentStatus: "pending" | "paid" | "partially_paid" | "refunded";
  bookingStatus: "pending" | "confirmed" | "cancelled" | "completed";
  cancellationReason?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  // Properties from API response
  property?: PropertyData;
  cleaningFee?: number;
  serviceFee?: number;
  taxes?: number;
  reviewId?: string;
}

const BookingDetailsScreen = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  const bookingId = params.id as string;
  // Queries
  const {
    data: bookingData,
    isLoading,
    isError,
    error,
    refetch,
  } = useBookingDetails(bookingId);

  // Type assertion for booking data
  const booking = bookingData as Booking | undefined;

  const cancelBookingMutation = useCancelBooking();

  // Handle booking cancellation
  const handleCancelBooking = () => {
    Alert.alert(t("booking.cancelTitle"), t("booking.cancelConfirm"), [
      { text: t("common.no"), style: "cancel" },
      {
        text: t("common.yes"),
        style: "destructive",
        onPress: () => {
          cancelBookingMutation.mutate(
            { id: bookingId, reason: "Guest requested cancellation" },
            {
              onSuccess: () => {
                showToast({
                  type: "success",
                  message: t("booking.cancelSuccess"),
                });
                router.back();
              },
              onError: (error) => {
                showToast({
                  type: "error",
                  message: error.message || t("booking.cancelError"),
                });
              },
            }
          );
        },
      },
    ]);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "EEEE, MMMM d, yyyy");
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (!booking || !booking.checkIn || !booking.checkOut) return 0;
    const start = new Date(booking.checkIn);
    const end = new Date(booking.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  // Share booking details
  const shareBooking = async () => {
    if (!booking || !booking.property) return;

    try {
      const property = booking.property;
      const message = `I'm staying at ${
        property.name || property.title || "a property"
      } in ${property.city || ""}${
        property.country ? `, ${property.country}` : ""
      } from ${formatDate(booking.checkIn)} to ${formatDate(
        booking.checkOut
      )}!`;

      await Share.share({
        message,
        title: "My Upcoming Trip",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Handle navigation to property details
  const navigateToProperty = () => {
    if (!booking || !booking.property) return;

    router.push({
      pathname: "/(screens)/PropertyModalScreen",
      params: { property: JSON.stringify(booking.property) },
    });
  };

  // Handle review creation
  const createReview = () => {
    if (!booking) return;

    router.push({
      pathname: "/(modals)/CreateReviewModal",
      params: {
        bookingId: booking._id,
        propertyId: booking.propertyId,
      },
    });
  };

  // Render error state
  if (isError) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.gray[900]
              : theme.colors.gray[50],
            paddingTop: insets.top,
          },
        ]}
      >
        <Stack.Screen options={{ title: t("booking.details") }} />
        <StatusBar style={isDark ? "light" : "dark"} />

        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.error[500]}
          />
          <Text
            style={[
              styles.errorTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("common.error")}
          </Text>
          <Text
            style={[
              styles.errorText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {error instanceof Error ? error.message : t("booking.loadError")}
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render loading state
  if (isLoading || !booking) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.gray[900]
              : theme.colors.gray[50],
            paddingTop: insets.top,
          },
        ]}
      >
        <Stack.Screen options={{ title: t("booking.details") }} />
        <StatusBar style={isDark ? "light" : "dark"} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("booking.loading")}
          </Text>
        </View>
      </View>
    );
  }
  // Get property and booking details
  const property = booking.property || ({} as PropertyData);
  const nights = calculateNights();
  const checkIn = formatDate(booking.checkIn);
  const checkOut = formatDate(booking.checkOut);
  const canCancel =
    booking.bookingStatus === "confirmed" &&
    new Date(booking.checkIn) > new Date();
  const canReview = booking.bookingStatus === "completed" && !booking.reviewId;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
          paddingTop: insets.top,
        },
      ]}
    >
      <Stack.Screen
        options={{
          title: t("booking.details"),
          headerRight: () => (
            <TouchableOpacity
              onPress={shareBooking}
              style={styles.headerActionButton}
            >
              <Ionicons
                name="share-outline"
                size={22}
                color={isDark ? theme.white : theme.colors.gray[900]}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Property Card */}
        <TouchableOpacity
          style={[
            styles.propertyCard,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
          onPress={navigateToProperty}
        >
          <Image
            source={
              property.images && property.images.length > 0
                ? { uri: property.images[0] }
                : require("../../src/assets/placeholder-property.png")
            }
            style={styles.propertyImage}
          />

          <View style={styles.propertyCardContent}>
            <Text
              style={[
                styles.propertyName,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {property.title || property.name || "Property"}
            </Text>

            <Text
              style={[
                styles.propertyLocation,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {property.city}, {property.country}
            </Text>

            <View style={styles.propertyHostInfo}>
              <Text
                style={[
                  styles.hostedBy,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("property.hostedBy")} {property.hostName || "Host"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                booking.bookingStatus === "confirmed"
                  ? theme.colors.success[500]
                  : booking.bookingStatus === "cancelled"
                  ? theme.colors.error[500]
                  : booking.bookingStatus === "completed"
                  ? theme.colors.primary[500]
                  : theme.colors.warning[500],
            },
          ]}
        >
          <Text style={styles.statusText}>
            {booking.bookingStatus === "confirmed"
              ? t("booking.confirmed")
              : booking.bookingStatus === "cancelled"
              ? t("booking.cancelled")
              : booking.bookingStatus === "completed"
              ? t("booking.completed")
              : t("booking.pending")}
          </Text>
        </View>

        {/* Booking Details Section */}
        <View
          style={[
            styles.detailsSection,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("booking.reservationDetails")}
          </Text>

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("booking.bookingId")}
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              #{booking._id.substring(0, 8)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("booking.bookingDate")}
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {formatDate(booking.createdAt)}
            </Text>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
              },
            ]}
          />

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("booking.checkIn")}
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {checkIn}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("booking.checkOut")}
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {checkOut}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("booking.nights")}
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {nights}
            </Text>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
              },
            ]}
          />

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("booking.guests")}
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              
              {booking.guests.adults} {t("booking.adults")}
              {booking.guests.children &&
                booking.guests.children > 0 &&
                `, ${booking.guests.children} ${t("booking.childrenShort")}`}
              {booking.guests.infants &&
                booking.guests.infants > 0 &&
                `, ${booking.guests.infants} ${t("booking.infantsShort")}`}
              {booking.guests.pets &&
                booking.guests.pets > 0 &&
                `, ${booking.guests.pets} ${t("booking.petsShort")}`}
            </Text>
          </View>

          {booking.specialRequests && (
            <View style={styles.specialRequestsContainer}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("booking.specialRequests")}
              </Text>
              <Text
                style={[
                  styles.specialRequestsText,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                {booking.specialRequests}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Details Section */}
        <View
          style={[
            styles.detailsSection,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("booking.paymentDetails")}
          </Text>

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("booking.paymentStatus")}
            </Text>
            <View
              style={[
                styles.paymentStatusBadge,
                {
                  backgroundColor:
                    booking.paymentStatus === "paid"
                      ? theme.colors.success[500]
                      : booking.paymentStatus === "refunded"
                      ? theme.colors.warning[500]
                      : theme.colors.error[500],
                },
              ]}
            >
              <Text style={styles.paymentStatusText}>
                {booking.paymentStatus === "paid"
                  ? t("booking.paid")
                  : booking.paymentStatus === "refunded"
                  ? t("booking.refunded")
                  : booking.paymentStatus === "partially_paid"
                  ? t("booking.partiallyPaid")
                  : t("booking.pending")}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
              },
            ]}
          />

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("booking.pricePerNight")}
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              ${formatCurrency(property.price || 0)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                styles.detailLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {nights} {t("booking.nightsCount")}
            </Text>
            <Text
              style={[
                styles.detailValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              ${formatCurrency((property.price || 0) * nights)}
            </Text>
          </View>

          {booking.cleaningFee && booking.cleaningFee > 0 && (
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("booking.cleaningFee")}
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                ${formatCurrency(booking.cleaningFee)}
              </Text>
            </View>
          )}

          {booking.serviceFee && booking.serviceFee > 0 && (
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("booking.serviceFee")}
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                ${formatCurrency(booking.serviceFee)}
              </Text>
            </View>
          )}

          {booking.taxes && booking.taxes > 0 && (
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("booking.taxes")}
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                ${formatCurrency(booking.taxes)}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
              },
            ]}
          />

          <View style={styles.totalRow}>
            <Text
              style={[
                styles.totalLabel,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {t("booking.total")}
            </Text>
            <Text
              style={[
                styles.totalValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              ${formatCurrency(booking.totalPrice)}
            </Text>
          </View>
        </View>

        {/* Host Contact Section */}
        <View
          style={[
            styles.detailsSection,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("booking.contactHost")}
          </Text>

          <TouchableOpacity
            style={[
              styles.contactButton,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[200],
              },
            ]}
            onPress={() => router.push(`/inbox/${property.hostId}`)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={isDark ? theme.white : theme.colors.gray[900]}
            />
            <Text
              style={[
                styles.contactButtonText,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {t("booking.messageHost")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          {canCancel && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { borderColor: theme.colors.error[500] },
              ]}
              onPress={handleCancelBooking}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: theme.colors.error[500] },
                ]}
              >
                {t("booking.cancelReservation")}
              </Text>
            </TouchableOpacity>
          )}

          {canReview && (
            <TouchableOpacity
              style={[
                styles.reviewButton,
                { backgroundColor: theme.colors.primary[500] },
              ]}
              onPress={createReview}
            >
              <Text style={styles.reviewButtonText}>
                {t("booking.writeReview")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  scrollViewContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  retryButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  headerActionButton: {
    paddingHorizontal: spacing.md,
  },
  propertyCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  propertyImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  propertyCardContent: {
    padding: spacing.md,
  },
  propertyName: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  propertyHostInfo: {
    marginTop: spacing.xs,
  },
  hostedBy: {
    fontSize: fontSize.sm,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  statusText: {
    color: "white",
    fontSize: fontSize.sm,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  detailsSection: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.md,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  specialRequestsContainer: {
    marginTop: spacing.sm,
  },
  specialRequestsText: {
    fontSize: fontSize.md,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  paymentStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  paymentStatusText: {
    color: "white",
    fontSize: fontSize.xs,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: fontSize.xl,
    fontWeight: "700",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  contactButtonText: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginLeft: spacing.xs,
  },
  actionsContainer: {
    marginTop: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  reviewButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "500",
  },
});

export default BookingDetailsScreen;
