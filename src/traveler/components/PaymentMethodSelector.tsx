/**
 * Payment Method Selector component for the Hoy application
 * Allows users to select payment methods for reservations
 */

import React, { useState, useEffect } from "react";
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
import * as userService from "@common/services/userService";
import CardLogo from "./CardLogo";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "bank" | "zaad" | "other";
  isDefault: boolean;
  details: {
    brand?: string;
    last4?: string;
    expiry?: string;
    logo?: string;
    name?: string;
    phone?: string; // For ZAAD payments
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
  useEffect(() => {
    fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user's payment methods
  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const methods = await userService.getPaymentMethods();
      setPaymentMethods(methods);

      // If no payment method is selected yet but there's a default one, select it
      if (!selectedMethod && methods.length > 0) {
        const defaultMethod = methods.find((m) => m.isDefault) || methods[0];
        onSelect(defaultMethod);
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      setError("Failed to load payment methods"); // Demo payment methods when API fails or for development
      const demoMethods: PaymentMethod[] = [
        {
          id: "pm_123456abcdef",
          type: "card",
          isDefault: true,
          details: {
            brand: "Visa",
            last4: "4242",
            expiry: "04/2026",
          },
        },
        {
          id: "pm_789012ghijkl",
          type: "card",
          isDefault: false,
          details: {
            brand: "Mastercard",
            last4: "8888",
            expiry: "12/2025",
          },
        },
        {
          id: "zaad_payment_method",
          type: "zaad",
          isDefault: false,
          details: {
            name: "ZAAD",
            phone: "123456789",
          },
        },
      ];

      setPaymentMethods(demoMethods);
      if (!selectedMethod) {
        onSelect(demoMethods[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle selection of a payment method
  const handleSelectMethod = (method: PaymentMethod) => {
    onSelect(method);
  };
  // Navigate to add payment method
  const handleAddPaymentMethod = () => {
    router.push("/(screens)/AddPaymentMethodScreen");
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
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodItem,
              {
                backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
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
              {method.type === "card" && (
                <>
                  {method.details.brand && (
                    <CardLogo brand={method.details.brand} size="medium" />
                  )}
                  <View style={styles.cardDetails}>
                    <Text
                      style={[
                        styles.cardBrand,
                        {
                          color: isDark ? theme.white : theme.colors.gray[900],
                        },
                      ]}
                    >
                      {method.details.brand} •••• {method.details.last4}
                    </Text>
                    {method.details.expiry && (
                      <Text
                        style={[
                          styles.cardExpiry,
                          {
                            color: isDark
                              ? theme.colors.gray[400]
                              : theme.colors.gray[600],
                          },
                        ]}
                      >
                        {t("payment.expires")} {method.details.expiry}
                      </Text>
                    )}
                    {method.isDefault && (
                      <View
                        style={[
                          styles.defaultBadge,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      >
                        <Text style={styles.defaultBadgeText}>
                          {t("payment.default")}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {method.type === "zaad" && (
                <>
                  <View
                    style={[styles.zaadLogo, { backgroundColor: "#00A651" }]}
                  >
                    <Text style={styles.zaadLogoText}>ZAAD</Text>
                  </View>
                  <View style={styles.cardDetails}>
                    <Text
                      style={[
                        styles.cardBrand,
                        {
                          color: isDark ? theme.white : theme.colors.gray[900],
                        },
                      ]}
                    >
                      ZAAD Mobile Payment
                    </Text>
                    {method.details.phone && (
                      <Text
                        style={[
                          styles.cardExpiry,
                          {
                            color: isDark
                              ? theme.colors.gray[400]
                              : theme.colors.gray[600],
                          },
                        ]}
                      >
                        {t("payment.phone")}: {method.details.phone}
                      </Text>
                    )}
                  </View>
                </>
              )}
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
        ))}

        <TouchableOpacity
          style={[
            styles.addMethodButton,
            {
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
              borderStyle: "dashed",
            },
          ]}
          onPress={handleAddPaymentMethod}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.addMethodText, { color: theme.colors.primary }]}
          >
            {t("payment.addNewMethod")}
          </Text>
        </TouchableOpacity>
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
  }, // The CardLogo component handles its own styling
  cardDetails: {
    flex: 1,
  },
  cardBrand: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: fontSize.sm,
  },
  defaultBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  defaultBadgeText: {
    color: "white",
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  checkmarkContainer: {
    paddingLeft: spacing.md,
  },
  addMethodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  addMethodText: {
    marginLeft: spacing.xs,
    fontWeight: "500",
    fontSize: fontSize.md,
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
});

export default PaymentMethodSelector;
