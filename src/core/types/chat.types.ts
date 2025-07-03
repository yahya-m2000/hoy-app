/**
 * Chat & Messaging Types
 * 
 * Comprehensive type definitions for chat and messaging features including:
 * - Real-time messaging
 * - Chat conversations
 * - Socket event handling
 * - Typing indicators
 * - Message status tracking
 * 
 * @module @core/types/chat
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { BaseEntity } from './common.types';
import type { User } from './user.types';
import type { Property } from './property.types';

// ========================================
// MESSAGE TYPES
// ========================================

/**
 * Message status enumeration
 */
export type MessageStatus = 'sending' | 'delivered' | 'read' | 'error';

/**
 * Message attachment type
 */
export type AttachmentType = 'image' | 'file' | 'document' | 'video' | 'audio';

/**
 * Message attachment interface
 */
export interface MessageAttachment {
  /** Attachment URL */
  url: string;
  /** Type of attachment */
  type: AttachmentType;
  /** Original filename */
  name?: string;
  /** File size in bytes */
  size?: number;
  /** MIME type */
  mimeType?: string;
  /** Thumbnail URL for media files */
  thumbnail?: string;
  /** Duration for audio/video files */
  duration?: number;
}

/**
 * Chat message interface with legacy field support
 */
export interface ChatMessage {
  id: string;
  /** Legacy MongoDB ID */
  _id: string;
  /** Chat/conversation ID (legacy field) */
  chatId?: string;
  /** Conversation ID (new field) */
  conversationId?: string;
  /** Message sender ID */
  senderId: string;
  /** Message content (legacy field) */
  text?: string;
  /** Message content (new field) */
  content?: string;
  /** Legacy creation timestamp */
  createdAt?: string | Date;
  /** New timestamp field */
  timestamp?: string;
  /** Legacy read status */
  read?: boolean;
  /** New read status */
  isRead?: boolean;
  /** Message delivery status */
  status?: MessageStatus;
  /** Message attachment */
  attachment?: MessageAttachment;
  /** Sender information (populated) */
  sender?: User;
  /** Whether message is edited */
  isEdited?: boolean;
  /** Edit timestamp */
  editedAt?: string;
  /** Reply to message ID */
  replyTo?: string;
  /** Whether message is deleted */
  isDeleted?: boolean;
}

// ========================================
// CONVERSATION TYPES
// ========================================

/**
 * Chat participant interface
 */
export interface Participant {
  /** Participant ID */
  id: string;
  /** Participant name */
  name: string;
  /** Profile avatar URL */
  avatar?: string;
  /** Whether participant is online */
  isOnline?: boolean;
  /** Last seen timestamp */
  lastSeen?: string;
}

/**
 * Last message summary for conversations
 */
export interface LastMessageSummary {
  /** Message text */
  text: string;
  /** Sender ID */
  senderId: string;
  /** Message timestamp */
  createdAt: string | Date;
  /** Read status */
  read: boolean;
  /** Message status */
  status?: MessageStatus;
}

/**
 * Chat conversation interface with legacy support
 */
export interface ChatConversation {
  /** Legacy MongoDB ID */
  _id: string;
  /** New conversation ID */
  id?: string;
  /** Conversation participants */
  participants: string[] | Participant[];
  /** Associated property (legacy) */
  property?: string | Property;
  /** Property ID (new field) */
  propertyId?: string;
  /** Last message in conversation */
  lastMessage?: ChatMessage | LastMessageSummary;
  /** Unread message count */
  unreadCount: number;
  /** Legacy creation timestamp */
  createdAt?: string | Date;
  /** Legacy update timestamp */
  updatedAt?: string | Date;
  /** Populated participant details */
  participantDetails?: User[];
  /** Conversation title */
  title?: string;
  /** Whether conversation is archived */
  isArchived?: boolean;
  /** Whether conversation is muted */
  isMuted?: boolean;
  /** Conversation type */
  type?: 'direct' | 'group' | 'property_inquiry';
}

// ========================================
// PARTICIPANT & TYPING TYPES
// ========================================

/**
 * Chat participant with activity status
 */
export interface ChatParticipant {
  /** User ID */
  userId: string;
  /** User information (populated) */
  user?: User;
  /** Whether user is typing */
  isTyping: boolean;
  /** Last seen timestamp */
  lastSeen?: string | Date;
  /** Whether user is online */
  isOnline?: boolean;
  /** Join timestamp */
  joinedAt?: string;
  /** User role in conversation */
  role?: 'owner' | 'member' | 'admin';
}

/**
 * Typing status event
 */
export interface TypingEvent {
  /** User ID who is typing */
  userId: string;
  /** Chat/conversation ID */
  chatId: string;
  /** Whether user is typing */
  isTyping: boolean;
  /** Timestamp of typing event */
  timestamp?: string;
}

// ========================================
// ERROR & STATE TYPES
// ========================================

/**
 * Chat service error interface
 */
export interface ChatError {
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: Record<string, string | number | boolean>;
}

/**
 * Chat application state
 */
export interface ChatState {
  /** List of conversations */
  conversations: ChatConversation[];
  /** Currently active conversation */
  activeConversation: ChatConversation | null;
  /** Messages in active conversation */
  messages: ChatMessage[];
  /** Loading state */
  loading: boolean;
  /** Current error */
  error: ChatError | null;
  /** Active participants */
  participants: ChatParticipant[];
  /** WebSocket connection status */
  isConnected: boolean;
  /** Whether currently loading messages */
  loadingMessages: boolean;
  /** Whether there are more messages to load */
  hasMoreMessages: boolean;
}

// ========================================
// SOCKET EVENT TYPES
// ========================================

/**
 * WebSocket events for chat functionality
 */
export enum ChatSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  NEW_MESSAGE = 'new_message',
  MESSAGE_DELIVERED = 'message_delivered',
  MESSAGE_READ = 'message_read',
  TYPING = 'typing',
  STOP_TYPING = 'stop_typing',
  READ_MESSAGES = 'read_messages',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  CONVERSATION_UPDATED = 'conversation_updated',
  ERROR = 'error',
}

/**
 * Socket event payload for joining a chat room
 */
export interface JoinRoomPayload {
  /** Conversation ID to join */
  conversationId: string;
  /** User ID joining the room */
  userId: string;
}

/**
 * Socket event payload for new messages
 */
export interface NewMessagePayload {
  /** The new message */
  message: ChatMessage;
  /** Conversation ID */
  conversationId: string;
}

/**
 * Socket event payload for message status updates
 */
export interface MessageStatusPayload {
  /** Message ID */
  messageId: string;
  /** New status */
  status: MessageStatus;
  /** User ID who updated the status */
  userId: string;
  /** Timestamp of status update */
  timestamp: string;
}
