/**
 * Notification Setting Component
 * Displays and manages ZAAD payment notifications and other app notifications
 * Follows consistent design pattern with other settings
 */

import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";

// Components
import { Container, Text, Icon, Button } from "@shared/components";

// Hooks and context
import { useTheme } from "@core/hooks/useTheme";

// Services and utils
import {
  notificationService,
  NotificationData,
} from "@core/services/notification.service";
import { ZaadUtils } from "@core/utils/zaad.utils";
import { spacing, radius } from "@core/design";

interface NotificationItemProps {
  notification: NotificationData;
  onPress: () => void;
  onMarkAsRead: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const isZaadPayment = notification.type === "zaad_payment";

  const handlePress = () => {
    if (!notification.read) {
      onMarkAsRead();
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        borderRadius: radius.lg,
        marginBottom: spacing.xs,
      }}
    >
      <Container paddingVertical="md">
        <Container flexDirection="row" alignItems="center">
          {/* Status indicator - left side like messages */}
          <Container
            alignItems="center"
            justifyContent="center"
            marginRight="md"
          >
            <Icon
              name={notification.read ? "eye-outline" : "mail-unread-outline"}
              size={18}
            />
          </Container>

          {/* Content */}
          <Container flex={1}>
            {/* ZAAD Badge - above title */}
            {isZaadPayment && (
              <Container marginBottom="xs">
                <Container
                  backgroundColor="#00A651"
                  paddingHorizontal="xs"
                  paddingVertical={2}
                  borderRadius="xs"
                  width={50}
                  alignItems="center"
                >
                  <Text
                    variant="caption"
                    weight="bold"
                    color="white"
                    style={{ fontSize: 10, letterSpacing: 0.5 }}
                  >
                    ZAAD
                  </Text>
                </Container>
              </Container>
            )}

            {/* Title */}
            <Container marginBottom="xs">
              <Text variant="body" weight="bold" numberOfLines={1}>
                {notification.title}
              </Text>
            </Container>

            {/* Body */}
            <Text
              variant="caption"
              color={theme.text?.secondary}
              style={{ lineHeight: 16 }}
              numberOfLines={1}
            >
              {notification.body}
            </Text>

            {/* Timestamp */}
            <Text
              variant="caption"
              color={theme.text?.secondary}
              style={{ fontSize: 11, marginTop: 2 }}
            >
              {new Date(notification.timestamp).toLocaleString()}
            </Text>
          </Container>

          {/* Chevron indicator */}
          <Container
            alignItems="center"
            justifyContent="center"
            marginLeft="sm"
          >
            <Icon name="chevron-forward" size={16} />
          </Container>
        </Container>
      </Container>
    </TouchableOpacity>
  );
};

interface NotificationSettingProps {
  title: string;
  description: string;
  infoContent: string;
}

