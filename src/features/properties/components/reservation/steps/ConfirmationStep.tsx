/**
 * Confirmation Step Component for Reservation Flow
 */

import React from "react";
import { Text, Container } from "@shared/components";
import { formatCurrency } from "@core/utils/data/formatting/data-formatters";
import { useTheme } from "@core/hooks/useTheme";

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

  return (
    <Container style={{ flex: 1 }}>
      <Container padding="md">
        {/* Booking Details */}
        <Container
          marginBottom="lg"
          paddingBottom="lg"
          borderBottomWidth={1}
          style={{ borderColor: "rgba(0, 0, 0, 0.1)" }}
        >
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginBottom="md"
          >
            <Text
              variant="caption"
              color={theme.colors.gray[600]}
              style={{ flex: 1 }}
            >
              Dates
            </Text>
            <Text
              variant="body"
              weight="medium"
              color={isDark ? theme.white : theme.colors.gray[900]}
              style={{ flex: 2, textAlign: "right" }}
            >
              {startDate && endDate
                ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                : ""}
            </Text>
          </Container>

          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginBottom="md"
          >
            <Text
              variant="caption"
              color={theme.colors.gray[600]}
              style={{ flex: 1 }}
            >
              Guests
            </Text>
            <Text
              variant="body"
              weight="medium"
              color={isDark ? theme.white : theme.colors.gray[900]}
              style={{ flex: 2, textAlign: "right" }}
            >
              {adults} adults
              {childrenCount > 0 ? `, ${childrenCount} children` : ""}
              {infants > 0 ? `, ${infants} infants` : ""}
              {pets > 0 ? `, ${pets} pets` : ""}
            </Text>
          </Container>

          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="flex-start"
            marginBottom="md"
          >
            <Text
              variant="caption"
              color={theme.colors.gray[600]}
              style={{ flex: 1 }}
            >
              Payment Method
            </Text>
            <Text
              variant="body"
              weight="medium"
              color={isDark ? theme.white : theme.colors.gray[900]}
              style={{ flex: 2, textAlign: "right" }}
            >
              {selectedPaymentMethod?.name || "Not selected"}
            </Text>
          </Container>
        </Container>

        {/* Price Breakdown */}
        {priceDetails && (
          <Container marginBottom="lg">
            <Text
              variant="h3"
              weight="semibold"
              color={isDark ? theme.white : theme.colors.gray[900]}
              style={{ marginBottom: theme.spacing.md }}
            >
              Price breakdown
            </Text>

            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              marginBottom="sm"
            >
              <Text
                variant="caption"
                color={theme.colors.gray[600]}
                style={{ flex: 1 }}
              >
                {formatCurrency(safePropertyPrice)} x {calculateNights()} nights
              </Text>
              <Text
                variant="body"
                weight="medium"
                color={isDark ? theme.white : theme.colors.gray[900]}
              >
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
                <Text
                  variant="caption"
                  color={theme.colors.gray[600]}
                  style={{ flex: 1 }}
                >
                  Cleaning fee
                </Text>
                <Text
                  variant="body"
                  weight="medium"
                  color={isDark ? theme.white : theme.colors.gray[900]}
                >
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
                <Text
                  variant="caption"
                  color={theme.colors.gray[600]}
                  style={{ flex: 1 }}
                >
                  Service fee
                </Text>
                <Text
                  variant="body"
                  weight="medium"
                  color={isDark ? theme.white : theme.colors.gray[900]}
                >
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
                <Text
                  variant="caption"
                  color={theme.colors.gray[600]}
                  style={{ flex: 1 }}
                >
                  Taxes
                </Text>
                <Text
                  variant="body"
                  weight="medium"
                  color={isDark ? theme.white : theme.colors.gray[900]}
                >
                  {formatCurrency(priceDetails.taxes)}
                </Text>
              </Container>
            )}

            <Container
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              borderTopWidth={1}
              style={{ borderTopColor: "rgba(0, 0, 0, 0.1)" }}
              paddingTop="md"
              marginTop="md"
            >
              <Text
                variant="body"
                weight="semibold"
                color={isDark ? theme.white : theme.colors.gray[900]}
              >
                Total
              </Text>
              <Text
                variant="h3"
                weight="bold"
                color={isDark ? theme.white : theme.colors.gray[900]}
              >
                {formatCurrency(priceDetails.totalPrice)}
              </Text>
            </Container>
          </Container>
        )}
      </Container>
    </Container>
  );
};

export default ConfirmationStep;
