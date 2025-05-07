/**
 * Inbox screen for the Hoy application
 * Shows message threads with property hosts and notifications
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Pressable,
} from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import LoadingSkeleton from "../../../src/components/LoadingSkeleton";
import Badge from "../../../src/components/Badge";
import { fontSize, fontWeight } from "../../../src/constants/typography";
import { spacing } from "../../../src/constants/spacing";
import { radius } from "../../../src/constants/radius";
import { useConversations } from "../../../src/hooks/useConversations";
import { useNotifications } from "../../../src/hooks/useNotifications";
import { router, useLocalSearchParams } from "expo-router";
import { ConversationType, NotificationType } from "../../../src/types/message";

type InboxTab = "messages" | "notifications";

export default function InboxScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<InboxTab>("messages");
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams<{ activeTab?: string }>();

  // Handle URL params for active tab
  useEffect(() => {
    if (
      params.activeTab === "messages" ||
      params.activeTab === "notifications"
    ) {
      setActiveTab(params.activeTab);
    }
  }, [params.activeTab]);

  // Fetch conversations using custom hook
  const {
    conversations = [],
    isLoading: isLoadingConversations,
    unreadCount: unreadConversationsCount,
    // markAsRead function - not used directly in this component
    refresh: refreshConversations,
  } = useConversations();

  // Fetch notifications using custom hook
  const {
    notifications = [],
    isLoading: isLoadingNotifications,
    unreadCount: unreadNotificationsCount,
    markAsRead: markNotificationAsRead,
    refresh: refreshNotifications,
  } = useNotifications();

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "messages") {
      await refreshConversations();
    } else {
      await refreshNotifications();
    }
    setRefreshing(false);
  };

  // Handle tab switch
  const switchTab = (tab: InboxTab) => {
    setActiveTab(tab);
  };
  // Handle opening a conversation
  const handleConversationPress = (conversationId: string) => {
    if (conversationId) {
      console.log("Opening conversation:", conversationId);
      router.push({
        pathname: "/conversation/[id]",
        params: { id: conversationId },
      });
    } else {
      console.error("Cannot open conversation: Missing ID");
    }
  };

  // Handle opening a notification
  const handleNotificationPress = (notification: NotificationType) => {
    // Mark notification as read
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    } // Navigate based on notification type and related content
    if (
      notification.relatedTo?.type === "booking" &&
      notification.relatedTo?.id
    ) {
      router.push({
        pathname: "/bookings/[id]",
        params: { id: notification.relatedTo.id },
      });
    } else if (
      notification.relatedTo?.id &&
      notification.content.includes("message")
    ) {
      router.push({
        pathname: "/conversation/[id]",
        params: { id: notification.relatedTo.id },
      });
    } else {
      // Open notification detail
      router.push({
        pathname: "/notification/[id]",
        params: { id: notification.id },
      });
    }
  };
  // Render conversation item
  const renderConversationItem = ({ item }: { item: ConversationType }) => {
    // Format relative time (e.g. "5 minutes ago") with error handling
    let timeAgo = "Recently";
    try {
      if (item.lastMessage?.sentAt) {
        const messageDate = new Date(item.lastMessage.sentAt);
        // Verify the date is valid
        if (!isNaN(messageDate.getTime())) {
          timeAgo = formatDistanceToNow(messageDate, { addSuffix: true });
        }
      }
    } catch (error) {
      console.error("Error formatting conversation date:", error);
    }

    // Make sure we have a conversation ID
    const conversationId = item.id || item.hostId || "unknown";

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : item.unreadCount > 0
              ? `${theme.colors.primary[50]}60`
              : "#FFFFFF",
          },
        ]}
        onPress={() => handleConversationPress(conversationId)}
      >
        <View style={styles.hostAvatar}>
          {item.hostImage ? (
            <Image
              source={{ uri: item.hostImage }}
              style={styles.hostImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.hostPlaceholder,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                },
              ]}
            >
              <Ionicons
                name="person"
                size={24}
                color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
              />
            </View>
          )}
          {item.unreadCount > 0 && (
            <Badge content={item.unreadCount} style={styles.unreadBadge} />
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text
              style={[
                styles.hostName,
                {
                  color: isDark
                    ? theme.colors.gray[50]
                    : theme.colors.gray[900],
                },
                item.unreadCount > 0 && {
                  fontWeight: String(fontWeight.semibold) as any,
                },
              ]}
              numberOfLines={1}
            >
              {item.hostName || "Host"}
            </Text>
            <Text
              style={[
                styles.timeAgo,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[500],
                },
              ]}
            >
              {timeAgo}
            </Text>
          </View>

          <Text
            style={[
              styles.propertyTitle,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
            numberOfLines={1}
          >
            {item.property?.title || "Property"}
          </Text>

          <View style={styles.messageRow}>
            <Text
              style={[
                styles.messageText,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                  fontWeight:
                    item.unreadCount > 0
                      ? (String(fontWeight.medium) as any)
                      : (String(fontWeight.normal) as any),
                },
              ]}
              numberOfLines={2}
            >
              {item.lastMessage?.text || ""}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: NotificationType }) => {
    // Format relative time (e.g. "5 minutes ago") with error handling
    let timeAgo = "Recently";
    try {
      if (item.createdAt) {
        const notificationDate = new Date(item.createdAt);
        // Verify the date is valid
        if (!isNaN(notificationDate.getTime())) {
          timeAgo = formatDistanceToNow(notificationDate, { addSuffix: true });
        }
      }
    } catch (error) {
      console.error("Error formatting notification date:", error);
    } // Determine icon based on notification content or related types
    let iconName = "notifications";
    if (item.relatedTo?.type === "booking") iconName = "calendar";
    else if (item.content.includes("message")) iconName = "mail";
    else if (item.relatedTo?.type === "payment") iconName = "card";
    else if (item.relatedTo?.type === "review") iconName = "star";
    else if (item.sender?.type === "system") iconName = "information-circle";

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: isDark
              ? item.isRead
                ? theme.colors.gray[800]
                : `${theme.colors.primary[900]}30`
              : item.isRead
              ? "#FFFFFF"
              : `${theme.colors.primary[50]}30`,
          },
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View
          style={[
            styles.notificationIcon,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[100],
            },
          ]}
        >
          <Ionicons
            name={iconName as any}
            size={22}
            color={
              isDark
                ? item.isRead
                  ? theme.colors.gray[400]
                  : theme.colors.primary[300]
                : item.isRead
                ? theme.colors.gray[500]
                : theme.colors.primary[500]
            }
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                {
                  color: isDark
                    ? theme.colors.gray[50]
                    : theme.colors.gray[900],
                  fontWeight: item.isRead
                    ? (String(fontWeight.normal) as any)
                    : (String(fontWeight.semibold) as any),
                },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <Text
              style={[
                styles.timeAgo,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[500],
                },
              ]}
            >
              {timeAgo}
            </Text>
          </View>

          <Text
            style={[
              styles.notificationMessage,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
                fontWeight: item.isRead
                  ? (String(fontWeight.normal) as any)
                  : (String(fontWeight.medium) as any),
              },
            ]}
            numberOfLines={2}
          >
            {item.content}
          </Text>
        </View>

        {!item.isRead && (
          <View
            style={[
              styles.unreadIndicator,
              {
                backgroundColor: isDark
                  ? theme.colors.primary[400]
                  : theme.colors.primary[500],
              },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  // Empty state component for no conversations or notifications
  const renderEmptyState = () => {
    const isMessages = activeTab === "messages";
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons
          name={isMessages ? "chatbubbles" : "notifications"}
          size={64}
          color={isDark ? theme.colors.gray[700] : theme.colors.gray[300]}
          style={styles.emptyStateIcon}
        />
        <Text
          style={[
            styles.emptyStateTitle,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
            },
          ]}
        >
          {isMessages ? t("inbox.noConversations") : t("inbox.noNotifications")}
        </Text>
        <Text
          style={[
            styles.emptyStateMessage,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[500],
            },
          ]}
        >
          {isMessages
            ? t("inbox.noConversationsMessage")
            : t("inbox.noNotificationsMessage")}
        </Text>
      </View>
    );
  };

  // Loading skeleton components
  const renderLoadingSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <View
          key={`skeleton-${index}`}
          style={[
            styles.skeletonContainer,
            { backgroundColor: isDark ? theme.colors.gray[800] : "#FFFFFF" },
          ]}
        >
          <LoadingSkeleton
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              marginRight: spacing.md,
            }}
          />
          <View style={{ flex: 1 }}>
            <LoadingSkeleton
              style={{
                width: "70%",
                height: 16,
                marginBottom: spacing.sm,
              }}
            />
            <LoadingSkeleton
              style={{
                width: "90%",
                height: 14,
                marginBottom: spacing.sm,
              }}
            />
            <LoadingSkeleton
              style={{
                width: "80%",
                height: 14,
              }}
            />
          </View>
        </View>
      ));
  };

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

      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: isDark ? "#FFFFFF" : theme.colors.gray[900],
            },
          ]}
        >
          {t("inbox.title")}
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "messages" && [
              styles.activeTab,
              {
                borderBottomColor: theme.colors.primary[500],
              },
            ],
          ]}
          onPress={() => switchTab("messages")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "messages"
                    ? isDark
                      ? theme.colors.primary[300]
                      : theme.colors.primary[600]
                    : isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[500],
              },
            ]}
          >
            {t("inbox.messages")}
          </Text>
          {unreadConversationsCount > 0 && (
            <Badge
              content={unreadConversationsCount}
              style={styles.tabBadge}
              textStyle={{ fontSize: 10 }}
            />
          )}
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            activeTab === "notifications" && [
              styles.activeTab,
              {
                borderBottomColor: theme.colors.primary[500],
              },
            ],
          ]}
          onPress={() => switchTab("notifications")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "notifications"
                    ? isDark
                      ? theme.colors.primary[300]
                      : theme.colors.primary[600]
                    : isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[500],
              },
            ]}
          >
            {t("inbox.notifications")}
          </Text>
          {unreadNotificationsCount > 0 && (
            <Badge
              content={unreadNotificationsCount}
              style={styles.tabBadge}
              textStyle={{ fontSize: 10 }}
            />
          )}
        </Pressable>
      </View>

      {/* Display messages or notifications based on active tab */}
      {activeTab === "messages" ? (
        isLoadingConversations ? (
          <View style={styles.contentContainer}>
            {renderLoadingSkeletons()}
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) =>
              item.conversationId || item.id || `conversation-${Math.random()}`
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary[500]]}
                tintColor={
                  isDark ? theme.colors.gray[400] : theme.colors.primary[500]
                }
              />
            }
          />
        )
      ) : isLoadingNotifications ? (
        <View style={styles.contentContainer}>{renderLoadingSkeletons()}</View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary[500]]}
              tintColor={
                isDark ? theme.colors.gray[400] : theme.colors.primary[500]
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: String(fontWeight.bold) as any,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    position: "relative",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: fontSize.md,
    fontWeight: String(fontWeight.medium) as any,
  },
  tabBadge: {
    marginLeft: spacing.xs,
    height: 18,
    minWidth: 18,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  // Conversation item styles
  conversationItem: {
    flexDirection: "row",
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },
  hostAvatar: {
    position: "relative",
    marginRight: spacing.md,
  },
  hostImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  hostPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: -5,
    right: -5,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  hostName: {
    fontSize: fontSize.md,
    flex: 1,
  },
  timeAgo: {
    fontSize: fontSize.xs,
  },
  propertyTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  // Notification item styles
  notificationItem: {
    flexDirection: "row",
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    position: "relative",
  },
  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: fontSize.md,
    flex: 1,
  },
  notificationMessage: {
    fontSize: fontSize.sm,
  },
  unreadIndicator: {
    position: "absolute",
    top: spacing.md,
    right: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyStateIcon: {
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: String(fontWeight.semibold) as any,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  emptyStateMessage: {
    fontSize: fontSize.md,
    textAlign: "center",
  },
  // Skeleton styles
  skeletonContainer: {
    flexDirection: "row",
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },
});
