/**
 * Dynamic Settings Route for Traveler Profile
 * Handles dynamic settings screens based on the setting parameter
 */

import React from "react";
import { useLocalSearchParams } from "expo-router";
import { DynamicSettingsScreen } from "@features/account/components/DynamicSettingsScreen";

export default function TravelerSettingScreen() {
  const { setting } = useLocalSearchParams<{ setting: string }>();

  return <DynamicSettingsScreen settingType={setting || ""} />;
}
