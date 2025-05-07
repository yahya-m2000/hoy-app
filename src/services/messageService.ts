import api from "./api";
import {
  MessageType,
  ConversationType,
  NotificationType,
} from "../types/message";
import {
  sendMessage as sendSocketMessage,
  sendNotification as sendSocketNotification,
} from "./socketService";
import { isValidObjectId } from "../utils/mongoUtils";
import { isNetworkError } from "../utils/errorHandling";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define API response types for better type safety
interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

// Helper function to check if user is authenticated
const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem("authToken");
  return !!token;
};

// Message API endpoints
export const fetchMessages = async (): Promise<MessageType[]> => {
  try {
    if (!(await isAuthenticated())) {
      return [];
    }

    const res = await api.get<ApiResponse<MessageType[]>>("/messages");
    return res.data.data;
  } catch (error: any) {
    console.error("Error fetching messages:", error?.message || error);
    return [];
  }
};

export const fetchUnreadCount = async (): Promise<number> => {
  try {
    // If not authenticated, silently return 0 without making the API call
    if (!(await isAuthenticated())) {
      return 0;
    }

    const res = await api.get<ApiResponse<{ count: number }>>(
      "/messages/unread"
    );
    return res.data.data.count || 0;
  } catch (error: any) {
    // Only log actual errors if authenticated, not auth-related errors
    if (error.response?.status !== 401) {
      console.error("Error fetching unread count:", error?.message || error);

      // Don't log network errors with full stack traces
      if (!isNetworkError(error)) {
        console.error("Error details:", error);
      }
    }

    return 0;
  }
};

export const fetchConversation = async (
  userId: string
): Promise<MessageType[]> => {
  try {
    // If not authenticated, silently return empty array
    if (!(await isAuthenticated())) {
      return [];
    }

    // Check if userId is a valid MongoDB ObjectId
    if (!isValidObjectId(userId)) {
      console.warn(`Invalid ObjectId format: ${userId}`);
      return []; // Return empty array instead of causing a server error
    }

    const res = await api.get<ApiResponse<MessageType[]>>(
      `/messages/conversations/${userId}`
    );
    return res.data.data;
  } catch (error: any) {
    // Only log non-auth errors
    if (error.response?.status !== 401) {
      console.error("Error fetching conversation:", error?.message || error);
    }
    return []; // Return empty array on error
  }
};

export const sendMessage = async (messageData: {
  recipientId: string;
  content: string;
}): Promise<MessageType> => {
  try {
    // If not authenticated, throw an error since sending requires auth
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required to send messages");
    }

    // Check if recipientId is a valid MongoDB ObjectId
    if (!isValidObjectId(messageData.recipientId)) {
      console.warn(
        `Invalid ObjectId format for recipient: ${messageData.recipientId}`
      );
      throw new Error("Invalid recipient ID format");
    }

    const res = await api.post<ApiResponse<MessageType>>(
      "/messages",
      messageData
    );
    const response = res.data.data;

    // Also send via socket for real-time delivery
    sendSocketMessage(messageData.recipientId, {
      content: messageData.content,
      id: response.id,
      createdAt: response.createdAt,
    });

    return response;
  } catch (error: any) {
    // Don't log auth-related errors
    if (error.response?.status !== 401) {
      console.error("Error sending message:", error?.message || error);
    }
    throw error; // Re-throw to let the UI handle it
  }
};

export const markMessageAsRead = async (
  conversationId: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // If not authenticated, return success false without making API call
    if (!(await isAuthenticated())) {
      return { success: false, message: "Authentication required" };
    }

    // Check if conversationId is a valid MongoDB ObjectId
    if (!isValidObjectId(conversationId)) {
      console.warn(
        `Invalid ObjectId format for marking conversation as read: ${conversationId}`
      );
      return { success: false, message: "Invalid conversation ID format" };
    }

    // Use the conversations endpoint as we're marking a conversation as read, not an individual message
    const res = await api.put<
      ApiResponse<{ success: boolean; message: string }>
    >(`/messages/conversations/${conversationId}/read`);
    return res.data.data;
  } catch (error: any) {
    // Only log non-auth related errors
    if (error.response?.status !== 401) {
      console.error(
        "Error marking conversation as read:",
        error?.message || error
      );
    }
    return { success: false, message: "Failed to mark conversation as read" };
  }
};

