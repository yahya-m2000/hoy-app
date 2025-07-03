// /**
//  * Chat context provider for managing chat state
//  * TEMPORARILY SIMPLIFIED TO PREVENT TYPESCRIPT ERRORS
//  */
// import React, {
//   createContext,
//   useContext,
//   useReducer,
//   useEffect,
//   useCallback,
//   useRef,
// } from "react";
// import {
//   ChatState,
//   ChatConversation,
//   ChatMessage,
//   ChatParticipant,
// } from "../types/chat";
// import { eventEmitter, AppEvents } from "../utils/eventEmitter";
// import { useAuth } from "./AuthContext";

// // Temporary stub implementations to prevent TypeScript errors
// const chatService = {
//   getConversations: async (): Promise<ChatConversation[]> => [],
//   getConversation: async (id: string): Promise<ChatConversation | null> => null,
//   getChatMessages: async (conversationId: string): Promise<ChatMessage[]> => [],
//   sendMessage: async (
//     conversationId: string,
//     text: string
//   ): Promise<ChatMessage | null> => null,
//   markMessagesAsRead: async (conversationId: string): Promise<void> => {},
//   createConversation: async (
//     participants: any
//   ): Promise<ChatConversation | null> => null,
//   getUnreadMessageCount: async (): Promise<number> => 0,
// };

// const chatSocketService = {
//   initializeSocket: (): void => {},
//   joinChatRoom: (conversationId: string): void => {},
//   sendChatMessage: async (
//     conversationId: string,
//     message: any
//   ): Promise<void> => {},
//   markMessagesAsRead: async (conversationId: string): Promise<void> => {},
//   sendTypingStatus: (conversationId: string, isTyping: boolean): void => {},
// };

// // Initial state
// const initialState: ChatState = {
//   conversations: [],
//   activeConversation: null,
//   messages: [],
//   loading: false,
//   error: null,
//   participants: [],
//   isConnected: false,
// };

// // Action types
// enum ActionType {
//   SET_LOADING = "SET_LOADING",
//   SET_ERROR = "SET_ERROR",
//   SET_CONVERSATIONS = "SET_CONVERSATIONS",
//   UPDATE_CONVERSATION = "UPDATE_CONVERSATION",
//   SET_ACTIVE_CONVERSATION = "SET_ACTIVE_CONVERSATION",
//   SET_MESSAGES = "SET_MESSAGES",
//   ADD_MESSAGE = "ADD_MESSAGE",
//   SET_PARTICIPANTS = "SET_PARTICIPANTS",
//   UPDATE_PARTICIPANT = "UPDATE_PARTICIPANT",
//   SET_CONNECTED = "SET_CONNECTED",
//   CLEAR_STATE = "CLEAR_STATE",
// }

// // Action interfaces
// type Action =
//   | { type: ActionType.SET_LOADING; payload: boolean }
//   | {
//       type: ActionType.SET_ERROR;
//       payload: { message: string; code: string } | null;
//     }
//   | { type: ActionType.SET_CONVERSATIONS; payload: ChatConversation[] }
//   | { type: ActionType.UPDATE_CONVERSATION; payload: ChatConversation }
//   | {
//       type: ActionType.SET_ACTIVE_CONVERSATION;
//       payload: ChatConversation | null;
//     }
//   | { type: ActionType.SET_MESSAGES; payload: ChatMessage[] }
//   | { type: ActionType.ADD_MESSAGE; payload: ChatMessage }
//   | { type: ActionType.SET_PARTICIPANTS; payload: ChatParticipant[] }
//   | {
//       type: ActionType.UPDATE_PARTICIPANT;
//       payload: Partial<ChatParticipant> & { userId: string };
//     }
//   | { type: ActionType.SET_CONNECTED; payload: boolean }
//   | { type: ActionType.CLEAR_STATE };

// // Reducer function
// const reducer = (state: ChatState, action: Action): ChatState => {
//   switch (action.type) {
//     case ActionType.SET_LOADING:
//       return { ...state, loading: action.payload };

//     case ActionType.SET_ERROR:
//       return { ...state, error: action.payload };

