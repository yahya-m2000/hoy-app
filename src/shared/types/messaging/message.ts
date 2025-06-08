/**
 * Message type definitions for the Hoy application
 */
export interface MessageType {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Notification type definition
 */
export interface NotificationType {
  id: string;
  userId: string;
  type: "notification";
  title: string;
  content: string;
  sender?: {
    id?: string;
    name?: string;
    type: "system" | "user" | "host" | "admin";
  };
  relatedTo?: {
    type: "booking" | "property" | "unit" | "review" | "payment" | "system";
    id?: string;
  };
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Conversation type for inbox display
 */
export interface ConversationType {
  id: string;
  conversationId?: string;
  propertyId: string;
  property: {
    title: string;
    image: string;
  };
  hostId: string | null;
  hostName: string;
  hostPhoto: string | null;
  hostImage?: string;
  lastMessage?: {
    text: string;
    sentAt: string;
    sentByHost: boolean;
    read: boolean;
  };
  unreadCount: number;
}
