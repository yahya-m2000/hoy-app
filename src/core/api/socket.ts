/**
 * Socket Client
 * 
 * Real-time communication client for:
 * - Chat messaging
 * - Push notifications
 * - Live updates
 * - Connection management
 * 
 * @module @core/api/socket
 */

import { io, Socket } from "socket.io-client";

import { API_CONFIG } from "../config/api.config";
import { getTokenFromStorage } from "../auth/storage";
import { logger } from "../utils/sys/log/logger";

// ========================================
// TYPES AND INTERFACES
// ========================================

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string | Date;
  type?: "text" | "image" | "system";
}

interface PushNotification {
  id: string;
  title: string;
  body: string;
  senderId: string;
  recipientId: string;
  type: string;
  data?: Record<string, any>;
  createdAt: string | Date;
}

type SocketEventHandler<T = any> = (data: T) => void;

// ========================================
// SOCKET INSTANCE
// ========================================

let socket: Socket | null = null;

// ========================================
// VALIDATION UTILITIES
// ========================================

/**
 * Check if date is valid
 */
function isValidDate(date: any): boolean {
  if (!date) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * Construct socket URL from API URL
 */
function constructSocketUrl(): string {
  try {
    const apiUrl = API_CONFIG.baseURL;
    
    if (!apiUrl) {
      throw new Error("API base URL not configured");
    }
    
    // Remove /api/v1 suffix and any trailing slashes
    const cleanUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
    
    logger.network("Socket URL constructed", { url: cleanUrl }, {
      module: "SocketClient"
    });
    
    return cleanUrl;
  } catch (error) {
    logger.error("Error constructing socket URL", error, {
      module: "SocketClient"
    });
    throw new Error("Failed to construct socket URL. Ensure API_BASE_URL is configured.");
  }
}

// ========================================
// MESSAGE VALIDATION
// ========================================

/**
 * Validate chat message format
 */
function validateChatMessage(message: any): message is ChatMessage {
  if (!message || typeof message !== "object") {
    logger.warn("Received invalid message format", message, {
      module: "SocketClient"
    });
    return false;
  }

  if (!message.senderId || typeof message.senderId !== "string") {
    logger.warn("Message has invalid senderId", { senderId: message.senderId }, {
      module: "SocketClient"
    });
    return false;
  }

  if (!message.recipientId || typeof message.recipientId !== "string") {
    logger.warn("Message has invalid recipientId", { recipientId: message.recipientId }, {
      module: "SocketClient"
    });
    return false;
  }

  if (!message.createdAt || !isValidDate(message.createdAt)) {
    logger.warn("Message has invalid createdAt date", { createdAt: message.createdAt }, {
      module: "SocketClient"
    });
    return false;
  }

  return true;
}

/**
 * Validate push notification format
 */
function validatePushNotification(notification: any): notification is PushNotification {
  if (!notification || typeof notification !== "object") {
    logger.warn("Received invalid notification format", notification, {
      module: "SocketClient"
    });
    return false;
  }

  if (!notification.senderId || typeof notification.senderId !== "string") {
    logger.warn("Notification has invalid senderId", { senderId: notification.senderId }, {
      module: "SocketClient"
    });
    return false;
  }

  if (!notification.recipientId || typeof notification.recipientId !== "string") {
    logger.warn("Notification has invalid recipientId", { recipientId: notification.recipientId }, {
      module: "SocketClient"
    });
    return false;
  }

  if (!notification.createdAt || !isValidDate(notification.createdAt)) {
    logger.warn("Notification has invalid createdAt date", { createdAt: notification.createdAt }, {
      module: "SocketClient"
    });
    return false;
  }

  return true;
}

// ========================================
// CONNECTION MANAGEMENT
// ========================================

/**
 * Initialize socket connection
 */
export const initializeSocket = async (): Promise<void> => {
  try {
    // Get authentication token
    const accessToken = await getTokenFromStorage();
    if (!accessToken) {
      logger.debug("No access token found, skipping socket connection", undefined, {
        module: "SocketClient"
      });
      return;
    }

    // Close existing connection if any
    if (socket?.connected) {
      logger.debug("Closing existing socket connection", undefined, {
        module: "SocketClient"
      });
      socket.disconnect();
    }

    // Get socket URL
    const socketUrl = constructSocketUrl();

    logger.debug("Connecting to socket server", { url: socketUrl }, {
      module: "SocketClient"
    });

    // Create new socket connection
    socket = io(socketUrl, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event handlers
    setupSocketEventHandlers();
  } catch (error) {
    logger.error("Error initializing socket", error, {
      module: "SocketClient"
    });
  }
};

/**
 * Set up socket event handlers
 */
function setupSocketEventHandlers(): void {
  if (!socket) return;

  // Connection events
  socket.on("connect", () => {
    logger.debug("Socket connected", undefined, {
      module: "SocketClient"
    });
  });

  socket.on("connect_error", (error: Error) => {
    logger.error("Socket connection error", error, {
      module: "SocketClient"
    });
  });

  socket.on("disconnect", (reason: string) => {
    logger.debug("Socket disconnected", { reason }, {
      module: "SocketClient"
    });
  });

  // Message events
  socket.on("message", (message: any) => {
    try {
      logger.debug("Message received", undefined, {
        module: "SocketClient"
      });

      if (validateChatMessage(message)) {
        // Handle valid message
        handleChatMessage(message);
      }
    } catch (error) {
      logger.error("Error processing socket message", error, {
        module: "SocketClient"
      });
    }
  });

  // Notification events
  socket.on("notification", (notification: any) => {
    try {
      logger.debug("Notification received", undefined, {
        module: "SocketClient"
      });

      if (validatePushNotification(notification)) {
        // Handle valid notification
        handlePushNotification(notification);
      }
    } catch (error) {
      logger.error("Error processing socket notification", error, {
        module: "SocketClient"
      });
    }
  });
}

// ========================================
// EVENT HANDLERS
// ========================================

let messageHandler: SocketEventHandler<ChatMessage> | null = null;
let notificationHandler: SocketEventHandler<PushNotification> | null = null;

/**
 * Handle incoming chat message
 */
function handleChatMessage(message: ChatMessage): void {
  if (messageHandler) {
    messageHandler(message);
  }
}

/**
 * Handle incoming push notification
 */
function handlePushNotification(notification: PushNotification): void {
  if (notificationHandler) {
    notificationHandler(notification);
  }
}

/**
 * Set message event handler
 */
export const setMessageHandler = (handler: SocketEventHandler<ChatMessage>): void => {
  messageHandler = handler;
};

/**
 * Set notification event handler
 */
export const setNotificationHandler = (handler: SocketEventHandler<PushNotification>): void => {
  notificationHandler = handler;
};

// ========================================
// CONNECTION UTILITIES
// ========================================

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    logger.debug("Closing socket connection", undefined, {
      module: "SocketClient"
    });
    socket.disconnect();
    socket = null;
  }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

/**
 * Reconnect socket if needed
 */
export const reconnectSocket = async (): Promise<void> => {
  if (!socket?.connected) {
    logger.debug("Socket not connected, attempting to reconnect", undefined, {
      module: "SocketClient"
    });
    
    try {
      await initializeSocket();
      logger.debug("Socket reconnection successful", undefined, {
        module: "SocketClient"
      });
    } catch (error) {
      logger.warn("Socket reconnection failed", error, {
        module: "SocketClient"
      });
    }
  }
};

// ========================================
// MESSAGE SENDING
// ========================================

/**
 * Send chat message
 */
export const sendMessage = (message: Omit<ChatMessage, "id" | "createdAt">): void => {
  if (!socket?.connected) {
    logger.warn("Socket not connected, message not sent", undefined, {
      module: "SocketClient"
    });
    return;
  }

  socket.emit("message", {
    ...message,
    createdAt: new Date().toISOString(),
  });
};

/**
 * Send push notification
 */
export const sendNotification = (notification: Omit<PushNotification, "id" | "createdAt">): void => {
  if (!socket?.connected) {
    logger.warn("Socket not connected, notification not sent", undefined, {
      module: "SocketClient"
    });
    return;
  }

  socket.emit("notification", {
    ...notification,
    createdAt: new Date().toISOString(),
  });
};

// ========================================
// TYPING INDICATORS
// ========================================

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (recipientId: string): void => {
  if (!socket?.connected) {
    logger.warn("Socket not connected, typing indicator not sent", undefined, {
      module: "SocketClient"
    });
    return;
  }

  socket.emit("typing", { recipientId });
};

/**
 * Send stop typing indicator
 */
export const sendStopTypingIndicator = (recipientId: string): void => {
  if (!socket?.connected) {
    logger.warn("Socket not connected, stop typing indicator not sent", undefined, {
      module: "SocketClient"
    });
    return;
  }

  socket.emit("stopTyping", { recipientId });
};
