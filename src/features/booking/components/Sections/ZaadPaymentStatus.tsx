/**
 * ZAAD Payment Status Component
 * Displays pending payment status and USSD payment button for ZAAD
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
// Context
import { useTheme } from "@core/hooks";

// Constants
import { fontSize, spacing, radius } from "@core/design";

interface ZaadPaymentStatusProps {
  booking: {
    paymentType: string;
    paymentStatus: string;
  };
}

const ZaadPaymentStatus: React.FC<ZaadPaymentStatusProps> = ({ booking }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  // Handle ZAAD USSD call
  const handleZaadPayment = async () => {
    try {
      // USSD code placeholder - this would eventually be dynamic
      const ussdCode = "*123*012345679#";

      // Different handling for iOS and Android
      if (Platform.OS === "ios") {
        // iOS doesn't support USSD directly, so we'll just open the dialer
        await Linking.openURL(`tel:`);

        // Show an alert with the code to dial
        Alert.alert(
          "ZAAD Payment",
          `Please manually enter ${ussdCode} in your dialer to complete the payment.`
        );
      } else {
        // For Android, we can try to directly open the USSD code
        const cleanUssdCode = ussdCode.replace(/\s+/g, "");

        // Direct launch method - will work on most Android devices
        Linking.openURL(`tel:${cleanUssdCode}`).catch((err) => {
          console.error("Primary USSD method failed:", err);

          // Fallback - try without the # symbol which can cause issues on some devices
          if (cleanUssdCode.endsWith("#")) {
            const fallbackCode = cleanUssdCode.slice(0, -1);
            Linking.openURL(`tel:${fallbackCode}`)
              .then(() => {
                Alert.alert(
                  "ZAAD Payment",
                  "Please add # at the end of the USSD code to complete the payment."
                );
              })
              .catch((fallbackErr) => {
                console.error("Fallback USSD method failed:", fallbackErr);

                // If all else fails, just open the dialer
                Linking.openURL("tel:")
                  .then(() => {
                    Alert.alert(
                      "ZAAD Payment",
                      `Please manually enter ${ussdCode} in your dialer to complete the payment.`
                    );
                  })
                  .catch(() => {
                    Alert.alert(
                      "Error Opening Dialer",
                      `Could not open phone dialer. Please manually dial ${ussdCode} from your phone to complete the payment.`
                    );
                  });
              });
          } else {
            // Just open the dialer if the code doesn't end with #
            Linking.openURL("tel:")
              .then(() => {
                Alert.alert(
                  "ZAAD Payment",
                  `Please manually enter ${ussdCode} in your dialer to complete the payment.`
                );
              })
              .catch(() => {
                Alert.alert(
                  "Error Opening Dialer",
                  `Could not open phone dialer. Please manually dial ${ussdCode} from your phone to complete the payment.`
                );
              });
          }
        });
      }
    } catch (error) {
      console.error("Error launching dialer:", error);
      Alert.alert(
        "Error Opening Dialer",
        "Could not launch the phone dialer. Please manually dial *123*012345679# from your phone."
      );
    }
  };

  // Only show if ZAAD payment is pending
  if (booking.paymentType !== "zaad" || booking.paymentStatus !== "pending") {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(255, 193, 7, 0.2)"
            : "rgba(255, 193, 7, 0.1)",
          borderColor: theme.colors.warning[500],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name="alert-circle-outline"
          size={24}
          color={theme.colors.warning[500]}
        />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: isDark
                  ? theme.colors.warning[300]
                  : theme.colors.warning[800],
              },
            ]}
          >
            {t("booking.zaadPaymentPending")}
          </Text>
          <Text
            style={[
              styles.message,
              {
                color: isDark
                  ? theme.colors.warning[300]
                  : theme.colors.warning[800],
              },
            ]}
          >
            {t("booking.zaadPaymentPendingMessage")}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.payButton,
          { backgroundColor: theme.colors.warning[500] },
        ]}
        onPress={handleZaadPayment}
      >
        <Text style={styles.payButtonText}>{t("booking.payNowWithZaad")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
  },
  payButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignSelf: "flex-end",
  },
  payButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: fontSize.sm,
  },
});

export default ZaadPaymentStatus;
