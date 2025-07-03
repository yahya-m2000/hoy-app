/**
 * Persistent Chat Storage Service
 *
 * Provides local storage for chat data to enable offline functionality
 * and improve performance by reducing API calls.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatConversation, ChatMessage } from "@core/types/chat.types";
import { logger } from "@core/utils/sys/log";

// Storage keys
const STORAGE_KEYS = {
  CONVERSATIONS: "chat_conversations",
  CONVERSATION_PREFIX: "chat_conversation_",
  MESSAGES_PREFIX: "chat_messages_",
  LAST_SYNC_TIME: "chat_last_sync_time",
  UNREAD_COUNT: "chat_unread_count",
};

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * Save conversations to persistent storage
 */
export const saveConversations = async (
  conversations: ChatConversation[]
): Promise<void> => {
  try {
    const data = {
      conversations,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      STORAGE_KEYS.CONVERSATIONS,
      JSON.stringify(data)
    );
    logger.debug(
      `Saved ${conversations.length} conversations to persistent storage`
    );
  } catch (error) {
    logger.error(
      "Error saving conversations to persistent storage:",
      error
    );
  }
};

/**
 * Load conversations from persistent storage
 */
export const loadConversations = async (): Promise<
  ChatConversation[] | null
> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!data) return null;

    const parsedData = JSON.parse(data);

    // Check if data is expired
    if (Date.now() - parsedData.timestamp > CACHE_EXPIRY) {
      logger.info("Conversation cache expired");
      return null;
    }

    logger.debug(
      `Loaded ${parsedData.conversations.length} conversations from persistent storage`
    );
    return parsedData.conversations;
  } catch (error) {
    logger.error(
      "Error loading conversations from persistent storage:",
      error
    );
    return null;
  }
};

/**
 * Save a specific conversation to persistent storage
 */
export const saveConversation = async (
  conversation: ChatConversation
): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.CONVERSATION_PREFIX}${conversation.id}`;
    const data = {
      conversation,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(data));
    logger.debug(
      `Saved conversation ${conversation.id} to persistent storage`
    );

    // Also update the conversation in the list of conversations
    const conversations = await loadConversations();
    if (conversations) {
      const updatedConversations = conversations.map((conv) =>
        conv.id === conversation.id ? conversation : conv
      );

      // If conversation doesn't exist in the list, add it
      if (!conversations.some((conv) => conv.id === conversation.id)) {
        updatedConversations.push(conversation);
      }

      await saveConversations(updatedConversations);
    }
  } catch (error) {
    logger.error(
      `Error saving conversation ${conversation.id} to persistent storage:`,
      error
    );
  }
};

/**
 * Load a specific conversation from persistent storage
 */
export const loadConversation = async (
  conversationId: string
): Promise<ChatConversation | null> => {
  try {
    const key = `${STORAGE_KEYS.CONVERSATION_PREFIX}${conversationId}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;

    const parsedData = JSON.parse(data);

    // Check if data is expired
    if (Date.now() - parsedData.timestamp > CACHE_EXPIRY) {
      logger.info(`Conversation ${conversationId} cache expired`);
      return null;
    }

    logger.debug(
      `Loaded conversation ${conversationId} from persistent storage`
    );
    return parsedData.conversation;
  } catch (error) {
    logger.error(
      `Error loading conversation ${conversationId} from persistent storage:`,
      error
    );
    return null;
  }
};

/**
 * Save messages for a conversation to persistent storage
 */
export const saveMessages = async (
  conversationId: string,
  messages: ChatMessage[]
): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${conversationId}`;
    const data = {
      messages,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(data));
    logger.debug(
      `Saved ${messages.length} messages for conversation ${conversationId} to persistent storage`
    );
  } catch (error) {
    logger.error(
      `Error saving messages for conversation ${conversationId} to persistent storage:`,
      error
    );
  }
};

/**
 * Load messages for a conversation from persistent storage
 */
export const loadMessages = async (
  conversationId: string
): Promise<ChatMessage[] | null> => {
  try {
    const key = `${STORAGE_KEYS.MESSAGES_PREFIX}${conversationId}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;

    const parsedData = JSON.parse(data);

    // Check if data is expired
    if (Date.now() - parsedData.timestamp > CACHE_EXPIRY) {
      logger.info(
        `Messages for conversation ${conversationId} cache expired`
      );
      return null;
    }

    logger.debug(
      `Loaded ${parsedData.messages.length} messages for conversation ${conversationId} from persistent storage`
    );
    return parsedData.messages;
  } catch (error) {
    logger.error(
      `Error loading messages for conversation ${conversationId} from persistent storage:`,
      error
    );
    return null;
  }
};

/**
 * Add a new message to a conversation's message list
 */
