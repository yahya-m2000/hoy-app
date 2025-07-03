/**
 * Property Reviews Screen - Bookings Tab
 * Dedicated reviews screen for bookings tab navigation
 */

import React from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { PropertyReviewsScreen } from "src/features/properties/screens/PropertyReviewsScreen";

export default function BookingsReviewsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Reviews",
          headerShown: true,
        }}
      />
      <PropertyReviewsScreen propertyId={id!} />
    </>
  );
}
