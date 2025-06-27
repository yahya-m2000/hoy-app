/**
 * Privacy & Security Screen for the Hoy application
 * Allows users to manage their privacy and security settings
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useToast } from "@shared/context";
import { useTheme } from "@shared/hooks/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { fontSize, fontWeight, spacing, radius } from "@shared/constants";

import {
  useCurrentUser,
  useUserPreferences,
  useUpdatePreferences,
} from "@shared/hooks";
import { CustomHeader } from "@shared/components";

export default function PrivacySecurityScreen() {
  const { theme, isDark } = useTheme();
  const { showToast } = useToast();
  const { isLoading: userLoading } = useCurrentUser();
  const { data: preferences } = useUserPreferences();
  const updatePrefs = useUpdatePreferences();

  // Settings state
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);

  // Default notification preferences
  const notificationPrefs = preferences?.notifications || {
    emailNotifications: true,
    pushNotifications: true,
    marketingNotifications: false,
  };

  // Helper functions
  const handleNotificationToggle = async (
    type: keyof typeof notificationPrefs,
    value: boolean
  ) => {
    if (isLoadingPrefs || updatePrefs.isPending) return;

    setIsLoadingPrefs(true);
    try {
      const updatedPrefs = {
        ...preferences,
        notifications: {
          ...notificationPrefs,
          [type]: value,
        },
      };
      await updatePrefs.mutateAsync(updatedPrefs);
      showToast({
        message: "Preferences updated successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      showToast({
        message: "Failed to update preferences",
        type: "error",
      });
    } finally {
      setIsLoadingPrefs(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            console.log("Account deletion initiated");
          },
        },
      ]
    );
  };

  const handleDataDownload = () => {
    Alert.alert(
      "Download Data",
      "We'll prepare your data for download and send you a link via email.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request Download",
          onPress: () => {
            // TODO: Implement data download request
            console.log("Data download requested");
            showToast({
              message: "Data download request submitted",
              type: "success",
            });
          },
        },
      ]
    );
  };

  if (userLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <CustomHeader title="Privacy & Security" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: string,
    action: () => void,
    rightElement?: React.ReactNode,
    destructive = false
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: theme.border }]}
      onPress={action}
      disabled={isLoadingPrefs}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons
          name={icon as any}
          size={24}
          color={destructive ? "#FF6B6B" : theme.text.secondary}
          style={styles.settingIcon}
        />
        <View style={styles.settingTextContainer}>
          <Text
            style={[
              styles.settingTitle,
              { color: destructive ? "#FF6B6B" : theme.text.primary },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[styles.settingSubtitle, { color: theme.text.secondary }]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {rightElement || (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.text.secondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <CustomHeader title="Privacy & Security" showBackButton />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Preferences */}
        {renderSection(
          "Notification Preferences",
          <>
            {renderSettingItem(
              "Email Notifications",
              "Receive booking confirmations and updates via email",
              "mail-outline",
              () => {},
              <Switch
                value={notificationPrefs.emailNotifications}
                onValueChange={(value) =>
                  handleNotificationToggle("emailNotifications", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
                disabled={isLoadingPrefs}
              />
            )}
            {renderSettingItem(
              "Push Notifications",
              "Receive push notifications on your device",
              "notifications-outline",
              () => {},
              <Switch
                value={notificationPrefs.pushNotifications}
                onValueChange={(value) =>
                  handleNotificationToggle("pushNotifications", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
                disabled={isLoadingPrefs}
              />
            )}
            {renderSettingItem(
              "Marketing Notifications",
              "Receive promotional offers and updates",
              "megaphone-outline",
              () => {},
              <Switch
                value={notificationPrefs.marketingNotifications}
                onValueChange={(value) =>
                  handleNotificationToggle("marketingNotifications", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
                disabled={isLoadingPrefs}
              />
            )}
          </>
        )}

        {/* Privacy Settings */}
        {renderSection(
          "Privacy Settings",
          <>
            {renderSettingItem(
              "Profile Visibility",
              "Control who can see your profile information",
              "eye-outline",
              () => {
                console.log("Profile visibility settings");
              }
            )}
            {renderSettingItem(
              "Search Privacy",
              "Manage how you appear in search results",
              "search-outline",
              () => {
                console.log("Search privacy settings");
              }
            )}
            {renderSettingItem(
              "Location Sharing",
              "Control location data usage",
              "location-outline",
              () => {
                console.log("Location sharing settings");
              }
            )}
          </>
        )}

        {/* Security Settings */}
        {renderSection(
          "Security Settings",
          <>
            {renderSettingItem(
              "Change Password",
              "Update your account password",
              "lock-closed-outline",
              () => {
                console.log("Change password");
              }
            )}
            {renderSettingItem(
              "Two-Factor Authentication",
              "Add an extra layer of security",
              "shield-checkmark-outline",
              () => {
                console.log("Two-factor authentication");
              }
            )}
            {renderSettingItem(
              "Login Activity",
              "View recent login attempts",
              "time-outline",
              () => {
                console.log("Login activity");
              }
            )}
          </>
        )}

        {/* Data Management */}
        {renderSection(
          "Data Management",
          <>
            {renderSettingItem(
              "Download My Data",
              "Request a copy of your personal data",
              "download-outline",
              handleDataDownload
            )}
            {renderSettingItem(
              "Delete Account",
              "Permanently delete your account and data",
              "trash-outline",
              handleDeleteAccount,
              undefined,
              true
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingItemRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  settingIcon: {
    marginRight: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});
