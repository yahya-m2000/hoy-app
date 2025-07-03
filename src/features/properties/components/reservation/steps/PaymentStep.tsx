/**
 * Payment Step Component for Reservation Flow
 */

import React from "react";
import { TouchableOpacity } from "react-native";
import { Text, Container } from "@shared/components";
import { PaymentMethodSelector } from "@features/booking";
import { useTheme } from "@core/hooks/useTheme";

interface PaymentStepProps {
  startDate: Date | null;
  endDate: Date | null;
  adults: number;
  childrenCount: number;
  pets: number;
  selectedPaymentMethod: any;
  onSelectPaymentMethod: (method: any) => void;
  formatDate: (date: Date | null) => string;
  onEditDates: () => void;
  onEditGuests: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  startDate,
  endDate,
  adults,
  childrenCount,
  pets,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  formatDate,
  onEditDates,
  onEditGuests,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Container style={{ flex: 1 }}>
      {/* Date and Guest Summary */}
      <Container marginBottom="lg">
        <TouchableOpacity onPress={onEditDates}>
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingVertical="md"
            paddingHorizontal="md"
            borderBottomWidth={1}
            style={{ borderColor: "rgba(0, 0, 0, 0.1)" }}
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
                : "Select dates"}
            </Text>
          </Container>
        </TouchableOpacity>

        <TouchableOpacity onPress={onEditGuests}>
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingVertical="md"
            paddingHorizontal="md"
            borderBottomWidth={1}
            borderColor="rgba(0, 0, 0, 0.1)"
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
              {adults + childrenCount} guests{pets > 0 ? `, ${pets} pets` : ""}
            </Text>
          </Container>
        </TouchableOpacity>
      </Container>

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        selectedMethod={selectedPaymentMethod}
        onSelect={onSelectPaymentMethod}
      />
    </Container>
  );
};

export default PaymentStep;
