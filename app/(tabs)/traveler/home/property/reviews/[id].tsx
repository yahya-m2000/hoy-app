/**
 * Property Reviews Screen - Home Tab
 * Dedicated reviews screen for home tab navigation
 */

import React from "react";
import { useLocalSearchParams } from "expo-router";
import { PropertyReviewsScreen } from "@shared/screens/PropertyReviewsScreen";

export default function HomeReviewsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <PropertyReviewsScreen propertyId={id!} />;
}
