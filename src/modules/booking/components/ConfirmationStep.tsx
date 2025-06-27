/**
 * Confirmation Step Component
 */

import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "@shared/components/base/Text";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Context & Hooks
import { useTheme } from "@shared/hooks/useTheme";
import { useCurrency } from "@shared/hooks/useCurrency";

// Utils & Types
import { formatDate, calculateNights, formatGuestCount } from "../utils";
import { formatCurrency } from "@shared/utils/formatting/formatters";
import type {
  BookingDates,
  BookingGuestInfo,
  BookingPriceDetails,
  BookingStepProps,
} from "../types";
import type { PropertyType } from "@shared/types/property";

// Constants
import { spacing, fontSize, radius } from "@shared/constants";

interface ExtendedPaymentMethod {
  id: string;
  type: "card" | "zaad" | "test";
  isDefault: boolean;
  details: {
    brand?: string;
    last4?: string;
    expiry?: string;
    name?: string;
    phone?: string;
  };
}

interface ConfirmationStepProps extends BookingStepProps {
  property: PropertyType;
  dates: BookingDates;
  guests: BookingGuestInfo;
  priceDetails: BookingPriceDetails | null;
  paymentMethod: ExtendedPaymentMethod | null;
  propertyPrice: number;
  onConfirm: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  property,
  dates,
  guests,
  priceDetails,
  paymentMethod,
  propertyPrice,
  onConfirm,
  onBack,
  isLoading,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { currency, getSymbol } = useCurrency();

  // Ensure propertyPrice is a valid number
  const safePropertyPrice =
    typeof propertyPrice === "number" && !isNaN(propertyPrice)
      ? propertyPrice
      : 0;

  const nights = calculateNights(dates.startDate, dates.endDate);

  return (
    <View>
      <View style={styles.confirmationContainer}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: isDark ? theme.colors.gray[200] : theme.colors.gray[800],
            },
          ]}
        >
          Reservation Summary
        </Text>

        {/* Property Information */}
        <View style={styles.propertyInfoContainer}>
          <Text
            style={[
              styles.propertyTitle,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
          >
            {property?.name}
          </Text>
          <Text
            style={[
              styles.propertyLocation,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {property?.address?.city}, {property?.address?.country}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />

        {/* Booking Details */}
        <View style={styles.infoRow}>
          <Text
            style={[
              styles.infoLabel,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            Dates
          </Text>
          <Text
            style={[
              styles.infoValue,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
          >
            {formatDate(dates.startDate)} - {formatDate(dates.endDate)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text
            style={[
              styles.infoLabel,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            Nights
          </Text>
          <Text
            style={[
              styles.infoValue,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
          >
            {nights}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text
            style={[
              styles.infoLabel,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            Guests
          </Text>
          <Text
            style={[
              styles.infoValue,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
          >
            {formatGuestCount(guests)}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />

        {/* Price Details */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: isDark ? theme.colors.gray[200] : theme.colors.gray[800],
              marginTop: spacing.md,
            },
          ]}
        >
          Price Details
        </Text>

        <View style={styles.infoRow}>
          <Text
            style={[
              styles.infoLabel,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {getSymbol(currency)}
            {formatCurrency(safePropertyPrice)} x {nights} nights
          </Text>
          <Text
            style={[
              styles.infoValue,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
          >
            {getSymbol(currency)}
            {formatCurrency(safePropertyPrice * nights)}
          </Text>
        </View>

        {priceDetails?.cleaningFee && priceDetails.cleaningFee > 0 && (
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              Cleaning fee
            </Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color: isDark ? theme.white : theme.colors.gray[900],
                },
              ]}
            >
              {getSymbol(currency)}
              {formatCurrency(priceDetails.cleaningFee)}
            </Text>
          </View>
        )}

        {priceDetails?.serviceFee && priceDetails.serviceFee > 0 && (
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              Service fee
            </Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color: isDark ? theme.white : theme.colors.gray[900],
                },
              ]}
            >
              {getSymbol(currency)}
              {formatCurrency(priceDetails.serviceFee)}
            </Text>
          </View>
        )}

        {priceDetails?.taxes && priceDetails.taxes > 0 && (
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              Taxes
            </Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color: isDark ? theme.white : theme.colors.gray[900],
                },
              ]}
            >
              {getSymbol(currency)}
              {formatCurrency(priceDetails.taxes)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />

        {/* Total */}
        <View style={[styles.infoRow, styles.totalRow]}>
          <Text
            style={[
              styles.totalLabel,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
          >
            {t("reservation.total")}
          </Text>
          <Text
            style={[
              styles.totalValue,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
          >
            {getSymbol(currency)}
            {formatCurrency(
              priceDetails?.totalPrice || safePropertyPrice * nights
            )}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />

        {/* Payment Method */}
        <Text
          style={[
            styles.sectionTitle,
            {
              color: isDark ? theme.colors.gray[200] : theme.colors.gray[800],
              marginTop: spacing.md,
            },
          ]}
        >
          {t("reservation.paymentMethod")}
        </Text>

        <View
          style={[
            styles.paymentMethodContainer,
            {
              backgroundColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.gray[100],
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        >
          <Ionicons
            name={
              paymentMethod?.type === "card" ? "card-outline" : "cash-outline"
            }
            size={24}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />

          <View style={styles.paymentMethodInfo}>
            <Text
              style={[
                styles.paymentMethodTitle,
                {
                  color: isDark ? theme.white : theme.colors.gray[900],
                },
              ]}
            >
              {paymentMethod?.details?.brand || "Card"} ••••
              {paymentMethod?.details?.last4 || "1234"}
            </Text>

            {paymentMethod?.details?.expiry && (
              <Text
                style={[
                  styles.paymentMethodSubtitle,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                Expires {paymentMethod.details.expiry}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons
              name="arrow-back"
              size={20}
              color={theme.colors.gray[700]}
            />
            <Text
              style={[styles.backButtonText, { color: theme.colors.gray[700] }]}
            >
              {t("common.back")}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.reserveButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.white} />
          ) : (
            <>
              <Text style={styles.reserveButtonText}>
                {t("reservation.confirmAndPay")}
              </Text>
              <Ionicons name="checkmark" size={20} color={theme.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  confirmationContainer: {
    padding: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  propertyInfoContainer: {
    marginBottom: spacing.md,
  },
  propertyTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: fontSize.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: fontSize.sm,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  totalRow: {
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  paymentMethodInfo: {
    marginLeft: spacing.md,
  },
  paymentMethodTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  paymentMethodSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  reserveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    flex: 1,
    marginLeft: spacing.md,
  },
  reserveButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
});

export default ConfirmationStep;
