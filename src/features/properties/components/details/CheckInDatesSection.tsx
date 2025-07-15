/**
 * CheckInDatesSection Component
 * Displays check-in and checkout dates with formatting
 */

import React from "react";
import { TouchableOpacity } from "react-native";
import { Text, Container } from "@shared/components";
import { t } from "i18next";

interface CheckInDatesSectionProps {
  checkIn: {
    date: Date | null;
    time?: string;
  };
  checkOut: {
    date: Date | null;
    time?: string;
  };
  onPress?: () => void;
}

export const CheckInDatesSection: React.FC<CheckInDatesSectionProps> = ({
  checkIn,
  checkOut,
  onPress,
}) => {
  const formatDate = (date: Date | null) => {
    if (!date) return t("common.notSelected");

    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "2-digit",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Check if dates are selected
  const hasDatesSelected = checkIn.date && checkOut.date;
  const linkText = hasDatesSelected
    ? t("property.changeDates")
    : t("property.common.selectDates");

  const ContentComponent = (
    <>
      <Container
        flexDirection="row"
        borderRadius="md"
        backgroundColor="card"
        marginBottom="md"
      >
        {/* Check In */}
        <Container flex={1} padding="md">
          <Text weight="bold" color="primary">
            {t("property.common.checkIn")}
          </Text>
          <Text variant="body" color="subtitle">
            {formatDate(checkIn.date)}
          </Text>
          {checkIn.time && (
            <Text variant="body" color="subtitle">
              {checkIn.time}
            </Text>
          )}
        </Container>
        {/* Check Out */}
        <Container flex={1} alignItems="flex-end" padding="md">
          <Text weight="bold" color="primary">
            {t("property.common.checkout")}
          </Text>
          <Text variant="body" color="subtitle">
            {formatDate(checkOut.date)}
          </Text>
          {checkOut.time && (
            <Text variant="body" color="subtitle">
              {checkOut.time}
            </Text>
          )}
        </Container>
      </Container>

      {/* Change/Select Dates Link */}
      {onPress && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Container alignItems="flex-start" marginBottom="md">
            <Text
              variant="body"
              color="primary"
              weight="medium"
              style={{ textDecorationLine: "underline" }}
            >
              {linkText}
            </Text>
          </Container>
        </TouchableOpacity>
      )}
    </>
  );

  return ContentComponent;
};

export default CheckInDatesSection;
