/**
 * ProfileWidget component
 * Displays user profile information including avatar, name, and join date
 * Shows QR code button for all authenticated users
 */

import React from "react";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

// Base Components
import {
  Container,
  Text,
  Button,
  Avatar,
  LoadingSkeleton,
} from "@shared/components";

// Hooks
import { useTheme } from "@core/hooks";
import { useUserRole } from "@core/context";

// Types
import type { ProfileHeaderProps } from "@core/types";

export default function ProfileWidget({
  user,
  loading,
  isHost,
  onQRCodePress,
}: ProfileHeaderProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  if (loading) {
    return (
      <Container flexDirection="row" alignItems="center" paddingBottom="lg">
        <LoadingSkeleton
          height={80}
          width={80}
          borderRadius={40}
          style={{ marginRight: 16 }}
        />
        <Container flex={1} marginLeft="md">
          <LoadingSkeleton
            height={24}
            width={150}
            style={{ marginBottom: 8 }}
          />
          <LoadingSkeleton
            height={16}
            width={200}
            style={{ marginBottom: 8 }}
          />
          <LoadingSkeleton height={14} width={100} />
        </Container>
      </Container>
    );
  }

  return (
    <Container flexDirection="row" alignItems="center" paddingBottom="lg">
      {/* User Avatar */}
      <Avatar
        source={user?.profilePicture || user?.avatarUrl || user?.profileImage}
        size="xlarge"
        name={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
      />

      {/* Profile Information */}
      <Container flex={1} marginLeft="md">
        <Text
          variant="h6"
          weight="semibold"
          color={isDark ? theme.colors.gray[100] : theme.colors.gray[900]}
          style={{ marginBottom: 4 }}
        >
          {user?.firstName || user?.lastName
            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
            : t("profile.guestUser")}
        </Text>

        <Text
          variant="body"
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
          style={{ marginBottom: 4 }}
        >
          {user?.email || t("profile.notSignedIn")}
        </Text>

        {user?.joinedDate && (
          <Text
            variant="caption"
            color={isDark ? theme.colors.gray[500] : theme.colors.gray[500]}
          >
            {t("profile.joinedDate", {
              date: new Date(user.joinedDate).toLocaleDateString(),
            })}
          </Text>
        )}
      </Container>

      {/* Action Buttons */}
      <Container flexDirection="row" alignItems="center">
        {/* QR Code Button */}
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[100],
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={onQRCodePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="qr-code-outline"
            size={20}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        </TouchableOpacity>
      </Container>
    </Container>
  );
}
