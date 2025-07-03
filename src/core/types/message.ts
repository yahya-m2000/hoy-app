/**
 * Message Types
 * 
 * Comprehensive type definitions for messaging and notifications including:
 * - Message structures and metadata
 * - Notification system types
 * - Conversation management
 * - Inbox display types
 * 
 * @module @core/types/message
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { BaseEntity } from './common.types';

// ========================================
// MESSAGE TYPES
// ========================================

/**
 * Basic message interface
 */
export interface MessageType extends BaseEntity {
  /** Message sender ID */
  senderId: string;
  /** Sender's display name */
  senderName: string;
  /** Message content */
  content: string;
  /** Whether message has been read */
  isRead: boolean;
  /** Message creation timestamp */
  createdAt: string;
  /** Message type */
  messageType?: 'text' | 'image' | 'file' | 'system';
  /** Message metadata */
  metadata?: Record<string, string | number | boolean>;
}

// ========================================
// NOTIFICATION TYPES
// ========================================

/**
 * Notification sender information
 */
export interface NotificationSender {
  /** Sender ID */
  id?: string;
  /** Sender display name */
  name?: string;
  /** Sender type classification */
  type: 'system' | 'user' | 'host' | 'admin';
  /** Sender avatar URL */
  avatar?: string;
}

/**
 * Related entity information for notifications
 */
export interface NotificationRelatedEntity {
  /** Related entity type */
  type: 'booking' | 'property' | 'unit' | 'review' | 'payment' | 'system' | 'message';
  /** Related entity ID */
  id?: string;
  /** Related entity title/name */
  title?: string;
  /** Additional metadata */
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Notification action button
 */
export interface NotificationAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action type */
  type: 'primary' | 'secondary' | 'destructive';
  /** Navigation target */
  action: string;
  /** Action parameters */
  params?: Record<string, string | number | boolean>;
}

/**
 * Complete notification interface
 */
export interface NotificationType extends BaseEntity {
  /** Notification recipient user ID */
  userId: string;
  /** Notification type identifier */
  type: 'notification';
  /** Notification title */
  title: string;
  /** Notification content/body */
  content: string;
  /** Notification sender information */
  sender?: NotificationSender;
  /** Related entity information */
  relatedTo?: NotificationRelatedEntity;
  /** Whether notification has been read */
  isRead: boolean;
  /** Whether notification is archived */
  isArchived: boolean;
  /** Notification priority level */
  priority?: NotificationPriority;
  /** Notification category */
  category?: string;
  /** Available actions */
  actions?: NotificationAction[];
  /** Notification expiration date */
  expiresAt?: string;
  /** Push notification sent status */
  pushSent?: boolean;
  /** Email notification sent status */
  emailSent?: boolean;
  /** Update timestamp */
  updatedAt: string;
}

// ========================================
// CONVERSATION TYPES
// ========================================

/**
 * Property information for conversations
 */
export interface ConversationProperty {
  /** Property title/name */
  title: string;
  /** Property main image URL */
  image: string;
  /** Property location */
  location?: string;
  /** Property rating */
  rating?: number;
}

/**
 * Last message summary in conversation
 */
export interface LastMessageInfo {
  /** Message text content */
  text: string;
  /** Message sent timestamp */
  sentAt: string;
  /** Whether sent by host */
  sentByHost: boolean;
  /** Whether message has been read */
  read: boolean;
  /** Message type */
  messageType?: 'text' | 'image' | 'file' | 'system';
  /** Sender name */
  senderName?: string;
}

/**
 * Conversation type for inbox display
 */
export interface ConversationType extends BaseEntity {
  /** Legacy conversation ID */
  conversationId?: string;
  /** Associated property ID */
  propertyId: string;
  /** Property information */
  property: ConversationProperty;
  /** Host user ID */
  hostId: string | null;
  /** Host display name */
  hostName: string;
  /** Host profile photo URL (legacy) */
  hostPhoto: string | null;
  /** Host profile image URL (alternative) */
  hostImage?: string;
  /** Last message information */
  lastMessage?: LastMessageInfo;
  /** Unread message count */
  unreadCount: number;
  /** Whether conversation is archived */
  isArchived?: boolean;
  /** Whether conversation is muted */
  isMuted?: boolean;
  /** Conversation status */
  status?: 'active' | 'ended' | 'archived';
  /** Last activity timestamp */
  lastActivity?: string;
  /** Participant count */
  participantCount?: number;
}

// ========================================
// NOTIFICATION PREFERENCES TYPES
// ========================================

/**
 * Notification channel preferences
 */
export interface NotificationChannels {
  /** Push notifications enabled */
  push: boolean;
  /** Email notifications enabled */
  email: boolean;
  /** SMS notifications enabled */
  sms: boolean;
  /** In-app notifications enabled */
  inApp: boolean;
}

/**
 * Notification category preferences
 */
export interface NotificationCategories {
  /** Booking-related notifications */
  bookings: boolean;
  /** Message notifications */
  messages: boolean;
  /** Review notifications */
  reviews: boolean;
  /** Payment notifications */
  payments: boolean;
  /** Marketing notifications */
  marketing: boolean;
  /** System announcements */
  announcements: boolean;
  /** Host-specific notifications */
  hosting?: boolean;
}

/**
 * Complete notification preferences
 */
export interface NotificationPreferences {
  /** User ID */
  userId: string;
  /** Notification channels */
  channels: NotificationChannels;
  /** Notification categories */
  categories: NotificationCategories;
  /** Quiet hours configuration */
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  /** Frequency preferences */
  frequency?: {
    digest: 'immediate' | 'hourly' | 'daily' | 'weekly';
    marketing: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  /** Last updated timestamp */
  updatedAt: string;
}
