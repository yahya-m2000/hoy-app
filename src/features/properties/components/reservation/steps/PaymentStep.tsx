/**
 * Payment Step Component for Reservation Flow
 * Modern, clean design with improved visual hierarchy and user experience
 */

import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Text, Container, Icon } from "@shared/components";
import { PaymentMethodSelector } from "@features/booking";
import { useTheme } from "@core/hooks/useTheme";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingGuests, setIsEditingGuests] = useState(false);

  // Create debounced versions to prevent multiple rapid calls
  const handleEditDates = () => {
    if (isEditingDates) return;
    setIsEditingDates(true);
    setTimeout(() => {
      onEditDates();
      setTimeout(() => {
        setIsEditingDates(false);
      }, 1000);
    }, 300);
  };

  const handleEditGuests = () => {
    if (isEditingGuests) return;
    setIsEditingGuests(true);
    setTimeout(() => {
      onEditGuests();
      setTimeout(() => {
        setIsEditingGuests(false);
      }, 1000);
    }, 300);
  };

  return (
    <Container style={{ flex: 1 }}>
      {/* Header Section */}
      <Container marginBottom="xl">
        <Text variant="h4" weight="bold" style={{ marginBottom: 8 }}>
          {t("reservation.paymentMethod", "Payment Method")}
        </Text>
        <Text variant="body">
          {t(
            "reservation.selectPaymentMethod",
            "Choose how you'd like to pay for your stay"
          )}
        </Text>
      </Container>

      {/* Summary Section */}
      <Container marginBottom="xl">
        {/* Date Summary */}
        <Container marginBottom="md">
          <Container marginBottom="sm">
            <Text
              variant="caption"
              weight="semibold"
              style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {t("reservation.selectedDates", "Selected Dates")}
            </Text>
          </Container>

          <TouchableOpacity onPress={handleEditDates} disabled={isEditingDates}>
            <Container
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Container style={{ flex: 1 }}>
                <Text variant="body" weight="semibold">
                  {startDate && endDate
                    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                    : t("reservation.selectDates", "Select dates")}
                </Text>
                <Container
                  flexDirection="row"
                  alignItems="center"
                  marginTop="xs"
                >
                  <Icon name="calendar" size={14} />
                  <Text variant="caption" style={{ marginLeft: 6 }}>
                    {t("reservation.editDates", "Tap to edit")}
                  </Text>
                </Container>
              </Container>
              <Container>
                <Icon name="pencil" size={16} />
              </Container>
            </Container>
          </TouchableOpacity>
        </Container>

        {/* Guest Summary */}
        <Container>
          <Container marginBottom="sm">
            <Text
              variant="caption"
              weight="semibold"
              style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {t("reservation.guestSummary", "Guest Summary")}
            </Text>
          </Container>

          <TouchableOpacity
            onPress={handleEditGuests}
            disabled={isEditingGuests}
          >
            <Container
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Container style={{ flex: 1 }}>
                <Text variant="body" weight="semibold">
                  {adults + childrenCount} {t("reservation.guests", "guests")}
                  {pets > 0 && `, ${pets} ${t("reservation.pets", "pets")}`}
                </Text>
                <Container
                  flexDirection="row"
                  alignItems="center"
                  marginTop="xs"
                >
                  <Icon name="people" size={14} />
                  <Text variant="caption" style={{ marginLeft: 6 }}>
                    {t("reservation.editGuests", "Tap to edit")}
                  </Text>
                </Container>
              </Container>
              <Container>
                <Icon name="pencil" size={16} />
              </Container>
            </Container>
          </TouchableOpacity>
        </Container>
      </Container>

      {/* Payment Method Selector */}
      <Container>
        <Container marginBottom="lg">
          <Text variant="h6" weight="semibold">
            {t("reservation.choosePaymentMethod", "Choose Payment Method")}
          </Text>
          <Text variant="caption" style={{ marginTop: 4 }}>
            {t(
              "reservation.paymentMethodDescription",
              "Select your preferred payment option"
            )}
          </Text>
        </Container>

        <PaymentMethodSelector
          selectedMethod={selectedPaymentMethod}
          onSelect={onSelectPaymentMethod}
        />
      </Container>

      {/* Payment Security Notice */}
      <Container marginTop="lg">
        <Container flexDirection="row" alignItems="center">
          <Container marginRight="md">
            <Icon
              name="shield-checkmark"
              size={16}
              color={theme.colors.success}
            />
          </Container>
          <Container flex={1}>
            <Text
              variant="caption"
              weight="semibold"
              color={theme.colors.success}
              style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {t("reservation.securePayment", "Secure Payment")}
            </Text>
            <Text
              variant="caption"
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
              style={{ marginTop: 2 }}
            >
              {t(
                "reservation.paymentSecurity",
                "Your payment information is encrypted and secure"
              )}
            </Text>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default PaymentStep;
