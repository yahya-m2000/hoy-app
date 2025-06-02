/**
 * Conversation Screen for both Host and Traveler
 * This screen displays individual conversation thread between users
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// Hooks & Context
import { useTranslation } from "react-i18next";
import { useTheme } from "@common-context/ThemeContext";
import { useAuth } from "@common-context/AuthContext";
// import { useChat } from "@traveler-hooks/useChat"; // Hook is currently commented out

// Types
import { ChatMessage as Message } from "@common/types/chat";

// Styles and Constants
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import { radius } from "@common/constants/radius";

export default function ConversationScreen() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();  // const { getMessages, sendMessage, markAsRead } = useChat(); // Hook is currently commented out
  const getMessages = useCallback(() => Promise.resolve([]), []);
  const sendMessage = useCallback((text: string, chatId: string) => Promise.resolve(), []);
  const markAsRead = useCallback((chatId: string) => Promise.resolve(), []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [conversationDetails, setConversationDetails] = useState({
    otherUserName: "",
    otherUserAvatar: "",
    propertyTitle: "",
  });

  const flatListRef = useRef<FlatList>(null);

  // Load conversation on mount
  const loadConversation = useCallback(async () => {
    try {
      setLoading(true);
      const conversationMessages = await getMessages(); // Simplified since hook is disabled
      setMessages(conversationMessages);
      
      // Set conversation details (this would come from API)
      // For now, using placeholder data
      setConversationDetails({
        otherUserName: "John Doe",
        otherUserAvatar: "",
        propertyTitle: "Beautiful Downtown Apartment",
      });
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setLoading(false);
    }
  }, [getMessages]);

  useEffect(() => {
    if (id && user) {
      loadConversation();
      markAsRead(id as string);
    }
  }, [id, user, loadConversation, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;    const tempMessage: Message = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      senderId: user?.id || "",
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      setSending(true);
      setMessages((prev) => [...prev, tempMessage]);
      setMessageText("");

      await sendMessage(id as string, messageText.trim());
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.senderId === user?.id;
    
    return (
      <View
        style={[
          styles.messageBubble,
          isUserMessage ? styles.userMessage : styles.otherMessage,
          {
            backgroundColor: isUserMessage
              ? theme.colors.primary
              : isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: isUserMessage
                ? theme.white
                : isDark
                ? theme.white
                : theme.colors.gray[900],
            },
          ]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.messageTime,
            {
              color: isUserMessage
                ? theme.white + "80"
                : isDark
                ? theme.colors.gray[400]
                : theme.colors.gray[600],
            },
          ]}
        >          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }) : ""}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.divider,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            {conversationDetails.otherUserName}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
            {conversationDetails.propertyTitle}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id || Math.random().toString()}
          style={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Container */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.divider,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[200],
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
            placeholder={t("chat.typePlaceholder")}
            placeholderTextColor={
              isDark ? theme.colors.gray[400] : theme.colors.gray[500]
            }
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: messageText.trim() ? 1 : 0.5,
              },
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  infoButton: {
    padding: spacing.xs,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    flexGrow: 1,
    padding: spacing.md,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: fontSize.md,
  },
  messageTime: {
    fontSize: fontSize.xs,
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    paddingTop: spacing.sm,
    minHeight: 40,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
});
