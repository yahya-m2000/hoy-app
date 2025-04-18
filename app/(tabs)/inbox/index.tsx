/**
 * Inbox screen for the Hoy application
 * Shows message threads with property hosts
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { mockConversations } from "../../../src/utils/mockData";
import LoadingSkeleton from "../../../src/components/LoadingSkeleton";
import Badge from "../../../src/components/Badge";
import { fontSize, fontWeight } from "../../../src/constants/typography";
import spacing from "../../../src/constants/spacing";
import radius from "../../../src/constants/radius";

interface Conversation {
  id: string;
  propertyId: string;
  property: {
    title: string;
    image: string;
  };
  hostId: string | undefined;
  hostName: string | undefined;
  hostImage: string | undefined;
  lastMessage: {
    text: string;
    sentAt: string;
    sentByHost: boolean;
    read: boolean;
  };
  unreadCount: number;
}

export default function InboxScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const markAsRead = (id: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? {
              ...conv,
              unreadCount: 0,
              lastMessage: { ...conv.lastMessage, read: true },
            }
          : conv
      )
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    // Format relative time (e.g. "5 minutes ago")
    const timeAgo = formatDistanceToNow(new Date(item.lastMessage.sentAt), {
      addSuffix: true,
    });

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          {
            backgroundColor: isDark
              ? item.unreadCount > 0
                ? `${theme.colors.primary[900]}60`
                : theme.colors.gray[800]
              : item.unreadCount > 0
              ? `${theme.colors.primary[100]}60`
              : theme.colors.gray[50],
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
        onPress={() => {
          console.log(`Navigate to conversation ${item.id}`);
          markAsRead(item.id);
        }}
      >
        <Image
          source={{ uri: item.hostImage }}
          style={styles.hostImage}
          resizeMode="cover"
        />
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
              {item.hostName}
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
            {item.property.title}
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
              numberOfLines={1}
            >
              {item.lastMessage.sentByHost ? "" : "You: "}
              {item.lastMessage.text}
            </Text>

            {item.unreadCount > 0 && (
              <Badge content={item.unreadCount} variant="primary" size="sm" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="chatbox-ellipses-outline"
        size={64}
        color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
      />
      <Text
        style={[
          styles.emptyTitle,
          { color: isDark ? theme.colors.gray[300] : theme.colors.gray[700] },
        ]}
      >
        {t("inbox.noMessages")}
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: isDark ? theme.colors.gray[400] : theme.colors.gray[500] },
        ]}
      >
        {t("inbox.noMessagesDescription")}
      </Text>
    </View>
  );

  const renderConversationLoadingSkeleton = () => (
    <View
      style={[
        styles.conversationItem,
        {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[50],
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
        },
      ]}
    >
      <LoadingSkeleton width={50} height={50} borderRadius={25} />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <LoadingSkeleton width={120} height={16} borderRadius={4} />
          <LoadingSkeleton width={70} height={12} borderRadius={4} />
        </View>
        <LoadingSkeleton
          width={150}
          height={14}
          borderRadius={4}
          style={{ marginTop: 4 }}
        />
        <LoadingSkeleton
          width={200}
          height={14}
          borderRadius={4}
          style={{ marginTop: 4 }}
        />
      </View>
    </View>
  );

  const totalUnreadCount = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

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
            styles.title,
            { color: isDark ? theme.colors.gray[50] : theme.colors.gray[900] },
          ]}
        >
          {t("inbox.title")}
          {totalUnreadCount > 0 && (
            <Text style={{ color: theme.colors.primary[500] }}>
              {" "}
              ({totalUnreadCount})
            </Text>
          )}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {renderConversationLoadingSkeleton()}
          {renderConversationLoadingSkeleton()}
          {renderConversationLoadingSkeleton()}
        </View>
      ) : conversations.length > 0 ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: String(fontWeight.bold) as any,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  conversationItem: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  hostImage: {
    width: 50,
    height: 50,
    borderRadius: typeof radius.circle === "number" ? radius.circle : 25,
  },
  conversationContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hostName: {
    fontSize: fontSize.md,
    fontWeight: "600",
    flex: 1,
  },
  timeAgo: {
    fontSize: fontSize.xs,
  },
  propertyTitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  messageText: {
    fontSize: fontSize.md,
    fontWeight: "400",
    flex: 1,
    marginRight: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginVertical: spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    textAlign: "center",
  },
});
