import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "@shared/hooks/useTheme";
import { spacing, fontSize, fontWeight, radius } from "@shared/constants";
import { getUserDisplayName } from "@shared/utils/user";
import type { User } from "@shared/types";

export interface HostQRCodeScreenProps {
  user: User | null;
}

/**
 * Instagram-style QR Code Screen
 * Displays host's QR code with their name and app branding
 */
export const HostQRCodeScreen: React.FC<HostQRCodeScreenProps> = ({ user }) => {
  const { theme, isDark } = useTheme();

  const displayName = getUserDisplayName(user);
  const hostId = user?._id || user?.id || "placeholder-host-id";

  // QR code content - deep link to host profile
  const qrContent = `hoy://host/${hostId}`;

  const handleClose = () => {
    router.back();
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share QR code");
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.gray[900] : theme.colors.white,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close"
            size={24}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
            },
          ]}
        >
          My QR Code
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleShare}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="share-outline"
            size={24}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Host Name */}
        <Text
          style={[
            styles.hostName,
            {
              color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
            },
          ]}
        >
          {displayName}
        </Text>

        {/* QR Code Container */}
        <View
          style={[
            styles.qrContainer,
            {
              backgroundColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
            },
          ]}
        >
          <QRCode
            value={qrContent}
            size={220}
            color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
            backgroundColor={
              isDark ? theme.colors.gray[800] : theme.colors.white
            }
            logo={require("../../../../../assets/icon.png")} // App logo in center
            logoSize={40}
            logoBackgroundColor="transparent"
            logoMargin={4}
            logoBorderRadius={8}
          />
        </View>

        {/* App Branding */}
        <View style={styles.brandingContainer}>
          <Text
            style={[
              styles.appName,
              {
                color: theme.colors.primary,
              },
            ]}
          >
            HOY
          </Text>
          <Text
            style={[
              styles.tagline,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            Scan to view my properties
          </Text>
        </View>
      </View>

      {/* Bottom Instructions */}
      <View style={styles.bottomSection}>
        <Text
          style={[
            styles.instructions,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            },
          ]}
        >
          Point your camera at this QR code to visit my host profile
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        paddingTop: spacing.lg,
      },
      android: {
        paddingTop: spacing.xl,
      },
    }),
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  hostName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  qrContainer: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  brandingContainer: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  appName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.md,
    textAlign: "center",
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: "center",
  },
  instructions: {
    fontSize: fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
