/**
 * Host Messages Screen
 * Shows conversations with guests for all properties
 * Includes message filtering, search, and quick response features
 */

// React Native core
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

// Expo and third-party libraries
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

// App context
import { useTheme } from "@common/context/ThemeContext";
import { useUserRole } from "@common/context/UserRoleContext";

// Components
import EmptyState from "@common/components/EmptyState";
import Avatar from "@common/components/Avatar";

// Constants
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import { radius } from "@common/constants/radius";

// Message interface definition
interface Message {
  id: string;
  guestId: string;
  guestName: string;
  guestPhoto: string;
  propertyId: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  reservationId: string;
  reservationDate: string;
}

// Placeholder for API calls - replace with actual API calls
const getHostMessages = async (): Promise<Message[]> => {
  // Simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "msg1",
          guestId: "guest1",
          guestName: "John Smith",
          guestPhoto: "https://i.pravatar.cc/150?img=1",
          propertyId: "prop1",
          propertyTitle: "Luxury Beach House",
          lastMessage: "What time is check-in?",
          lastMessageTime: "2025-05-08T14:30:00Z",
          unread: 1,
          reservationId: "res1",
          reservationDate: "2025-05-20",
        },
        {
          id: "msg2",
          guestId: "guest2",
          guestName: "Jane Davis",
          guestPhoto: "https://i.pravatar.cc/150?img=2",
          propertyId: "prop2",
          propertyTitle: "Downtown Apartment",
          lastMessage: "Thanks for the information!",
          lastMessageTime: "2025-05-07T10:15:00Z",
          unread: 0,
          reservationId: "res2",
          reservationDate: "2025-06-10",
        },
        {
          id: "msg3",
          guestId: "guest3",
          guestName: "Michael Johnson",
          guestPhoto: "https://i.pravatar.cc/150?img=3",
          propertyId: "prop1",
          propertyTitle: "Luxury Beach House",
          lastMessage: "Is parking available on-site?",
          lastMessageTime: "2025-05-06T18:45:00Z",
          unread: 2,
          reservationId: "res3",
          reservationDate: "2025-07-05",
        },
        {
          id: "msg4",
          guestId: "guest4",
          guestName: "Sarah Williams",
          guestPhoto: "https://i.pravatar.cc/150?img=4",
          propertyId: "prop3",
          propertyTitle: "Mountain Cabin",
          lastMessage: "Do you allow pets?",
          lastMessageTime: "2025-05-05T09:30:00Z",
          unread: 0,
          reservationId: "res4",
          reservationDate: "2025-04-15",
        },
        {
          id: "msg5",
          guestId: "guest5",
          guestName: "Robert Brown",
          guestPhoto: "https://i.pravatar.cc/150?img=5",
          propertyId: "prop2",
          propertyTitle: "Downtown Apartment",
          lastMessage: "What restaurants do you recommend nearby?",
          lastMessageTime: "2025-05-03T22:10:00Z",
          unread: 0,
          reservationId: "res5",
          reservationDate: "2025-03-25",
        },
      ]);
    }, 1000);
  });
};

const MessagesScreen = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { isHost } = useUserRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread
  const [refreshing, setRefreshing] = useState(false);

  // Query for host messages
  const {
    data: messages,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["hostMessages"],
    queryFn: getHostMessages,
  });

  // Filter messages based on search and filter
  const filteredMessages = React.useMemo(() => {
    if (!messages) return [];

    return messages.filter((message) => {
      // Search filter
      const matchesSearch =
        message.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.propertyTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesFilter =
        filter === "all" || (filter === "unread" && message.unread > 0);

      return matchesSearch && matchesFilter;
    });
  }, [messages, searchQuery, filter]);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Redirect to traveler mode if not a host
  React.useEffect(() => {
    if (!isHost) {
      router.replace("/(tabs)");
    }
  }, [isHost]);

  // Format date for display
  const formatMessageTime = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      // Today - show time
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      // Yesterday
      return t("common.yesterday");
    } else if (diffDays < 7) {
      // Within a week
      return messageDate.toLocaleDateString([], { weekday: "short" });
    } else {
      // Older
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Format reservation date for display
  const formatReservationDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Render message item for FlatList
  const renderMessageItem = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={[
        styles.messageItem,
        {
          backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
        },
      ]}
      onPress={() => router.push(`/(screens)/common/conversation/${item.id}`)}
    >
      <View style={styles.messageAvatar}>
        <Avatar size="md" source={item.guestPhoto} name={item.guestName} />
        {item.unread > 0 && (
          <View
            style={[
              styles.unreadBadge,
              { backgroundColor: theme.colors.primary[500] },
            ]}
          >
            <Text style={[styles.unreadText, { color: theme.white }]}>
              {item.unread}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text
            style={[
              styles.guestName,
              { color: isDark ? theme.white : theme.colors.gray[900] },
              item.unread > 0 && { fontWeight: "700" },
            ]}
            numberOfLines={1}
          >
            {item.guestName}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {formatMessageTime(item.lastMessageTime)}
          </Text>
        </View>

        <Text
          style={[
            styles.propertyName,
            { color: isDark ? theme.colors.gray[400] : theme.colors.gray[600] },
          ]}
          numberOfLines={1}
        >
          {item.propertyTitle} • {t("host.reservation")}{" "}
          {formatReservationDate(item.reservationDate)}
        </Text>

        <Text
          style={[
            styles.messageText,
            { color: isDark ? theme.colors.gray[300] : theme.colors.gray[700] },
            item.unread > 0 && { fontWeight: "500" },
          ]}
          numberOfLines={2}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!isHost) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
    >
      {/* Search bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
        />
        <TextInput
          style={[
            styles.searchInput,
            { color: isDark ? theme.white : theme.colors.gray[900] },
          ]}
          placeholder={t("host.searchMessages")}
          placeholderTextColor={
            isDark ? theme.colors.gray[500] : theme.colors.gray[400]
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "all" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "all"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                fontWeight: filter === "all" ? "600" : "400",
              },
            ]}
          >
            {t("host.allMessages")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "unread" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setFilter("unread")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color:
                  filter === "unread"
                    ? theme.colors.primary
                    : isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                fontWeight: filter === "unread" ? "600" : "400",
              },
            ]}
          >
            {t("host.unread")}
            {messages && messages.filter((m) => m.unread > 0).length > 0 && (
              <Text
                style={{
                  color:
                    filter === "unread"
                      ? theme.colors.primary[500]
                      : theme.colors.primary[400],
                }}
              >
                {" "}
                ({messages.filter((m) => m.unread > 0).length})
              </Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("common.loading")}
          </Text>
        </View>
      ) : filteredMessages.length > 0 ? (
        <FlatList
          data={filteredMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <EmptyState
          icon="chatbubbles-outline"
          title={
            searchQuery.length > 0
              ? t("host.noMessagesFound")
              : t("host.noMessages")
          }
          message={
            searchQuery.length > 0
              ? t("host.noMessagesFoundDesc")
              : t("host.noMessagesDesc")
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterTab: {
    marginRight: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterText: {
    fontSize: fontSize.md,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  messageItem: {
    flexDirection: "row",
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  messageAvatar: {
    position: "relative",
    marginRight: spacing.md,
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  unreadText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  guestName: {
    fontSize: fontSize.md,
    fontWeight: "500",
    flex: 1,
  },
  messageTime: {
    fontSize: fontSize.xs,
  },
  propertyName: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: fontSize.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
  },
});

export default MessagesScreen;