export const markAllMessagesAsRead = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // If not authenticated, return success false without making API call
    if (!(await isAuthenticated())) {
      return { success: false, message: "Authentication required" };
    }

    const res = await api.put<
      ApiResponse<{ success: boolean; message: string }>
    >("/messages/read-all");
    return res.data.data;
  } catch (error: any) {
    console.error(
      "Error marking all messages as read:",
      error?.message || error
    );
    return { success: false, message: "Failed to mark all messages as read" };
  }
};

// Notification API endpoints
export const fetchNotifications = async (): Promise<NotificationType[]> => {
  try {
    // If not authenticated, silently return empty array
    if (!(await isAuthenticated())) {
      return [];
    }

    const res = await api.get<ApiResponse<NotificationType[]>>(
      "/notifications"
    );
    return res.data.data;
  } catch (error: any) {
    console.error("Error fetching notifications:", error?.message || error);
    return [];
  }
};

export const fetchUnreadNotificationCount = async (): Promise<number> => {
  try {
    // If not authenticated, silently return 0
    if (!(await isAuthenticated())) {
      return 0;
    }

    const res = await api.get<ApiResponse<{ count: number }>>(
      "/notifications/unread"
    );
    return res.data.data.count || 0;
  } catch (error: any) {
    console.error(
      "Error fetching unread notification count:",
      error?.message || error
    );

    // For network errors, provide a cleaner log message
    if (isNetworkError(error)) {
      console.info("Network unavailable for notifications");
    }

    return 0;
  }
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // If not authenticated, return success false without making API call
    if (!(await isAuthenticated())) {
      return { success: false, message: "Authentication required" };
    }

    // Check if notificationId is a valid MongoDB ObjectId
    if (!isValidObjectId(notificationId)) {
      console.warn(
        `Invalid ObjectId format for marking notification as read: ${notificationId}`
      );
      return { success: false, message: "Invalid notification ID format" };
    }

    const res = await api.put<
      ApiResponse<{ success: boolean; message: string }>
    >(`/notifications/${notificationId}/read`);
    return res.data.data;
  } catch (error: any) {
    console.error(
      "Error marking notification as read:",
      error?.message || error
    );
    return { success: false, message: "Failed to mark notification as read" };
  }
};

export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // If not authenticated, return success false without making API call
    if (!(await isAuthenticated())) {
      return { success: false, message: "Authentication required" };
    }

    const res = await api.put<
      ApiResponse<{ success: boolean; message: string }>
    >("/notifications/read-all");
    return res.data.data;
  } catch (error: any) {
    console.error(
      "Error marking all notifications as read:",
      error?.message || error
    );
    return {
      success: false,
      message: "Failed to mark all notifications as read",
    };
  }
};

/**
 * Map API conversation format to app format
 */
const mapApiConversationToAppFormat = (conversation: any): ConversationType => {
  try {
    // Validate required fields and provide defaults for missing data
    if (!conversation) {
      console.warn("Received null or undefined conversation");
      throw new Error("Invalid conversation data");
    }

    return {
      id: conversation.id || conversation.otherUser?.id || "unknown",
      conversationId: conversation.id || "unknown",
      propertyId: conversation.property?.id || "unknown",
      property: {
        title: conversation.property?.title || "Unknown Property",
        image: conversation.property?.image || "",
      },
      hostId: conversation.otherUser?.id || null,
      hostName: conversation.otherUser?.name || "Host",
      hostPhoto: conversation.otherUser?.profilePic || null,
      lastMessage: conversation.lastMessage
        ? {
            text: conversation.lastMessage?.content || "",
            sentAt:
              conversation.lastMessage?.createdAt || new Date().toISOString(),
            sentByHost:
              conversation.lastMessage?.senderId === conversation.otherUser?.id,
            read: conversation.lastMessage?.isRead || false,
          }
        : undefined,
      unreadCount: conversation.unreadCount || 0,
    };
  } catch (error: any) {
    console.error("Error mapping conversation:", error?.message || error);

    // Return a default conversation object as fallback
    return {
      id: "error",
      conversationId: "error",
      propertyId: "unknown",
      property: {
        title: "Error loading property",
        image: "",
      },
      hostId: null,
      hostName: "Unknown Host",
      hostPhoto: null,
      lastMessage: undefined,
      unreadCount: 0,
    };
  }
};

