/**
 * Booking Confirmation Screen for the Hoy application
 * Shown after a successful booking
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import * as Calendar from "expo-calendar";
import PaymentSummary from "../../src/components/PaymentSummary";
import { fontSize } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
// import { formatCurrency } from "../../src/utils/formatters";

const BookingConfirmationScreen = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  // const [showZaadDialog, setShowZaadDialog] = useState(false);

  const booking = params.booking ? JSON.parse(params.booking as string) : null;
  const property = booking?.property;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "EEE, MMM d, yyyy");
  };

  // Share booking details
  const handleShareBooking = async () => {
    if (!booking) return;

    try {
      const message = `I've just booked ${property.title || ""} in ${
        property.city
      }, ${property.country} from ${formatDate(
        booking.checkIn
      )} to ${formatDate(booking.checkOut)}! Can't wait!`;

      await Share.share({
        message,
        title: "My Upcoming Stay",
      });
    } catch (error) {
      console.error("Error sharing booking:", error);
    }
  };

  // Navigate to property
  // const handleViewProperty = () => {
  //   if (!property) return;

  //   router.push(
  //     "/(screens)/PropertyModalScreen?property=" +
  //       encodeURIComponent(JSON.stringify(property))
  //   );
  // };

  // Navigate to booking details
  const handleViewBooking = () => {
    if (!booking) return;

    router.push(`/bookings/${booking._id}`);
  };

  // Add to calendar
  const handleAddToCalendar = async () => {
    if (!booking) return;

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== "granted") {
        alert(t("booking.calendarPermissionDenied"));
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      const defaultCalendar =
        calendars.find((cal) => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        alert(t("booking.noCalendarFound"));
        return;
      }

      const startDate = new Date(booking.checkIn);
      const endDate = new Date(booking.checkOut);

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Stay at ${property.title || ""}`,
        location: `${property.address}, ${property.city}, ${property.country}`,
        startDate,
        endDate,
        timeZone: "UTC",
        alarms: [{ relativeOffset: -1440 }], // 1 day before
      });

      alert(t("booking.addedToCalendar"));
    } catch (error) {
      console.error("Error adding to calendar:", error);
      alert(t("booking.calendarError"));
    }
  };

  // Open directions
  const handleGetDirections = () => {
    if (!property) return;

    const address = `${property.address}, ${property.city}, ${property.country}`;
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address)}`;

    Linking.canOpenURL(mapsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mapsUrl);
        }
      })
      .catch((error) => console.error("Error opening maps:", error));
  };
  // Handle ZAAD USSD call
  const handleZaadPayment = async () => {
    try {
      // USSD code placeholder - this would eventually be dynamic
      const ussdCode = "*123*012345679#";

      // Different handling for iOS and Android
      if (Platform.OS === "ios") {
        // iOS doesn't support USSD directly, so we'll just open the dialer
        // The user will need to enter the code manually
        await Linking.openURL(`tel:`);

        // Show an alert with the code to dial
        Alert.alert(
          "ZAAD Payment",
          `Please manually enter ${ussdCode} in your dialer to complete the payment.`
        );
      } else {
        // For Android, we can try to directly open the USSD code
        // Remove any formatting that might interfere with the USSD code
        const cleanUssdCode = ussdCode.replace(/\s+/g, "");

        // Direct launch method - will work on most Android devices
        Linking.openURL(`tel:${cleanUssdCode}`).catch((err) => {
          console.error("Primary USSD method failed:", err);

          // Fallback - try without the # symbol which can cause issues on some devices
          if (cleanUssdCode.endsWith("#")) {
            const fallbackCode = cleanUssdCode.slice(0, -1);
            Linking.openURL(`tel:${fallbackCode}`)
              .then(() => {
                Alert.alert(
                  "ZAAD Payment",
                  "Please add # at the end of the USSD code to complete the payment."
                );
              })
              .catch((fallbackErr) => {
                console.error("Fallback USSD method failed:", fallbackErr);

                // If all else fails, just open the dialer
                Linking.openURL("tel:")
                  .then(() => {
                    Alert.alert(
                      "ZAAD Payment",
                      `Please manually enter ${ussdCode} in your dialer to complete the payment.`
                    );
                  })
                  .catch(() => {
                    Alert.alert(
                      "Error Opening Dialer",
                      `Could not open phone dialer. Please manually dial ${ussdCode} from your phone to complete the payment.`
                    );
                  });
              });
          } else {
            // Just open the dialer if the code doesn't end with #
            Linking.openURL("tel:")
              .then(() => {
                Alert.alert(
                  "ZAAD Payment",
                  `Please manually enter ${ussdCode} in your dialer to complete the payment.`
                );
              })
              .catch(() => {
                Alert.alert(
                  "Error Opening Dialer",
                  `Could not open phone dialer. Please manually dial ${ussdCode} from your phone to complete the payment.`
                );
              });
          }
        });
      }
    } catch (error) {
      console.error("Error launching dialer:", error);
      Alert.alert(
        "Error Opening Dialer",
        "Could not launch the phone dialer. Please manually dial *123*012345679# from your phone."
      );
    }
  };

  // Go to home screen
  const handleDone = () => {
    router.replace("/(tabs)");
  };

  if (!booking) {
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
        <Stack.Screen options={{ headerShown: false }} />
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
            {t("booking.bookingNotFound")}
          </Text>
          <Text
            style={[
              styles.errorMessage,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("booking.bookingNotFoundMessage")}
          </Text>
          <TouchableOpacity
            style={[
              styles.errorButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.errorButtonText}>{t("common.goHome")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calculate price details for payment summary
  const priceDetails = {
    basePrice: (property?.price || 0) * getNumberOfNights(),
    cleaningFee: booking.cleaningFee || 0,
    serviceFee: booking.serviceFee || 0,
    taxes: booking.taxes || 0,
    totalPrice: booking.totalPrice || 0,
    nights: getNumberOfNights(),
    pricePerNight: property?.price || 0,
  };

  function getNumberOfNights() {
    if (!booking.checkIn || !booking.checkOut) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

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
          headerShown: false,
          gestureEnabled: false,
          animation: "fade",
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Success Animation */}
        <View style={styles.successContainer}>
          <View
            style={[
              styles.successCircle,
              { backgroundColor: theme.colors.success[500] },
            ]}
          >
            <Ionicons name="checkmark" size={48} color="white" />
          </View>
          <Text
            style={[
              styles.successTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("booking.bookingConfirmed")}
          </Text>
          <Text
            style={[
              styles.successText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("booking.confirmationMessage")}
          </Text>
        </View>

        {/* Payment Status for ZAAD */}
        {booking.paymentType === "zaad" &&
          booking.paymentStatus === "pending" && (
            <View
              style={[
                styles.card,
                styles.zaadPaymentCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 193, 7, 0.2)"
                    : "rgba(255, 193, 7, 0.1)",
                  borderColor: theme.colors.warning[500],
                },
              ]}
            >
              <View style={styles.zaadPaymentContent}>
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color={theme.colors.warning[500]}
                />
                <View style={styles.zaadPaymentTextContainer}>
                  <Text
                    style={[
                      styles.zaadPaymentTitle,
                      {
                        color: isDark
                          ? theme.colors.warning[300]
                          : theme.colors.warning[800],
                      },
                    ]}
                  >
                    ZAAD Payment Pending
                  </Text>
                  <Text
                    style={[
                      styles.zaadPaymentText,
                      {
                        color: isDark
                          ? theme.colors.warning[300]
                          : theme.colors.warning[800],
                      },
                    ]}
                  >
                    Your booking is confirmed, but payment is pending.
                    {"\n"}
                    Dial the USSD code to complete payment.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.zaadPayButton,
                  { backgroundColor: theme.colors.warning[500] },
                ]}
                onPress={handleZaadPayment}
              >
                <Text style={styles.zaadPayButtonText}>Pay Now with ZAAD</Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Property Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
            },
          ]}
        >
          {property?.images && property.images.length > 0 && (
            <Image
              source={{ uri: property.images[0] }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.cardContent}>
            <Text
              style={[
                styles.propertyName,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {property?.title}
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
              {property?.city}, {property?.country}
            </Text>

            <View style={styles.dateContainer}>
              <View style={styles.dateItem}>
                <Text
                  style={[
                    styles.dateLabel,
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
                    styles.dateValue,
                    { color: isDark ? theme.white : theme.colors.gray[900] },
                  ]}
                >
                  {formatDate(booking.checkIn)}
                </Text>
              </View>

              <View style={styles.dateItem}>
                <Text
                  style={[
                    styles.dateLabel,
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
                    styles.dateValue,
                    { color: isDark ? theme.white : theme.colors.gray[900] },
                  ]}
                >
                  {formatDate(booking.checkOut)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("booking.paymentDetails")}
          </Text>

          <PaymentSummary priceDetails={priceDetails} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareBooking}
          >
            <Ionicons
              name="share-social"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text
              style={[
                styles.actionText,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {t("booking.shareBooking")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToCalendar}
          >
            <Ionicons
              name="calendar"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text
              style={[
                styles.actionText,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {t("booking.addToCalendar")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGetDirections}
          >
            <Ionicons
              name="navigate"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text
              style={[
                styles.actionText,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {t("booking.directions")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              { borderColor: theme.colors.primary[500] },
            ]}
            onPress={handleViewBooking}
          >
            <Text
              style={[
                styles.viewButtonText,
                { color: theme.colors.primary[500] },
              ]}
            >
              {t("booking.viewBookingDetails")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.doneButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={handleDone}
          >
            <Text style={styles.doneButtonText}>{t("common.done")}</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Information */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
              marginTop: spacing.md,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("booking.guests")}
          </Text>

          <View style={styles.guestInfoContainer}>
            <Text
              style={[
                styles.guestInfo,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {booking.guests.adults} {t("booking.adults")}
              {booking.guests.children > 0 &&
                `, ${booking.guests.children} ${t("booking.childrenShort")}`}
              {booking.guests.infants > 0 &&
                `, ${booking.guests.infants} ${t("booking.infantsShort")}`}
              {booking.guests.pets > 0 &&
                `, ${booking.guests.pets} ${t("booking.petsShort")}`}
            </Text>
          </View>
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
    padding: spacing.lg,
    paddingBottom: 100,
  },
  // Success animation styles
  successContainer: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: fontSize.md,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  // ZAAD Payment styles
  zaadPaymentCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  zaadPaymentContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  zaadPaymentTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  zaadPaymentTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  zaadPaymentText: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
  },
  zaadPayButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignSelf: "flex-end",
  },
  zaadPayButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: fontSize.sm,
  },
  // Property card styles
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  propertyImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  propertyName: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  dateValue: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  // Action buttons styles
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.md,
  },
  actionButton: {
    alignItems: "center",
    padding: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  // Bottom buttons
  buttonsContainer: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  viewButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  doneButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    marginLeft: spacing.sm,
  },
  doneButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: "white",
  },
  // Error state
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  errorButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  errorButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: "white",
  },
  // Guest information styles
  guestInfoContainer: {
    marginVertical: spacing.sm,
  },
  guestInfo: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
  },
});

export default BookingConfirmationScreen;
