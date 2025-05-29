// /**
//  * Chat socket service to handle real-time communication
//  */
// import { io, Socket } from "socket.io-client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { ChatMessage, ChatSocketEvent, TypingEvent } from "@common//types/chat";
// import { eventEmitter, AppEvents } from "@common/utils/eventEmitter";

// // Socket instance
// let socket: Socket | null = null;

// // Track socket connection state
// let isConnected = false;
// let isConnecting = false;
// let reconnectAttempts = 0;
// const MAX_RECONNECT_ATTEMPTS = 5;

// /**
//  * Get socket server URL from config
//  */
// const getSocketUrl = (): string => {
//   try {
//     const apiUrl =
//       Constants.expoConfig?.extra?.apiUrl ||
//       process.env.EXPO_PUBLIC_API_URL ||
//       "http://localhost:3000/api/v1/";
//     // Extract the base URL (without the /api/v1/)
//     const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
//     // Ensure we have a clean URL without trailing slashes
//     const cleanUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

//     console.log(`Socket URL constructed: ${cleanUrl}`);
//     return cleanUrl;
//   } catch (error) {
//     console.error("Error constructing socket URL:", error);
//     // Fallback to default
//     return "http://localhost:3000";
//   }
// };

// /**
//  * Initialize socket connection
//  */
// export const initializeSocket = async (): Promise<Socket | null> => {
//   // Prevent multiple connection attempts
//   if (isConnecting) {
//     console.log("Socket connection attempt already in progress");
//     return null;
//   }

//   isConnecting = true;

//   try {
//     // Get authentication token
//     const token = await AsyncStorage.getItem("accessToken");

//     if (!token) {
//       console.log("No access token found, skipping socket connection");
//       isConnecting = false;
//       return null;
//     }

//     // Close existing socket if already connected
//     if (socket?.connected) {
//       console.log("Closing existing socket connection");
//       socket.close();
//       isConnected = false;
//     }

//     const socketUrl = getSocketUrl();
//     console.log("Connecting to socket server:", socketUrl);

//     // Create socket connection with auth token in both auth and query params
//     socket = io(socketUrl, {
//       auth: { token },
//       query: { token }, // Also include token in query params for servers that check there
//       transports: ["websocket"],
//       reconnection: true,
//       reconnectionAttempts: 10,
//       reconnectionDelay: 2000,
//       timeout: 10000,
//     });

//     // Set up event listeners
//     socket.on("connect", () => {
//       console.log("Socket connected");
//       isConnected = true;
//       reconnectAttempts = 0;
//       eventEmitter.emit(AppEvents.SOCKET_CONNECTED);
//     });

//     socket.on("disconnect", (reason) => {
//       console.log(`Socket disconnected: ${reason}`);
//       isConnected = false;
//       eventEmitter.emit(AppEvents.SOCKET_DISCONNECTED, reason);
//     });

//     socket.on("connect_error", (error) => {
//       console.error("Socket connection error:", error.message);
//       isConnected = false;
//     });

//     // Handle chat events
//     socket.on(ChatSocketEvent.NEW_MESSAGE, (message: ChatMessage) => {
//       eventEmitter.emit(AppEvents.CHAT_MESSAGE_RECEIVED, message);
//     });

//     socket.on(ChatSocketEvent.TYPING, (event: TypingEvent) => {
//       eventEmitter.emit(AppEvents.CHAT_USER_TYPING, event);
//     });

//     socket.on(ChatSocketEvent.STOP_TYPING, (event: TypingEvent) => {
//       eventEmitter.emit(AppEvents.CHAT_USER_STOPPED_TYPING, event);
//     });

//     socket.on(
//       ChatSocketEvent.READ_MESSAGES,
//       (data: { chatId: string; userId: string }) => {
//         eventEmitter.emit(AppEvents.CHAT_MESSAGES_READ, data);
//       }
//     );

//     isConnecting = false;
//     return socket;
//   } catch (error) {
//     console.error("Error initializing socket:", error);
//     isConnecting = false;
//     return null;
//   }
// };

// /**
//  * Ensure socket is connected
//  * Returns true if socket was already connected or successfully reconnected
//  */
// export const ensureSocketConnection = async (): Promise<boolean> => {
//   // If already connected, return true
//   if (socket?.connected) {
//     return true;
//   }

//   // Check if we've exceeded max reconnect attempts
//   if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
//     console.error("Maximum reconnection attempts reached");
//     return false;
//   }