export const addMessage = async (
  conversationId: string,
  message: ChatMessage
): Promise<void> => {
  try {
    // Load existing messages
    let messages = (await loadMessages(conversationId)) || [];

    // Check if message already exists
    if (!messages.some((m) => m.id === message.id)) {
      // Add new message
      messages.push(message); // Sort messages by timestamp
      messages.sort((a, b) => {
        const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timestampA - timestampB;
      });

      // Save updated messages
      await saveMessages(conversationId, messages);

      // Update the conversation's last message
      const conversation = await loadConversation(conversationId);
      if (conversation) {
        conversation.lastMessage = message;
        await saveConversation(conversation);
      }
    }
  } catch (error) {
    logger.error(
      `Error adding message to conversation ${conversationId}:`,
      error
    );
  }
};

/**
 * Save unread count to persistent storage
 */
export const saveUnreadCount = async (count: number): Promise<void> => {
  try {
    const data = {
      count,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.UNREAD_COUNT, JSON.stringify(data));
    logger.debug(`Saved unread count (${count}) to persistent storage`);
  } catch (error) {
    logger.error("Error saving unread count to persistent storage:", error);
  }
};

/**
 * Load unread count from persistent storage
 */
export const loadUnreadCount = async (): Promise<number | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.UNREAD_COUNT);
    if (!data) return null;

    const parsedData = JSON.parse(data);

    // Check if data is expired
    if (Date.now() - parsedData.timestamp > CACHE_EXPIRY) {
      logger.info("Unread count cache expired");
      return null;
    }

    logger.debug(
      `Loaded unread count (${parsedData.count}) from persistent storage`
    );
    return parsedData.count;
  } catch (error) {
    logger.error(
      "Error loading unread count from persistent storage:",
      error
    );
    return null;
  }
};

/**
 * Save last sync time to persistent storage
 */
export const saveLastSyncTime = async (timestamp: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_SYNC_TIME,
      JSON.stringify(timestamp)
    );
    logger.debug(
      `Saved last sync time (${new Date(
        timestamp
      ).toISOString()}) to persistent storage`
    );
  } catch (error) {
    logger.error(
      "Error saving last sync time to persistent storage:",
      error
    );
  }
};

/**
 * Load last sync time from persistent storage
 */
export const loadLastSyncTime = async (): Promise<number | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
    if (!data) return null;

    const timestamp = JSON.parse(data);
    logger.debug(
      `Loaded last sync time (${new Date(
        timestamp
      ).toISOString()}) from persistent storage`
    );
    return timestamp;
  } catch (error) {
    logger.error(
      "Error loading last sync time from persistent storage:",
      error
    );
    return null;
  }
};

/**
 * Clear all chat persistent storage
 */
export const clearChatStorage = async (): Promise<void> => {
  try {
    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();

    // Filter chat-related keys
    const chatKeys = allKeys.filter(
      (key) =>
        key === STORAGE_KEYS.CONVERSATIONS ||
        key === STORAGE_KEYS.LAST_SYNC_TIME ||
        key === STORAGE_KEYS.UNREAD_COUNT ||
        key.startsWith(STORAGE_KEYS.CONVERSATION_PREFIX) ||
        key.startsWith(STORAGE_KEYS.MESSAGES_PREFIX)
    );

    // Remove all chat-related keys
    if (chatKeys.length > 0) {
      await AsyncStorage.multiRemove(chatKeys);
      logger.info(`Cleared ${chatKeys.length} chat storage items`);
    }
  } catch (error) {
    logger.error("Error clearing chat storage:", error);
  }
};

/**
 * Clean up expired cache entries
 */
export const cleanupExpiredCache = async (): Promise<void> => {
  try {
    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();

    // Filter chat-related keys
    const chatKeys = allKeys.filter(
      (key) =>
        key === STORAGE_KEYS.CONVERSATIONS ||
        key === STORAGE_KEYS.UNREAD_COUNT ||
        key.startsWith(STORAGE_KEYS.CONVERSATION_PREFIX) ||
        key.startsWith(STORAGE_KEYS.MESSAGES_PREFIX)
    );

    // Check each key for expiration
    const expiredKeys: string[] = [];

    for (const key of chatKeys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          if (
            parsedData.timestamp &&
            Date.now() - parsedData.timestamp > CACHE_EXPIRY
          ) {
            expiredKeys.push(key);
          }
        } catch {
          // If we can't parse the data, consider it expired
          expiredKeys.push(key);
        }
      }
    }

    // Remove expired keys
    if (expiredKeys.length > 0) {
      await AsyncStorage.multiRemove(expiredKeys);
      logger.info(
        `Removed ${expiredKeys.length} expired chat cache entries`
      );
    }
  } catch (error) {
    logger.error("Error cleaning up expired cache:", error);
  }
};