//     case ActionType.SET_CONVERSATIONS:
//       return { ...state, conversations: action.payload };

//     case ActionType.UPDATE_CONVERSATION: {
//       const updated = action.payload;
//       const existingIndex = state.conversations.findIndex(
//         (c) => c._id === updated._id
//       );

//       if (existingIndex >= 0) {
//         const updatedConversations = [...state.conversations];
//         updatedConversations[existingIndex] = {
//           ...updatedConversations[existingIndex],
//           ...updated,
//         };
//         return { ...state, conversations: updatedConversations };
//       } else {
//         return {
//           ...state,
//           conversations: [updated, ...state.conversations],
//         };
//       }
//     }

//     case ActionType.SET_ACTIVE_CONVERSATION:
//       return { ...state, activeConversation: action.payload };

//     case ActionType.SET_MESSAGES:
//       return { ...state, messages: action.payload };

//     case ActionType.ADD_MESSAGE: {
//       const newMessage = action.payload;
//       // Avoid duplicate messages
//       if (state.messages.some((m) => m._id === newMessage._id)) {
//         return state;
//       }
//       return {
//         ...state,
//         messages: [...state.messages, newMessage],
//       };
//     }

//     case ActionType.SET_PARTICIPANTS:
//       return { ...state, participants: action.payload };

//     case ActionType.UPDATE_PARTICIPANT: {
//       const { userId, ...updates } = action.payload;
//       const existingIndex = state.participants.findIndex(
//         (p) => p.userId === userId
//       );

//       if (existingIndex >= 0) {
//         const updatedParticipants = [...state.participants];
//         updatedParticipants[existingIndex] = {
//           ...updatedParticipants[existingIndex],
//           ...updates,
//         };
//         return { ...state, participants: updatedParticipants };
//       }
//       return state;
//     }

//     case ActionType.SET_CONNECTED:
//       return { ...state, isConnected: action.payload };

//     case ActionType.CLEAR_STATE:
//       return initialState;

//     default:
//       return state;
//   }
// };

// // Context type
// interface ChatContextType extends ChatState {
//   loadConversations: () => Promise<void>;
//   getConversation: (id: string) => Promise<ChatConversation | null>;
//   setActiveConversation: (conversation: ChatConversation | null) => void;
//   loadMessages: (conversationId: string) => Promise<void>;
//   sendMessage: (
//     conversationId: string,
//     text: string,
//     attachment?: any
//   ) => Promise<boolean>;
//   markAsRead: (conversationId: string) => Promise<void>;
//   createNewConversation: (
//     recipientId: string,
//     initialMessage: string,
//     propertyId?: string
//   ) => Promise<ChatConversation | null>;
//   getUnreadCount: () => Promise<number>;
//   clearError: () => void;
//   sendTypingStatus: (conversationId: string, isTyping: boolean) => void;
// }

// // Create context
// const ChatContext = createContext<ChatContextType | undefined>(undefined);

// // Provider component
// export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const { user } = useAuth();

//   // Refs for memoization and to avoid stale closures
//   const stateRef = useRef(state);
//   const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Keep state ref updated
//   useEffect(() => {
//     stateRef.current = state;
//   }, [state]);

//   // Initialize chat when user logs in
//   useEffect(() => {
//     if (user) {
//       chatSocketService.initializeSocket();
//       loadConversations();
//     } else {
//       // Clear state when user logs out
//       dispatch({ type: ActionType.CLEAR_STATE });
//     }

//     return () => {
//       if (refreshTimeoutRef.current) {
//         clearTimeout(refreshTimeoutRef.current);
//       }
//     };
//   }, [user]);

//   // Event listeners for socket events
//   useEffect(() => {
//     // Message received
//     const messageHandler = (message: ChatMessage) => {
//       // If this is for the active conversation, add it to messages
//       if (stateRef.current.activeConversation?._id === message.chatId) {
//         dispatch({ type: ActionType.ADD_MESSAGE, payload: message });

//         // Mark as read automatically if we're in the conversation
//         markAsRead(message.chatId);
//       }

//       // Update conversation list to show latest message
//       updateConversationWithMessage(message);
//     };

