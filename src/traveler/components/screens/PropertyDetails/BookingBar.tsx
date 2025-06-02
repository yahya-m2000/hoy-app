import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface BookingBarProps {
  price: number;
  totalPrice?: number;
  selectedDates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onReserve: () => void;
}

const BookingBar: React.FC<BookingBarProps> = ({
  price,
  totalPrice,
  selectedDates,
  onReserve,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.bookingBar,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.grayPalette[50],
          borderTopColor: isDark
            ? theme.colors.grayPalette[800]
            : theme.colors.grayPalette[200],
        },
      ]}
    >
      <View>
        <View style={styles.priceContainer}>
          <Text
            style={[
              styles.price,
              {
                color: isDark
                  ? theme.colors.grayPalette[50]
                  : theme.colors.grayPalette[900],
              },
            ]}
          >
            ${price}
          </Text>
          <Text
            style={[
              styles.perNight,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
          >
            {t("property.perNight")}
          </Text>
        </View>

        {totalPrice && totalPrice > 0 && (
          <Text
            style={[
              styles.totalPrice,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
          >
            ${totalPrice} {t("property.total")}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.reserveButton,
          { backgroundColor: theme.colors.primaryPalette[600] },
        ]}
        onPress={onReserve}
      >
        {" "}
        <Text style={styles.reserveButtonText}>
          {selectedDates?.startDate && selectedDates?.endDate
            ? t("property.reserve")
            : t("property.checkAvailability")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bookingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
  },
  perNight: {
    fontSize: 14,
    marginLeft: 4,
  },
  totalPrice: {
    fontSize: 14,
    marginTop: 2,
  },
  reserveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.md,
  },
  reserveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default BookingBar;
