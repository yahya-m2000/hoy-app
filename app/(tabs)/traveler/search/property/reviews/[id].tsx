/**
 * Property Reviews Screen - Search Tab
 * Dedicated reviews screen for search tab navigation
 */

import React from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { PropertyReviewsScreen } from "@shared/screens/PropertyReviewsScreen";


export default function SearchReviewsPage() {
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
