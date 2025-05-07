import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { fontSize } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversation,
  sendMessage,
  markMessageAsRead,
} from "../../src/services/messageService";
import { MessageType } from "../../src/types/message";
import {
  sendTypingIndicator,
  sendStopTypingIndicator,
  SocketEvents,
} from "../../src/services/socketService";
import { eventEmitter } from "../../src/utils/eventEmitter";
import { isValidObjectId } from "../../src/utils/mongoUtils";
import { getRelativeTime } from "../../src/utils/dateUtils";
import { useMessages } from "../../src/context/MessageContext";

export default function ConversationScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();
  const { socketConnected, reconnectSocket } = useMessages();

  // Get conversation details
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      // Validate if id is in proper MongoDB ObjectId format
      if (!isValidObjectId(id)) {
        console.error(`Invalid conversation ID format: ${id}`);
        throw new Error("Invalid conversation ID format");
      }

      // If socket is not connected, try to reconnect
      if (!socketConnected) {
        await reconnectSocket().catch((err) => {
          console.warn("Failed to reconnect socket:", err);
        });
      }

      const response = await fetchConversation(id); // Mark messages as read when viewing conversation
      if (response.length > 0) {
        try {
          await markMessageAsRead(id).catch((err) => {
            console.log("Failed to mark conversation as read:", err);
          });
        } catch (error) {
          console.warn("Error marking conversation as read:", error);
        }
      }

      return response;
    },
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      // After sending a message, refetch the conversation
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    },
  });

  // Listen for incoming messages
  useEffect(() => {
    const handleNewMessage = (message: MessageType) => {
      try {
        if (!message || typeof message !== "object") {
          console.warn(
            "Received invalid message in conversation screen:",
            message
          );
          return;
        }

        if (!isValidObjectId(message.senderId)) {
          console.warn("Message has invalid senderId:", message.senderId);
          return;
        }

        if (message.senderId === id) {
          queryClient.invalidateQueries({ queryKey: ["conversation", id] });
        }
      } catch (error) {
        console.error(
          "Error handling new message in conversation screen:",
          error
        );
      }
    };

    const handleTyping = (data: { senderId: string }) => {
      try {
        if (!data || typeof data !== "object" || !data.senderId) {
          console.warn("Received invalid typing data:", data);
          return;
        }

        if (data.senderId === id) {
          setIsTyping(true);
        }
      } catch (error) {
        console.error("Error handling typing indicator:", error);
      }
    };

    const handleStopTyping = (data: { senderId: string }) => {
      try {
        if (!data || typeof data !== "object" || !data.senderId) {
          console.warn("Received invalid stop typing data:", data);
          return;
        }

        if (data.senderId === id) {
          setIsTyping(false);
        }
      } catch (error) {
        console.error("Error handling stop typing indicator:", error);
      }
    };

    eventEmitter.on(SocketEvents.MESSAGE_RECEIVED, handleNewMessage);
    eventEmitter.on(SocketEvents.USER_TYPING, handleTyping);
    eventEmitter.on(SocketEvents.USER_STOPPED_TYPING, handleStopTyping);

    return () => {
      eventEmitter.off(SocketEvents.MESSAGE_RECEIVED, handleNewMessage);
      eventEmitter.off(SocketEvents.USER_TYPING, handleTyping);
      eventEmitter.off(SocketEvents.USER_STOPPED_TYPING, handleStopTyping);
    };
  }, [id, queryClient]);

  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !id || !user) return;

    // Validate recipient ID
    if (!isValidObjectId(id)) {
      console.error(`Cannot send message: Invalid recipient ID format: ${id}`);
      return;
    }

    try {
      // Ensure socket is connected before sending
      await reconnectSocket().catch((err) => {
        console.warn("Failed to reconnect socket before sending:", err);
      });

      // Send the message
      await sendMessageMutation.mutateAsync({
        recipientId: id,
        content: messageText.trim(),
      });

      // Clear input and scroll to bottom
      setMessageText("");
      scrollToBottom();

      // Clear typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }

      // Safely send stop typing indicator
      sendStopTypingIndicator(id).catch((err) => {
        console.warn("Failed to send stop typing indicator:", err);
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Function to handle typing indicator
  const handleTypingIndicator = (text: string) => {
    setMessageText(text);

    // Send typing indicator if text is not empty
    if (text.trim() && id) {
      sendTypingIndicator(id);

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to stop typing indicator after 2 seconds
      const timeout = setTimeout(() => {
        sendStopTypingIndicator(id);
      }, 2000);

      setTypingTimeout(timeout as unknown as NodeJS.Timeout);
    } else if (!text.trim() && id) {
      // If text is empty, stop typing indicator
      sendStopTypingIndicator(id);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 300);
    }
  }, [messages, scrollToBottom]);

  // Render message item
  const renderMessageItem = ({ item }: { item: MessageType }) => {
    const isMyMessage = item.senderId === user?.id;

    // Format time with our helper function
    const timeAgo = getRelativeTime(item.createdAt, "Recently");

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage
            ? styles.myMessageContainer
            : styles.theirMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage
              ? [
                  styles.myMessageBubble,
                  { backgroundColor: theme.colors.primary[500] },
                ]
              : [
                  styles.theirMessageBubble,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[800]
                      : theme.colors.gray[200],
                  },
                ],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isMyMessage
                  ? "white"
                  : isDark
                  ? theme.colors.gray[100]
                  : theme.colors.gray[800],
              },
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                color: isMyMessage
                  ? "rgba(255, 255, 255, 0.7)"
                  : isDark
                  ? theme.colors.gray[400]
                  : theme.colors.gray[500],
              },
            ]}
          >
            {timeAgo}
          </Text>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={isDark ? theme.colors.primary[300] : theme.colors.primary[500]}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark
              ? theme.colors.gray[900]
              : theme.colors.gray[50],
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? theme.colors.gray[200] : theme.colors.gray[800]}
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
            numberOfLines={1}
          >
            {messages.length > 0 && messages[0].senderName
              ? messages[0].senderName
              : "Chat"}
          </Text>
          {isTyping && (
            <Text
              style={[
                styles.typingIndicator,
                { color: theme.colors.primary[isDark ? 300 : 500] },
              ]}
            >
              typing...
            </Text>
          )}
        </View>
      </View>

      {/* Messages List */}
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="chatbubble-outline"
            size={64}
            color={isDark ? theme.colors.gray[700] : theme.colors.gray[300]}
          />
          <Text
            style={[
              styles.emptyText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {isError ? "Error loading messages" : "No messages yet"}
          </Text>
          <Text
            style={[
              styles.emptySubtext,
              {
                color: isDark ? theme.colors.gray[500] : theme.colors.gray[500],
              },
            ]}
          >
            {isError
              ? "Please try again later"
              : "Your conversation will appear here"}
          </Text>
          {isError && (
            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: theme.colors.primary[500] },
              ]}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />
      )}

      {/* Message Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100],
            borderTopColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? theme.colors.gray[700] : "#FFFFFF",
              color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
            },
          ]}
          value={messageText}
          onChangeText={handleTypingIndicator}
          placeholder={t("message.typePlaceholder", "Type a message...")}
          placeholderTextColor={
            isDark ? theme.colors.gray[500] : theme.colors.gray[400]
          }
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: messageText.trim()
                ? theme.colors.primary[500]
                : isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sendMessageMutation.isPending}
        >
          {sendMessageMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  typingIndicator: {
    fontSize: fontSize.sm,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: "500",
    marginTop: spacing.md,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: spacing.xs,
    maxWidth: "80%",
  },
  myMessageContainer: {
    alignSelf: "flex-end",
  },
  theirMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  myMessageBubble: {
    borderBottomRightRadius: 0,
  },
  theirMessageBubble: {
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: fontSize.md,
  },
  messageTime: {
    fontSize: fontSize.xs,
    alignSelf: "flex-end",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === "ios" ? spacing.xs : 0,
    maxHeight: 120,
    fontSize: fontSize.md,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
});