//     // Typing status
//     const typingHandler = ({
//       userId,
//       chatId,
//       isTyping,
//     }: {
//       userId: string;
//       chatId: string;
//       isTyping: boolean;
//     }) => {
//       if (stateRef.current.activeConversation?._id === chatId) {
//         dispatch({
//           type: ActionType.UPDATE_PARTICIPANT,
//           payload: { userId, isTyping },
//         });
//       }
//     };

//     // Read receipts
//     const readHandler = ({
//       chatId,
//       userId,
//     }: {
//       chatId: string;
//       userId: string;
//     }) => {
//       // Update conversation to show messages as read
//       if (user?._id !== userId) {
//         const conversation = stateRef.current.conversations.find(
//           (c) => c._id === chatId
//         );
//         if (conversation) {
//           dispatch({
//             type: ActionType.UPDATE_CONVERSATION,
//             payload: {
//               ...conversation,
//               lastMessage: conversation.lastMessage
//                 ? { ...conversation.lastMessage, read: true }
//                 : undefined,
//             },
//           });
//         }
//       }
//     };

//     // Socket connection status
//     const connectedHandler = () => {
//       dispatch({ type: ActionType.SET_CONNECTED, payload: true });
//       loadConversations(); // Refresh conversations when reconnected
//     };

//     const disconnectedHandler = () => {
//       dispatch({ type: ActionType.SET_CONNECTED, payload: false });
//     };

//     // Subscribe to events
//     eventEmitter.on(AppEvents.CHAT_MESSAGE_RECEIVED, messageHandler);
//     eventEmitter.on(AppEvents.CHAT_USER_TYPING, typingHandler);
//     eventEmitter.on(AppEvents.CHAT_USER_STOPPED_TYPING, typingHandler);
//     eventEmitter.on(AppEvents.CHAT_MESSAGES_READ, readHandler);
//     eventEmitter.on(AppEvents.SOCKET_CONNECTED, connectedHandler);
//     eventEmitter.on(AppEvents.SOCKET_DISCONNECTED, disconnectedHandler);

//     // Cleanup
//     return () => {
//       eventEmitter.off(AppEvents.CHAT_MESSAGE_RECEIVED, messageHandler);
//       eventEmitter.off(AppEvents.CHAT_USER_TYPING, typingHandler);
//       eventEmitter.off(AppEvents.CHAT_USER_STOPPED_TYPING, typingHandler);
//       eventEmitter.off(AppEvents.CHAT_MESSAGES_READ, readHandler);
//       eventEmitter.off(AppEvents.SOCKET_CONNECTED, connectedHandler);
//       eventEmitter.off(AppEvents.SOCKET_DISCONNECTED, disconnectedHandler);
//     };
//   }, [user]);

//   /**
//    * Update a conversation with a new message
//    */
//   const updateConversationWithMessage = (message: ChatMessage) => {
//     const { chatId, senderId, text, createdAt } = message;

//     // Find the conversation to update
//     const existingConversation = stateRef.current.conversations.find(
//       (c) => c._id === chatId
//     );

//     if (existingConversation) {
//       // Update existing conversation
//       const isOwnMessage = senderId === user?._id;

//       dispatch({
//         type: ActionType.UPDATE_CONVERSATION,
//         payload: {
//           ...existingConversation,
//           lastMessage: {
//             text,
//             senderId,
//             createdAt,
//             read: isOwnMessage, // Own messages are always read
//           },
//           updatedAt:
//             createdAt instanceof Date ? createdAt : new Date(createdAt),
//           // Increment unread count if message is from someone else
//           unreadCount: isOwnMessage
//             ? existingConversation.unreadCount
//             : existingConversation.unreadCount + 1,
//         },
//       });

//       // Trigger a notification for the conversation update
//       eventEmitter.emit(AppEvents.CHAT_CONVERSATION_UPDATED, chatId);
//     } else {
//       // This is a new conversation, fetch it
//       loadConversations();
//     }
//   };

//   /**
//    * Load all conversations
//    */
//   const loadConversations = async () => {
//     if (!user) return;

//     dispatch({ type: ActionType.SET_LOADING, payload: true });
//     dispatch({ type: ActionType.SET_ERROR, payload: null });

