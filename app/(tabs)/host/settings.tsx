import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useTheme, useUserRole } from "@shared/context";
import { LoadingSpinner } from "@shared/components";
// import {
// getUserProfile,
// updateUserProfile,
// getUserPreferences,
// updateUserPreferences,
// } from "../../../src/host/services/hostService";
import {
  getCurrentUser as getUserProfile,
  updateProfile as updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
} from "@shared/services";

import type { User } from "@shared/types";
import { router } from "expo-router";

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: "navigation" | "toggle" | "action";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function HostSettings() {
  const { markAsUnauthenticated } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { toggleUserRole } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [hostProfile, setHostProfile] = useState<User | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAcceptBookings, setAutoAcceptBookings] = useState(false);

  const loadHostProfile = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📋 Loading host profile from API...");

      // Load both profile and preferences
      const [profileResponse, preferencesResponse] = await Promise.allSettled([
        getUserProfile(),
        getUserPreferences(),
      ]);

      if (profileResponse.status === "fulfilled") {
        console.log("✅ Host profile loaded:", profileResponse.value);
        const userData =
          (profileResponse.value as any)?.data || profileResponse.value;
        setHostProfile(userData as User);
      } else {
        console.error("❌ Error loading profile:", profileResponse.reason);
      }
      if (preferencesResponse.status === "fulfilled") {
        const preferences = preferencesResponse.value as any;
        setNotificationsEnabled(preferences?.notifications?.enabled ?? true);
        setAutoAcceptBookings(preferences?.autoAcceptBookings ?? false);
      } else {
        console.error(
          "❌ Error loading preferences:",
          preferencesResponse.reason
        );
      }
    } catch (error) {
      console.error("❌ Error loading host data:", error);
      Alert.alert(
        "Error",
        "Failed to load profile data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHostProfile();
  }, [loadHostProfile]);

  const handleEditProfile = async () => {
    if (!hostProfile) return;

    Alert.prompt(
      "Edit Name",
      "Enter your new name:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (newName) => {
            if (!newName || newName.trim() === "") return;
            try {
              setLoading(true);
              const updatedProfile = await updateUserProfile({
                name: newName.trim(),
              });

              const userData = (updatedProfile as any)?.data || updatedProfile;
              setHostProfile(userData);
              Alert.alert("Success", "Profile updated successfully!");
            } catch (error) {
              console.error("Error updating profile:", error);
              Alert.alert(
                "Error",
                "Failed to update profile. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      "plain-text",
      (hostProfile as any)?.name || ""
    );
  };

  const handleHostTools = () => {
    Alert.alert(
      "Host Tools",
      "Advanced host tools coming soon!\n\n• Bulk pricing updates\n• Analytics dashboard\n• Performance insights\n• Marketing tools",
      [{ text: "OK" }]
    );
  };

  const handleEarnings = () => {
    Alert.alert(
      "Earnings",
      "Earnings dashboard coming soon!\n\n• Revenue reports\n• Payout history\n• Tax documents\n• Financial insights",
      [{ text: "OK" }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      "Support",
      "Host support coming soon!\n\n• 24/7 host support\n• Resource center\n• Community forum\n• Contact us",
      [{ text: "OK" }]
    );
  };
  const handleSwitchToTraveler = () => {
    Alert.alert(
      "Switch to Traveler Mode",
      "Are you sure you want to switch back to Traveler mode?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: async () => {
            try {
              await toggleUserRole();
              // Force navigation to traveler home after role switch
              // Use replace to reset navigation stack
              if (router.canGoBack()) {
                router.dismissAll();
              }
              router.replace("/(tabs)/traveler/home");
            } catch (error) {
              console.error("Error switching to traveler mode:", error);
              Alert.alert("Error", "Failed to switch modes. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      await updateUserPreferences({
        notifications: { enabled: value },
      });
    } catch (error) {
      console.error("Error updating notification preference:", error);
      // Revert on error
      setNotificationsEnabled(!value);
      Alert.alert("Error", "Failed to update notification settings.");
    }
  };

  const handleAutoAcceptToggle = async (value: boolean) => {
    try {
      setAutoAcceptBookings(value);
      await updateUserPreferences({
        autoAcceptBookings: value,
      });
    } catch (error) {
      console.error("Error updating auto-accept preference:", error);
      // Revert on error
      setAutoAcceptBookings(!value);
      Alert.alert("Error", "Failed to update auto-accept settings.");
    }
  };
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: markAsUnauthenticated,
      },
    ]);
  };

  const profileSettings: SettingsItem[] = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      subtitle: "Update your host information",
      icon: "person-outline",
      type: "navigation",
      onPress: handleEditProfile,
    },
    {
      id: "host-tools",
      title: "Host Tools",
      subtitle: "Advanced hosting features",
      icon: "build-outline",
      type: "navigation",
      onPress: handleHostTools,
    },
    {
      id: "earnings",
      title: "Earnings",
      subtitle: "View your revenue and payouts",
      icon: "card-outline",
      type: "navigation",
      onPress: handleEarnings,
    },
  ];
  const accountSettings: SettingsItem[] = [
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Push notifications for bookings",
      icon: "notifications-outline",
      type: "toggle",
      value: notificationsEnabled,
      onToggle: handleNotificationToggle,
    },
    {
      id: "auto-accept",
      title: "Auto-accept Bookings",
      subtitle: "Automatically accept qualified bookings",
      icon: "checkmark-circle-outline",
      type: "toggle",
      value: autoAcceptBookings,
      onToggle: handleAutoAcceptToggle,
    },
    {
      id: "dark-mode",
      title: "Dark Mode",
      subtitle: "Toggle app appearance",
      icon: "moon-outline",
      type: "toggle",
      value: isDark,
      onToggle: toggleTheme,
    },
  ];

  const supportSettings: SettingsItem[] = [
    {
      id: "support",
      title: "Support & Help",
      subtitle: "Get help with hosting",
      icon: "help-circle-outline",
      type: "navigation",
      onPress: handleSupport,
    },
    {
      id: "switch-mode",
      title: "Switch to Traveler Mode",
      subtitle: "Browse and book as a guest",
      icon: "swap-horizontal-outline",
      type: "action",
      onPress: handleSwitchToTraveler,
    },
    {
      id: "logout",
      title: "Logout",
      subtitle: "Sign out of your account",
      icon: "log-out-outline",
      type: "action",
      onPress: handleLogout,
    },
  ];
  const renderSettingsSection = (title: string, items: SettingsItem[]) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
        {title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.settingsItem,
              index < items.length - 1 && styles.settingsItemBorder,
              { borderBottomColor: theme.border },
            ]}
            onPress={item.onPress}
            disabled={item.type === "toggle"}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons
                name={item.icon}
                size={24}
                color={theme.primary}
                style={styles.settingsIcon}
              />
              <View style={styles.settingsText}>
                <Text
                  style={[styles.settingsTitle, { color: theme.text.primary }]}
                >
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text
                    style={[
                      styles.settingsSubtitle,
                      { color: theme.text.secondary },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </View>

            {item.type === "toggle" ? (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.background}
              />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.text.secondary}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
        <View style={styles.profileImageContainer}>
          {hostProfile?.profileImage ? (
            <Image
              source={{ uri: hostProfile.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={[
                styles.profileImagePlaceholder,
                { backgroundColor: theme.primary },
              ]}
            >
              <Ionicons name="person" size={40} color={theme.background} />
            </View>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.text.primary }]}>
            {hostProfile?.firstName} {hostProfile?.lastName}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.text.secondary }]}>
            {hostProfile?.email}
          </Text>
          <View style={styles.hostBadge}>
            <Ionicons name="home" size={16} color={theme.primary} />
            <Text style={[styles.hostBadgeText, { color: theme.primary }]}>
              Host Mode
            </Text>
          </View>
        </View>
      </View>

      {/* Settings Sections */}
      {renderSettingsSection("Profile & Tools", profileSettings)}
      {renderSettingsSection("Account Settings", accountSettings)}
      {renderSettingsSection("Support & Actions", supportSettings)}

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: theme.text.secondary }]}>
          Hoy Host App v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  hostBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  hostBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingsItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
  },
  footer: {
    alignItems: "center",
    padding: 24,
    marginTop: 24,
  },
  versionText: {
    fontSize: 12,
  },
});
