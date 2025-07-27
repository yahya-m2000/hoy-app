import React from "react";
import { Share, Alert } from "react-native";
import { router } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { Container, Text, Header } from "@shared/components";
import { useTheme } from "@core/hooks";
import { getUserDisplayName } from "@core/utils/user";
import type { QRCodeScreenProps } from "@core/types";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Instagram-style QR Code Screen
 * Displays user's QR code with their name and app branding
 * Role-aware: Shows host profile deep link for hosts, regular profile for travelers
 */
const QRCodeScreen: React.FC<QRCodeScreenProps> = ({ user }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const displayName = getUserDisplayName(user);
  const userId = user?._id || user?.id || "placeholder-user-id";

  // QR code content - deep link to user profile (host or traveler)
  const qrContent = `hoy://user/${userId}`;

  const handleClose = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        title: `Connect with ${displayName} on Hoy`,
        message: `Check out ${displayName}'s profile on Hoy! \n\nScan this QR code or visit: ${qrContent}`,
        url: qrContent, // For platforms that support URL sharing
      };

      const result = await Share.share(shareContent);

      if (result.action === Share.sharedAction) {
        console.log("QR code shared successfully");
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      Alert.alert("Error", "Unable to share QR code. Please try again.");
    }
  };

  // Gradient colors
  const qrGradientColors = ["#F56320", "#3B82F6"];
  const backgroundGradientColors = [
    theme.colors.primary,
    theme.colors.secondary,
  ] as const;

  return (
    <LinearGradient
      colors={backgroundGradientColors as any}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      {/* Header */}
      <Header
        leftIcon="close"
        onLeftPress={handleClose}
        rightIcon="share-outline"
        onRightPress={handleShare}
        variant="transparent"
      />

      {/* Content */}
      <Container
        flex={1}
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="xl"
        backgroundColor="transparent"
      >
        {/* User Name */}
        <Container marginBottom="xl">
          <Text variant="h6" weight="bold" color="inverse">
            {displayName.toUpperCase()}
          </Text>
        </Container>

        {/* QR Code Container */}
        <Container
          marginBottom="xl"
          backgroundColor="background"
          padding="xl"
          borderRadius="xl"
          elevation={2}
          shadowColor="black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.2}
          shadowRadius={6}
        >
          <QRCode
            value={qrContent}
            size={220}
            logo={require("../../../../assets/icon.png")}
            logoSize={50}
            logoBackgroundColor="transparent"
            logoMargin={4}
            logoBorderRadius={8}
            backgroundColor="transparent"
            enableLinearGradient
            gradientDirection={["0", "100", "1", "100"]}
            linearGradient={[theme.colors.primary, theme.colors.secondary]}
          />
        </Container>

        {/* App Branding */}
        <Container alignItems="center" marginTop="md">
          <Container marginBottom="xs">
            <Text size="xl" weight="bold" color="inverse">
              {t("common.appName")}
            </Text>
          </Container>
          <Text size="md" color="inverse">
            {t("features.account.qrCode.scanToViewProfile")}
          </Text>
        </Container>
      </Container>

      {/* Bottom Instructions */}
      <Container
        paddingHorizontal="xl"
        paddingBottom="xl"
        alignItems="center"
        backgroundColor="transparent"
      >
        <Text size="sm" color="inverse">
          {t("features.account.qrCode.pointCameraToProfile")}
        </Text>
      </Container>
    </LinearGradient>
  );
};

export default QRCodeScreen;
