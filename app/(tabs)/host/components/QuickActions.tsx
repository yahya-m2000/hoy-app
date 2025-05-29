/**
 * QuickActions Component
 * Displays quick action buttons for host dashboard
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common/context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import { radius } from "@common/constants/radius";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Action item type definition
interface QuickAction {
  id: string;
  icon: string;
  title: string;
  route?: string;
  onPress?: () => void;
  color: "primary" | "success" | "info" | "warning";
}

const QuickActions = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  // Define quick actions
  const actions: QuickAction[] = [
    {
      id: "add-property",
      icon: "add-circle-outline",
      title: t("host.addProperty"),
      route: "/host/add-property",
      color: "primary",
    },
    {
      id: "messages",
      icon: "chatbubbles-outline",
      title: t("host.messages"),
      route: "/host/messages",
      color: "primary",
    },
    {
      id: "payout",
      icon: "cash-outline",
      title: t("host.requestPayout"),
      route: "/host/earnings",
      color: "success",
    },
    {
      id: "calendar",
      icon: "calendar-outline",
      title: t("host.calendar"),
      onPress: () => console.log("Calendar pressed"),
      color: "info",
    },
  ];

  // Handle action button press
  const handleActionPress = (action: QuickAction) => {
    if (action.onPress) {
      action.onPress();
    } else if (action.route) {
      router.push(action.route);
    }
  };

  // Render a quick action button
  const renderActionButton = (action: QuickAction) => {
    return (
      <TouchableOpacity
        key={action.id}
        style={[
          styles.quickActionItem,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          },
        ]}
        onPress={() => handleActionPress(action)}
      >
        <View
          style={[
            styles.quickActionIcon,
            {
              backgroundColor: isDark
                ? theme.colors[action.color][900]
                : theme.colors[action.color][100],
            },
          ]}
        >
          <Ionicons
            name={action.icon as any}
            size={24}
            color={theme.colors[action.color][500]}
          />
        </View>
        <Text
          style={[
            styles.quickActionText,
            { color: isDark ? theme.white : theme.colors.gray[900] },
          ]}
        >
          {action.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.quickActions}>
      <Text
        style={[
          styles.quickActionsTitle,
          { color: isDark ? theme.white : theme.colors.gray[900] },
        ]}
      >
        {t("host.quickActions")}
      </Text>
      <View style={styles.quickActionsGrid}>
        {actions.map(renderActionButton)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickActions: {
    marginTop: spacing.lg,
  },
  quickActionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionItem: {
    width: "48%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontWeight: "500",
    textAlign: "center",
  },
});

export default QuickActions;
