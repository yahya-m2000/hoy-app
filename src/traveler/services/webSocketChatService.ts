// /**
//  * WebSocket Chat Service
//  *
//  * Provides real-time communication with the chat server using WebSockets.
//  * Falls back to HTTP polling if WebSockets are not available.
//  */
// import { useEffect, useRef, useState } from "react";
// import Constants from "expo-constants";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { ChatMessage, ChatConversation } from "@common/types/chat";
// import * as safeLogger from "@common/utils/log/safeLogger";
// import * as chatService from "./chatService";

// // WebSocket connection status
// export enum ConnectionStatus {
//   CONNECTING = "connecting",
//   CONNECTED = "connected",
//   DISCONNECTED = "disconnected",
//   RECONNECTING = "reconnecting",
//   ERROR = "error",
// }

// // Event types for WebSocket messages
// export enum WebSocketEventType {
//   NEW_MESSAGE = "new_message",
//   MESSAGE_READ = "message_read",
//   TYPING = "typing",
//   STOP_TYPING = "stop_typing",
//   USER_ONLINE = "user_online",
//   USER_OFFLINE = "user_offline",
// }

// // WebSocket message interface
// interface WebSocketMessage {
//   type: WebSocketEventType;
//   payload: any;
// }

// // Global WebSocket instance and state
// let socket: WebSocket | null = null;
// let connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
// const messageListeners: ((message: WebSocketMessage) => void)[] = [];
// const statusListeners: ((status: ConnectionStatus) => void)[] = [];
// let reconnectAttempts = 0;
// const MAX_RECONNECT_ATTEMPTS = 5;
// const RECONNECT_DELAY = 2000; // Start with 2 seconds
// let reconnectTimer: NodeJS.Timeout | null = null;

// /**
//  * Initialize the WebSocket connection
//  */
// export const initializeWebSocket = async (): Promise<boolean> => {
//   try {
//     if (
//       socket &&
//       (socket.readyState === WebSocket.OPEN ||
//         socket.readyState === WebSocket.CONNECTING)
//     ) {
//       safeLogger.info("WebSocket already connected or connecting");
//       return true;
//     }

//     updateConnectionStatus(ConnectionStatus.CONNECTING);

//     // Get authentication token
//     const token = await AsyncStorage.getItem("accessToken");
//     if (!token) {
//       safeLogger.error(
//         "WebSocket initialization failed: No auth token available"
//       );
//       updateConnectionStatus(ConnectionStatus.ERROR);
//       return false;
//     }

//     // Get WebSocket URL from config or environment
//     let wsUrl =
//       Constants.expoConfig?.extra?.wsUrl ||
//       process.env.EXPO_PUBLIC_WS_URL ||
//       "ws://localhost:3000/ws";

//     // Ensure ws:// protocol
//     if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
//       wsUrl = "ws://" + wsUrl;
//     }

//     // Remove trailing slash for consistency
//     if (wsUrl.endsWith("/")) {
//       wsUrl = wsUrl.slice(0, -1);
//     }

//     // Add auth token as query parameter
//     const wsUrlWithAuth = `${wsUrl}?token=${token}`;
//     safeLogger.info(`Connecting to WebSocket at: ${wsUrl}`);

//     // Create new WebSocket connection
//     socket = new WebSocket(wsUrlWithAuth);

//     // Set up event handlers
//     socket.onopen = handleSocketOpen;
//     socket.onmessage = handleSocketMessage;
//     socket.onclose = handleSocketClose;
//     socket.onerror = handleSocketError;

//     return true;
//   } catch (error) {
//     safeLogger.error("Failed to initialize WebSocket:", error);
//     updateConnectionStatus(ConnectionStatus.ERROR);
//     return false;
//   }
// };

// /**
//  * Handle WebSocket open event
//  */
// const handleSocketOpen = () => {
//   safeLogger.info("WebSocket connection established");
//   updateConnectionStatus(ConnectionStatus.CONNECTED);
//   reconnectAttempts = 0; // Reset reconnect attempts on successful connection
// };

// /**
//  * Handle WebSocket message event
//  */
// const handleSocketMessage = (event: WebSocketMessageEvent) => {
//   try {
//     const data = JSON.parse(event.data) as WebSocketMessage;
//     safeLogger.debug("WebSocket message received:", data);

