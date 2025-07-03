/**
 * PropertyAvailability - Shows availability dates for properties
 * Displays either search dates or default "Available year round" text
 */

import React from "react";
import { TextStyle } from "react-native";
import { Text } from "@shared/components";
import { useTheme } from "@core/hooks";
import { fontSize, fontWeight } from "@core/design";
import { useDateSelection } from "@features/calendar/context/DateSelectionContext";

export interface PropertyAvailabilityProps {
  /** Custom text styles */
  style?: TextStyle;
  /** Size variant */
  variant?: "small" | "large";
  /** Custom start date override */
  startDate?: Date;
  /** Custom end date override */
  endDate?: Date;
}
const PropertyAvailability: React.FC<PropertyAvailabilityProps> = ({
  style,
  variant = "large",
  startDate: customStartDate,
  endDate: customEndDate,
}) => {
  const { theme, isDark } = useTheme();
  const { searchDates } = useDateSelection();

  const textSize = variant === "small" ? fontSize.xs - 1 : fontSize.sm;
  const textColor = isDark ? theme.colors.gray[400] : theme.colors.gray[500];

  const startDate = customStartDate || searchDates.startDate;
  const endDate = customEndDate || searchDates.endDate;

  const availabilityText =
    startDate && endDate
      ? `${startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`
      : "Available year round";

  return (
    <Text
      style={[
        {
          fontSize: textSize,
          fontWeight: fontWeight.normal,
          color: textColor,
          lineHeight: textSize * 1.1,
        },
        style,
      ]}
    >
      {availabilityText}
    </Text>
  );
};

export default PropertyAvailability;
