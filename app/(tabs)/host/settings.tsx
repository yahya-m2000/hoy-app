/**
 * Settings screen for the Hoy application in host mode
 * Shows host profile and settings with account management options
 * Includes theme switching, currency selection, and hosting preferences
 */

// React Native core
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";

// Expo and third-party libraries
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { format } from "date-fns";

// App context and hooks
import { useTheme } from "@common-context/ThemeContext";
import { useAuth } from "@common-context/AuthContext";
import { useCurrentUser } from "@common-hooks/useUser";
import { useUserRole } from "@common-context/UserRoleContext";
import { useCurrency } from "@common-hooks/useCurrency";

// Components
import Avatar from "@common-components/Avatar";
import LoadingSkeleton from "@common-components/LoadingSkeleton";

// Utils
import { showCleanSlateAlert } from "@common-utils/network/cacheBuster";

// Constants
import { fontSize } from "@constants/typography";
import { spacing } from "@constants/spacing";
import { radius } from "@constants/radius";

interface SettingsItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  action?: () => void;
  rightElement?: React.ReactNode;
  isDanger?: boolean;
}

export default function HostSettingsScreen() {
  const { theme, isDark, toggleTheme, mode } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, logout, loading: authLoading } = useAuth();
  const {
    data: currentUser,
    isLoading: userLoading,
    refetch,
  } = useCurrentUser();
  const { currency, getSymbol } = useCurrency();
  const { isHost, toggleUserRole, isRoleLoading } = useUserRole();
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
      console.log("Host settings screen focused - refreshing user data");
      refetch();
      setLastRefresh(Date.now());

      // No cleanup needed for useFocusEffect
    }, [refetch])
  );

  // Also refresh on initial mount
  useEffect(() => {
    refetch();
  }, [refetch]);

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
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingsItem}
              onPress={item.action}
              disabled={!item.action}
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
                      : isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[600]
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

  // Host Account settings
  const accountSettings: SettingsItem[] = [
    {
      id: "profile",
      icon: "person-outline",
      title: t("account.personalInfo"),
      action: () => router.push("/(screens)/common/personal-info"),
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
      action: () => router.push("/(screens)/common/privacy-security"),
    },
  ];

  // Host-specific settings
  const hostSettings: SettingsItem[] = [
    {
      id: "properties",
      icon: "business-outline",
      title: t("host.manageProperties") || "Manage Properties",
      action: () => router.push("/host/properties"),
    },
    {
      id: "reservations",
      icon: "calendar-outline",
      title: t("host.manageReservations") || "Manage Reservations",
      action: () => router.push("/host/reservations"),
    },
    {
      id: "earnings",
      icon: "wallet-outline",
      title: t("host.viewEarnings") || "View Earnings",
      action: () => router.push("/host/earnings"),
    },
    {
      id: "addProperty",
      icon: "add-circle-outline",
      title: t("host.addNewProperty") || "Add New Property",
      action: () =>
        showComingSoonAlert(t("host.addNewProperty") || "Add New Property"),
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
      action: () => router.push("/(modals)/common/language"),
    },
    {
      id: "currency",
      icon: "cash-outline",
      title: t("account.currency"),
      subtitle: `${currency} (${getSymbol(currency)})`,
      action: () => router.push("/(modals)/common/currency"),
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
      id: "travelerMode",
      icon: "airplane-outline",
      title: t("account.travelerMode") || "Traveler Mode",
      subtitle: !isHost
        ? t("account.travelerModeOn") || "On"
        : t("account.travelerModeOff") || "Off",
      action: () => toggleUserRole(),
      rightElement: (
        <Switch
          value={!isHost}
          onValueChange={toggleUserRole}
          trackColor={{
            false: isDark ? theme.colors.gray[700] : theme.colors.gray[300],
            true: theme.colors.primary[500],
          }}
          thumbColor={theme.white}
          disabled={isRoleLoading}
        />
      ),
    },
  ];

  // Support settings
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
      action: () => router.push("/(modals)/common/language"),
    },
    {
      id: "currency",
      icon: "cash-outline",
      title: t("account.currency"),
      subtitle: `${currency} (${getSymbol(currency)})`,
      action: () => router.push("/(modals)/common/currency"),
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
          onPress={() => router.push("/(modals)/common/auth")}
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
            styles.loadingContainer,
            {
              backgroundColor: isDark
                ? theme.colors.gray[900]
                : theme.colors.gray[50],
            },
          ]}
        >
          <LoadingSkeleton
            circle
            width={80}
            height={80}
            style={{ marginBottom: spacing.md }}
          />
          <LoadingSkeleton
            width={200}
            height={24}
            style={{ marginBottom: spacing.sm }}
          />
          <LoadingSkeleton width={150} height={18} />
        </View>
      ) : (
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Avatar
              size="lg"
              source={currentUser?.profilePicture}
              name={`${currentUser?.firstName} ${currentUser?.lastName}`}
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
              <Text
                style={[
                  styles.profileBadge,
                  {
                    color: theme.colors.primary[500],
                    backgroundColor: isDark
                      ? theme.colors.primary[900]
                      : theme.colors.primary[50],
                  },
                ]}
              >
                {t("host.hostProfile") || "Host"}
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
        {renderSettingsSection(
          t("host.hostSettings") || "Host Settings",
          hostSettings
        )}
        {renderSettingsSection(t("account.accountSettings"), accountSettings)}
        {renderSettingsSection(t("account.preferences"), preferenceSettings)}
        {renderSettingsSection(t("account.supportLegal"), supportSettings)}
        {renderSettingsSection(t("account.legal"), legalSettings)}

        {/* App version with secret tap counter for dev tools */}
        <TouchableOpacity
          style={styles.versionContainer}
          onPress={async () => {
            try {
              const storedCount = await AsyncStorage.getItem("devTapCount");
              const currentCount = parseInt(storedCount || "0", 10) || 0;
              const newCount = currentCount + 1;
              await AsyncStorage.setItem("devTapCount", newCount.toString());

              // At 10 taps, enable dev options
              if (newCount === 10) {
                setShowDevOptions(true);
                Alert.alert(
                  "Developer Mode Enabled",
                  "You now have access to developer options.",
                  [{ text: "OK" }]
                );
              } else if (newCount >= 5 && newCount < 10) {
                // Give feedback between 5-9 taps
                console.log(
                  `Developer mode: ${10 - newCount} more taps needed`
                );
              }
            } catch (error) {
              console.error("Error updating dev tap count:", error);
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
            Hoy v1.0.0
            {showDevOptions ? " (Dev Mode)" : ""}
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
  loadingContainer: {
    padding: spacing.lg,
    alignItems: "center",
  },
  profileContainer: {
    padding: spacing.lg,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: 2,
  },
  profileBadge: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  editButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  editButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  sectionContent: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
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
