import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";
import { Avatar } from "@shared/components";
import { spacing, fontSize } from "@shared/constants";

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
            { color: isDark ? theme.colors.white : theme.colors.gray[900] },
          ]}
        >
          {t("host.welcomeBack")}
          {user?.firstName ? `, ${user.firstName}` : ""}
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
        size="medium"
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSize.md,
  },
});

export default HostHeader;
