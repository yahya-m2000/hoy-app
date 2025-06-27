/**
 * Property Reviews Screen - Wishlist Tab
 * Dedicated reviews screen for wishlist tab navigation
 */

import React from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { PropertyReviewsScreen } from "@shared/screens/PropertyReviewsScreen";

export default function WishlistReviewsPage() {
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
