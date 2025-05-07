/**
 * Message Context for the Hoy application
 * Provides message state and operations throughout the app
 */

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
// import { mockConversations } from "../utils/mockData";
import * as messageService from "../services/messageService";
import { initializeSocket, getSocket } from "../services/socketService";
import { useAuth } from "./AuthContext";
import { AppState, AppStateStatus } from "react-native";
import { ConversationType } from "../types/message";

// Type for context
interface MessageContextType {
  conversations: ConversationType[];
  totalUnreadCount: number;
  isLoading: boolean;
  markAsRead: (conversationId: string) => void;
  markAllAsRead: () => void;
  refreshConversations: () => Promise<void>;
  sendPropertyInquiry: (propertyId: string, content: string) => Promise<any>;
  socketConnected: boolean;
  reconnectSocket: () => Promise<boolean>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const { user } = useAuth();

  // Use refs to break circular dependencies
  const refreshConversationsRef = useRef<() => Promise<void>>(async () => {});

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0
  );
  // Initialize socket connection
  const initializeSocketConnection = useCallback(async () => {
    if (user) {
      console.log("Initializing socket connection");
      try {
        const socket = await initializeSocket();
        const isConnected = !!socket?.connected;
        setSocketConnected(isConnected);

        if (!isConnected) {
          console.warn("Socket connection failed during initialization");
        } else {
          console.log("Socket connected successfully");
        }

        return isConnected;
      } catch (error) {
        console.error("Socket initialization error:", error);
        setSocketConnected(false);
        return false;
      }
    }
    return false;
  }, [user]);

  // Reconnect socket manually
  const reconnectSocket = useCallback(async () => {
    console.log("Manually reconnecting socket");
    try {
      // Try to initialize socket connection up to 3 times
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`Socket reconnection attempt ${attempt}/3`);
        const result = await initializeSocketConnection();

        if (result) {
          console.log("Socket reconnection successful");
          return true;
        }

        // Wait a bit longer between each retry
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }

      console.error("All socket reconnection attempts failed");
      return false;
    } catch (error) {
      console.error("Socket reconnection error:", error);
      return false;
    }
  }, [initializeSocketConnection]);

  // Fetch conversations - define the actual implementation
  const refreshConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to fetch from actual API
      const fetchedConversations = await messageService
        .fetchConversations()
        .catch(() => conversations);

      // Map the response to ensure it has the required fields
      setConversations(
        fetchedConversations.map((conv) => ({
          ...conv,
          hostPhoto: conv.hostImage || null, // Ensure hostPhoto field is present
          hostId: conv.hostId || null, // Ensure hostId is string | null not undefined
          hostName: conv.hostName || "", // Ensure hostName is string not undefined
          unreadCount: conv.unreadCount || 0, // Ensure unreadCount has default value
        }))
      );
    } catch (error) {
      // If error occurs or no conversations are found, initialize with empty array
      setConversations([]);
      console.error("Error refreshing conversations:", error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the ref after defining the function
  useEffect(() => {
    refreshConversationsRef.current = refreshConversations;
  }, [refreshConversations]);

  // Mark a conversation as read
  const markAsRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              unreadCount: 0,
              lastMessage: conv.lastMessage
                ? { ...conv.lastMessage, read: true }
                : undefined,
            }
          : conv
      )
    );

    // Call API to mark as read
    messageService.markMessageAsRead(conversationId).catch((error) => {
      console.error("Error marking conversation as read:", error);
      // Revert state on error
      refreshConversationsRef.current();
    });
  }, []);

  // Mark all conversations as read
  const markAllAsRead = useCallback(() => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        unreadCount: 0,
        lastMessage: conv.lastMessage
          ? { ...conv.lastMessage, read: true }
          : undefined,
      }))
    );

    // Call API
    messageService.markAllMessagesAsRead().catch((error) => {
      console.error("Error marking all conversations as read:", error);
      // Revert state on error
      refreshConversationsRef.current();
    });
  }, []);
  // Send a property inquiry to a host
  const sendPropertyInquiry = useCallback(
    async (propertyId: string, content: string) => {
      try {
        // Ensure socket is connected for real-time updates
        await reconnectSocket();

        const result = await messageService.sendPropertyInquiry(
          propertyId,
          content
        );

        // Refresh conversations after sending inquiry
        await refreshConversationsRef.current();

        return result;
      } catch (error) {
        console.error("Error sending property inquiry:", error);

        // Attempt to refresh conversations even if there was an error
        // This helps ensure the UI is in sync even if the request failed
        try {
          await refreshConversationsRef.current();
        } catch (refreshError) {
          console.warn(
            "Failed to refresh conversations after error:",
            refreshError
          );
        }

        throw error;
      }
    },
    [reconnectSocket]
  );

  // Monitor app state to reconnect socket when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && user) {
        // App has come to the foreground
        const socket = getSocket();
        if (!socket?.connected) {
          console.log("App returned to foreground, reconnecting socket");
          await initializeSocketConnection();
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [user, initializeSocketConnection]);

  // Initialize socket when user is available
  useEffect(() => {
    if (user) {
      initializeSocketConnection();
    }
  }, [user, initializeSocketConnection]);

  // Initial load
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  return (
    <MessageContext.Provider
      value={{
        conversations,
        totalUnreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshConversations,
        sendPropertyInquiry,
        socketConnected,
        reconnectSocket,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};

export default MessageContext;
