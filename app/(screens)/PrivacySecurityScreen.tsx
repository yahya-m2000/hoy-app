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
import { useTheme } from "../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { fontSize } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
import { useCurrentUser, useUserPreferences } from "../../src/hooks/useUser";
import { useToast } from "../../src/context/ToastContext";

export default function PrivacySecurityScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isLoading: userLoading } = useCurrentUser();
  const { data: preferences, updatePrefs } = useUserPreferences();

  // Settings state
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);

  // Default notification preferences
  const notificationPrefs = preferences?.notifications || {
    emailNotifications: true,
    pushNotifications: true,
    marketingNotifications: false,
  };

  // Handle toggling notification preferences
  const toggleNotificationPreference = async (key: string, value: boolean) => {
    setIsLoadingPrefs(true);
    try {
      await updatePrefs.mutateAsync({
        notifications: {
          ...preferences?.notifications,
          [key]: value,
        },
      });

      showToast({
        type: "success",
        message: t("privacy.settingsSaved"),
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      showToast({
        type: "error",
        message: t("privacy.settingsError"),
      });
    } finally {
      setIsLoadingPrefs(false);
    }
  };

  // Handle password change
  const handleChangePassword = () => {
    router.push("/(modals)/ChangePasswordModal");
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      t("privacy.deleteAccountTitle"),
      t("privacy.deleteAccountConfirmation"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            // This would typically call a service to delete the account
            Alert.alert(
              t("common.comingSoon"),
              t("common.featureNotAvailable", {
                feature: t("privacy.deleteAccount"),
              })
            );
          },
        },
      ]
    );
  };

  if (userLoading || isLoadingPrefs) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.gray[900]
              : theme.colors.gray[50],
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text
          style={[
            styles.loadingText,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
            },
          ]}
        >
          {t("common.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  // Toggle setting item renderer
  const renderToggleSetting = (
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    disabled = false
  ) => (
    <View
      style={[
        styles.settingItem,
        {
          borderBottomColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[200],
        },
      ]}
    >
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            {
              color: isDark
                ? disabled
                  ? theme.colors.gray[500]
                  : theme.colors.gray[100]
                : disabled
                ? theme.colors.gray[400]
                : theme.colors.gray[900],
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.settingDescription,
            {
              color: isDark
                ? disabled
                  ? theme.colors.gray[600]
                  : theme.colors.gray[400]
                : disabled
                ? theme.colors.gray[500]
                : theme.colors.gray[600],
            },
          ]}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={disabled ? undefined : onToggle}
        disabled={disabled}
        trackColor={{
          false: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
          true: theme.colors.primary[500],
        }}
        thumbColor={theme.white}
      />
    </View>
  );

  // Action setting item renderer
  const renderActionSetting = (
    title: string,
    description: string,
    iconName: any, // Using 'any' to accommodate Ionicons name prop
    onPress: () => void,
    isDanger = false
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          borderBottomColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[200],
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.settingIconContainer}>
        <Ionicons
          name={iconName}
          size={24}
          color={
            isDanger
              ? theme.colors.error[500]
              : isDark
              ? theme.colors.gray[300]
              : theme.colors.gray[700]
          }
        />
      </View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            {
              color: isDanger
                ? theme.colors.error[500]
                : isDark
                ? theme.colors.gray[100]
                : theme.colors.gray[900],
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.settingDescription,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            },
          ]}
        >
          {description}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
            },
          ]}
        >
          {t("account.privacySecurity")}
        </Text>
        <View style={styles.emptyRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Password & Authentication Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            {t("privacy.passwordAuth")}
          </Text>
          <View
            style={[
              styles.sectionContent,
              {
                backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
                borderColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[200],
              },
            ]}
          >
            {renderActionSetting(
              t("privacy.changePassword"),
              t("privacy.changePasswordDesc"),
              "lock-closed-outline",
              handleChangePassword
            )}

            {renderActionSetting(
              t("privacy.twoFactorAuth"),
              t("privacy.twoFactorAuthDesc"),
              "shield-checkmark-outline",
              () =>
                Alert.alert(
                  t("common.comingSoon"),
                  t("common.featureNotAvailable", {
                    feature: t("privacy.twoFactorAuth"),
                  })
                )
            )}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            {t("privacy.notifications")}
          </Text>
          <View
            style={[
              styles.sectionContent,
              {
                backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
                borderColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[200],
              },
            ]}
          >
            {renderToggleSetting(
              t("privacy.emailNotifications"),
              t("privacy.emailNotificationsDesc"),
              notificationPrefs.emailNotifications,
              (value) =>
                toggleNotificationPreference("emailNotifications", value)
            )}

            {renderToggleSetting(
              t("privacy.pushNotifications"),
              t("privacy.pushNotificationsDesc"),
              notificationPrefs.pushNotifications,
              (value) =>
                toggleNotificationPreference("pushNotifications", value)
            )}

            {renderToggleSetting(
              t("privacy.marketingEmails"),
              t("privacy.marketingEmailsDesc"),
              notificationPrefs.marketingNotifications || false,
              (value) =>
                toggleNotificationPreference("marketingNotifications", value)
            )}
          </View>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            {t("privacy.dataPrivacy")}
          </Text>
          <View
            style={[
              styles.sectionContent,
              {
                backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
                borderColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[200],
              },
            ]}
          >
            {renderActionSetting(
              t("privacy.privacyPolicy"),
              t("privacy.privacyPolicyDesc"),
              "document-text-outline",
              () =>
                Alert.alert(
                  t("common.comingSoon"),
                  t("common.featureNotAvailable", {
                    feature: t("privacy.privacyPolicy"),
                  })
                )
            )}

            {renderActionSetting(
              t("privacy.dataDownload"),
              t("privacy.dataDownloadDesc"),
              "download-outline",
              () =>
                Alert.alert(
                  t("common.comingSoon"),
                  t("common.featureNotAvailable", {
                    feature: t("privacy.dataDownload"),
                  })
                )
            )}

            {renderActionSetting(
              t("privacy.deleteAccount"),
              t("privacy.deleteAccountDesc"),
              "trash-outline",
              handleDeleteAccount,
              true
            )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  emptyRight: {
    width: 44,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  sectionContent: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    marginRight: spacing.sm,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: fontSize.sm,
  },
  loadingText: {
    fontSize: fontSize.md,
    marginTop: spacing.sm,
  },
});
