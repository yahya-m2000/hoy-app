// /**
//  * Custom hook for using chat functionality in components
//  */
// import { useCallback, useEffect, useState, useRef } from "react";
// import { useChat as useChatContext } from "@common/context/ChatContext";
// // import * as chatSocketService from "@common/services/chatSocketService";
// import { ChatMessage, ChatConversation } from "../../common/types/chat";
// import { useAuth } from "@common/context/AuthContext";

// /**
//  * Debounce function to limit rapid executions
//  */
// const debounce = (func: Function, wait: number) => {
//   let timeout: NodeJS.Timeout | null = null;

//   return (...args: any[]) => {
//     if (timeout) clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// };

// /**
//  * Custom hook for chat functionality in a specific conversation
//  *
//  * @param chatId - The ID of the chat/conversation to connect to
//  * @param autoJoin - Whether to automatically join the chat room (default: true)
//  */
// export const useChat = (chatId?: string, autoJoin: boolean = true) => {
//   const { user } = useAuth();
//   const {
//     activeConversation,
//     messages,
//     loading,
//     error,
//     participants,
//     isConnected,
//     loadMessages,
//     markAsRead,
//     sendMessage: contextSendMessage,
//     sendTypingStatus,
//   } = useChatContext();

//   const [isJoined, setIsJoined] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [localError, setLocalError] = useState<string | null>(null);
//   const [isSending, setIsSending] = useState(false);

//   // Keep reference to latest chat ID to handle async operations safely
//   const currentChatIdRef = useRef(chatId);

//   useEffect(() => {
//     currentChatIdRef.current = chatId;
//   }, [chatId]);

//   // Create debounced version of typing indicator
//   const debouncedSendTypingStatus = useCallback(
//     debounce((id: string, typing: boolean) => {
//       sendTypingStatus(id, typing);
//     }, 500),
//     [sendTypingStatus]
//   );

//   // Join chat room when component mounts if autoJoin is true
//   useEffect(() => {
//     let isMounted = true;

//     const joinRoom = async () => {
//       if (!chatId) return;

//       try {
//         console.log(
//           `Joining chat room ${chatId} with user ID ${user?._id?.substring(
//             0,
//             5
//           )}...`
//         );
//         const success = await chatSocketService.joinChatRoom(chatId);

//         if (isMounted) {
//           setIsJoined(success);
//           if (success) {
//             // If we successfully joined, load messages and mark as read
//             loadMessages(chatId);
//             markAsRead(chatId);
//           } else {
//             console.error(`Failed to join room ${chatId} through chat service`);
//             setLocalError("Failed to join chat room");
//           }
//         }
//       } catch (error) {
//         if (isMounted) {
//           console.error("Error joining chat room:", error);
//           setLocalError("Failed to initialize chat service when joining room");
//         }
//       }
//     };

//     if (autoJoin && chatId && !isJoined) {
//       joinRoom();
//     }

//     // Leave chat room when component unmounts
//     return () => {
//       isMounted = false;
//       if (chatId && isJoined) {
//         console.log(
//           `Leaving chat room ${chatId} with user ID ${user?._id?.substring(
//             0,
//             5
//           )}...`
//         );
//         chatSocketService.leaveChatRoom(chatId);
//         setIsJoined(false);
//       }
//     };
//   }, [chatId, autoJoin, isJoined, user, loadMessages, markAsRead]);

//   // Handle typing indicator
//   useEffect(() => {
//     if (!chatId) return;

//     if (isTyping) {
//       debouncedSendTypingStatus(chatId, true);

//       // Auto-cancel typing after 5 seconds of no updates
//       const timer = setTimeout(() => {
//         setIsTyping(false);
//         debouncedSendTypingStatus(chatId, false);
//       }, 5000);

//       return () => clearTimeout(timer);
//     }
//   }, [isTyping, chatId, debouncedSendTypingStatus]);

//   // Send a message
//   const sendMessage = useCallback(
//     async (text: string, attachment?: any): Promise<boolean> => {
//       const currentChatId = currentChatIdRef.current;
//       if (!currentChatId) {
//         setLocalError("Cannot send message: No chat ID provided");
//         return false;
//       }

//       // Prevent multiple send attempts at once
//       if (isSending) return false;

//       try {
//         setIsSending(true);

//         // Cancel typing indicator
//         setIsTyping(false);
//         debouncedSendTypingStatus(currentChatId, false);

//         // Send message through context
//         const success = await contextSendMessage(
//           currentChatId,
//           text,
//           attachment
//         );
//         return success;
//       } catch (error) {
//         console.error("Error sending message:", error);
//         setLocalError("Failed to send message");
//         return false;
//       } finally {
//         setIsSending(false);
//       }
//     },
//     [contextSendMessage, debouncedSendTypingStatus, isSending]
//   );

//   // Update typing status based on user input
//   const handleTyping = useCallback(() => {
//     if (!isTyping) {
//       setIsTyping(true);
//     }
//   }, [isTyping]);

//   // Mark messages as read with error handling
//   const markAsReadWithRetry = useCallback(async () => {
//     if (!chatId) return;

//     try {
//       await markAsRead(chatId);
//     } catch (error) {
//       console.error("Error marking messages as read:", error);
//     }
//   }, [chatId, markAsRead]);

//   // Clear any errors
//   const clearAllErrors = useCallback(() => {
//     setLocalError(null);
//   }, []);

//   return {
//     // State
//     chatId,
//     conversation: activeConversation,
//     messages,
//     loading,
//     error: error || localError,
//     isJoined,
//     isConnected,
//     participants,
//     isSending,

//     // Actions
//     sendMessage,
//     markAsRead: markAsReadWithRetry,
//     handleTyping,

//     // Helpers
//     isAnyoneTyping: participants.some((p) => p.isTyping),
//     clearError: clearAllErrors,
//   };
// };
