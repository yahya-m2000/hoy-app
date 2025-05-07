import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { eventEmitter, AppEvents } from "../utils/eventEmitter";
import { isValidDate } from "../utils/dateUtils";
import { isValidObjectId } from "../utils/mongoUtils";

// Define new app events for socket communication
export const SocketEvents = {
  CONNECTED: "socket:connected",
  DISCONNECTED: "socket:disconnected",
  MESSAGE_RECEIVED: "socket:message_received",
  NOTIFICATION_RECEIVED: "socket:notification_received",
  USER_TYPING: "socket:user_typing",
  USER_STOPPED_TYPING: "socket:user_stopped_typing",
  MESSAGE_READ: "socket:message_read",
  ALL_MESSAGES_READ: "socket:all_messages_read",
  NOTIFICATION_READ: "socket:notification_read",
  ALL_NOTIFICATIONS_READ: "socket:all_notifications_read",
};

// Socket.io client instance
let socket: Socket | null = null;

// Base URL for Socket.io server
const getSocketUrl = (): string => {
  try {
    const apiUrl =
      Constants.expoConfig?.extra?.apiUrl ||
      process.env.EXPO_PUBLIC_API_URL ||
      "http://localhost:3000/api/v1/";

    // Extract the base URL (without the /api/v1/)
    // Example: "https://6ed0-109-147-151-140.ngrok-free.app/api/v1/" -> "https://6ed0-109-147-151-140.ngrok-free.app"
    const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "");

    // Ensure we have a clean URL without trailing slashes
    const cleanUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    console.log(`Socket URL constructed: ${cleanUrl}`);
    return cleanUrl;
  } catch (error) {
    console.error("Error constructing socket URL:", error);
    // Fallback to default
    return "http://localhost:3000";
  }
};

/**
 * Initialize the Socket.io connection
 */
export const initializeSocket = async (): Promise<Socket | null> => {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    if (!token) {
      console.log("No access token found, skipping socket connection");
      return null;
    }

    // Close existing socket if already connected
    if (socket?.connected) {
      console.log("Closing existing socket connection");
      socket.close();
    }

    const socketUrl = getSocketUrl();
    console.log("Connecting to socket server:", socketUrl);

    // Create new socket connection with authentication
    socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10, // Increased reconnection attempts
      reconnectionDelay: 2000, // More delay between reconnection attempts
      timeout: 10000, // Longer connection timeout
    });

    // Set up event listeners
    socket.on("connect", () => {
      console.log("Socket connected");
      eventEmitter.emit(SocketEvents.CONNECTED);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      // Don't emit disconnected here as it might trigger too many reconnect attempts
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      eventEmitter.emit(SocketEvents.DISCONNECTED, reason);
    });
    socket.on("receive_message", (message) => {
      try {
        console.log("Message received:", message);

        // Basic validation
        if (!message || typeof message !== "object") {
          console.warn("Received invalid message format:", message);
          return;
        }

        // Validate ObjectIds
        if (message.senderId && !isValidObjectId(message.senderId)) {
          console.warn("Message has invalid senderId:", message.senderId);
          return;
        }

        if (message.recipientId && !isValidObjectId(message.recipientId)) {
          console.warn("Message has invalid recipientId:", message.recipientId);
          return;
        }

        // Validate and fix date fields
        if (message.createdAt) {
          if (!isValidDate(message.createdAt)) {
            console.warn(
              "Message has invalid createdAt date:",
              message.createdAt
            );
            // Replace invalid date with current date to prevent UI errors
            message.createdAt = new Date().toISOString();
          }
        } else {
          // If no date provided, add one
          message.createdAt = new Date().toISOString();
        }

        // Emit the validated and fixed message
        eventEmitter.emit(SocketEvents.MESSAGE_RECEIVED, message);
      } catch (error) {
        console.error("Error processing socket message:", error);
      }
    });

    socket.on("receive_notification", (notification) => {
      try {
        console.log("Notification received:", notification);

        // Basic validation
        if (!notification || typeof notification !== "object") {
          console.warn("Received invalid notification format:", notification);
          return;
        }

        // Validate ObjectIds
        if (notification.senderId && !isValidObjectId(notification.senderId)) {
          console.warn(
            "Notification has invalid senderId:",
            notification.senderId
          );
          return;
        }

        if (
          notification.recipientId &&
          !isValidObjectId(notification.recipientId)
        ) {
          console.warn(
            "Notification has invalid recipientId:",
            notification.recipientId
          );
          return;
        }

        // Validate and fix date fields
        if (notification.createdAt) {
          if (!isValidDate(notification.createdAt)) {
            console.warn(
              "Notification has invalid createdAt date:",
              notification.createdAt
            );
            // Replace invalid date with current date to prevent UI errors
            notification.createdAt = new Date().toISOString();
          }
        } else {
          // If no date provided, add one
          notification.createdAt = new Date().toISOString();
        }

        // Emit the validated and fixed notification
        eventEmitter.emit(SocketEvents.NOTIFICATION_RECEIVED, notification);
      } catch (error) {
        console.error("Error processing socket notification:", error);
      }
    });

    socket.on("typing", (data) => {
      eventEmitter.emit(SocketEvents.USER_TYPING, data);
    });

    socket.on("stop_typing", (data) => {
      eventEmitter.emit(SocketEvents.USER_STOPPED_TYPING, data);
    });

    socket.on("message_read", (data) => {
      eventEmitter.emit(SocketEvents.MESSAGE_READ, data);
    });

    socket.on("all_messages_read", () => {
      eventEmitter.emit(SocketEvents.ALL_MESSAGES_READ);
    });

    socket.on("notification_read", (data) => {
      eventEmitter.emit(SocketEvents.NOTIFICATION_READ, data);
    });

    socket.on("all_notifications_read", () => {
      eventEmitter.emit(SocketEvents.ALL_NOTIFICATIONS_READ);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return socket;
  } catch (error) {
    console.error("Error initializing socket:", error);
    return null;
  }
};

