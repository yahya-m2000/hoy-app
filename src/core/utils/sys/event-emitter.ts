/**
 * Type-safe event emitter for React Native
 * Production-ready implementation with backward compatibility
 */

import { Alert } from 'react-native';
import { logger } from './log';

// Event payload type definitions - all payloads are optional for backward compatibility
interface EventPayloads {
  // Authentication events
  'auth:logout': { reason?: string } | undefined;
  'auth:logout_complete': void | undefined;
  'auth:login': { userId: string; role: 'host' | 'traveler' } | undefined;
  'auth:token_refreshed': { newToken: string } | undefined;

  // User events
  'user:data_changed': { userId: string; changes: Record<string, any> } | undefined;
  'user:role_changed': { oldRole: string; newRole: string } | { newRole: string } | undefined;

  // Socket events
  'socket:connected': { url?: string } | undefined;
  'socket:disconnected': { reason?: string; willReconnect?: boolean } | string | undefined;

  // Chat events
  'chat:message_received': { conversationId: string; message: any } | any;
  'chat:user_typing': { conversationId: string; userId: string } | any;
  'chat:user_stopped_typing': { conversationId: string; userId: string } | any;
  'chat:messages_read': { conversationId: string; messageIds: string[] } | any;
  'chat:conversation_updated': { conversationId: string; updates: any } | string | undefined;

  // Notification events
  'notification:received': { id: string; type: string; data: any } | any;
  'notification:read': { notificationId: string } | any;

  // Circuit breaker events
  'circuit_breaker:opened': { endpoint: string; metrics: any } | undefined;
  'circuit_breaker:closed': { endpoint: string; metrics: any } | undefined;
  'circuit_breaker:half_open': { endpoint: string; metrics: any } | undefined;
  'circuit_breaker:alert': { type: string; endpoint: string; metrics: any; timestamp: string } | undefined;

  // System events
  'error': { event: string; error: Error };

  // Allow any string for backward compatibility
  [key: string]: any;
}

type EventName = keyof EventPayloads | string;
type EventListener<T extends EventName> = T extends keyof EventPayloads 
  ? (payload?: EventPayloads[T]) => void | Promise<void>
  : (...args: any[]) => void | Promise<void>;

interface ListenerInfo {
  listener: EventListener<any>;
  once: boolean;
  addedAt: Date;
}

interface EventEmitterOptions {
  maxListeners?: number;
  warnOnMaxListeners?: boolean;
  enableMetrics?: boolean;
}

class TypedEventEmitter {
  private events = new Map<EventName, ListenerInfo[]>();
  private maxListeners: number = 10;
  private warnOnMaxListeners: boolean = true;
  private enableMetrics: boolean = false;
  private metrics = {
    eventsEmitted: 0,
    listenersAdded: 0,
    listenersRemoved: 0,
    errors: 0,
  };

  constructor(options: EventEmitterOptions = {}) {
    this.maxListeners = options.maxListeners ?? 10;
    this.warnOnMaxListeners = options.warnOnMaxListeners ?? true;
    this.enableMetrics = options.enableMetrics ?? __DEV__;
  }