// Conversations API endpoints (for the inbox screen)
export const fetchConversations = async (): Promise<ConversationType[]> => {
  try {
    // If not authenticated, silently return empty array
    if (!(await isAuthenticated())) {
      return [];
    }

    const res = await api.get<ApiResponse<any[]>>("/messages/conversations");

    // Map API format to app format
    return (res.data.data || [])
      .map((conversation) => {
        try {
          return mapApiConversationToAppFormat(conversation);
        } catch (error: any) {
          console.error("Error mapping conversation:", error?.message || error);
          // Return a default placeholder for this conversation
          return {
            id: "error-" + Math.random().toString(36).substring(2, 9),
            conversationId: "unknown",
            propertyId: "unknown",
            property: {
              title: "Error loading conversation",
              image: "",
            },
            hostId: null,
            hostName: "Unknown Host",
            hostPhoto: null,
            unreadCount: 0,
          };
        }
      })
      .filter(Boolean);
  } catch (error: any) {
    console.error("Error fetching conversations:", error?.message || error);

    // For network errors, provide a cleaner log message
    if (isNetworkError(error)) {
      console.info(
        "Network unavailable for conversations. Will retry automatically when connection is restored."
      );
    } else {
      console.error("Error details:", error);
    }

    return [];
  }
};

// Define the notification data type for better type safety
interface NotificationData {
  recipientId: string;
  title: string;
  content: string;
  type?: string;
  relatedTo?: {
    type: string;
    id?: string;
  };
}

// Send a notification through the API and socket
export const sendNotification = async (
  notificationData: NotificationData
): Promise<NotificationType> => {
  try {
    // If not authenticated, throw an error since sending requires auth
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required to send notifications");
    }

    // Validate recipientId
    if (!isValidObjectId(notificationData.recipientId)) {
      console.warn(
        `Invalid ObjectId format for recipient: ${notificationData.recipientId}`
      );
      throw new Error("Invalid recipient ID format");
    }

    // Validate related ID if present
    if (
      notificationData.relatedTo?.id &&
      !isValidObjectId(notificationData.relatedTo.id)
    ) {
      console.warn(
        `Invalid ObjectId format for related entity: ${notificationData.relatedTo.id}`
      );
      // Remove invalid ID instead of failing
      notificationData.relatedTo.id = undefined;
    }

    const response = await api
      .post<ApiResponse<NotificationType>>("/notifications", notificationData)
      .then((res) => res.data.data);

    // Also send via socket for real-time delivery
    try {
      await sendSocketNotification(notificationData.recipientId, {
        title: notificationData.title,
        content: notificationData.content,
        id: response.id,
        createdAt: response.createdAt,
        type: notificationData.type || "system",
        relatedTo: notificationData.relatedTo,
      });
    } catch (socketError: any) {
      console.warn(
        "Failed to send real-time notification:",
        socketError?.message || socketError
      );
      // Continue even if socket delivery fails - the notification is already saved in the database
    }

    return response;
  } catch (error: any) {
    console.error("Error sending notification:", error?.message || error);
    throw error; // Re-throw to let the UI handle it
  }
};

interface PropertyInquiryResponse {
  message: string;
  messageId: string;
  hostId: string;
  propertyTitle: string;
}

// Send a property inquiry message to a property host
export const sendPropertyInquiry = async (
  propertyId: string,
  content: string
): Promise<PropertyInquiryResponse> => {
  try {
    // If not authenticated, throw an error since sending requires auth
    if (!(await isAuthenticated())) {
      throw new Error("Authentication required to send property inquiries");
    }

    // Check if propertyId is a valid MongoDB ObjectId
    if (!isValidObjectId(propertyId)) {
      console.warn(`Invalid ObjectId format for property: ${propertyId}`);
      throw new Error("Invalid property ID format");
    }

    // Validate message content
    if (!content || content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    // Attempt to send the property inquiry
    console.log(`Sending property inquiry for property ${propertyId}`);
    const response = await api
      .post<ApiResponse<PropertyInquiryResponse>>(
        `/messages/property-inquiry/${propertyId}`,
        {
          content,
        }
      )
      .then((res) => res.data.data);

    // Log the response for debugging
    console.log("Property inquiry sent successfully:", response);

    // Also refresh conversations after sending a message
    try {
      await fetchConversations();
    } catch (refreshError: any) {
      console.warn(
        "Could not refresh conversations after inquiry:",
        refreshError?.message || refreshError
      );
      // Continue even if refresh fails - the message was sent successfully
    }

    // Return the response so the UI can update accordingly
    return response;
  } catch (error: any) {
    // Log detailed error information
    console.error(`Error sending property inquiry: ${error?.message || error}`);

    // Re-throw to let the UI handle it with proper error messaging
    throw error;
  }
};
