import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/context";

// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

interface ContactSectionProps {
  phoneNumber?: string;
  whatsappNumber?: string;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  phoneNumber,
  whatsappNumber,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const handlePhoneCall = async () => {
    if (phoneNumber) {
      const url = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    }
  };

  const handleWhatsAppMessage = async () => {
    if (whatsappNumber) {
      const url = `whatsapp://send?phone=${whatsappNumber}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to web WhatsApp
        const webUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}`;
        await Linking.openURL(webUrl);
      }
    }
  };

  if (!phoneNumber && !whatsappNumber) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDark
              ? theme.colors.grayPalette[100]
              : theme.colors.grayPalette[900],
          },
        ]}
      >
        {t("property.contact")}
      </Text>

      <View style={styles.contactOptionsContainer}>
        {phoneNumber && (
          <TouchableOpacity
            style={[
              styles.contactOption,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.white,
                borderColor: isDark
                  ? theme.colors.grayPalette[700]
                  : theme.colors.grayPalette[200],
              },
            ]}
            onPress={handlePhoneCall}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text
                style={[
                  styles.contactLabel,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[100]
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {t("property.call")}
              </Text>
              <Text
                style={[
                  styles.contactValue,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[300]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {phoneNumber}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
            />
          </TouchableOpacity>
        )}

        {whatsappNumber && (
          <TouchableOpacity
            style={[
              styles.contactOption,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.white,
                borderColor: isDark
                  ? theme.colors.grayPalette[700]
                  : theme.colors.grayPalette[200],
              },
            ]}
            onPress={handleWhatsAppMessage}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.contactInfo}>
              <Text
                style={[
                  styles.contactLabel,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[100]
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {t("property.whatsapp")}
              </Text>
              <Text
                style={[
                  styles.contactValue,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[300]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {whatsappNumber}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  contactOptionsContainer: {
    gap: spacing.sm,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  contactIcon: {
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
  },
});

export { ContactSection };
