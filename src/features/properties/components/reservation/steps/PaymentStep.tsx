/**
 * Payment Step Component for Reservation Flow
 * Modern, clean design with improved visual hierarchy and user experience
 * Enhanced with ZAAD payment integration and notification support
 */

import React, { useState } from "react";
import { TouchableOpacity, Platform, Alert } from "react-native";
import { Text, Container, Icon, Button } from "@shared/components";
import { PaymentMethodSelector } from "@features/booking";
import { useTheme } from "@core/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { ZaadUtils } from "@core/utils/zaad.utils";
import { notificationService } from "@core/services/notification.service";

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
  property?: any;
  unit?: any;
  totalAmount?: string;
  currency?: string;
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
  property,
  unit,
  totalAmount = "0",
  currency = "USD",
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingGuests, setIsEditingGuests] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  // Handle ZAAD payment processing
  const handleZaadPayment = async () => {
    if (!selectedPaymentMethod || selectedPaymentMethod.type !== 'zaad') {
      return;
    }

    setIsProcessingPayment(true);

    try {
      const zaadNumber = selectedPaymentMethod.details?.phone || '';
      const hostPhone = property?.host?.phone || property?.owner?.phone || '';
      const hostName = property?.host?.name || property?.owner?.name || 'Host';
      const propertyName = property?.title || property?.name || 'Property';

      if (!zaadNumber || !ZaadUtils.validateZaadNumber(zaadNumber.replace(/\D/g, ''))) {
        throw new Error('Invalid ZAAD number');
      }

      const paymentDetails = {
        hostPhone,
        zaadNumber: zaadNumber.replace(/\D/g, ''),
        amount: totalAmount.replace(/[^\d.]/g, ''),
        currency,
        reservationId: `temp_${Date.now()}`, // Will be replaced with actual reservation ID
        propertyName,
        hostName,
      };

      // Get current language preference
      const currentLanguage = t('common.language') === 'Somali' ? 'so' : 'en';

      await ZaadUtils.processZaadPayment(paymentDetails, currentLanguage);

    } catch (error) {
      console.error('Error processing ZAAD payment:', error);
      const isEnglish = t('common.language') !== 'Somali';
      Alert.alert(
        isEnglish ? 'Payment Error' : 'Khalad Bixin',
        isEnglish 
          ? 'There was an error processing your payment request. Please try again.'
          : 'Khalad ayaa ka dhacay bixintaada. Fadlan isku day mar kale.',
        [{ text: isEnglish ? 'OK' : 'Haa' }]
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Container style={{ flex: 1 }}>
      {/* Header Section */}
      <Container marginBottom="xl">
        <Text variant="h4" weight="bold" style={{ marginBottom: 8 }}>
          {t("features.booking.flow.paymentMethod", "Payment Method")}
        </Text>
        <Text variant="body">
          {t(
            "features.booking.flow.selectPaymentMethod",
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
              {t("features.booking.flow.selectedDates", "Selected Dates")}
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
                    : t("features.booking.flow.selectDates", "Select dates")}
                </Text>
                <Container
                  flexDirection="row"
                  alignItems="center"
                  marginTop="xs"
                >
                  <Icon name="calendar" size={14} />
                  <Text variant="caption" style={{ marginLeft: 6 }}>
                    {t("features.booking.flow.editDates", "Tap to edit")}
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
              {t("features.booking.flow.guestSummary", "Guest Summary")}
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
                  {adults + childrenCount} {t("features.booking.flow.guests", "guests")}
                  {pets > 0 && `, ${pets} ${t("features.booking.flow.pets", "pets")}`}
                </Text>
                <Container
                  flexDirection="row"
                  alignItems="center"
                  marginTop="xs"
                >
                  <Icon name="people" size={14} />
                  <Text variant="caption" style={{ marginLeft: 6 }}>
                    {t("features.booking.flow.editGuests", "Tap to edit")}
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
            {t("features.booking.flow.choosePaymentMethod", "Choose Payment Method")}
          </Text>
          <Text variant="caption" style={{ marginTop: 4 }}>
            {t(
              "features.booking.flow.paymentMethodDescription",
              "Select your preferred payment option"
            )}
          </Text>
        </Container>

        <PaymentMethodSelector
          selectedMethod={selectedPaymentMethod}
          onSelect={onSelectPaymentMethod}
        />
      </Container>

      {/* ZAAD Payment Instructions */}
      {selectedPaymentMethod?.type === 'zaad' && (
        <Container marginTop="lg" marginBottom="lg">
          <Container
            backgroundColor={isDark ? theme.colors.gray[800] : theme.colors.gray[50]}
            padding="lg"
            borderRadius="lg"
            marginBottom="md"
          >
            <Container flexDirection="row" alignItems="center" marginBottom="sm">
              <Icon 
                name="information-circle" 
                size={20} 
                color={theme.colors.primary} 
                style={{ marginRight: 8 }}
              />
              <Text variant="body" weight="semibold">
                {t("reservation.zaadInstructions", "ZAAD Payment Instructions")}
              </Text>
            </Container>
            
            <Text variant="caption" style={{ lineHeight: 18, marginBottom: 12 }}>
              {t("reservation.zaadDescription", 
                "You will receive a notification with payment details. Use the ZAAD code to complete your payment."
              )}
            </Text>

            {Platform.OS === 'android' && (
              <Container marginTop="sm">
                <Text variant="caption" weight="semibold" color={theme.colors.success}>
                  {t("reservation.androidFeature", "✓ Auto-dial ZAAD code")}
                </Text>
                <Text variant="caption" weight="semibold" color={theme.colors.success}>
                  {t("reservation.androidContact", "✓ Save to contacts")}
                </Text>
              </Container>
            )}
          </Container>

          {/* Test Payment Button (for demo purposes) */}
          <Button
            title={t("reservation.previewPayment", "Preview Payment Instructions")}
            variant="outline"
            onPress={handleZaadPayment}
            loading={isProcessingPayment}
            disabled={isProcessingPayment}
            style={{ marginBottom: 16 }}
          />
        </Container>
      )}

      {/* Payment Summary */}
      {selectedPaymentMethod && totalAmount && (
        <Container marginBottom="lg">
          <Container
            backgroundColor={isDark ? theme.colors.gray[800] : theme.colors.gray[50]}
            padding="lg"
            borderRadius="lg"
          >
            <Text variant="body" weight="semibold" style={{ marginBottom: 12 }}>
              {t("reservation.paymentSummary", "Payment Summary")}
            </Text>
            
            <Container flexDirection="row" justifyContent="space-between" marginBottom="sm">
              <Text variant="body">{t("reservation.total", "Total Amount")}</Text>
              <Text variant="body" weight="semibold">
                {ZaadUtils.formatAmount(totalAmount, currency)}
              </Text>
            </Container>
            
            <Container flexDirection="row" justifyContent="space-between">
              <Text variant="caption">{t("reservation.paymentMethod", "Payment Method")}</Text>
              <Text variant="caption" weight="semibold">
                {selectedPaymentMethod.details?.name || 'ZAAD'}
              </Text>
            </Container>
          </Container>
        </Container>
      )}

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
              {t("features.booking.flow.securePayment", "Secure Payment")}
            </Text>
            <Text
              variant="caption"
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
              style={{ marginTop: 2 }}
            >
              {t(
                "features.booking.flow.paymentSecurity",
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
