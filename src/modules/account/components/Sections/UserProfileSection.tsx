/**
 * UserProfileSection component
 * Displays user profile information including avatar, name, and join date
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useUserRole } from "@shared/context";
import { radius, fontSize, fontWeight, spacing } from "@shared/constants";

// Components
import { Avatar, LoadingSkeleton } from "@shared/components";
interface UserProfileSectionProps {
  currentUser: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
    joinedDate?: string;
  } | null;
  joinedDate: string;
  userLoading: boolean;
  onEditProfile: () => void;
}

export default function UserProfileSection({
  currentUser,
  joinedDate,
  userLoading,
  onEditProfile,
}: UserProfileSectionProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  if (userLoading) {
    return (
      <View style={styles.profileSection}>
        <LoadingSkeleton
          height={80}
          width={80}
          borderRadius={40}
          style={styles.skeletonAvatar}
        />
        <View style={styles.profileInfo}>
          <LoadingSkeleton
            height={24}
            width={150}
            style={styles.skeletonName}
          />
          <LoadingSkeleton
            height={16}
            width={200}
            style={styles.skeletonEmail}
          />
          <LoadingSkeleton
            height={14}
            width={100}
            style={styles.skeletonJoined}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.profileSection}>
      {" "}
      <Avatar
        source={currentUser?.profilePicture}
        size={80}
        name={`${currentUser?.firstName || ""} ${
          currentUser?.lastName || ""
        }`.trim()}
      />
      <View style={styles.profileInfo}>
        <Text
          style={[
            styles.profileName,
            {
              color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
            },
          ]}
        >
          {currentUser?.firstName || currentUser?.lastName
            ? `${currentUser.firstName || ""} ${
                currentUser.lastName || ""
              }`.trim()
            : t("account.guestUser")}
        </Text>
        <Text
          style={[
            styles.profileEmail,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            },
          ]}
        >
          {currentUser?.email || t("account.notSignedIn")}
        </Text>
        {joinedDate && (
          <Text
            style={[
              styles.profileJoined,
              {
                color: isDark ? theme.colors.gray[500] : theme.colors.gray[500],
              },
            ]}
          >
            {t("account.joinedDate", { date: joinedDate })}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.editButton,
          {
            backgroundColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[100],
          },
        ]}
        onPress={onEditProfile}
      >
        <Ionicons
          name="pencil-outline"
          size={20}
          color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  profileJoined: {
    fontSize: fontSize.sm,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  skeletonAvatar: {
    marginRight: spacing.md,
  },
  skeletonName: {
    marginBottom: spacing.xs,
  },
  skeletonEmail: {
    marginBottom: spacing.xs,
  },
  skeletonJoined: {},
});
