import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchUnreadCount,
  markMessageAsRead,
  markAllMessagesAsRead,
} from "../services/messageService";
import { eventEmitter } from "../utils/eventEmitter";
import { SocketEvents } from "../services/socketService";
import { ConversationType } from "../types/message";
import { isValidDate } from "../utils/dateUtils";
import { isValidObjectId } from "../utils/mongoUtils";

/**
 * Hook for managing user conversations
 */
export const useConversations = () => {
  const queryClient = useQueryClient();
  const maxRetries = 3;

  // Fetch conversations
  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: Error) => {
      if (failureCount >= maxRetries) {
        console.error("Max retries reached for conversations query:", error);
        return false;
      }
      return true;
    },
    select: (data: ConversationType[]) => {
      // Validate conversation data
      return data.filter((conversation) => {
        // Check for required fields
        if (!conversation.id || !conversation.hostName) {
          console.warn("Conversation missing required fields:", conversation);
          return false;
        }

        // Validate dates in last message
        if (
          conversation.lastMessage?.sentAt &&
          !isValidDate(conversation.lastMessage.sentAt)
        ) {
          console.warn(
            "Conversation has invalid date:",
            conversation.lastMessage.sentAt
          );
          // Fix the invalid date
          if (conversation.lastMessage) {
            conversation.lastMessage.sentAt = new Date().toISOString();
          }
        }

        return true;
      });
    },
  });
  // Get unread count across all conversations
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: fetchUnreadCount,
    staleTime: 1000 * 60, // 1 minute
    retry: (failureCount, error: Error) => {
      if (failureCount >= maxRetries) {
        console.error("Max retries reached for unread count query:", error);
        return false;
      }
      return true;
    },
  });

  // Mark a message as read
  const markAsReadMutation = useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  // Mark all messages as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllMessagesAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
  // Listen for real-time message events
  useEffect(() => {
    // When a new message is received
    const messageHandler = (message: any) => {
      try {
        if (!message || typeof message !== "object") {
          console.warn(
            "Received invalid message in useConversations hook",
            message
          );
          return;
        }

        // Validate message data
        if (
          !isValidObjectId(message.conversationId) &&
          !isValidObjectId(message.senderId)
        ) {
          console.warn("Message missing valid IDs", message);
          return;
        }

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["unreadCount"] });

        console.log(
          "Successfully processed new message in useConversations hook"
        );
      } catch (error) {
        console.error(
          "Error handling message in useConversations hook:",
          error
        );
      }
    };

    // When a message is marked as read
    const messageReadHandler = (data: any) => {
      try {
        if (!data || typeof data !== "object") {
          console.warn(
            "Received invalid read data in useConversations hook",
            data
          );
          return;
        }

        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      } catch (error) {
        console.error(
          "Error handling message read in useConversations hook:",
          error
        );
      }
    };
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    queryClient.invalidateQueries({ queryKey: ["unreadCount"] });

    // When all messages are marked as read
    const allMessagesReadHandler = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    };

    // Subscribe to events
    eventEmitter.on(SocketEvents.MESSAGE_RECEIVED, messageHandler);
    eventEmitter.on(SocketEvents.MESSAGE_READ, messageReadHandler);
    eventEmitter.on(SocketEvents.ALL_MESSAGES_READ, allMessagesReadHandler);

    // Cleanup
    return () => {
      eventEmitter.off(SocketEvents.MESSAGE_RECEIVED, messageHandler);
      eventEmitter.off(SocketEvents.MESSAGE_READ, messageReadHandler);
      eventEmitter.off(SocketEvents.ALL_MESSAGES_READ, allMessagesReadHandler);
    };
  }, [queryClient]);

  // Calculate total unread count from conversation data as well (as a fallback)
  const calculatedUnreadCount = conversations.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0
  );

  // Use the higher of the two counts to ensure we don't miss any unread messages
  const totalUnreadCount = Math.max(unreadCount, calculatedUnreadCount);

  return {
    conversations: conversations || [],
    isLoading,
    isError,
    unreadCount,
    totalUnreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    refresh: refetch,
  };
};
