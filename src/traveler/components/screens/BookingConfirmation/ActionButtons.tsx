/**
 * Action Buttons Component
 * Displays action buttons for sharing, calendar, and directions
 */

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
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@common/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import * as Calendar from "expo-calendar";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";

interface Property {
  title?: string;
  city?: string;
  country?: string;
  address?: string;
}

interface Booking {
  checkIn: string;
  checkOut: string;
  property: Property;
}

interface ActionButtonsProps {
  booking: Booking;
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
        title: `Stay at ${property.title || ""}`,
        location: `${property.address}, ${property.city}, ${property.country}`,
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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.actionButton} onPress={handleShareBooking}>
        <Ionicons name="share-social" size={24} color={theme.colors.primary} />
        <Text
          style={[
            styles.actionText,
            { color: isDark ? theme.white : theme.colors.grayPalette[900] },
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
            { color: isDark ? theme.white : theme.colors.grayPalette[900] },
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
            { color: isDark ? theme.white : theme.colors.grayPalette[900] },
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
