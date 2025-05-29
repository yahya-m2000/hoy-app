/**
 * Host Header Component
 * Displays welcome message and user avatar for host dashboard
 */

// React Native core
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Third-party libraries
import { useTranslation } from "react-i18next";

// App context
import { useTheme } from "@common/context/ThemeContext";

// Components
import Avatar from "@common/components/Avatar";

// Constants
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";

interface HostHeaderProps {
  user: any;
}

const HostHeader = ({ user }: HostHeaderProps) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text
          style={[
            styles.greeting,
            { color: isDark ? theme.white : theme.colors.gray[900] },
          ]}
        >
          {t("host.welcomeBack")}, {user?.firstName}
        </Text>
        <Text
          style={[
            styles.date,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
            },
          ]}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
      <Avatar
        size="md"
        source={user?.avatarUrl || null}
        name={`${user?.firstName || ""} ${user?.lastName || ""}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSize.md,
  },
});

export default HostHeader;