  /**
   * Add event listener with backward compatibility
   */
  on<T extends EventName = string>(
    event: T, 
    listener: EventListener<T>
  ): () => void {
    const listeners = this.events.get(event) || [];
    
    // Check max listeners
    if (listeners.length >= this.maxListeners && this.warnOnMaxListeners) {
      const warning = `MaxListenersExceededWarning: ${listeners.length} listeners added for event "${event}". Use setMaxListeners() to increase limit.`;
      logger.warn(warning);
      
      if (__DEV__ && listeners.length > this.maxListeners * 2) {
        // Only alert in dev when it's really excessive
        Alert.alert('Memory Leak Warning', warning);
      }
    }

    const listenerInfo: ListenerInfo = {
      listener,
      once: false,
      addedAt: new Date(),
    };

    listeners.push(listenerInfo);
    this.events.set(event, listeners);
    
    if (this.enableMetrics) {
      this.metrics.listenersAdded++;
    }

    // Return unsubscribe function
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Add one-time event listener
   */
  once<T extends EventName = string>(
    event: T, 
    listener: EventListener<T>
  ): () => void {
    const listeners = this.events.get(event) || [];
    
    const listenerInfo: ListenerInfo = {
      listener,
      once: true,
      addedAt: new Date(),
    };

    listeners.push(listenerInfo);
    this.events.set(event, listeners);
    
    if (this.enableMetrics) {
      this.metrics.listenersAdded++;
    }

    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Remove event listener
   */
  off<T extends EventName = string>(
    event: T, 
    listener: EventListener<any>
  ): void {
    const listeners = this.events.get(event);
    if (!listeners) return;

    const index = listeners.findIndex(info => info.listener === listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      if (this.enableMetrics) {
        this.metrics.listenersRemoved++;
      }
    }

    if (listeners.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit event synchronously (default for backward compatibility)
   * Supports both old style (event, ...args) and new style (event, payload)
   */
  emit<T extends EventName = string>(
    event: T,
    ...args: T extends keyof EventPayloads 
      ? [payload?: EventPayloads[T]]
      : any[]
  ): void {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) return;

    if (this.enableMetrics) {
      this.metrics.eventsEmitted++;
    }

    const listenersCopy = [...listeners];
    
    for (const listenerInfo of listenersCopy) {
      try {
        // Handle both single payload and multiple args for backward compatibility
        if (args.length <= 1) {
          listenerInfo.listener(args[0]);
        } else {
          listenerInfo.listener(...args);
        }
        
        if (listenerInfo.once) {
          this.off(event, listenerInfo.listener);
        }
      } catch (error) {
        if (this.enableMetrics) {
          this.metrics.errors++;
        }

        logger.error(`Error in event listener for ${event}:`, error);
        
        if (event !== 'error') {
          this.emit('error', {
            event: event as string,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    }
  }

  /**
   * Emit event asynchronously (new method for async operations)
   */
  async emitAsync<T extends EventName = string>(
    event: T,
    ...args: T extends keyof EventPayloads 
      ? [payload?: EventPayloads[T]]
      : any[]
  ): Promise<void> {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) return;

    if (this.enableMetrics) {
      this.metrics.eventsEmitted++;
    }

    const listenersCopy = [...listeners];
    
    for (const listenerInfo of listenersCopy) {
      try {
        // Handle both single payload and multiple args
        const result = args.length <= 1 
          ? listenerInfo.listener(args[0])
          : listenerInfo.listener(...args);
          
        await Promise.resolve(result);
        
        if (listenerInfo.once) {
          this.off(event, listenerInfo.listener);
        }
      } catch (error) {
        if (this.enableMetrics) {
          this.metrics.errors++;
        }

        logger.error(`Error in event listener for ${event}:`, error);
        
        if (event !== 'error') {
          this.emit('error', {
            event: event as string,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    }
  }

  /**
   * Remove all listeners for an event or all events
   */
  removeAllListeners(event?: EventName): void {
    if (event) {
      const listeners = this.events.get(event);
      if (listeners && this.enableMetrics) {
        this.metrics.listenersRemoved += listeners.length;
      }
      this.events.delete(event);
    } else {
      if (this.enableMetrics) {
        for (const listeners of this.events.values()) {
          this.metrics.listenersRemoved += listeners.length;
        }
      }
      this.events.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: EventName): number {
    const listeners = this.events.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * Set maximum listeners
   */
  setMaxListeners(n: number): void {
    this.maxListeners = n;
  }

  /**
   * Get all event names (for debugging)
   */
  eventNames(): EventName[] {
    return Array.from(this.events.keys());
  }

  /**
   * Get metrics (if enabled)
   */
  getMetrics() {
    if (!this.enableMetrics) {
      return null;
    }
    
    return {
      ...this.metrics,
      activeListeners: Array.from(this.events.values()).reduce(
        (sum, listeners) => sum + listeners.length,
        0
      ),
      eventTypes: this.events.size,
      listenersByEvent: Array.from(this.events.entries()).map(([event, listeners]) => ({
        event,
        count: listeners.length,
      })),
    };
  }

  /**
   * Get debug info for development
   */
  getDebugInfo() {
    if (!__DEV__) {
      return null;
    }

    const info: Record<string, any> = {};
    
    for (const [event, listeners] of this.events.entries()) {
      info[event] = {
        count: listeners.length,
        listeners: listeners.map(l => ({
          once: l.once,
          addedAt: l.addedAt.toISOString(),
          age: Date.now() - l.addedAt.getTime(),
        })),
      };
    }
    
    return info;
  }

  /**
   * Check for potential memory leaks
   */
  checkForLeaks(): { hasLeaks: boolean; details: any[] } {
    const suspiciousEvents: any[] = [];
    const now = Date.now();
    
    for (const [event, listeners] of this.events.entries()) {
      // Check for too many listeners
      if (listeners.length > this.maxListeners) {
        suspiciousEvents.push({
          event,
          issue: 'too_many_listeners',
          count: listeners.length,
          limit: this.maxListeners,
        });
      }
      
      // Check for old listeners (> 1 hour)
      const oldListeners = listeners.filter(l => 
        now - l.addedAt.getTime() > 3600000
      );
      
      if (oldListeners.length > 0) {
        suspiciousEvents.push({
          event,
          issue: 'old_listeners',
          count: oldListeners.length,
          oldest: new Date(Math.min(...oldListeners.map(l => l.addedAt.getTime()))),
        });
      }
    }
    
    return {
      hasLeaks: suspiciousEvents.length > 0,
      details: suspiciousEvents,
    };
  }
}

// Export singleton instance with production settings
export const eventEmitter = new TypedEventEmitter({
  maxListeners: 20, // Reasonable limit for mobile app
  warnOnMaxListeners: true,
  enableMetrics: __DEV__, // Only in development
});

// Export common app events for backward compatibility
export const AppEvents = {
  // Authentication events
  AUTH_LOGOUT: 'auth:logout' as const,
  AUTH_LOGOUT_COMPLETE: 'auth:logout_complete' as const,
  AUTH_LOGIN: 'auth:login' as const,
  TOKEN_REFRESHED: 'auth:token_refreshed' as const,

  // User events
  USER_DATA_CHANGED: 'user:data_changed' as const,
  USER_ROLE_CHANGED: 'user:role_changed' as const,

  // Socket events
  SOCKET_CONNECTED: 'socket:connected' as const,
  SOCKET_DISCONNECTED: 'socket:disconnected' as const,

  // Chat events
  CHAT_MESSAGE_RECEIVED: 'chat:message_received' as const,
  CHAT_USER_TYPING: 'chat:user_typing' as const,
  CHAT_USER_STOPPED_TYPING: 'chat:user_stopped_typing' as const,
  CHAT_MESSAGES_READ: 'chat:messages_read' as const,
  CHAT_CONVERSATION_UPDATED: 'chat:conversation_updated' as const,

  // Notification events
  NOTIFICATION_RECEIVED: 'notification:received' as const,
  NOTIFICATION_READ: 'notification:read' as const,

  // Circuit breaker events
  CIRCUIT_BREAKER_OPENED: 'circuit_breaker:opened' as const,
  CIRCUIT_BREAKER_CLOSED: 'circuit_breaker:closed' as const,
  CIRCUIT_BREAKER_HALF_OPEN: 'circuit_breaker:half_open' as const,
  CIRCUIT_BREAKER_ALERT: 'circuit_breaker:alert' as const,
};

// Type helper for event names
export type AppEventName = typeof AppEvents[keyof typeof AppEvents];

// Development helper to monitor event emitter health
if (__DEV__) {
  // Check for memory leaks every 5 minutes in development
  setInterval(() => {
    const leakCheck = eventEmitter.checkForLeaks();
    if (leakCheck.hasLeaks) {
      logger.warn('[EventEmitter] Potential memory leaks detected:', leakCheck.details);
    }
  }, 300000);
}
