/**
 * ProfileWidget component
 * Displays user profile information including avatar, name, and join date
 * Shows QR code button for all authenticated users
 */

import React from "react";
import { TouchableOpacity, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Base Components
import {
  Container,
  Text,
  Button,
  Avatar,
  LoadingSkeleton,
  Icon,
} from "@shared/components";

// Hooks
import { useTheme } from "@core/hooks";
import { useUserRole } from "@core/context";
import { useToast } from "@core/context";
import { api } from "@core/api/client";
import { useCurrentUser } from "@features/user/hooks";

// Types
import type { ProfileHeaderProps } from "@core/types";
import { LinearGradient } from "expo-linear-gradient";
import { radius } from "src/core/design";
import { spacing } from "src/shared";
import Animated from "react-native-reanimated";

export default function ProfileWidget({
  user,
  loading,
  onQRCodePress,
}: ProfileHeaderProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { setUserRole } = useUserRole();
  const { showToast } = useToast();
  const { refetch } = useCurrentUser();

  const isHost = user?.role === "host";

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

  // Handler for activating as host
  const handleActivateHost = async () => {
    if (isHost) return;
    Alert.alert(
      t("Become a Host"),
      t("Do you want to activate your account as a host?"),
      [
        { text: t("Cancel"), style: "cancel" },
        {
          text: t("Activate"),
          style: "default",
          onPress: async () => {
            try {
              const response: {
                data?: { success?: boolean; message?: string };
              } = await api.post("/users/me/become-host");
              // Always refetch user after attempting to become host
              const { data: latestUser } = await refetch();
              if (latestUser?.role === "host") {
                await setUserRole("host");
                if (showToast) {
                  showToast({
                    type: "success",
                    message: t("common.switchedToHost"),
                  });
                }
                router.replace("/(tabs)/host/today");
              } else {
                throw new Error(response.data?.message || "Unknown error");
              }
            } catch (err: any) {
              if (showToast) {
                showToast({
                  type: "error",
                  message: err?.response?.data?.message || t("errors.generic"),
                });
              }
            }
          },
        },
      ]
    );
  };

  // Debug: Force user data refresh
  const handleDebugRefresh = async () => {
    const { data: latestUser } = await refetch();
    if (showToast) {
      showToast({
        type: "info",
        message: `Refreshed. Latest role: ${latestUser?.role}`,
      });
    }
  };

  return (
    <Container>
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

          {/* Show user role under email */}
          {/* <Text
            variant="caption"
            color={isHost ? theme.colors.primary : theme.colors.secondary}
            style={{
              marginBottom: 4,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {isHost
              ? t("profile.hostLabel", "Host")
              : t("profile.travelerLabel", "Traveler")}
          </Text> */}
          {/* Debug button for force refresh */}
          {/* {__DEV__ && (
            <Button
              title="Debug: Refresh User Data"
              onPress={handleDebugRefresh}
              variant="outline"
              style={{ marginTop: 8, alignSelf: "flex-start" }}
            />
          )}

          {user?.joinedDate && (
            <Text
              variant="caption"
              color={isDark ? theme.colors.gray[500] : theme.colors.gray[500]}
            >
              {t("profile.joinedDate", {
                date: new Date(user.joinedDate).toLocaleDateString(),
              })}
            </Text>
          )} */}
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
      {/* Only show the Become a Host pressable if not a host */}
      {!isHost && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleActivateHost}
          style={{
            borderRadius: radius.lg,
            marginBottom: spacing.lg,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={[
              theme.colors.primary,
              theme.colors.secondary,
              theme.colors.tertiary,
            ]}
            style={{ flex: 1, flexDirection: "row", borderRadius: radius.lg }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Container
              flex={1}
              padding="md"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              style={{ position: "relative" }}
            >
              <Container flexDirection="row" alignItems="center">
                <Icon
                  name="home-outline"
                  color="inverse"
                  size="lg"
                  style={{ marginRight: 12 }}
                />
                <Text variant="body" color="inverse" weight="semibold">
                  {t("profile.becomeAHost")}
                </Text>
              </Container>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={theme.colors.gray[100]}
              />
            </Container>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </Container>
  );
}