//     try {
//       const conversations = await chatService.getConversations();
//       dispatch({ type: ActionType.SET_CONVERSATIONS, payload: conversations });

//       // Schedule refresh for conversations every 60 seconds
//       if (refreshTimeoutRef.current) {
//         clearTimeout(refreshTimeoutRef.current);
//       }

//       refreshTimeoutRef.current = setTimeout(() => {
//         if (user) loadConversations();
//       }, 60000);
//     } catch (error) {
//       console.error("Error loading conversations:", error);
//       dispatch({
//         type: ActionType.SET_ERROR,
//         payload: {
//           message: "Failed to load conversations",
//           code: "load_conversations_error",
//         },
//       });
//     } finally {
//       dispatch({ type: ActionType.SET_LOADING, payload: false });
//     }
//   };

//   /**
//    * Get a specific conversation by ID
//    */
//   const getConversation = async (
//     id: string
//   ): Promise<ChatConversation | null> => {
//     dispatch({ type: ActionType.SET_LOADING, payload: true });
//     dispatch({ type: ActionType.SET_ERROR, payload: null });

//     try {
//       const conversation = await chatService.getConversation(id);
//       dispatch({ type: ActionType.UPDATE_CONVERSATION, payload: conversation });
//       return conversation;
//     } catch (error) {
//       console.error(`Error getting conversation ${id}:`, error);
//       dispatch({
//         type: ActionType.SET_ERROR,
//         payload: {
//           message: "Failed to load conversation",
//           code: "get_conversation_error",
//         },
//       });
//       return null;
//     } finally {
//       dispatch({ type: ActionType.SET_LOADING, payload: false });
//     }
//   };

//   /**
//    * Set the active conversation
//    */
//   const setActiveConversation = (conversation: ChatConversation | null) => {
//     dispatch({
//       type: ActionType.SET_ACTIVE_CONVERSATION,
//       payload: conversation,
//     });

//     // Clear messages when changing conversations
//     if (!conversation) {
//       dispatch({ type: ActionType.SET_MESSAGES, payload: [] });
//       return;
//     }

//     // Load messages for this conversation
//     loadMessages(conversation._id);

//     // Join the socket room for this conversation
//     chatSocketService.joinChatRoom(conversation._id);

//     // If there are unread messages, mark them as read
//     if (conversation.unreadCount > 0) {
//       markAsRead(conversation._id);
//     }

//     // Set up participants for the conversation
//     const otherParticipantIds = conversation.participants.filter(
//       (id) => id !== user?._id
//     );

//     // Create participant objects
//     const participants: ChatParticipant[] = otherParticipantIds.map(
//       (userId) => ({
//         userId,
//         user: conversation.participantDetails?.find((u) => u._id === userId),
//         isTyping: false,
//       })
//     );

//     dispatch({ type: ActionType.SET_PARTICIPANTS, payload: participants });
//   };

//   /**
//    * Load messages for a conversation
//    */
//   const loadMessages = async (conversationId: string) => {
//     dispatch({ type: ActionType.SET_LOADING, payload: true });
//     dispatch({ type: ActionType.SET_ERROR, payload: null });

//     try {
//       const messages = await chatService.getChatMessages(conversationId);
//       dispatch({ type: ActionType.SET_MESSAGES, payload: messages });
//     } catch (error) {
//       console.error(
//         `Error loading messages for conversation ${conversationId}:`,
//         error
//       );
//       dispatch({
//         type: ActionType.SET_ERROR,
//         payload: {
//           message: "Failed to load messages",
//           code: "load_messages_error",
//         },
//       });
//     } finally {
//       dispatch({ type: ActionType.SET_LOADING, payload: false });
//     }
//   };

//   /**
//    * Send a message in a conversation
//    */
//   const sendMessage = async (
//     conversationId: string,
//     text: string,
//     attachment?: any
//   ): Promise<boolean> => {
//     dispatch({ type: ActionType.SET_ERROR, payload: null });

//     try {
//       // First send via API
//       const message = await chatService.sendMessage(
//         conversationId,
//         text,
//         attachment
//       );

