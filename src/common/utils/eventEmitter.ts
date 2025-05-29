/**
 * Simple event emitter for React Native
 * Used for app-wide events that don't fit into React's component hierarchy
 */

type Listener = (...args: any[]) => void;

class EventEmitter {
  private events: Record<string, Listener[]> = {};

  /**
   * Add event listener
   */
  on(event: string, listener: Listener): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);

    // Return unsubscribe function
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: Listener): void {
    if (!this.events[event]) {
      return;
    }
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  /**
   * Emit event
   */
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events[event] = [];
    } else {
      this.events = {};
    }
  }
}

// Export a singleton instance
export const eventEmitter = new EventEmitter();

// Common app events
export const AppEvents = {
  // Authentication events
  AUTH_LOGOUT: "auth:logout",
  AUTH_LOGOUT_COMPLETE: "auth:logout_complete",
  AUTH_LOGIN: "auth:login",
  TOKEN_REFRESHED: "auth:token_refreshed",

  // User events
  USER_DATA_CHANGED: "user:data_changed",
  USER_ROLE_CHANGED: "user:role_changed",

  // Socket events
  SOCKET_CONNECTED: "socket:connected",
  SOCKET_DISCONNECTED: "socket:disconnected",

  // Chat events
  CHAT_MESSAGE_RECEIVED: "chat:message_received",
  CHAT_USER_TYPING: "chat:user_typing",
  CHAT_USER_STOPPED_TYPING: "chat:user_stopped_typing",
  CHAT_MESSAGES_READ: "chat:messages_read",
  CHAT_CONVERSATION_UPDATED: "chat:conversation_updated",

  // Notification events
  NOTIFICATION_RECEIVED: "notification:received",
  NOTIFICATION_READ: "notification:read",
};
