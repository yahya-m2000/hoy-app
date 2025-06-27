/**
 * Property Reviews Screen - Stack Navigation
 * Entry point for reviews screen in the stack navigation context
 */

import React from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { PropertyReviewsScreen } from "@modules/properties/features/reviews/screens";

export default function PropertyReviewsPage() {
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