//       // Add to local state
//       dispatch({ type: ActionType.ADD_MESSAGE, payload: message });

//       // Update conversation with new last message
//       updateConversationWithMessage(message);

//       // Also send via socket for real-time delivery
//       await chatSocketService.sendChatMessage(conversationId, {
//         _id: message._id,
//         chatId: conversationId,
//         senderId: user?._id || "",
//         text,
//         createdAt: message.createdAt,
//         read: false,
//         attachment: message.attachment,
//       });

//       return true;
//     } catch (error) {
//       console.error(
//         `Error sending message to conversation ${conversationId}:`,
//         error
//       );
//       dispatch({
//         type: ActionType.SET_ERROR,
//         payload: {
//           message: "Failed to send message",
//           code: "send_message_error",
//         },
//       });
//       return false;
//     }
//   };

//   /**
//    * Mark messages in a conversation as read
//    */
//   const markAsRead = async (conversationId: string) => {
//     try {
//       // Update local state first
//       const conversation = state.conversations.find(
//         (c) => c._id === conversationId
//       );
//       if (conversation && conversation.unreadCount > 0) {
//         dispatch({
//           type: ActionType.UPDATE_CONVERSATION,
//           payload: {
//             ...conversation,
//             unreadCount: 0,
//             lastMessage: conversation.lastMessage
//               ? { ...conversation.lastMessage, read: true }
//               : undefined,
//           },
//         });
//       }

//       // Send read receipt to server via API
//       await chatService.markMessagesAsRead(conversationId);

//       // Also send via socket for real-time updates
//       await chatSocketService.markMessagesAsRead(conversationId);
//     } catch (error) {
//       console.error(
//         `Error marking messages as read for conversation ${conversationId}:`,
//         error
//       );
//     }
//   };

//   /**
//    * Create a new conversation
//    */
//   const createNewConversation = async (
//     recipientId: string,
//     initialMessage: string,
//     propertyId?: string
//   ): Promise<ChatConversation | null> => {
//     dispatch({ type: ActionType.SET_LOADING, payload: true });
//     dispatch({ type: ActionType.SET_ERROR, payload: null });

//     try {
//       const conversation = await chatService.createConversation(
//         recipientId,
//         initialMessage,
//         propertyId
//       );

//       // Add to conversations list
//       dispatch({ type: ActionType.UPDATE_CONVERSATION, payload: conversation });

//       // Join the socket room
//       await chatSocketService.joinChatRoom(conversation._id);

//       return conversation;
//     } catch (error) {
//       console.error(
//         `Error creating conversation with user ${recipientId}:`,
//         error
//       );
//       dispatch({
//         type: ActionType.SET_ERROR,
//         payload: {
//           message: "Failed to create conversation",
//           code: "create_conversation_error",
//         },
//       });
//       return null;
//     } finally {
//       dispatch({ type: ActionType.SET_LOADING, payload: false });
//     }
//   };

//   /**
//    * Get unread message count
//    */
//   const getUnreadCount = async (): Promise<number> => {
//     try {
//       return await chatService.getUnreadMessageCount();
//     } catch (error) {
//       console.error("Error getting unread message count:", error);
//       return 0;
//     }
//   };

//   /**
//    * Clear error state
//    */
//   const clearError = () => {
//     dispatch({ type: ActionType.SET_ERROR, payload: null });
//   };

//   /**
//    * Send typing status
//    */
//   const sendTypingStatus = useCallback(
//     (conversationId: string, isTyping: boolean) => {
//       chatSocketService.sendTypingStatus(conversationId, isTyping);
//     },
//     []
//   );

//   // Create context value
//   const contextValue: ChatContextType = {
//     ...state,
//     loadConversations,
//     getConversation,
//     setActiveConversation,
//     loadMessages,
//     sendMessage,
//     markAsRead,
//     createNewConversation,
//     getUnreadCount,
//     clearError,
//     sendTypingStatus,
//   };

//   return (
//     <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
//   );
// };

// // Hook for using chat context
// export const useChat = (): ChatContextType => {
//   const context = useContext(ChatContext);
//   if (!context) {
//     throw new Error("useChat must be used within a ChatProvider");
//   }
//   return context;
// };
