import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@core/hooks";
import { useCurrency } from "@core/context";
import { useCurrencyConversion } from "@core/hooks";
import { spacing } from "@core/design";
import { Ionicons } from "@expo/vector-icons";

export interface Reservation {
  id: string;
  guestName: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: "upcoming" | "active" | "completed" | "pending" | "cancelled";
  totalAmount: number;
  nights: number;
}

interface ReservationCardProps {
  reservation: Reservation;
  statusLabel?: string | null;
  isCurrentlyHosting?: boolean;
  onPress?: (reservation: Reservation) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  statusLabel,
  isCurrentlyHosting = false,
  onPress,
}) => {
  const { theme } = useTheme();
  const { currency, supportedCurrencies } = useCurrency();
  const { convertAmount } = useCurrencyConversion();

  // State for converted amount
  const [convertedTotalAmount, setConvertedTotalAmount] = useState<
    number | null
  >(null);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currencyInfo = supportedCurrencies.find(
      (curr) => curr.code === currency
    );
    return currencyInfo?.symbol || currency;
  };

  // Convert amount when currency or reservation changes
  useEffect(() => {
    const convertTotalAmount = async () => {
      const converted = await convertAmount(reservation.totalAmount, "USD");
      setConvertedTotalAmount(converted);
    };

    convertTotalAmount();
  }, [reservation.totalAmount, currency, convertAmount]);

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: theme.border }]}
      onPress={() => onPress?.(reservation)}
    >
      <View style={styles.content}>
        {statusLabel && (
          <Text
            style={[
              styles.statusLabel,
              isCurrentlyHosting && { color: theme.colors.primary },
              !isCurrentlyHosting && { color: theme.text.secondary },
            ]}
          >
            {statusLabel}
          </Text>
        )}
        <View style={styles.guestInfo}>
          <Text
            style={[
              styles.guestName,
              { color: theme.text.primary },
              isCurrentlyHosting && styles.guestNameLarge,
            ]}
          >
            {reservation.guestName}
          </Text>
          <Text style={[styles.propertyName, { color: theme.text.secondary }]}>
            {reservation.property}
          </Text>
        </View>

        <View style={styles.details}>
          <Text
            style={[
              styles.dateRange,
              { color: theme.text.secondary },
              isCurrentlyHosting && styles.dateRangeLarge,
            ]}
          >
            {formatDate(reservation.checkIn)} -
            {formatDate(reservation.checkOut)}
          </Text>
          {!isCurrentlyHosting && (
            <Text style={[styles.amount, { color: theme.text.primary }]}>
              {getCurrencySymbol()} {convertedTotalAmount}
            </Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={theme.text.secondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  guestInfo: {
    marginBottom: spacing.xs,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  guestNameLarge: {
    fontSize: 18,
  },
  propertyName: {
    fontSize: 14,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateRange: {
    fontSize: 14,
  },
  dateRangeLarge: {
    fontSize: 16,
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ReservationCard;