export const NotificationSetting: React.FC<NotificationSettingProps> = ({
  title,
  description,
  infoContent,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const notificationHistory = notificationService.getNotificationHistory();
    setNotifications(notificationHistory);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleClearAll = () => {
    Alert.alert(
      t("notifications.clearAll", "Clear All Notifications"),
      t(
        "notifications.clearAllConfirm",
        "Are you sure you want to clear all notifications?"
      ),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        {
          text: t("common.clear", "Clear"),
          style: "destructive",
          onPress: async () => {
            await notificationService.clearHistory();
            loadNotifications();
          },
        },
      ]
    );
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    if (notification.type === "zaad_payment" && notification.data) {
      const zaadData = notification.data;

      try {
        if (Platform.OS === "android") {
          // Android: Show options for auto-dial and save contact
          Alert.alert(
            t("notifications.zaadPayment", "ZAAD Payment"),
            t(
              "notifications.zaadPaymentOptions",
              "Choose an action for your payment:"
            ),
            [
              {
                text: t("notifications.dialNow", "Dial Now"),
                onPress: () =>
                  ZaadUtils.dialUSSD(zaadData.zaadNumber, zaadData.amount),
              },
              {
                text: t("notifications.saveContact", "Save to Contacts"),
                onPress: () =>
                  ZaadUtils.addToContacts({
                    hostPhone: zaadData.hostPhone,
                    zaadNumber: zaadData.zaadNumber,
                    amount: zaadData.amount,
                    currency: zaadData.currency,
                    reservationId: zaadData.reservationId,
                    propertyName: zaadData.propertyName,
                    hostName: zaadData.hostName || "Host",
                  }, t),
              },
              {
                text: t("notifications.copyCode", "Copy Code"),
                onPress: () =>
                  ZaadUtils.copyUSSDToClipboard(
                    zaadData.zaadNumber,
                    zaadData.amount
                  ),
              },
              { text: t("common.cancel", "Cancel"), style: "cancel" },
            ]
          );
        } else {
          // iOS: Show payment instructions
          ZaadUtils.showPaymentInstructions({
            hostPhone: zaadData.hostPhone,
            zaadNumber: zaadData.zaadNumber,
            amount: zaadData.amount,
            currency: zaadData.currency,
            reservationId: zaadData.reservationId,
            propertyName: zaadData.propertyName,
            hostName: zaadData.hostName || "Host",
          }, t);
        }
      } catch (error) {
        console.error("Error handling ZAAD payment:", error);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Container>
      {/* Header Info - consistent with other settings */}
      <Container marginBottom="lg">
        <Text variant="h6" weight="semibold" style={{ marginBottom: 4 }}>
          {t("features.account.profile.notifications", "Notifications")}
        </Text>
        <Text variant="caption" color={theme.text?.secondary}>
          {t(
            "features.account.profile.notificationsDesc",
            "Manage your payment notifications and alerts"
          )}
        </Text>
      </Container>

      {/* Stats and Actions */}
      {notifications.length > 0 && (
        <Container marginBottom="lg">
          <Container
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            marginBottom="md"
          >
            <Container>
              {unreadCount > 0 && (
                <Text variant="body" weight="medium">
                  {unreadCount} unread
                </Text>
              )}
            </Container>

            <Container flexDirection="row" alignItems="center">
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                  <Container marginRight="lg">
                    <Text
                      variant="caption"
                      color={theme.text?.secondary}
                      weight="medium"
                    >
                      {t("notifications.markAllRead", "Mark all read")}
                    </Text>
                  </Container>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleClearAll}>
                <Text
                  variant="caption"
                  color={theme.text?.secondary}
                  weight="medium"
                >
                  {t("notifications.clearAll", "Clear all")}
                </Text>
              </TouchableOpacity>
            </Container>
          </Container>

          {/* Subtle divider */}
          <Container
            height={1}
            backgroundColor={
              isDark ? theme.colors.gray[700] : theme.colors.gray[200]
            }
            marginBottom="md"
          />
        </Container>
      )}

      {/* Notifications List */}
      <Container flex={1}>
        {notifications.length === 0 ? (
          <Container
            alignItems="center"
            justifyContent="center"
            padding="xl"
            style={{ minHeight: 200 }}
          >
            <Icon
              name="notifications-outline"
              size={48}
              color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
              style={{ marginBottom: spacing.lg }}
            />
            <Text
              variant="h6"
              weight="semibold"
              style={{ marginBottom: spacing.sm, textAlign: "center" }}
            >
              {t("notifications.empty", "No Notifications")}
            </Text>
            <Text
              variant="body"
              color={theme.text?.secondary}
              style={{ textAlign: "center", lineHeight: 22 }}
            >
              {t(
                "notifications.emptyDescription",
                "When you receive notifications, they will appear here."
              )}
            </Text>
          </Container>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          >
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onMarkAsRead={() => handleMarkAsRead(notification.id)}
              />
            ))}
          </ScrollView>
        )}
      </Container>
    </Container>
  );
};
