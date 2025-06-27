import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@shared/components/base";
import { useTheme } from "@shared/hooks/useTheme";
import { spacing, fontSize, fontWeight, radius } from "@shared/constants";
import { getUserDisplayName } from "@shared/utils/user";
import type { HostProfileHeaderProps } from "../utils/types";

/**
 * Host Profile Header Component
 * Displays host avatar, name, and QR code button at the top of settings
 */
export const HostProfileHeader: React.FC<HostProfileHeaderProps> = ({
  user,
  loading,
  onQRCodePress,
}) => {
  const { theme, isDark } = useTheme();

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.white,
          },
        ]}
      >
        <View style={styles.profileSection}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.avatarPlaceholder}
          />
          <View style={styles.infoSection}>
            <View
              style={[
                styles.namePlaceholder,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
            />
            <View
              style={[
                styles.emailPlaceholder,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }

  const displayName = getUserDisplayName(user);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.gray[800] : theme.colors.white,
          borderBottomColor: isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[200],
        },
      ]}
    >
      <View style={styles.profileSection}>
        <Avatar
          size="large"
          source={user?.avatarUrl || user?.profileImage}
          name={displayName}
          showBorder
        />
        <View style={styles.infoSection}>
          <Text
            style={[
              styles.displayName,
              {
                color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
              },
            ]}
          >
            {displayName}
          </Text>
          <Text
            style={[
              styles.email,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {user?.email || "Host Profile"}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.qrButton,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[100],
            },
          ]}
          onPress={onQRCodePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="qr-code-outline"
            size={24}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoSection: {
    flex: 1,
    marginLeft: spacing.md,
  },
  displayName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.md,
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  // Loading states
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radius.circle,
  },
  namePlaceholder: {
    height: 20,
    width: 120,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  emailPlaceholder: {
    height: 16,
    width: 180,
    borderRadius: radius.sm,
  },
});
