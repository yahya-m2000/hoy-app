import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { fontSize, fontWeight } from "../../src/constants/typography";
import spacing from "../../src/constants/spacing";
import radius from "../../src/constants/radius";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../../src/services/messageService";
import { format } from "date-fns";
import { NotificationType } from "../../src/types/message";

export default function NotificationDetailScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Get notification details
  const {
    data: notifications,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetchNotifications();
      return response; // This converts Axios.IPromise to a standard Promise
    },
  });

  // Find the notification by ID
  const notification = notifications?.find((n) => n.id === id);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await markNotificationAsRead(notificationId);
      return response; // This converts Axios.IPromise to a standard Promise
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  // Mark notification as read when opening it
  useEffect(() => {
    if (notification && !notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  }, [notification]);

  // Get proper icon based on notification type
  const getNotificationIcon = (
    type?: string
  ): React.ComponentProps<typeof Ionicons>["name"] => {
    switch (type) {
      case "booking":
        return "calendar";
      case "property":
        return "home";
      case "review":
        return "star";
      case "payment":
        return "card";
      default:
        return "notifications";
    }
  };

  // Handle related item navigation
  const handleRelatedNavigation = () => {
    if (!notification?.relatedTo) return;

    const { type, id } = notification.relatedTo;

    switch (type) {
      case "booking":
        router.push({
          pathname: "/bookings/[id]",
          params: { id },
        });
        break;
      case "property":
        router.push({
          pathname: "/property/[id]",
          params: { id },
        });
        break;
      case "review":
        // Navigate to review screen
        break;
      case "payment":
        // Navigate to payment screen
        break;
      default:
        // Do nothing
        break;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  // Error state
  if (isError || !notification) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ color: isDark ? "white" : "black" }}>
          {t("notification.errorLoading")}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={{ color: theme.colors.primary[500] }}>
            {t("common.retry")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.gray[900] : "white",
        },
      ]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark
                ? `${theme.colors.primary[500]}30`
                : `${theme.colors.primary[500]}15`,
            },
          ]}
        >
          <Ionicons
            name={getNotificationIcon(notification.relatedTo?.type)}
            size={32}
            color={theme.colors.primary[500]}
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
            },
          ]}
        >
          {notification.title}
        </Text>

        <Text
          style={[
            styles.timestamp,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[500],
            },
          ]}
        >
          {format(new Date(notification.createdAt), "PPP • p")}
        </Text>

        <Text
          style={[
            styles.content,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
            },
          ]}
        >
          {notification.content}
        </Text>

        {notification.relatedTo?.id && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary[500],
              },
            ]}
            onPress={handleRelatedNavigation}
          >
            <Text style={styles.buttonText}>
              {t(
                `notification.viewRelated.${
                  notification.relatedTo.type || "item"
                }`
              )}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: String(fontWeight.bold) as any,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  buttonText: {
    color: "white",
    fontWeight: String(fontWeight.semibold) as any,
    fontSize: fontSize.md,
  },
});
