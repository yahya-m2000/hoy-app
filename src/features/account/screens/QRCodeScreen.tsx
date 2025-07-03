import React from "react";
import { Share, Alert } from "react-native";
import { router } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { Container, Text, Header } from "@shared/components";
import { useTheme } from "@core/hooks";
import { getUserDisplayName } from "@core/utils/user";
import type { QRCodeScreenProps } from "@core/types";

/**
 * Instagram-style QR Code Screen
 * Displays user's QR code with their name and app branding
 * Role-aware: Shows host profile deep link for hosts, regular profile for travelers
 */
const QRCodeScreen: React.FC<QRCodeScreenProps> = ({ user }) => {
  const { theme, isDark } = useTheme();

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

  return (
    <Container flex={1} backgroundColor={isDark ? "gray900" : "white"}>
      {/* Header */}
      <Header
        title="My QR Code"
        leftIcon="close"
        onLeftPress={handleClose}
        rightIcon="share-outline"
        onRightPress={handleShare}
      />

      {/* Content */}
      <Container
        flex={1}
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="xl"
      >
        {/* User Name */}
        <Container marginBottom="xl">
          <Text size="2xl" weight="bold">
            {displayName}
          </Text>
        </Container>

        {/* QR Code Container */}
        <Container
          padding="xl"
          borderRadius="xl"
          borderWidth={1}
          backgroundColor={isDark ? "gray800" : "white"}
          borderColor={isDark ? "gray700" : "gray200"}
          marginBottom="xl"
          elevation={2}
          shadowColor="black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          <QRCode
            value={qrContent}
            size={220}
            color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
            backgroundColor={
              isDark ? theme.colors.gray[800] : theme.colors.white
            }
            logo={require("../../../../assets/icon.png")} // App logo in center
            logoSize={40}
            logoBackgroundColor="transparent"
            logoMargin={4}
            logoBorderRadius={8}
          />
        </Container>

        {/* App Branding */}
        <Container alignItems="center" marginTop="md">
          <Container marginBottom="xs">
            <Text size="xl" weight="bold" color="primary">
              HOY
            </Text>
          </Container>
          <Text size="md" color={isDark ? "gray400" : "gray600"}>
            Scan to view my profile
          </Text>
        </Container>
      </Container>

      {/* Bottom Instructions */}
      <Container paddingHorizontal="xl" paddingBottom="xl" alignItems="center">
        <Text size="sm" color={isDark ? "gray400" : "gray600"}>
          Point your camera at this QR code to visit my profile
        </Text>
      </Container>
    </Container>
  );
};

export default QRCodeScreen;
