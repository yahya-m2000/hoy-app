// React and React Native
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Linking,
  Alert,
} from "react-native";

// External Libraries
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import * as Calendar from "expo-calendar";

// Shared Context and Hooks
import { useTheme } from "@core/hooks";

// Shared Constants
import { fontSize, spacing } from "@core/design";

// Types
import type { PopulatedBooking } from "@core/types";

interface ActionButtonsProps {
  booking: PopulatedBooking;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ booking }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { property } = booking;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "EEE, MMM d, yyyy");
  };
  // Share booking details
  const handleShareBooking = async () => {
    if (!booking || !property) return;

    try {
      const message = `I've just booked ${property.title || "a property"} in ${
        property.locationString || "unknown location"
      } from ${formatDate(booking.checkIn)} to ${formatDate(
        booking.checkOut
      )}! Can't wait!`;

      await Share.share({
        message,
        title: "My Upcoming Stay",
      });
    } catch (error) {
      console.error("Error sharing booking:", error);
    }
  };

  // Add to calendar
  const handleAddToCalendar = async () => {
    if (!booking) return;

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          t("booking.calendarPermissionDenied")
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      const defaultCalendar =
        calendars.find((cal) => cal.isPrimary) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert("Error", t("booking.noCalendarFound"));
        return;
      }
      const startDate = new Date(booking.checkIn);
      const endDate = new Date(booking.checkOut);
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Stay at ${property?.title || "Property"}`,
        location: property?.locationString || "",
        startDate,
        endDate,
        timeZone: "UTC",
        alarms: [{ relativeOffset: -1440 }], // 1 day before
      });

      Alert.alert("Success", t("booking.addedToCalendar"));
    } catch (error) {
      console.error("Error adding to calendar:", error);
      Alert.alert("Error", t("booking.calendarError"));
    }
  };
  // Open directions
  const handleGetDirections = () => {
    if (!property?.locationString) return;

    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
      property.locationString
    )}`;

    Linking.canOpenURL(mapsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mapsUrl);
        }
      })
      .catch((error) => console.error("Error opening maps:", error));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleShareBooking}
      >
        <Ionicons name="share-social" size={24} color={theme.colors.primary} />
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
        <Ionicons name="calendar" size={24} color={theme.colors.primary} />
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
        <Ionicons name="navigate" size={24} color={theme.colors.primary} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  actionButton: {
    alignItems: "center",
    padding: spacing.sm,
    flex: 1,
  },
  actionText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default ActionButtons;