/**
 * Get the socket instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Close the socket connection
 */
export const closeSocket = (): void => {
  if (socket) {
    console.log("Closing socket connection");
    socket.close();
    socket = null;
  }
};

/**
 * Check socket connection and attempt to reconnect if needed
 * Returns true if socket was already connected or successfully reconnected
 */
export const ensureSocketConnection = async (): Promise<boolean> => {
  // If already connected, return true
  if (socket?.connected) {
    return true;
  }

  console.log("Socket not connected, attempting to reconnect...");

  // Try to initialize socket
  const newSocket = await initializeSocket();

  if (newSocket?.connected) {
    console.log("Socket reconnection successful");
    return true;
  } else {
    console.warn("Socket reconnection failed");
    return false;
  }
};

/**
 * Send a message via socket
 */
export const sendMessage = async (
  recipientId: string,
  message: any
): Promise<boolean> => {
  // Ensure socket is connected
  const isConnected = await ensureSocketConnection();

  if (isConnected && socket?.connected) {
    socket.emit("send_message", { recipientId, message });
    return true;
  } else {
    console.warn("Socket not connected, message not sent");
    return false;
  }
};

/**
 * Send a notification via socket
 */
export const sendNotification = async (
  recipientId: string,
  notification: any
): Promise<boolean> => {
  // Ensure socket is connected
  const isConnected = await ensureSocketConnection();

  if (isConnected && socket?.connected) {
    socket.emit("send_notification", { recipientId, notification });
    return true;
  } else {
    console.warn("Socket not connected, notification not sent");
    return false;
  }
};

/**
 * Send typing indicator
 */
export const sendTypingIndicator = async (
  recipientId: string
): Promise<boolean> => {
  // Ensure socket is connected
  const isConnected = await ensureSocketConnection();

  if (isConnected && socket?.connected) {
    socket.emit("typing", { recipientId });
    return true;
  } else {
    console.warn("Socket not connected, typing indicator not sent");
    return false;
  }
};

/**
 * Send stop typing indicator
 */
export const sendStopTypingIndicator = async (
  recipientId: string
): Promise<boolean> => {
  // Ensure socket is connected
  const isConnected = await ensureSocketConnection();

  if (isConnected && socket?.connected) {
    socket.emit("stop_typing", { recipientId });
    return true;
  } else {
    console.warn("Socket not connected, stop typing indicator not sent");
    return false;
  }
};

// Listen for login/logout events to connect/disconnect socket
eventEmitter.on(AppEvents.AUTH_LOGIN, () => {
  initializeSocket();
});

eventEmitter.on(AppEvents.AUTH_LOGOUT, () => {
  closeSocket();
});

// Initialize socket connection if we already have a token
initializeSocket();
