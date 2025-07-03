/**
 * Property Reviews Screen - Search Tab
 * Dedicated reviews screen for search tab navigation
 */

import React from "react";
import { useLocalSearchParams } from "expo-router";
import { PropertyReviewsScreen } from "src/features/properties/screens/PropertyReviewsScreen";

export default function SearchReviewsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PropertyReviewsScreen propertyId={id!} />;
}