//     // Notify all listeners
//     messageListeners.forEach((listener) => listener(data));
//   } catch (error) {
//     safeLogger.error("Error processing WebSocket message:", error);
//   }
// };

// /**
//  * Handle WebSocket close event
//  */
// const handleSocketClose = (event: WebSocketCloseEvent) => {
//   safeLogger.warn(
//     `WebSocket connection closed: Code ${event.code}, Reason: ${event.reason}`
//   );
//   updateConnectionStatus(ConnectionStatus.DISCONNECTED);

//   // Attempt to reconnect if not closed cleanly
//   if (event.code !== 1000) {
//     attemptReconnect();
//   }
// };

// /**
//  * Handle WebSocket error event
//  */
// const handleSocketError = (error: WebSocketErrorEvent) => {
//   safeLogger.error("WebSocket error:", error);
//   updateConnectionStatus(ConnectionStatus.ERROR);

//   // Attempt to reconnect after error
//   attemptReconnect();
// };

// /**
//  * Attempt to reconnect with exponential backoff
//  */
// const attemptReconnect = () => {
//   if (reconnectTimer) {
//     clearTimeout(reconnectTimer);
//   }

//   if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
//     safeLogger.error(
//       `Maximum reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached`
//     );
//     return;
//   }

//   reconnectAttempts++;
//   const delay = RECONNECT_DELAY * Math.pow(1.5, reconnectAttempts - 1);

//   safeLogger.info(
//     `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
//   );
//   updateConnectionStatus(ConnectionStatus.RECONNECTING);

//   reconnectTimer = setTimeout(() => {
//     initializeWebSocket();
//   }, delay);
// };

// /**
//  * Update connection status and notify listeners
//  */
// const updateConnectionStatus = (status: ConnectionStatus) => {
//   connectionStatus = status;
//   statusListeners.forEach((listener) => listener(status));
// };

// /**
//  * Send a message through the WebSocket
//  */
// export const sendMessage = (
//   type: WebSocketEventType,
//   payload: any
// ): boolean => {
//   if (!socket || socket.readyState !== WebSocket.OPEN) {
//     safeLogger.warn("Cannot send message: WebSocket not connected");
//     return false;
//   }

//   try {
//     const message: WebSocketMessage = { type, payload };
//     socket.send(JSON.stringify(message));
//     return true;
//   } catch (error) {
//     safeLogger.error("Error sending WebSocket message:", error);
//     return false;
//   }
// };

// /**
//  * Add a message listener
//  */
// export const addMessageListener = (
//   listener: (message: WebSocketMessage) => void
// ): (() => void) => {
//   messageListeners.push(listener);
//   return () => {
//     const index = messageListeners.indexOf(listener);
//     if (index !== -1) {
//       messageListeners.splice(index, 1);
//     }
//   };
// };

// /**
//  * Add a connection status listener
//  */
// export const addStatusListener = (
//   listener: (status: ConnectionStatus) => void
// ): (() => void) => {
//   statusListeners.push(listener);
//   return () => {
//     const index = statusListeners.indexOf(listener);
//     if (index !== -1) {
//       statusListeners.splice(index, 1);
//     }
//   };
// };

// /**
//  * Close the WebSocket connection
//  */
// export const closeConnection = () => {
//   if (socket) {
//     socket.close(1000, "User closed connection");
//     socket = null;
//   }

//   if (reconnectTimer) {
//     clearTimeout(reconnectTimer);
//     reconnectTimer = null;
//   }

//   updateConnectionStatus(ConnectionStatus.DISCONNECTED);
// };

// /**
//  * Get current connection status
//  */
// export const getConnectionStatus = (): ConnectionStatus => {
//   return connectionStatus;
// };

// /**
//  * Hook for using the WebSocket connection
//  */
// export const useWebSocketConnection = () => {
//   const [status, setStatus] = useState<ConnectionStatus>(connectionStatus);

//   useEffect(() => {
//     // Initialize WebSocket when component mounts
//     initializeWebSocket();

//     // Add status listener
//     const removeListener = addStatusListener(setStatus);

//     // Clean up on unmount
//     return () => {
//       removeListener();
//     };
//   }, []);

