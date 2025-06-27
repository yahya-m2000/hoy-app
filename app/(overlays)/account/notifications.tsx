/**
 * Notifications Screen for the Hoy application
 * Allows users to manage their notification preferences
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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

export default function NotificationsScreen() {
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
    bookingUpdates: true,
    messageNotifications: true,
    reviewReminders: true,
    specialOffers: false,
    policyUpdates: true,
  };

  // Helper function to handle notification toggles
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
        message: "Notification preferences updated",
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

  if (userLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <CustomHeader title="Notifications" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>
            Loading notification settings...
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

  const renderNotificationItem = (
    title: string,
    subtitle: string,
    icon: string,
    type: keyof typeof notificationPrefs
  ) => (
    <View
      style={[styles.notificationItem, { borderBottomColor: theme.border }]}
    >
      <View style={styles.notificationItemLeft}>
        <Ionicons
          name={icon as any}
          size={24}
          color={theme.text.secondary}
          style={styles.notificationIcon}
        />
        <View style={styles.notificationTextContainer}>
          <Text
            style={[styles.notificationTitle, { color: theme.text.primary }]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.notificationSubtitle,
              { color: theme.text.secondary },
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <Switch
        value={notificationPrefs[type]}
        onValueChange={(value) => handleNotificationToggle(type, value)}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={theme.surface}
        disabled={isLoadingPrefs}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <CustomHeader title="Notifications" showBackButton />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Communication Notifications */}
        {renderSection(
          "Communication",
          <>
            {renderNotificationItem(
              "Push Notifications",
              "Receive notifications on your device",
              "notifications-outline",
              "pushNotifications"
            )}
            {renderNotificationItem(
              "Email Notifications",
              "Receive updates via email",
              "mail-outline",
              "emailNotifications"
            )}
            {renderNotificationItem(
              "Message Notifications",
              "Get notified about new messages from hosts",
              "chatbubble-outline",
              "messageNotifications"
            )}
          </>
        )}

        {/* Booking & Travel */}
        {renderSection(
          "Booking & Travel",
          <>
            {renderNotificationItem(
              "Booking Updates",
              "Confirmations, cancellations, and changes",
              "calendar-outline",
              "bookingUpdates"
            )}
            {renderNotificationItem(
              "Review Reminders",
              "Reminders to review your stays",
              "star-outline",
              "reviewReminders"
            )}
          </>
        )}

        {/* Marketing & Offers */}
        {renderSection(
          "Marketing & Offers",
          <>
            {renderNotificationItem(
              "Special Offers",
              "Deals and promotions from Hoy",
              "gift-outline",
              "specialOffers"
            )}
            {renderNotificationItem(
              "Marketing Communications",
              "Tips, trends, and feature updates",
              "megaphone-outline",
              "marketingNotifications"
            )}
          </>
        )}

        {/* Legal & Policy */}
        {renderSection(
          "Legal & Policy",
          <>
            {renderNotificationItem(
              "Policy Updates",
              "Changes to terms of service and privacy policy",
              "document-text-outline",
              "policyUpdates"
            )}
          </>
        )}

        {/* Info Section */}
        <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={theme.primary}
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.text.primary }]}>
              About Notifications
            </Text>
            <Text
              style={[styles.infoSubtitle, { color: theme.text.secondary }]}
            >
              Some notifications are required for security and legal purposes
              and cannot be disabled. You can always manage your device&apos;s
              notification settings in your phone&apos;s settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  notificationItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  notificationIcon: {
    marginRight: spacing.md,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  notificationSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  infoSection: {
    flexDirection: "row",
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  infoSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
  },
});
