import React, { useState, useEffect } from "react";
// Remove react-native primitives
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Container, Text, Icon } from "@shared/components";
import { Pressable } from "react-native";
import { useTheme } from "@core/hooks";
import { useCurrency } from "@core/context";
import { useCurrencyConversion } from "@core/hooks";
import { spacing } from "@core/design";
// import { Ionicons } from "@expo/vector-icons";

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
    <Pressable onPress={() => onPress?.(reservation)}>
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        padding={"md"}
        marginBottom={"sm"}
        borderRadius={"md"}
        borderWidth={1}
        borderColor={theme.border}
      >
        <Container flex={1}>
          {statusLabel && (
            <Text
              variant="caption"
              weight="semibold"
              style={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: spacing.xs,
              }}
              color={isCurrentlyHosting ? "primary" : "onSurfaceVariant"}
            >
              {statusLabel}
            </Text>
          )}
          <Container marginBottom={"xs"}>
            <Text
              variant={isCurrentlyHosting ? "h6" : "body"}
              weight="semibold"
              color="onSurface"
              style={{ marginBottom: 2 }}
            >
              {reservation.guestName}
            </Text>
            <Text variant="body" color="onSurfaceVariant">
              {reservation.property}
            </Text>
          </Container>
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text
              variant="body"
              color="onSurfaceVariant"
              style={isCurrentlyHosting ? { fontSize: 16 } : undefined}
            >
              {formatDate(reservation.checkIn)} -{" "}
              {formatDate(reservation.checkOut)}
            </Text>
            {!isCurrentlyHosting && (
              <Text variant="body" weight="semibold" color="onSurface">
                {getCurrencySymbol()} {convertedTotalAmount}
              </Text>
            )}
          </Container>
        </Container>
        <Icon name="chevron-forward" size={16} color={theme.text.secondary} />
      </Container>
    </Pressable>
  );
};

export default ReservationCard;