//   return {
//     status,
//     isConnected: status === ConnectionStatus.CONNECTED,
//     connect: initializeWebSocket,
//     disconnect: closeConnection,
//   };
// };

// /**
//  * Send a chat message using WebSocket if available, fallback to HTTP
//  */
// export const sendChatMessage = async (
//   conversationId: string,
//   content: string
// ): Promise<ChatMessage | null> => {
//   // Try WebSocket first
//   if (socket && socket.readyState === WebSocket.OPEN) {
//     const messageSent = sendMessage(WebSocketEventType.NEW_MESSAGE, {
//       conversationId,
//       content,
//     });

//     if (messageSent) {
//       // Return a temporary message object. The real one will come via WebSocket
//       return {
//         id: "temp-" + Date.now(),
//         conversationId,
//         content,
//         senderId: (await AsyncStorage.getItem("currentUserId")) || "unknown",
//         timestamp: new Date().toISOString(),
//         status: "sending",
//         isRead: false,
//       };
//     }
//   }

//   // Fallback to HTTP API
//   safeLogger.info(
//     "WebSocket unavailable, falling back to HTTP API for message send"
//   );
//   return chatService.sendMessage(conversationId, content);
// };

// /**
//  * Send typing indicator
//  */
// export const sendTypingIndicator = (conversationId: string): boolean => {
//   return sendMessage(WebSocketEventType.TYPING, { conversationId });
// };

// /**
//  * Send stop typing indicator
//  */
// export const sendStopTypingIndicator = (conversationId: string): boolean => {
//   return sendMessage(WebSocketEventType.STOP_TYPING, { conversationId });
// };

// /**
//  * Mark message as read using WebSocket if available, fallback to HTTP
//  */
// export const markMessageAsRead = async (
//   messageId: string
// ): Promise<boolean> => {
//   // Try WebSocket first
//   if (socket && socket.readyState === WebSocket.OPEN) {
//     return sendMessage(WebSocketEventType.MESSAGE_READ, { messageId });
//   }

//   // Fallback to HTTP API
//   safeLogger.info(
//     "WebSocket unavailable, falling back to HTTP API for marking message as read"
//   );
//   try {
//     await chatService.markMessageAsRead(messageId);
//     return true;
//   } catch (error) {
//     safeLogger.error("Error marking message as read:", error);
//     return false;
//   }
// };

// /**
//  * Hook for listening to typing indicators
//  */
// export const useTypingIndicators = (conversationId: string) => {
//   const [typingUsers, setTypingUsers] = useState<string[]>([]);
//   const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

//   useEffect(() => {
//     const handleMessage = (message: WebSocketMessage) => {
//       if (
//         message.type === WebSocketEventType.TYPING &&
//         message.payload.conversationId === conversationId
//       ) {
//         setTypingUsers((prev) => {
//           if (!prev.includes(message.payload.userId)) {
//             return [...prev, message.payload.userId];
//           }
//           return prev;
//         });

//         // Clear existing timeout for this user if any
//         if (typingTimeoutsRef.current[message.payload.userId]) {
//           clearTimeout(typingTimeoutsRef.current[message.payload.userId]);
//         }

//         // Set timeout to remove typing indicator after 5 seconds
//         typingTimeoutsRef.current[message.payload.userId] = setTimeout(() => {
//           setTypingUsers((prev) =>
//             prev.filter((id) => id !== message.payload.userId)
//           );
//         }, 5000);
//       }

//       if (
//         message.type === WebSocketEventType.STOP_TYPING &&
//         message.payload.conversationId === conversationId
//       ) {
//         setTypingUsers((prev) =>
//           prev.filter((id) => id !== message.payload.userId)
//         );

//         // Clear timeout for this user
//         if (typingTimeoutsRef.current[message.payload.userId]) {
//           clearTimeout(typingTimeoutsRef.current[message.payload.userId]);
//           delete typingTimeoutsRef.current[message.payload.userId];
//         }
//       }
//     };

//     const removeListener = addMessageListener(handleMessage);

//     return () => {
//       removeListener();

//       // Clear all timeouts
//       Object.values(typingTimeoutsRef.current).forEach((timeout) => {
//         clearTimeout(timeout);
//       });
//       typingTimeoutsRef.current = {};
//     };
//   }, [conversationId]);

//   return typingUsers;
// };
