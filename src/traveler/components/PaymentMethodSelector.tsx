/**
 * Payment Method Selector component for the Hoy application
 * Allows users to select payment methods for reservations (ZAAD-only)
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTheme } from "@common/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@common/context/AuthContext";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

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
  const { user } = useAuth();

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

      // Debug: Log user object to see what phone field is available
      console.log("User object in PaymentMethodSelector:", {
        phoneNumber: user.phoneNumber,
        phone: (user as any).phone,
        fullUser: JSON.stringify(user, null, 2),
      });

      // Check if user has a phone number for ZAAD
      // Try multiple field names for compatibility
      const phoneNumber =
        user.phoneNumber ||
        (user as any).phone ||
        (user as any).phoneNumer || // Check for typos
        (user as any).phone_number ||
        ((user as any).data && (user as any).data.phoneNumber) ||
        ((user as any)._source && (user as any)._source.phoneNumber);

      console.log("Extracted phone number:", phoneNumber);

      if (!phoneNumber || phoneNumber.trim() === "") {
        console.log("No phone number found for user");
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: isDark ? theme.colors.gray[400] : theme.colors.gray[600] },
          ]}
        >
          {t("payment.loading")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: isDark ? theme.colors.gray[200] : theme.colors.gray[800] },
        ]}
      >
        {t("payment.selectMethod")}
      </Text>

      {error && (
        <View
          style={[
            styles.errorContainer,
            {
              backgroundColor: isDark
                ? theme.colors.error[900]
                : theme.colors.error[50],
              borderColor: theme.colors.error[500],
            },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={theme.colors.error[500]}
          />
          <Text
            style={[
              styles.errorText,
              {
                color: isDark
                  ? theme.colors.error[100]
                  : theme.colors.error[700],
              },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.methodsList}
      >
        {paymentMethods.length === 0 && !error ? (
          // Show message when user has no phone number for ZAAD
          <View
            style={[
              styles.noPhoneContainer,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[50],
                borderColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
              },
            ]}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={48}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
              style={styles.noPhoneIcon}
            />
            <Text
              style={[
                styles.noPhoneTitle,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {t("reservation.noPaymentMethodTitle")}
            </Text>
            <Text
              style={[
                styles.noPhoneDescription,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("reservation.noPaymentMethodDescription")}
            </Text>
            <TouchableOpacity
              style={[
                styles.goToProfileButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => router.push("/(screens)/common/personal-info")}
            >
              <Text style={styles.goToProfileButtonText}>
                {t("reservation.goToProfile")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodItem,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.white,
                  borderColor:
                    method.id === selectedMethod?.id
                      ? theme.colors.primary
                      : isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[300],
                  borderWidth: method.id === selectedMethod?.id ? 2 : 1,
                },
              ]}
              onPress={() => handleSelectMethod(method)}
            >
              <View style={styles.methodContent}>
                <View style={[styles.zaadLogo, { backgroundColor: "#00A651" }]}>
                  <Text style={styles.zaadLogoText}>ZAAD</Text>
                </View>
                <View style={styles.paymentDetails}>
                  <Text
                    style={[
                      styles.paymentBrand,
                      {
                        color: isDark ? theme.white : theme.colors.gray[900],
                      },
                    ]}
                  >
                    ZAAD Mobile Payment
                  </Text>
                  <Text
                    style={[
                      styles.paymentPhone,
                      {
                        color: isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      },
                    ]}
                  >
                    {t("payment.phone")}: {method.details.phone}
                  </Text>
                </View>
              </View>

              {method.id === selectedMethod?.id && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  errorText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flex: 1,
  },
  methodsList: {
    marginBottom: spacing.md,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentBrand: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: 2,
  },
  paymentPhone: {
    fontSize: fontSize.sm,
  },
  checkmarkContainer: {
    paddingLeft: spacing.md,
  },
  zaadLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  zaadLogoText: {
    color: "white",
    fontWeight: "700",
    fontSize: fontSize.sm,
  },
  noPhoneContainer: {
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  noPhoneIcon: {
    marginBottom: spacing.md,
  },
  noPhoneTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  noPhoneDescription: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  goToProfileButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  goToProfileButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});

export default PaymentMethodSelector;
