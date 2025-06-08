/**
 * Chat and messaging related type definitions
 */

/**
 * Chat message type definition
 */
export interface ChatMessage {
  _id: string; // Legacy field
  id?: string; // New field
  chatId?: string; // Legacy field
  conversationId?: string; // New field
  senderId: string;
  text?: string; // Legacy field
  content?: string; // New field
  createdAt?: string | Date; // Legacy field
  timestamp?: string; // New field
  read?: boolean; // Legacy field
  isRead?: boolean; // New field
  status?: "sending" | "delivered" | "read" | "error";
  attachment?: {
    url: string;
    type: "image" | "file";
    name?: string;
  };
  sender?: any; // Will be properly typed when User is available
}

/**
 * Chat conversation type definition
 */
export interface ChatConversation {
  _id: string; // Legacy field
  id?: string; // New field
  participants: string[] | Participant[];
  property?: string | any; // Will be properly typed when Property is available
  propertyId?: string;
  lastMessage?:
    | ChatMessage
    | {
        text: string;
        senderId: string;
        createdAt: string | Date;
        read: boolean;
      };
  unreadCount: number;
  createdAt?: string | Date; // Legacy field
  updatedAt?: string | Date; // Legacy field
  participantDetails?: any[]; // Will be properly typed when User is available
}

/**
 * Chat participant type
 */
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

/**
 * Chat participant type definition
 */
export interface ChatParticipant {
  userId: string;
  user?: any; // Will be properly typed when User is available
  isTyping: boolean;
  lastSeen?: string | Date;
}

/**
 * Chat typing status event
 */
export interface TypingEvent {
  userId: string;
  chatId: string;
  isTyping: boolean;
}

/**
 * Chat service error type
 */
export interface ChatError {
  message: string;
  code: string;
  status?: number;
}

/**
 * Chat state type for context
 */
export interface ChatState {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: ChatError | null;
  participants: ChatParticipant[];
  isConnected: boolean;
}

/**
 * Chat socket events
 */
export enum ChatSocketEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  NEW_MESSAGE = "new_message",
  TYPING = "typing",
  STOP_TYPING = "stop_typing",
  READ_MESSAGES = "read_messages",
  USER_ONLINE = "user_online",
  USER_OFFLINE = "user_offline",
  ERROR = "error",
}
