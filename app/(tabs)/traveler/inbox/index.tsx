/**
 * Inbox Screen for Traveler
 * Contains Messages and Notifications sections with navigation buttons
 */

import React, { useState, useEffect } from "react";
import { StatusBar, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

// Components
import { Screen, Container, Text, Icon, Button } from "@shared/components";

// Hooks
import { useTheme } from "@core/hooks/useTheme";

// Services
import { notificationService } from "@core/services/notification.service";

// Sections
import { NotificationsSection } from "@features/inbox/components/NotificationsSection";

// Constants
import { spacing, radius } from "@core/design";

type InboxSection = "messages" | "notifications";

export default function InboxScreen() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const [activeSection, setActiveSection] =
    useState<InboxSection>("notifications");
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count
  useEffect(() => {
    const updateUnreadCount = () => {
      const notifications = notificationService.getNotificationHistory();
      const count = notifications.filter((n) => !n.read).length;
      setUnreadCount(count);
    };

    updateUnreadCount();

    // Set up a listener for notification changes
    const interval = setInterval(updateUnreadCount, 1000);
    return () => clearInterval(interval);
  }, []);

  const SectionButton = ({
    section,
    title,
    count,
    isActive,
  }: {
    section: InboxSection;
    title: string;
    count?: number;
    isActive: boolean;
  }) => (
    <TouchableOpacity
      onPress={() => setActiveSection(section)}
      style={{
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 2,
        borderBottomColor: isActive ? theme.colors.primary : "transparent",
        alignItems: "center",
      }}
    >
      <Container flexDirection="row" alignItems="center">
        <Text
          variant="body"
          weight={isActive ? "bold" : "medium"}
          color={isActive ? theme.colors.primary : theme.text?.secondary}
        >
          {title}
        </Text>
        {count !== undefined && count > 0 && (
          <Container
            backgroundColor={theme.colors.primary}
            paddingHorizontal="sm"
            paddingVertical="xs"
            borderRadius="circle"
            marginLeft="sm"
            minWidth={20}
            alignItems="center"
            justifyContent="center"
          >
            <Text
              variant="caption"
              weight="bold"
              color="white"
              style={{ fontSize: 11 }}
            >
              {count > 99 ? "99+" : count}
            </Text>
          </Container>
        )}
      </Container>
    </TouchableOpacity>
  );

  const MessagesSection = () => (
    <Container
      flex={1}
      alignItems="center"
      justifyContent="center"
      padding="xl"
    >
      <Icon
        name="chatbubbles-outline"
        size={64}
        color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
        style={{ marginBottom: spacing.lg }}
      />
      <Text
        variant="h6"
        weight="semibold"
        style={{ marginBottom: spacing.sm, textAlign: "center" }}
      >
        {t("inbox.messages.title", "Messages")}
      </Text>
      <Text
        variant="body"
        color={theme.text?.secondary}
        style={{ textAlign: "center", lineHeight: 22 }}
      >
        {t(
          "inbox.messages.description",
          "Your conversations with hosts will appear here."
        )}
      </Text>
    </Container>
  );

  // Debug functions
  const handleDebugStorage = async () => {
    await notificationService.debugNotificationStorage();
  };

  const handleCreateTestNotification = async () => {
    await notificationService.createTestNotification();
  };

  return (
    <Screen
      header={{
        title: t("common.tabs.inbox", "Inbox"),
        showDivider: false,
      }}
      backgroundColor={theme.background}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        style={{ flex: 1, paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        {/* Section Navigation */}
        <Container flexDirection="row" style={{}}>
          <SectionButton
            section="messages"
            title={t("common.navigation.inbox.messages", "Messages")}
            isActive={activeSection === "messages"}
          />
          <SectionButton
            section="notifications"
            title={t("common.navigation.inbox.notifications", "Notifications")}
            count={unreadCount}
            isActive={activeSection === "notifications"}
          />
        </Container>

        {/* Section Content */}
        <Container flex={1}>
          {activeSection === "messages" ? (
            <MessagesSection />
          ) : (
            <Container flex={1} padding="lg">
              <NotificationsSection />
            </Container>
          )}
        </Container>

        {/* Debug Buttons - Remove these in production */}
        {/* {__DEV__ && (
          <Container
            padding="md"
            backgroundColor={
              isDark ? theme.colors.gray[800] : theme.colors.gray[100]
            }
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.gray[300],
            }}
          >
            <Text
              variant="caption"
              weight="semibold"
              style={{ marginBottom: 8 }}
            >
              Debug Tools (Dev Mode Only):
            </Text>
            <Container flexDirection="row" justifyContent="space-between">
              <Button
                title="Debug Storage"
                onPress={handleDebugStorage}
                size="small"
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Create Test"
                onPress={handleCreateTestNotification}
                size="small"
                variant="outline"
                style={{ flex: 1 }}
              />
            </Container>
          </Container>
        )} */}
      </ScrollView>
    </Screen>
  );
}
