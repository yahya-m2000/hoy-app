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
import { useTheme } from "@common-context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";
import {
  useCurrentUser,
  useUserPreferences,
  useUpdatePreferences,
} from "@common-hooks/useUser";
import { useToast } from "@common-context/ToastContext";

export default function PrivacySecurityScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
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
  const handleTogglePreference = async (key: string, value: boolean) => {
    setIsLoadingPrefs(true);
    try {
      await updatePrefs.mutateAsync({
        notifications: {
          ...notificationPrefs,
          [key]: value,
        },
      });
      showToast({
        message: t("account.settings.updated"),
        type: "success"
      });
    } catch (error) {
      console.error("Error updating preference:", error);
      showToast({
        message: t("account.settings.updateError"),
        type: "error"
      });
    } finally {
      setIsLoadingPrefs(false);
    }
  };

  const handleChangePassword = () => {
    // TODO: Implement password change flow
    Alert.alert(
      t("account.security.changePassword"),
      t("account.security.changePasswordDescription"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.continue"), onPress: () => {} },
      ]
    );
  };

  const handleTwoFactorAuth = () => {
    // TODO: Implement 2FA setup
    Alert.alert(
      t("account.security.twoFactorAuth"),
      t("account.security.twoFactorAuthDescription"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("account.security.setupTwoFactor"), onPress: () => {} },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("account.security.deleteAccount"),
      t("account.security.deleteAccountWarning"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert(
              t("account.security.deleteAccount"),
              t("account.security.deleteAccountConfirmation"),
              [
                { text: t("common.cancel"), style: "cancel" },
                {
                  text: t("common.delete"),
                  style: "destructive",
                  onPress: () => {},
                },
              ]
            );
          },
        },
      ]
    );
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={[styles.section, { backgroundColor: theme.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.divider,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons
          name={icon as any}
          size={24}
          color={theme.primary}
          style={styles.settingIcon}
        />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.settingSubtitle, { color: theme.text.secondary }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.text.secondary}
        />
        {rightElement}
      </View>
    </TouchableOpacity>
  );

  const renderToggleItem = (
    icon: string,
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: (value: boolean) => void
  ) => (
    <View
      style={[
        styles.settingItem,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.divider,
        },
      ]}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons
          name={icon as any}
          size={24}
          color={theme.primary}
          style={styles.settingIcon}
        />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
            {title}
          </Text>
          <Text
            style={[styles.settingSubtitle, { color: theme.text.secondary }]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: theme.divider,
          true: theme.primary,
        }}
        thumbColor={value ? theme.primary : theme.text.secondary}
        disabled={isLoadingPrefs}
      />
    </View>
  );

  if (userLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>
            {t("common.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        {renderSection(
          t("account.privacy.title"),
          <>
            {renderToggleItem(
              "mail",
              t("account.privacy.emailNotifications"),
              t("account.privacy.emailNotificationsDescription"),
              notificationPrefs.emailNotifications,
              (value) => handleTogglePreference("emailNotifications", value)
            )}
            {renderToggleItem(
              "notifications",
              t("account.privacy.pushNotifications"),
              t("account.privacy.pushNotificationsDescription"),
              notificationPrefs.pushNotifications,
              (value) => handleTogglePreference("pushNotifications", value)
            )}
            {renderToggleItem(
              "megaphone",
              t("account.privacy.marketingNotifications"),
              t("account.privacy.marketingNotificationsDescription"),
              notificationPrefs.marketingNotifications,
              (value) => handleTogglePreference("marketingNotifications", value)
            )}
            {renderSettingItem(
              "eye",
              t("account.privacy.dataVisibility"),
              t("account.privacy.dataVisibilityDescription"),
              () => {
                // TODO: Navigate to data visibility settings
              }
            )}
            {renderSettingItem(
              "download",
              t("account.privacy.downloadData"),
              t("account.privacy.downloadDataDescription"),
              () => {
                // TODO: Implement data download
                Alert.alert(
                  t("account.privacy.downloadData"),
                  t("account.privacy.downloadDataInfo")
                );
              }
            )}
          </>
        )}

        {/* Security Settings */}
        {renderSection(
          t("account.security.title"),
          <>
            {renderSettingItem(
              "key",
              t("account.security.changePassword"),
              t("account.security.changePasswordDescription"),
              handleChangePassword
            )}
            {renderSettingItem(
              "shield-checkmark",
              t("account.security.twoFactorAuth"),
              t("account.security.twoFactorAuthDescription"),
              handleTwoFactorAuth
            )}
            {renderSettingItem(
              "phone-portrait",
              t("account.security.loginActivity"),
              t("account.security.loginActivityDescription"),
              () => {
                // TODO: Navigate to login activity
              }
            )}
            {renderSettingItem(
              "business",
              t("account.security.connectedApps"),
              t("account.security.connectedAppsDescription"),
              () => {
                // TODO: Navigate to connected apps
              }
            )}
          </>
        )}

        {/* Danger Zone */}
        {renderSection(
          t("account.security.dangerZone"),
          <>
            {renderSettingItem(
              "trash",
              t("account.security.deleteAccount"),
              t("account.security.deleteAccountDescription"),
              handleDeleteAccount
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },  loadingText: {
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
  },  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
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
  },  settingItemLeft: {
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
  },  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});
