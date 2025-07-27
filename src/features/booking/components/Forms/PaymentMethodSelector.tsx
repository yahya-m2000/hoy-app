/**
 * Payment Method Selector component for the Hoy application
 * Allows users to select payment methods for reservations (ZAAD-only)
 */

import React, { useState, useEffect, useCallback } from "react";
import { TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";

import { useTranslation } from "react-i18next";
import { router } from "expo-router";
// Context
import { useTheme } from "@core/hooks";
import { useAuth } from "@core/context";
import { useCurrentUser } from "@features/user/hooks";
import { Container, Text, Icon } from "@shared/components";

// Constants
import { fontSize, spacing, radius } from "@core/design";

interface PaymentMethod {
  id: string;
  type: "zaad";
  isDefault: boolean;
  details: {
    name: string;
    phone: string;
  };
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format phone number with country code
  const formatPhoneNumber = useCallback((phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, ""); // Remove non-digits

    // If phone already starts with country code (252 for Somalia), keep as is
    if (cleanPhone.startsWith("252")) {
      return `+${cleanPhone}`;
    }

    // If phone starts with +, assume it already has country code
    if (phone.startsWith("+")) {
      return phone;
    }

    // If phone starts with 0, remove it and add +252
    if (cleanPhone.startsWith("0")) {
      return `+252${cleanPhone.substring(1)}`;
    }

    // Otherwise, assume it's a local number and add +252
    return `+252${cleanPhone}`;
  }, []);

  // Fetch user's payment methods
  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Check if user has a phone number for ZAAD
      // Try multiple field names for compatibility
      const phoneNumber =
        user.phoneNumber ||
        (user as any).phone ||
        (user as any).phoneNumer || // Check for typos
        (user as any).phone_number ||
        ((user as any).data && (user as any).data.phoneNumber) ||
        ((user as any)._source && (user as any)._source.phoneNumber);

      if (!phoneNumber || phoneNumber.trim() === "") {
        setPaymentMethods([]);
        setError(null); // We'll handle this case in the UI
        return;
      }

      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Create ZAAD payment method using user's phone number
      const zaadMethod: PaymentMethod = {
        id: "zaad_payment_method",
        type: "zaad",
        isDefault: true,
        details: {
          name: "ZAAD",
          phone: formattedPhone,
        },
      };

      setPaymentMethods([zaadMethod]);

      // Auto-select if no method is currently selected
      if (!selectedMethod) {
        onSelect(zaadMethod);
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      setError("Failed to load payment methods");
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  }, [user, onSelect, selectedMethod, formatPhoneNumber]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Handle selection of a payment method
  const handleSelectMethod = (method: PaymentMethod) => {
    onSelect(method);
  };

  if (loading) {
    return (
      <Container alignItems="center" justifyContent="center" padding="xl">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="body" style={{ marginTop: spacing.md }}>
          {t("payment.loading")}
        </Text>
      </Container>
    );
  }

  return (
    <Container>
      {error && (
        <Container flexDirection="row" alignItems="center" marginBottom="md">
          <Icon name="alert-circle" size={20} color={theme.colors.error} />
          <Text variant="caption" style={{ marginLeft: spacing.xs, flex: 1 }}>
            {error}
          </Text>
        </Container>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: spacing.md }}
      >
        {paymentMethods.length === 0 && !error ? (
          // Show message when user has no phone number for ZAAD
          <Container alignItems="center" padding="xl">
            <Icon
              name="phone-portrait"
              size={48}
              style={{ marginBottom: spacing.md }}
            />
            <Text
              variant="h6"
              weight="semibold"
              style={{ marginBottom: spacing.sm, textAlign: "center" }}
            >
              {t("features.booking.flow.noPaymentMethodTitle")}
            </Text>
            <Text
              variant="body"
              style={{
                marginBottom: spacing.lg,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {t("features.booking.flow.noPaymentMethodDescription")}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radius.md,
              }}
              onPress={() => router.push("/(overlays)/account/personal-info")}
            >
              <Text variant="body" weight="semibold" color={theme.white}>
                {t("features.booking.flow.goToProfile")}
              </Text>
            </TouchableOpacity>
          </Container>
        ) : (
          paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: spacing.md,
                borderRadius: radius.md,
                borderWidth: method.id === selectedMethod?.id ? 2 : 1,
                borderColor:
                  method.id === selectedMethod?.id
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[300],
                marginBottom: spacing.sm,
              }}
              onPress={() => handleSelectMethod(method)}
            >
              <Container flexDirection="row" alignItems="center" flex={1}>
                <Container
                  width={40}
                  height={40}
                  borderRadius="circle"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="sm"
                  backgroundColor="#00A651"
                >
                  <Text variant="caption" weight="bold" color={theme.white}>
                    ZAAD
                  </Text>
                </Container>
                <Container flex={1}>
                  <Text variant="body" weight="semibold">
                    ZAAD Mobile Payment
                  </Text>
                  <Text variant="caption">
                    {t("payment.phone")}: {method.details.phone}
                  </Text>
                </Container>
              </Container>

              {method.id === selectedMethod?.id && (
                <Container marginLeft="md">
                  <Icon
                    name="checkmark-circle"
                    size={24}
                    color={theme.colors.primary}
                  />
                </Container>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Container>
  );
};

export default PaymentMethodSelector;
