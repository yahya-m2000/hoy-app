/**
 * BookingsSection Component
 * Section container for organizing bookings (upcoming/past)
 * Features beautiful booking cards in a grid layout
 */

// React and React Native
import React from "react";
import { FlatList, Dimensions } from "react-native";
import { useRouter } from "expo-router";

// Base Components
import { Container, Text, EmptyState } from "@shared/components";

// Booking Components
import { BookingCard } from "@features/booking/components/Card";

// Shared Context and Hooks
import { useTheme } from "@core/hooks";

// Constants
import { spacing, radius } from "@core/design";

// Types
import type { PopulatedBooking } from "@core/types";

interface BookingsSectionProps {
  title: string;
  bookings: PopulatedBooking[];
  isUpcoming: boolean;
  isLoading: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

export const BookingsSection: React.FC<BookingsSectionProps> = ({
  title,
  bookings,
  isUpcoming,
  isLoading,
}) => {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  // Calculate card dimensions for responsive grid
  const cardMargin = spacing.md;
  const containerPadding = spacing.md * 2; // padding on both sides
  const cardWidth = (screenWidth - containerPadding - cardMargin) / 2; // 2 columns

  // Render individual booking card
  const renderBookingCard = ({ item }: { item: PopulatedBooking }) => (
    <Container
      style={{
        width: cardWidth,
        marginRight: spacing.md,
        marginBottom: spacing.lg,
      }}
    >
      <BookingCard booking={item} isUpcoming={isUpcoming} />
    </Container>
  );

  // Render section header
  const renderSectionHeader = () => (
    <Container
      marginBottom="lg"
      style={{
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
      }}
    >
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Container>
          <Text
            variant="h6"
            weight="bold"
            color={theme.text.primary}
            style={{ marginBottom: 2 }}
          >
            {title}
          </Text>
          <Text variant="caption" color={theme.text.secondary} weight="medium">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
          </Text>
        </Container>
      </Container>
    </Container>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Container
      paddingVertical="xxl"
      alignItems="center"
      style={{
        borderRadius: radius.xl,
        marginTop: spacing.md,
      }}
    >
      {isLoading ? (
        <Container alignItems="center">
          <Container
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark
                ? theme.colors.gray[600]
                : theme.colors.gray[200],
              marginBottom: spacing.md,
            }}
          >
            <></>
          </Container>
          <Text
            variant="body"
            color={theme.text.secondary}
            style={{ textAlign: "center" }}
          >
            Loading your {isUpcoming ? "upcoming" : "past"} bookings...
          </Text>
        </Container>
      ) : (
        <EmptyState
          icon={isUpcoming ? "calendar-outline" : "time-outline"}
          title={isUpcoming ? "No upcoming trips" : "No booking history"}
          message={
            isUpcoming
              ? "Ready for your next adventure? Start exploring amazing properties!"
              : "Your completed and cancelled bookings will appear here."
          }
          action={
            isUpcoming
              ? {
                  label: "Explore Properties",
                  onPress: () => router.push("/(tabs)/traveler/search"),
                }
              : undefined
          }
        />
      )}
    </Container>
  );

  return (
    <Container marginBottom="xl">
      {/* Section Header */}
      {renderSectionHeader()}

      {/* Bookings Grid or Empty State */}
      {bookings.length > 0 ? (
        <Container>
          <FlatList
            data={bookings}
            renderItem={renderBookingCard}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Disable scroll since this is inside a ScrollView
            ItemSeparatorComponent={() => (
              <Container height={spacing.sm}>
                <></>
              </Container>
            )}
            contentContainerStyle={{
              paddingBottom: spacing.md,
            }}
          />
        </Container>
      ) : (
        renderEmptyState()
      )}
    </Container>
  );
};