//   reconnectAttempts++;
//   console.log(
//     `Socket not connected, attempting to reconnect (attempt ${reconnectAttempts})...`
//   );

//   // Check if user is logged in before attempting to reconnect
//   const token = await AsyncStorage.getItem("accessToken");
//   if (!token) {
//     console.warn("Reconnect attempt blocked: user is logged out");
//     return false;
//   }

//   // Try to initialize socket
//   const newSocket = await initializeSocket();

//   if (newSocket?.connected) {
//     console.log("Socket reconnection successful");
//     return true;
//   } else {
//     console.warn("Socket reconnection failed");
//     return false;
//   }
// };

// /**
//  * Join a chat room
//  */
// export const joinChatRoom = async (roomId: string): Promise<boolean> => {
//   const isConnected = await ensureSocketConnection();

//   if (!isConnected || !socket) {
//     console.error("Failed to join room: socket not connected");
//     return false;
//   }

//   return new Promise((resolve) => {
//     socket!.emit(
//       ChatSocketEvent.JOIN_ROOM,
//       { roomId },
//       (response: { success: boolean }) => {
//         if (response.success) {
//           console.log(`Successfully joined room: ${roomId}`);
//           resolve(true);
//         } else {
//           console.error(`Failed to join room: ${roomId}`);
//           resolve(false);
//         }
//       }
//     );
//   });
// };

// /**
//  * Leave a chat room
//  */
// export const leaveChatRoom = async (roomId: string): Promise<boolean> => {
//   if (!socket?.connected) {
//     console.log("Socket not connected, cannot leave room");
//     return false;
//   }

//   return new Promise((resolve) => {
//     socket!.emit(
//       ChatSocketEvent.LEAVE_ROOM,
//       { roomId },
//       (response: { success: boolean }) => {
//         if (response.success) {
//           console.log(`Successfully left room: ${roomId}`);
//           resolve(true);
//         } else {
//           console.error(`Failed to leave room: ${roomId}`);
//           resolve(false);
//         }
//       }
//     );
//   });
// };

// /**
//  * Send a chat message
//  */
// export const sendChatMessage = async (
//   chatId: string,
//   message: Partial<ChatMessage>
// ): Promise<boolean> => {
//   const isConnected = await ensureSocketConnection();

//   if (!isConnected || !socket) {
//     console.error("Failed to send message: socket not connected");
//     return false;
//   }

//   return new Promise((resolve) => {
//     socket!.emit(
//       ChatSocketEvent.NEW_MESSAGE,
//       { chatId, message },
//       (response: { success: boolean; messageId?: string }) => {
//         if (response.success) {
//           console.log(`Successfully sent message to room: ${chatId}`);
//           resolve(true);
//         } else {
//           console.error(`Failed to send message to room: ${chatId}`);
//           resolve(false);
//         }
//       }
//     );
//   });
// };

// /**
//  * Send typing indicator
//  */
// export const sendTypingStatus = async (
//   chatId: string,
//   isTyping: boolean
// ): Promise<boolean> => {
//   const isConnected = await ensureSocketConnection();

//   if (!isConnected || !socket) {
//     return false;
//   }

//   const event = isTyping ? ChatSocketEvent.TYPING : ChatSocketEvent.STOP_TYPING;

//   socket.emit(event, { chatId });
//   return true;
// };

// /**
//  * Send read receipt for messages
//  */
// export const markMessagesAsRead = async (chatId: string): Promise<boolean> => {
//   const isConnected = await ensureSocketConnection();

//   if (!isConnected || !socket) {
//     return false;
//   }

//   socket.emit(ChatSocketEvent.READ_MESSAGES, { chatId });
//   return true;
// };

// /**
//  * Check if socket is connected
//  */
// export const isSocketConnected = (): boolean => {
//   return socket?.connected || false;
// };

// /**
//  * Close socket connection
//  */
// export const closeSocketConnection = (): void => {
//   if (socket) {
//     socket.close();
//     socket = null;
//     isConnected = false;
//   }
// };

// // Set up event listeners for app events
// eventEmitter.on(AppEvents.AUTH_LOGIN, () => {
//   console.log("User logged in, initializing socket connection");
//   initializeSocket();
// });

// eventEmitter.on(AppEvents.AUTH_LOGOUT, () => {
//   console.log("User logged out, closing socket connection");
//   closeSocketConnection();
// });

// // Initialize socket if user is already logged in
// AsyncStorage.getItem("accessToken").then((token) => {
//   if (token) {
//     console.log("Initializing socket connection");
//     initializeSocket();
//   }
// });
