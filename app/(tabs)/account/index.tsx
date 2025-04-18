/**
 * Account screen for the Hoy application
 * Shows user profile and settings
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { fontSize } from "../../../src/constants/typography";
import spacing from "../../../src/constants/spacing";
import radius from "../../../src/constants/radius";
import Avatar from "../../../src/components/Avatar";
import { mockUser } from "../../../src/utils/mockData";
import { format } from "date-fns";

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
  const [isHost, setIsHost] = React.useState(false);

  // Format joined date
  const joinedDate = format(new Date(mockUser.joinedDate), "MMMM yyyy");

  // Function to render a settings section
  const renderSettingsSection = (title: string, items: SettingsItem[]) => {
    return (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? theme.colors.gray[400] : theme.colors.gray[600] },
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
                index < items.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
              onPress={item.action}
            >
              <View style={styles.settingsItemIcon}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={
                    item.isDanger
                      ? theme.error[500]
                      : isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700]
                  }
                />
              </View>
              <View style={styles.settingsItemContent}>
                <Text
                  style={[
                    styles.settingsItemTitle,
                    {
                      color: item.isDanger
                        ? theme.error[500]
                        : isDark
                        ? theme.white
                        : theme.colors.gray[900],
                    },
                  ]}
                >
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text
                    style={[
                      styles.settingsItemSubtitle,
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
      action: () => console.log("Navigate to personal info"),
    },
    {
      id: "payment",
      icon: "card-outline",
      title: t("account.paymentMethods"),
      action: () => console.log("Navigate to payment methods"),
    },
    {
      id: "notifications",
      icon: "notifications-outline",
      title: t("account.notifications"),
      action: () => console.log("Navigate to notifications"),
    },
    {
      id: "privacy",
      icon: "lock-closed-outline",
      title: t("account.privacySecurity"),
      action: () => console.log("Navigate to privacy & security"),
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
      action: () => console.log("Navigate to language selection"),
    },
    {
      id: "currency",
      icon: "cash-outline",
      title: t("account.currency"),
      subtitle: "USD ($)",
      action: () => console.log("Navigate to currency selection"),
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
            true: theme.primary[500],
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
            true: theme.primary[500],
          }}
          thumbColor={theme.white}
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
      action: () => console.log("Navigate to help center"),
    },
    {
      id: "feedback",
      icon: "chatbubble-outline",
      title: t("account.giveFeedback"),
      action: () => console.log("Navigate to feedback"),
    },
    {
      id: "terms",
      icon: "document-text-outline",
      title: t("account.termsOfService"),
      action: () => console.log("Navigate to terms"),
    },
  ];

  // Legal and account management
  const legalSettings: SettingsItem[] = [
    {
      id: "logout",
      icon: "log-out-outline",
      title: t("account.signOut"),
      isDanger: true,
      action: () => console.log("Sign out"),
    },
  ];

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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Card */}
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
              size="xl"
              source={mockUser.image}
              name={mockUser.name}
              showBorder={true}
            />

            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                {mockUser.name}
              </Text>
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
                {mockUser.email}
              </Text>
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
                {t("account.memberSince", { date: joinedDate })}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[200],
              },
            ]}
            onPress={() => console.log("Navigate to edit profile")}
          >
            <Text
              style={[
                styles.editButtonText,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {t("account.editProfile")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {renderSettingsSection(t("account.accountSettings"), accountSettings)}
        {renderSettingsSection(t("account.preferences"), preferenceSettings)}
        {renderSettingsSection(t("account.supportLegal"), supportSettings)}
        {renderSettingsSection("", legalSettings)}

        {/* App Version */}
        <Text
          style={[
            styles.versionText,
            { color: isDark ? theme.colors.gray[500] : theme.colors.gray[500] },
          ]}
        >
          {t("account.version")} 1.0.0
        </Text>
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
    padding: spacing.md,
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
    padding: spacing.md,
  },
  settingsItemIcon: {
    width: 24,
    alignItems: "center",
  },
  settingsItemContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  settingsItemTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  settingsItemSubtitle: {
    fontSize: fontSize.sm,
    color: "#888",
    marginTop: 2,
  },
  versionText: {
    textAlign: "center",
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
});
