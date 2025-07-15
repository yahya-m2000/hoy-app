/**
 * Confirmation Step Component for Reservation Flow
 */

import React from "react";
import { Text, Container } from "@shared/components";
import { formatCurrency } from "@core/utils/data/formatting/data-formatters";
import { useTheme } from "@core/hooks/useTheme";
import { useTranslation } from "react-i18next";

interface ConfirmationStepProps {
  property: any;
  startDate: Date | null;
  endDate: Date | null;
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  selectedPaymentMethod: any;
  priceDetails: any;
  safePropertyPrice: number;
  formatDate: (date: Date | null) => string;
  calculateNights: () => number;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  property,
  startDate,
  endDate,
  adults,
  childrenCount,
  infants,
  pets,
  selectedPaymentMethod,
  priceDetails,
  safePropertyPrice,
  formatDate,
  calculateNights,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Container style={{ flex: 1 }}>
      {/* Booking Details */}
      <Container marginBottom="xl">
        <Container marginBottom="lg">
          <Text variant="h4" weight="bold" style={{ marginBottom: 8 }}>
            {t("reservation.bookingDetails", "Booking Details")}
          </Text>
          <Text variant="body">
            {t(
              "reservation.bookingDetailsDescription",
              "Review your reservation details before confirming"
            )}
          </Text>
        </Container>

        <Container marginBottom="lg">
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginBottom="md"
          >
            <Text variant="caption" weight="semibold" style={{ flex: 1 }}>
              {t("reservation.dates", "Dates")}
            </Text>
            <Text
              variant="body"
              weight="medium"
              style={{ flex: 2, textAlign: "right" }}
            >
              {startDate && endDate
                ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                : t("reservation.noDatesSelected", "No dates selected yet")}
            </Text>
          </Container>

          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginBottom="md"
          >
            <Text variant="caption" weight="semibold" style={{ flex: 1 }}>
              {t("reservation.guests", "Guests")}
            </Text>
            <Text
              variant="body"
              weight="medium"
              style={{ flex: 2, textAlign: "right" }}
            >
              {adults} {t("reservation.adults", "adults")}
              {childrenCount > 0
                ? `, ${childrenCount} ${t("reservation.children", "children")}`
                : ""}
              {infants > 0
                ? `, ${infants} ${t("reservation.infants", "infants")}`
                : ""}
              {pets > 0 ? `, ${pets} ${t("reservation.pets", "pets")}` : ""}
            </Text>
          </Container>

          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginBottom="md"
          >
            <Text variant="caption" weight="semibold" style={{ flex: 1 }}>
              {t("reservation.paymentMethod", "Payment Method")}
            </Text>
            <Text
              variant="body"
              weight="medium"
              style={{ flex: 2, textAlign: "right" }}
            >
              {selectedPaymentMethod?.name ||
                t("reservation.paymentMethodNotSelected", "Not selected")}
            </Text>
          </Container>
        </Container>
      </Container>

      {/* Price Breakdown */}
      {priceDetails && (
        <Container>
          <Container marginBottom="lg">
            <Text variant="h4" weight="bold" style={{ marginBottom: 8 }}>
              {t("reservation.priceBreakdown", "Price Breakdown")}
            </Text>
            <Text variant="body">
              {t(
                "reservation.priceBreakdownDescription",
                "Detailed breakdown of your total cost"
              )}
            </Text>
          </Container>

          <Container marginBottom="lg">
            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="sm"
            >
              <Text variant="caption" style={{ flex: 1 }}>
                {formatCurrency(safePropertyPrice)} x {calculateNights()}{" "}
                {t("reservation.nights", "nights")}
              </Text>
              <Text variant="body" weight="medium">
                {formatCurrency(safePropertyPrice * calculateNights())}
              </Text>
            </Container>

            {priceDetails.cleaningFee > 0 && (
              <Container
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="sm"
              >
                <Text variant="caption" style={{ flex: 1 }}>
                  {t("reservation.cleaningFee", "Cleaning fee")}
                </Text>
                <Text variant="body" weight="medium">
                  {formatCurrency(priceDetails.cleaningFee)}
                </Text>
              </Container>
            )}

            {priceDetails.serviceFee > 0 && (
              <Container
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="sm"
              >
                <Text variant="caption" style={{ flex: 1 }}>
                  {t("reservation.serviceFee", "Service fee")}
                </Text>
                <Text variant="body" weight="medium">
                  {formatCurrency(priceDetails.serviceFee)}
                </Text>
              </Container>
            )}

            {priceDetails.taxes > 0 && (
              <Container
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="sm"
              >
                <Text variant="caption" style={{ flex: 1 }}>
                  {t("reservation.taxes", "Taxes")}
                </Text>
                <Text variant="body" weight="medium">
                  {formatCurrency(priceDetails.taxes)}
                </Text>
              </Container>
            )}

            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              borderTopWidth={1}
              borderColor={
                isDark ? theme.colors.gray[700] : theme.colors.gray[200]
              }
              paddingTop="md"
              marginTop="md"
            >
              <Text variant="body" weight="semibold">
                {t("reservation.total", "Total")}
              </Text>

              <Text variant="h3" weight="bold">
                {formatCurrency(priceDetails.totalPrice)}
              </Text>
            </Container>
          </Container>
        </Container>
      )}
    </Container>
  );
};

export default ConfirmationStep;
