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
import { useTheme } from "@shared/context";

// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

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
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(theme);

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
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {t("property.hostedBy")} {host?.firstName || t("property.hostTitle")}
      </Text>

      {hostLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            {t("property.loadingHostInfo")}
          </Text>
        </View>
      ) : (
        <View style={styles.hostCard}>
          <View style={styles.hostContainer}>
            {renderAvatar()}

            <View style={styles.hostInfo}>
              <Text style={[styles.hostName, { color: theme.text.primary }]}>
                {host?.firstName} {host?.lastName}
                {host?.isSuperHost && (
                  <Text style={styles.superHostBadge}>
                    {" "}
                    ⭐ {t("property.superhost")}
                  </Text>
                )}
              </Text>

              <Text
                style={[styles.hostDetails, { color: theme.text.secondary }]}
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
                  style={[styles.hostDetails, { color: theme.text.secondary }]}
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
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons
                name="call-outline"
                size={fontSize.lg}
                color={theme.text.primary}
              />
              <Text
                style={[
                  styles.contactButtonText,
                  { color: theme.text.primary },
                ]}
              >
                {t("property.call")}
              </Text>
            </TouchableOpacity>

            {/* WhatsApp Button */}
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleWhatsApp}
            >
              <Ionicons
                name="logo-whatsapp"
                size={fontSize.lg}
                color={theme.text.primary}
              />
              <Text
                style={[
                  styles.contactButtonText,
                  { color: theme.text.primary },
                ]}
              >
                {t("property.whatsapp")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: "transparent",
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.md,
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
    hostCard: {
      paddingVertical: spacing.md,
    },
    hostContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: spacing.md,
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
      fontSize: 16,
      fontWeight: "600",
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
      fontWeight: "500",
      color: "#FF5A5F",
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
      backgroundColor: theme.colors.gray[50],
      flex: 1,
      minHeight: 44,
    },
    contactButtonText: {
      fontSize: 13,
      fontWeight: "500",
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
