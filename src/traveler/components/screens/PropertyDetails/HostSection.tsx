import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";

export interface ExtendedUser {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "host" | "admin";
  joinedDate: string;
  avatarUrl?: string;
  profileImage?: string;
  createdAt?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  phone?: string;
  hostType?: "individual" | "organization";
  isSuperHost?: boolean;
  responseRate?: string;
  responseTime?: string;
}

interface HostSectionProps {
  host: ExtendedUser | null;
  hostLoading: boolean;
  onMessageHost: () => void;
}

const HostSection: React.FC<HostSectionProps> = ({
  host,
  hostLoading,
  onMessageHost,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  // Generate a consistent color for the host based on their name
  const getAvatarColor = (name: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from host name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Avatar component
  const renderAvatar = () => {
    const hostName = `${host?.firstName || ""} ${host?.lastName || ""}`.trim();

    if (host?.avatarUrl || host?.profileImage) {
      return (
        <Image
          source={{ uri: host.avatarUrl || host.profileImage }}
          style={styles.hostImage}
        />
      );
    }

    // Show initials with colored background
    const initials = getInitials(host?.firstName || "U", host?.lastName || "H");
    const backgroundColor = getAvatarColor(hostName || "Unknown Host");

    return (
      <View
        style={[
          styles.hostImage,
          styles.initialsContainer,
          { backgroundColor },
        ]}
      >
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    );
  };

  // Use contact data from host profile
  const phoneNumber = host?.phone || host?.phoneNumber || "+1-555-123-4567";
  const whatsappNumber = host?.whatsappNumber || phoneNumber;

  const handleCall = async () => {
    const phoneUrl = `tel:${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);

    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert("Error", "Unable to make phone calls on this device");
    }
  };

  const handleWhatsApp = async () => {
    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, "");

    // Try to open WhatsApp app first
    const whatsappUrl = `whatsapp://send?phone=${cleanNumber}`;
    const canOpenApp = await Linking.canOpenURL(whatsappUrl);

    if (canOpenApp) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fall back to web WhatsApp
      const webWhatsappUrl = `https://web.whatsapp.com/send?phone=${cleanNumber}`;
      const canOpenWeb = await Linking.canOpenURL(webWhatsappUrl);

      if (canOpenWeb) {
        await Linking.openURL(webWhatsappUrl);
      } else {
        Alert.alert("Error", "Unable to open WhatsApp");
      }
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDark
              ? theme.colors.grayPalette[50]
              : theme.colors.grayPalette[900],
          },
        ]}
      >
        {t("property.hostedBy")} {host?.firstName || t("property.hostTitle")}
      </Text>

      {hostLoading ? (
        <View style={styles.loadingContainer}>
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.grayPalette[600] },
            ]}
          >
            {t("property.loadingHostInfo")}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.hostContainer}>
            {renderAvatar()}

            <View style={styles.hostInfo}>
              <Text
                style={[
                  styles.hostName,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[50]
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {host?.firstName} {host?.lastName}
                {host?.isSuperHost && (
                  <Text
                    style={[
                      styles.superHostBadge,
                      { color: theme.colors.primary[500] },
                    ]}
                  >
                    {" "}
                    ⭐ {t("property.superhost")}
                  </Text>
                )}
              </Text>

              <Text
                style={[
                  styles.hostDetails,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {host?.hostType === "organization"
                  ? t("property.organization")
                  : t("property.individualHost")}{" "}
                • {t("property.hostSince")}{" "}
                {host?.createdAt
                  ? new Date(host.createdAt).getFullYear()
                  : t("property.recently")}
              </Text>

              {host?.responseRate && host?.responseTime && (
                <Text
                  style={[
                    styles.hostDetails,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {host.responseRate} {t("property.responseRate")} •{" "}
                  {host.responseTime} {t("property.responseTime")}
                </Text>
              )}
            </View>
          </View>

          {/* Contact Buttons Row */}
          <View style={styles.contactButtonsContainer}>
            {/* Call Button */}
            <TouchableOpacity
              style={[
                styles.contactButton,
                {
                  backgroundColor: isDark
                    ? theme.colors.grayPalette[700]
                    : theme.colors.grayPalette[100],
                  borderColor: isDark
                    ? theme.colors.grayPalette[600]
                    : theme.colors.grayPalette[300],
                },
              ]}
              onPress={handleCall}
            >
              <Ionicons
                name="call-outline"
                size={18}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.contactButtonText,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[100]
                      : theme.colors.grayPalette[800],
                  },
                ]}
              >
                {t("property.call")}
              </Text>
            </TouchableOpacity>

            {/* WhatsApp Button */}
            <TouchableOpacity
              style={[
                styles.contactButton,
                {
                  backgroundColor: isDark
                    ? theme.colors.grayPalette[700]
                    : theme.colors.grayPalette[100],
                  borderColor: isDark
                    ? theme.colors.grayPalette[600]
                    : theme.colors.grayPalette[300],
                },
              ]}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text
                style={[
                  styles.contactButtonText,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[100]
                      : theme.colors.grayPalette[800],
                  },
                ]}
              >
                {t("property.whatsapp")}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.lg,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  hostContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
  },
  hostImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.lg,
  },
  initialsContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hostInfo: {
    flex: 1,
    justifyContent: "center",
  },
  hostName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  hostDetails: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  superHostBadge: {
    fontSize: 14,
    fontWeight: "600",
  },
  contactButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: spacing.xs,
    textAlign: "center",
  },
  messageButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  messageButtonText: {
    color: "white",
    fontWeight: "700",
  },
});

export default HostSection;
