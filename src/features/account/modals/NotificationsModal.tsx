/**
 * Notifications Modal Component
 * Displays ZAAD payment notifications and other app notifications
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "src/core/hooks/useTheme";
import { Container, Button, Text, Icon } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { fontSize, spacing, radius } from "@core/design";
import { useTranslation } from "react-i18next";
import {
  notificationService,
  NotificationData,
} from "@core/services/notification.service";
import { ZaadUtils } from "@core/utils/zaad.utils";

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationsModal({
  visible,
  onClose,
}: NotificationsModalProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load notifications
  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = () => {
    const notificationHistory = notificationService.getNotificationHistory();
    setNotifications(notificationHistory);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
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
          onPress: () => {
            notificationService.clearHistory();
            loadNotifications();
          },
        },
      ]
    );
  };

  const handleZaadPayment = async (zaadData: any) => {
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
  };

  const renderNotificationItem = (notification: NotificationData) => {
    const isZaadPayment = notification.type === "zaad_payment";

    return (
      <TouchableOpacity
        key={notification.id}
        style={{
          backgroundColor: notification.read
            ? isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[50]
            : isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[100],
          padding: spacing.lg,
          borderRadius: radius.lg,
          marginBottom: spacing.md,
          borderLeftWidth: 4,
          borderLeftColor: isZaadPayment ? "#00A651" : theme.colors.primary,
        }}
        onPress={() => {
          if (!notification.read) {
            handleMarkAsRead(notification.id);
          }
          if (isZaadPayment && notification.data) {
            handleZaadPayment(notification.data);
          }
        }}
      >
        <Container
          flexDirection="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Container flex={1}>
            <Container
              flexDirection="row"
              alignItems="center"
              marginBottom="xs"
            >
              {isZaadPayment && (
                <Container
                  backgroundColor="#00A651"
                  paddingHorizontal="sm"
                  paddingVertical="xs"
                  borderRadius="sm"
                  marginRight="sm"
                >
                  <Text variant="caption" weight="bold" color="white">
                    ZAAD
                  </Text>
                </Container>
              )}
              <Text variant="body" weight="semibold">
                {notification.title}
              </Text>
            </Container>

            <Text
              variant="caption"
              style={{ marginBottom: spacing.sm, lineHeight: 18 }}
            >
              {notification.body}
            </Text>

            {isZaadPayment && notification.data && (
              <Container marginTop="sm">
                <Text variant="caption" weight="semibold">
                  {t("notifications.paymentDetails", "Payment Details:")}
                </Text>
                <Text variant="caption">
                  {t("notifications.amount", "Amount")}:{" "}
                  {ZaadUtils.formatAmount(
                    notification.data.amount,
                    notification.data.currency
                  )}
                </Text>
                <Text variant="caption">
                  {t("notifications.property", "Property")}:{" "}
                  {notification.data.propertyName}
                </Text>
                <Text variant="caption">
                  {t("notifications.ussdCode", "USSD Code")}:{" "}
                  {ZaadUtils.generateUSSDCode(
                    notification.data.zaadNumber,
                    notification.data.amount
                  )}
                </Text>
              </Container>
            )}

            <Text
              variant="caption"
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
              style={{ marginTop: spacing.xs }}
            >
              {new Date(notification.timestamp).toLocaleString()}
            </Text>
          </Container>

          {!notification.read && (
            <Container
              backgroundColor={theme.colors.primary}
              width={8}
              height={8}
              borderRadius="circle"
              marginLeft="sm"
              marginTop="xs"
            />
          )}
        </Container>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        {/* Header */}
        <Container
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="lg"
          paddingVertical="md"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          }}
        >
          <View style={{ width: 40 }} />
          <Text style={{ fontSize: fontSize.lg, fontWeight: "600" }}>
            {t("notifications.title", "Notifications")}
          </Text>
          <Button
            onPress={onClose}
            variant="ghost"
            title=""
            style={{ width: 40, height: 40 }}
            icon={<Ionicons name="close" size={24} />}
          />
        </Container>

        {/* Actions Header */}
        {notifications.length > 0 && (
          <Container
            flexDirection="row"
            justifyContent="space-between"
            paddingHorizontal="lg"
            paddingVertical="sm"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.gray[100],
            }}
          >
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text
                variant="caption"
                color={theme.colors.primary}
                weight="semibold"
              >
                {t("notifications.markAllRead", "Mark All Read")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAll}>
              <Text
                variant="caption"
                color={theme.colors.error}
                weight="semibold"
              >
                {t("notifications.clearAll", "Clear All")}
              </Text>
            </TouchableOpacity>
          </Container>
        )}

        {/* Content */}
        <Container flex={1} style={{ paddingBottom: insets.bottom }}>
          {notifications.length === 0 ? (
            <Container
              flex={1}
              alignItems="center"
              justifyContent="center"
              padding="xl"
            >
              <Icon
                name="notifications-outline"
                size={64}
                color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
                style={{ marginBottom: spacing.lg }}
              />
              <Text
                variant="h6"
                weight="semibold"
                style={{ marginBottom: spacing.sm }}
              >
                {t("notifications.empty", "No Notifications")}
              </Text>
              <Text
                variant="body"
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
              contentContainerStyle={{ padding: spacing.lg }}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map(renderNotificationItem)}
            </ScrollView>
          )}
        </Container>
      </Container>
    </Modal>
  );
}
