/**
 * BookingsSection Component
 * Section container for organizing bookings (upcoming/past)
 */

// React and React Native
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Shared Context and Hooks
import { useTheme } from "@shared/context/ThemeContext";

// Components
import BookingCard from "../Card/BookingCard";
import { BookingEmptyState } from "../States";

// Shared Constants
import { fontSize } from "@shared/constants/typography";
import { spacing } from "@shared/constants/spacing";

// Types
import type { PopulatedBooking } from "@shared/types/booking";

interface BookingsSectionProps {
  title: string;
  bookings: PopulatedBooking[];
  isUpcoming: boolean;
  isLoading: boolean;
}

export const BookingsSection: React.FC<BookingsSectionProps> = ({
  title,
  bookings,
  isUpcoming,
  isLoading,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDark ? theme.white : theme.colors.gray[900] },
        ]}
      >
        {title}
      </Text>

      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            isUpcoming={isUpcoming}
          />
        ))
      ) : (
        <BookingEmptyState isUpcoming={isUpcoming} isLoading={isLoading} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
});
