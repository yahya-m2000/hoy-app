/**
 * Property Reviews Screen - Properties Tab
 * Dedicated reviews screen for properties tab navigation
 */

import React from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { PropertyReviewsScreen } from "src/features/properties/screens/PropertyReviewsScreen";

export default function PropertiesReviewsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Stack>
      <Stack.Screen
        options={{
          title: "Reviews",
          headerShown: true,
        }}
      />
      <PropertyReviewsScreen propertyId={id!} />
    </Stack>
  );
}
