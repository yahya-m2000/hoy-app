import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, useDateSelection } from "@shared/context";
import { spacing } from "@shared/constants";
import { Calendar } from "@shared/components";

const AvailabilityCalendarScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const { selectDatesForProperty } = useDateSelection();
  // Get property data from params
  const propertyId = params.propertyId as string;

  // Mock data - in real app this would come from property availability API
  const blockedDates = [
    new Date(2024, 11, 15), // December 15, 2024
    new Date(2024, 11, 16), // December 16, 2024
    new Date(2024, 11, 25), // December 25, 2024
    new Date(2024, 11, 26), // December 26, 2024
    new Date(2025, 0, 1), // January 1, 2025
  ];

  const bookingRanges = [
    {
      start: new Date(2024, 11, 10), // December 10, 2024
      end: new Date(2024, 11, 12), // December 12, 2024
    },
    {
      start: new Date(2024, 11, 20), // December 20, 2024
      end: new Date(2024, 11, 22), // December 22, 2024
    },
  ];

  const handleDateSelect = (startDate: Date, endDate?: Date) => {
    if (!startDate || !endDate || !propertyId) {
      console.log("Invalid date selection or missing property ID");
      return;
    }

    console.log("Selected dates:", { startDate, endDate, propertyId });

    // Update dates for the specific property
    selectDatesForProperty(propertyId, {
      startDate,
      endDate,
    });

    // Navigate back to property details
    router.back();
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.white,
        },
      ]}
    >
      {" "}
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.colors.white,
            borderBottomColor: isDark
              ? theme.colors.grayPalette[700]
              : theme.colors.grayPalette[200],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${theme.colors.primary}15` },
              ]}
            >
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[100]
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                Select Dates
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[400]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                Choose your check-in and check-out dates
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.grayPalette[100],
              },
            ]}
            onPress={() => router.back()}
          >
            <MaterialIcons
              name="close"
              size={18}
              color={
                isDark
                  ? theme.colors.grayPalette[300]
                  : theme.colors.grayPalette[600]
              }
            />
          </TouchableOpacity>
        </View>
      </View>{" "}
      <Calendar
        blockedDates={blockedDates}
        bookingRanges={bookingRanges}
        onDateSelect={handleDateSelect}
        enableRangeSelection={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    marginTop: 2,
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AvailabilityCalendarScreen;
