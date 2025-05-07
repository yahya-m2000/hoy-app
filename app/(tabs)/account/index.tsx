/**
 * Account screen for the Hoy application
 * Shows user profile and settings
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showCleanSlateAlert } from "../../../src/utils/cacheBuster";
import { useTheme } from "../../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { fontSize } from "../../../src/constants/typography";
import { spacing } from "../../../src/constants/spacing";
import { radius } from "../../../src/constants/radius";
import Avatar from "../../../src/components/Avatar";
import { useAuth } from "../../../src/context/AuthContext";
import { useCurrentUser } from "../../../src/hooks/useUser";
import { useCurrency } from "../../../src/hooks/useCurrency";
import { format } from "date-fns";
import LoadingSkeleton from "../../../src/components/LoadingSkeleton";

interface SettingsItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  action?: () => void;
  rightElement?: React.ReactNode;
  isDanger?: boolean;
}

export default function AccountScreen() {
  const { theme, isDark, toggleTheme, mode } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, logout, loading: authLoading, emergencyDataPurge } = useAuth();
  const {
    data: currentUser,
    isLoading: userLoading,
    refetch,
  } = useCurrentUser();
  const { currency, getSymbol } = useCurrency();
  const [isHost, setIsHost] = useState(false);
  const [showDevOptions, setShowDevOptions] = useState(false);

  // Check if dev mode was previously enabled
  useEffect(() => {
    const checkDevMode = async () => {
      try {
        const storedCount = await AsyncStorage.getItem("devTapCount");
        const devTapCount = parseInt(storedCount || "0", 10) || 0;
        if (devTapCount >= 10) {
          setShowDevOptions(true);
        }
      } catch (error) {
        console.error("Error checking dev mode:", error);
      }
    };

    checkDevMode();
  }, []);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now()); // Track last refresh time

  // Use useFocusEffect for screen focus behavior
  useFocusEffect(
    React.useCallback(() => {
      console.log("Account screen focused - refreshing user data");
      refetch();
      setLastRefresh(Date.now());

      // No cleanup needed for useFocusEffect
    }, [refetch])
  );

  // Also refresh on initial mount
  useEffect(() => {
    refetch();
  }, [refetch]);
  // Update host status when user data is loaded
  useEffect(() => {
    if (currentUser) {
      setIsHost(currentUser.role === "host");
      console.log(`User data loaded: ${currentUser.email} (${currentUser.id})`);
    }
  }, [currentUser]);

  // Format joined date if available
  const joinedDate = currentUser?.joinedDate
    ? format(new Date(currentUser.joinedDate), "MMMM yyyy")
    : "";

  // Show "coming soon" alert for unimplemented features
  const showComingSoonAlert = (featureName: string) => {
    Alert.alert(
      t("common.comingSoon"),
      t("common.featureNotAvailable", { feature: featureName }),
      [{ text: t("common.ok") }]
    );
  };

  // Function to render a settings section
  const renderSettingsSection = (title: string, items: SettingsItem[]) => {
    return (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
            },
          ]}
        >
          {title}
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
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingsItem,
                {
                  borderBottomWidth: index < items.length - 1 ? 1 : 0,
                  borderBottomColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
              onPress={item.action}
            >
              <View
                style={[
                  styles.settingsIconContainer,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[100],
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={
                    item.isDanger
                      ? theme.colors.error[500]
                      : theme.colors.primary[500]
                  }
                />
              </View>
              <View style={styles.settingsContent}>
                <Text
                  style={[
                    styles.settingsTitle,
                    {
                      color: item.isDanger
                        ? theme.colors.error[500]
                        : isDark
                        ? theme.colors.gray[100]
                        : theme.colors.gray[900],
                    },
                  ]}
                >
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text
                    style={[
                      styles.settingsSubtitle,
                      {
                        color: isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                )}
              </View>
              {item.rightElement ? (
                item.rightElement
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={
                    isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                  }
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  // Account settings
  const accountSettings: SettingsItem[] = [
    {
      id: "profile",
      icon: "person-outline",
      title: t("account.personalInfo"),
      action: () => router.push("/(screens)/PersonalInfoScreen"),
    },
    {
      id: "payment",
      icon: "card-outline",
      title: t("account.paymentMethods"),
      action: () => showComingSoonAlert(t("account.paymentMethods")),
    },
    {
      id: "notifications",
      icon: "notifications-outline",
      title: t("account.notifications"),
      action: () => showComingSoonAlert(t("account.notifications")),
    },
    {
      id: "privacy",
      icon: "lock-closed-outline",
      title: t("account.privacySecurity"),
      action: () => router.push("/(screens)/PrivacySecurityScreen"),
    },
  ];

  // Preferences settings
  const preferenceSettings: SettingsItem[] = [
    {
      id: "language",
      icon: "language-outline",
      title: t("account.language"),
      subtitle:
        i18n.language === "en"
          ? "English"
          : i18n.language === "fr"
          ? "Français"
          : "العربية",
      action: () => router.push("/(modals)/LanguageModal"),
    },
    {
      id: "currency",
      icon: "cash-outline",
      title: t("account.currency"),
      subtitle: `${currency} (${getSymbol(currency)})`,
      action: () => router.push("/(modals)/CurrencyModal"),
    },
    {
      id: "theme",
      icon: isDark ? "moon-outline" : "sunny-outline",
      title: t("account.theme"),
      subtitle:
        mode === "system"
          ? t("account.themeSystem")
          : isDark
          ? t("account.themeDark")
          : t("account.themeLight"),
      action: () => toggleTheme(),
      rightElement: (
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{
            false: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
            true: theme.colors.primary[500],
          }}
          thumbColor={theme.white}
        />
      ),
    },
    {
      id: "hostMode",
      icon: "home-outline",
      title: t("account.hostMode"),
      subtitle: isHost ? t("account.hostModeOn") : t("account.hostModeOff"),
      action: () => setIsHost(!isHost),
      rightElement: (
        <Switch
          value={isHost}
          onValueChange={setIsHost}
          trackColor={{
            false: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
            true: theme.colors.primary[500],
          }}
          thumbColor={theme.white}
        />
      ),
    },
  ]; // Support settings
  const supportSettings: SettingsItem[] = [
    {
      id: "help",
      icon: "help-circle-outline",
      title: t("account.helpCenter"),
      action: () => showComingSoonAlert(t("account.helpCenter")),
    },
    {
      id: "feedback",
      icon: "chatbubble-outline",
      title: t("account.giveFeedback"),
      action: () => showComingSoonAlert(t("account.giveFeedback")),
    },
    {
      id: "resetApp",
      icon: "refresh-circle-outline",
      title: t("account.resetApp") || "Reset App Data",
      subtitle:
        t("account.resetAppDesc") || "Fix issues by clearing cached data",
      action: () => showCleanSlateAlert(),
    },
    {
      id: "terms",
      icon: "document-text-outline",
      title: t("account.termsOfService"),
      action: () => showComingSoonAlert(t("account.termsOfService")),
    },
    // Add developer tools after 10 taps on app version (see onVersionPress)
    ...(showDevOptions
      ? [
          {
            id: "dev-refresh",
            icon: "refresh-circle-outline",
            title: "🛠️ Force Refresh User Data",
            subtitle: `Last refresh: ${new Date(
              lastRefresh
            ).toLocaleTimeString()}`,
            action: () => {
              refetch();
              setLastRefresh(Date.now());
              Alert.alert(
                "Refresh Triggered",
                "User data has been forcibly refreshed from the server."
              );
            },
          },
          {
            id: "dev-clear-cache",
            icon: "trash-outline",
            title: "🛠️ Clear Query Cache",
            action: () => {
              // This triggers our more comprehensive data purge
              emergencyDataPurge();
              Alert.alert(
                "Cache Cleared",
                "Query cache has been cleared. This should fix any stale data issues.",
                [{ text: "OK" }]
              );
            },
          },
        ]
      : []),
  ];
  // Legal and account management
  const legalSettings: SettingsItem[] = [
    {
      id: "logout",
      icon: "log-out-outline",
      title: t("account.signOut"),
      isDanger: true,
      action: logout,
    },
  ];

  // Developer options - shown after tapping version number 5 times
  // const devSettings: SettingsItem[] = showDevOptions
  //   ? [
  //       {
  //         id: "emergencyReset",
  //         icon: "nuclear-outline",
  //         title: "Emergency Data Reset",
  //         subtitle: "Use only if experiencing login/session issues",
  //         isDanger: true,
  //         action: () => {
  //           Alert.alert(
  //             "Emergency Data Reset",
  //             "This will completely reset all app data and log you out. This is for troubleshooting only. Continue?",
  //             [
  //               {
  //                 text: "Cancel",
  //                 style: "cancel",
  //               },
  //               {
  //                 text: "Reset Everything",
  //                 style: "destructive",
  //                 onPress: async () => {
  //                   await emergencyDataPurge();
  //                   Alert.alert(
  //                     "Reset Complete",
  //                     "All user data has been purged. Please restart the app and log in again.",
  //                     [
  //                       {
  //                         text: "OK",
  //                         onPress: () => logout(),
  //                       },
  //                     ]
  //                   );
  //                 },
  //               },
  //             ]
  //           );
  //         },
  //       },
  //     ]
  //   : [];

  // Show loading spinner when auth is being determined
  if (authLoading) {
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

  // Generate general settings for non-authenticated users
  const guestPreferenceSettings: SettingsItem[] = [
    {
      id: "language",
      icon: "language-outline",
      title: t("account.language"),
      subtitle:
        i18n.language === "en"
          ? "English"
          : i18n.language === "fr"
          ? "Français"
          : "العربية",
      action: () => router.push("/(modals)/LanguageModal"),
    },
    {
      id: "currency",
      icon: "cash-outline",
      title: t("account.currency"),
      subtitle: `${currency} (${getSymbol(currency)})`,
      action: () => router.push("/(modals)/CurrencyModal"),
    },
    {
      id: "theme",
      icon: isDark ? "moon-outline" : "sunny-outline",
      title: t("account.theme"),
      subtitle:
        mode === "system"
          ? t("account.themeSystem")
          : isDark
          ? t("account.themeDark")
          : t("account.themeLight"),
      action: () => toggleTheme(),
      rightElement: (
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{
            false: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
            true: theme.colors.primary[500],
          }}
          thumbColor={theme.white}
        />
      ),
    },
  ];

  // Guest support settings
  const guestSupportSettings: SettingsItem[] = [
    {
      id: "help",
      icon: "help-circle-outline",
      title: t("account.helpCenter"),
      action: () => showComingSoonAlert(t("account.helpCenter")),
    },
    {
      id: "feedback",
      icon: "chatbubble-outline",
      title: t("account.giveFeedback"),
      action: () => showComingSoonAlert(t("account.giveFeedback")),
    },
    {
      id: "terms",
      icon: "document-text-outline",
      title: t("account.termsOfService"),
      action: () => showComingSoonAlert(t("account.termsOfService")),
    },
  ];

  // Show settings with sign-in prompt for non-authenticated users
  if (!user && !authLoading) {
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

        {/* Guest header */}
        <View
          style={[
            styles.guestHeader,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
            },
          ]}
        >
          <Ionicons
            name="person-circle-outline"
            size={60}
            color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
          />
          <View style={styles.guestHeaderContent}>
            <Text
              style={[
                styles.guestTitle,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {t("account.signInRequired")}
            </Text>
            <Text
              style={[
                styles.guestSubtitle,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("account.signInPrompt")}
            </Text>
          </View>
        </View>

        {/* Sign in button */}
        <TouchableOpacity
          style={[
            styles.signInButtonContainer,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
            },
          ]}
          onPress={() => router.push("/(modals)/AuthModal")}
        >
          <View
            style={[
              styles.settingsIconContainer,
              {
                backgroundColor: isDark
                  ? theme.colors.primary[900]
                  : theme.colors.primary[100],
              },
            ]}
          >
            <Ionicons
              name="log-in-outline"
              size={20}
              color={theme.colors.primary[500]}
            />
          </View>
          <View style={styles.settingsContent}>
            <Text
              style={[
                styles.settingsTitle,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {t("account.signIn")}
            </Text>
            <Text
              style={[
                styles.settingsSubtitle,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("account.signInToAccess")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
          />
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* General Settings Available Without Login */}
          {renderSettingsSection(
            t("account.preferences"),
            guestPreferenceSettings
          )}
          {renderSettingsSection(
            t("account.supportLegal"),
            guestSupportSettings
          )}

          {/* App version */}
          <View style={styles.versionContainer}>
            <Text
              style={[
                styles.versionText,
                {
                  color: isDark
                    ? theme.colors.gray[500]
                    : theme.colors.gray[500],
                },
              ]}
            >
              Hoy v1.0.0
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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

      {userLoading ? (
        <View
          style={[
            styles.profileCard,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          <LoadingSkeleton width={80} height={80} borderRadius={40} />
          <View style={{ height: spacing.md }} />
          <LoadingSkeleton width={150} height={20} />
          <View style={{ height: spacing.xs }} />
          <LoadingSkeleton width={100} height={16} />
        </View>
      ) : (
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
            },
          ]}
        >
          <View style={styles.profileHeader}>
            <Avatar
              size="lg"
              source={currentUser?.avatarUrl || null}
              name={`${currentUser?.firstName || ""} ${
                currentUser?.lastName || ""
              }`}
              showBorder
            />
            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  {
                    color: isDark
                      ? theme.colors.gray[100]
                      : theme.colors.gray[900],
                  },
                ]}
              >
                {currentUser?.firstName} {currentUser?.lastName}
              </Text>
              {joinedDate && (
                <Text
                  style={[
                    styles.profileDetail,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {t("account.memberSince")} {joinedDate}
                </Text>
              )}
              {currentUser?.email && (
                <Text
                  style={[
                    styles.profileDetail,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {currentUser.email}
                </Text>
              )}
            </View>
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
            onPress={() => showComingSoonAlert(t("account.editProfile"))}
          >
            <Text
              style={[
                styles.editButtonText,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {t("account.editProfile")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Settings Sections */}
        {renderSettingsSection(t("account.accountSettings"), accountSettings)}
        {renderSettingsSection(t("account.preferences"), preferenceSettings)}
        {renderSettingsSection(t("account.supportLegal"), supportSettings)}
        {renderSettingsSection(t("account.legal"), legalSettings)}
        {/* App version - enable developer options by tapping this 10 times */}
        <TouchableOpacity
          style={styles.versionContainer}
          onPress={async () => {
            // Secret way to enable developer options - properly handling async calls
            try {
              const storedCount = await AsyncStorage.getItem("devTapCount");
              const devTapCount = (parseInt(storedCount || "0", 10) || 0) + 1;
              await AsyncStorage.setItem("devTapCount", devTapCount.toString());

              if (devTapCount >= 10 && !showDevOptions) {
                setShowDevOptions(true);
                Alert.alert(
                  "Developer Options Enabled",
                  "Developer options are now available in the Support section.",
                  [{ text: "OK" }]
                );
              } else if (devTapCount > 0 && devTapCount < 10) {
                console.log(`Dev mode tap: ${devTapCount}/10`);

                // If we're getting close, show feedback
                if (devTapCount === 7) {
                  Alert.alert(
                    "Almost there",
                    "Tap 3 more times to enable developer options"
                  );
                }
              }
            } catch (error) {
              console.error("Error accessing AsyncStorage:", error);
            }
          }}
        >
          <Text
            style={[
              styles.versionText,
              {
                color: isDark ? theme.colors.gray[500] : theme.colors.gray[500],
              },
            ]}
          >
            Hoy v1.0.0 {showDevOptions ? " (Dev Mode)" : ""}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    borderRadius: radius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.xxs,
  },
  profileDetail: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  editButton: {
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  editButtonText: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  section: {
    marginBottom: spacing.lg,
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
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  settingsSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  versionText: {
    fontSize: fontSize.xs,
  },
  loadingText: {
    fontSize: fontSize.md,
    marginTop: spacing.sm,
  },
  signInTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginTop: spacing.lg,
    textAlign: "center",
  },
  signInSubtitle: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  signInButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  signInButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  // Guest view specific styles
  guestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  guestHeaderContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  guestTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  guestSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.4,
  },
  signInButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
