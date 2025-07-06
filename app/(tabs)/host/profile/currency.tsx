/**
 * Currency Selection Screen
 * Uses the dynamic settings approach
 */

import React from "react";
import { DynamicSettingsScreen } from "@features/account/components/DynamicSettingsScreen";

export default function CurrencyScreen() {
  return <DynamicSettingsScreen settingType="currency" />;
}
