// /**
//  * Simplified chat API hooks with stability focus
//  *
//  * This implementation prioritizes stability and reliability over features.
//  * It focuses on preventing excessive API calls and infinite update loops.
//  */

// import { useState, useEffect, useRef, useCallback } from "react";
// import { AppState, AppStateStatus } from "react-native";
// import Constants from "expo-constants";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as chatService from "@traveler-services/chatService";
// import { ChatConversation, ChatMessage } from "@common/types/chat";
// import * as safeLogger from "@common/utils/log/safeLogger";

// // API call status tracking - prevent duplicate calls
// const API_CALL_STATUS = {
//   conversationsFetching: false,
//   unreadCountFetching: false,
//   messagesFetching: {} as Record<string, boolean>,
//   lastFetchTime: {
//     conversations: 0,
//     unreadCount: 0,
//     messages: {} as Record<string, number>,
//   },
// };

// // Shared data cache
// const GLOBAL_CACHE = {
//   conversations: [] as ChatConversation[],
//   unreadCount: 0,
//   messages: {} as Record<string, ChatMessage[]>,
//   activeComponents: {
//     conversations: 0,
//     unreadCount: 0,
//     messages: {} as Record<string, number>,
//   },
// };

// // Get polling intervals from config
// const getPollingInterval = (type: "conversations" | "unreadCount") => {
//   const config = Constants.expoConfig?.extra || {};
//   if (type === "conversations") {
//     return config.chatPollingInterval || 30000;
//   } else {
//     return config.chatUnreadCountPollingInterval || 60000;
//   }
// };

// // Check if polling is disabled
// const isPollingDisabled = () => {
//   const config = Constants.expoConfig?.extra || {};
//   return config.disableChatPolling || false;
// };

// /**
//  * Safe wrapper for async API calls with status tracking
//  */
// const safeApiCall = async <T>(
//   apiCallFunction: () => Promise<T>,
//   statusKey: string,
//   cacheKey?: string
// ): Promise<T | null> => {
//   try {
//     // Set status to fetching
//     if (statusKey === "conversations") {
//       if (API_CALL_STATUS.conversationsFetching) {
//         safeLogger.debug(
//           "Conversations already being fetched, skipping duplicate call"
//         );
//         return null;
//       }
//       API_CALL_STATUS.conversationsFetching = true;
//     } else if (statusKey === "unreadCount") {
//       if (API_CALL_STATUS.unreadCountFetching) {
//         safeLogger.debug(
//           "Unread count already being fetched, skipping duplicate call"
//         );
//         return null;
//       }
//       API_CALL_STATUS.unreadCountFetching = true;
//     } else if (statusKey.startsWith("messages_") && cacheKey) {
//       if (API_CALL_STATUS.messagesFetching[cacheKey]) {
//         safeLogger.debug(
//           `Messages for ${cacheKey} already being fetched, skipping duplicate call`
//         );
//         return null;
//       }
//       API_CALL_STATUS.messagesFetching[cacheKey] = true;
//     }

//     // Execute API call
//     safeLogger.debug(`Executing API call: ${statusKey}`);
//     const result = await apiCallFunction();

//     // Record the time of the successful fetch
//     if (statusKey === "conversations") {
//       API_CALL_STATUS.lastFetchTime.conversations = Date.now();
//     } else if (statusKey === "unreadCount") {
//       API_CALL_STATUS.lastFetchTime.unreadCount = Date.now();
//     } else if (statusKey.startsWith("messages_") && cacheKey) {
//       API_CALL_STATUS.lastFetchTime.messages[cacheKey] = Date.now();
//     }

//     return result;
//   } catch (error) {
//     safeLogger.error(`API call error for ${statusKey}:`, error);
//     return null;
//   } finally {
//     // Reset status regardless of outcome
//     setTimeout(() => {
//       if (statusKey === "conversations") {
//         API_CALL_STATUS.conversationsFetching = false;
//       } else if (statusKey === "unreadCount") {
//         API_CALL_STATUS.unreadCountFetching = false;
//       } else if (statusKey.startsWith("messages_") && cacheKey) {
//         API_CALL_STATUS.messagesFetching[cacheKey] = false;
//       }
//     }, 1000); // Give a small buffer before allowing another call
//   }
// };

// /**
//  * Debounce function to prevent rapid duplicate calls
//  * @private - Not exposed as part of the hook's API
//  */
// const debounceCall = <T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): ((...args: Parameters<T>) => void) => {
//   let timeout: NodeJS.Timeout | null = null;

//   return (...args: Parameters<T>) => {
//     if (timeout) {
//       clearTimeout(timeout);
//     }

//     timeout = setTimeout(() => {
//       timeout = null;
//       func(...args);
//     }, wait);
//   };
// };

// /**
//  * Hook for using chat conversations with simplified implementation
//  */
// export const useChatConversations = (
//   options: {
//     pollingInterval?: number;
//     enableInBackground?: boolean;
//   } = {}
// ) => {
//   const [conversations, setConversations] = useState<ChatConversation[]>(
//     GLOBAL_CACHE.conversations
//   );
//   const [loading, setLoading] = useState<boolean>(
//     GLOBAL_CACHE.conversations.length === 0
//   );
//   const [error, setError] = useState<Error | null>(null);

//   const pollingIntervalRef = useRef<number>(
//     options.pollingInterval || getPollingInterval("conversations")
//   );
//   const enableInBackgroundRef = useRef<boolean>(
//     options.enableInBackground || false
//   );
//   const appStateRef = useRef<AppStateStatus>(AppState.currentState);
//   const isMountedRef = useRef<boolean>(true);
//   const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const initialFetchDoneRef = useRef<boolean>(false);

//   // Schedule next poll - defined early to avoid circular dependencies
//   const schedulePoll = useCallback((fetchFunc: () => Promise<void>) => {
//     if (pollTimeoutRef.current) {
//       clearTimeout(pollTimeoutRef.current);
//     }

//     // Skip polling if disabled in config
//     if (isPollingDisabled()) {
//       return;
//     }

//     // Skip polling if there are no active components
//     if (GLOBAL_CACHE.activeComponents.conversations === 0) {
//       return;
//     }

//     // Determine polling interval
//     const interval =
//       appStateRef.current === "active"
//         ? pollingIntervalRef.current
//         : Math.max(pollingIntervalRef.current * 3, 120000); // 3x longer in background, minimum 2 minutes

//     pollTimeoutRef.current = setTimeout(() => {
//       fetchFunc();
//     }, interval);

//     safeLogger.debug(`Next conversations poll in ${interval / 1000}s`);
//   }, []);

//   // Fetch conversations implementation
//   const fetchConversations = useCallback(async () => {
//     // Skip if component is unmounted
//     if (!isMountedRef.current) return;

//     // Skip if in background and background polling is disabled
//     if (appStateRef.current !== "active" && !enableInBackgroundRef.current) {
//       schedulePoll(fetchConversations);
//       return;
//     }

//     // Skip if recently fetched (within 2 seconds)
//     const timeSinceLastFetch =
//       Date.now() - API_CALL_STATUS.lastFetchTime.conversations;
//     if (timeSinceLastFetch < 2000 && initialFetchDoneRef.current) {
//       safeLogger.debug(
//         `Skipping conversations fetch - last fetch was ${timeSinceLastFetch}ms ago`
//       );
//       schedulePoll(fetchConversations);
//       return;
//     }

//     if (!initialFetchDoneRef.current) {
//       setLoading(true);
//     }

//     const result = await safeApiCall(
//       async () => await chatService.getConversations(),
//       "conversations"
//     );

//     if (result && isMountedRef.current) {
//       // Update state and global cache
//       setConversations(result);
//       GLOBAL_CACHE.conversations = result;
//       setLoading(false);
//       setError(null);
//       initialFetchDoneRef.current = true;

//       // Save to AsyncStorage cache
//       try {
//         await AsyncStorage.setItem(
//           "cached_conversations",
//           JSON.stringify({
//             data: result,
//             timestamp: Date.now(),
//           })
//         );
//       } catch (e) {
//         safeLogger.error("Error saving conversations to cache:", e);
//       }
//     }

//     // Schedule next poll
//     schedulePoll(fetchConversations);
//   }, [schedulePoll]);

//   // Track app state changes without triggering renders
//   useEffect(() => {
//     const subscription = AppState.addEventListener("change", (nextAppState) => {
//       const wasBackground =
//         appStateRef.current !== "active" && nextAppState === "active";
//       appStateRef.current = nextAppState;

//       // If coming from background to foreground, refresh immediately
//       if (wasBackground) {
//         safeLogger.info("App is now active, refreshing chat data");
//         fetchConversations();
//       }
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, [fetchConversations]);

//   // Register this component in the active components tracker
//   useEffect(() => {
//     GLOBAL_CACHE.activeComponents.conversations++;
//     safeLogger.debug(
//       `Component registered for conversations: ${GLOBAL_CACHE.activeComponents.conversations} active`
//     );

//     return () => {
//       GLOBAL_CACHE.activeComponents.conversations--;
//       safeLogger.debug(
//         `Component unregistered for conversations: ${GLOBAL_CACHE.activeComponents.conversations} active`
//       );

//       if (pollTimeoutRef.current) {
//         clearTimeout(pollTimeoutRef.current);
//         pollTimeoutRef.current = null;
//       }

//       isMountedRef.current = false;
//     };
//   }, []);

//   // Load from cache and set up initial polling
//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         const cachedConversations = await AsyncStorage.getItem(
//           "cached_conversations"
//         );
//         if (cachedConversations) {
//           const parsed = JSON.parse(cachedConversations);
//           if (parsed.data && Array.isArray(parsed.data) && parsed.timestamp) {
//             // Check if cache is still valid (less than 1 hour old)
//             const cacheAge = Date.now() - parsed.timestamp;
//             if (cacheAge < 3600000) {
//               if (isMountedRef.current) {
//                 setConversations(parsed.data);
//                 GLOBAL_CACHE.conversations = parsed.data;
//                 setLoading(false);
//               }
//               safeLogger.debug("Loaded conversations from AsyncStorage cache");
//             }
//           }
//         }
//       } catch (e) {
//         safeLogger.error("Error loading cached conversations:", e);
//       }

//       // Always fetch fresh data
//       fetchConversations();
//     };

//     loadInitialData();

//     // Clean up timeout on unmount
//     return () => {
//       if (pollTimeoutRef.current) {
//         clearTimeout(pollTimeoutRef.current);
//       }
//     };
//   }, [fetchConversations]);

//   // Manual refresh function
//   const refresh = useCallback(async () => {
//     if (pollTimeoutRef.current) {
//       clearTimeout(pollTimeoutRef.current);
//       pollTimeoutRef.current = null;
//     }

//     safeLogger.debug("Manual refresh of conversations triggered");
//     await fetchConversations();
//     return GLOBAL_CACHE.conversations;
//   }, [fetchConversations]);

//   // Return stable interface
//   return {
//     conversations,
//     loading,
//     error,
//     refresh,
//   };
// };

// /**
//  * Hook for getting unread message count with simplified implementation
//  */
// export const useUnreadMessageCount = (
//   options: {
//     pollingInterval?: number;
//     enableInBackground?: boolean;
//   } = {}
// ) => {
//   const [unreadCount, setUnreadCount] = useState<number>(
//     GLOBAL_CACHE.unreadCount
//   );
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);

//   const pollingIntervalRef = useRef<number>(
//     options.pollingInterval || getPollingInterval("unreadCount")
//   );
//   const enableInBackgroundRef = useRef<boolean>(
//     options.enableInBackground || false
//   );
//   const appStateRef = useRef<AppStateStatus>(AppState.currentState);
//   const isMountedRef = useRef<boolean>(true);
//   const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const initialFetchDoneRef = useRef<boolean>(false);

//   // Schedule next poll - defined early to avoid circular dependencies
//   const schedulePoll = useCallback((fetchFunc: () => Promise<void>) => {
//     if (pollTimeoutRef.current) {
//       clearTimeout(pollTimeoutRef.current);
//     }

//     // Skip polling if disabled in config
//     if (isPollingDisabled()) {
//       return;
//     }

//     // Skip polling if there are no active components
//     if (GLOBAL_CACHE.activeComponents.unreadCount === 0) {
//       return;
//     }

//     // Determine polling interval
//     const interval =
//       appStateRef.current === "active"
//         ? pollingIntervalRef.current
//         : Math.max(pollingIntervalRef.current * 3, 180000); // 3x longer in background, minimum 3 minutes

//     pollTimeoutRef.current = setTimeout(() => {
//       fetchFunc();
//     }, interval);
//   }, []);

//   // Fetch unread count implementation
//   const fetchUnreadCount = useCallback(async () => {
//     // Skip if component is unmounted
//     if (!isMountedRef.current) return;

//     // Skip if in background and background polling is disabled
//     if (appStateRef.current !== "active" && !enableInBackgroundRef.current) {
//       schedulePoll(fetchUnreadCount);
//       return;
//     }

//     // Skip if recently fetched (within 2 seconds)
//     const timeSinceLastFetch =
//       Date.now() - API_CALL_STATUS.lastFetchTime.unreadCount;
//     if (timeSinceLastFetch < 2000 && initialFetchDoneRef.current) {
//       schedulePoll(fetchUnreadCount);
//       return;
//     }

//     if (!initialFetchDoneRef.current) {
//       setLoading(true);
//     }

//     try {
//       const count = await chatService.getUnreadCount();

//       if (isMountedRef.current) {
//         setUnreadCount(count);
//         GLOBAL_CACHE.unreadCount = count;
//         setLoading(false);
//         setError(null);
//         initialFetchDoneRef.current = true;
//       }
//     } catch (err: any) {
//       if (isMountedRef.current) {
//         setError(new Error(err?.message || "Failed to fetch unread count"));
//       }
//       safeLogger.error("Error fetching unread count:", err);
//     }

//     // Schedule next poll
//     schedulePoll(fetchUnreadCount);
//   }, [schedulePoll]);

//   // Track app state changes without triggering renders
//   useEffect(() => {
//     const subscription = AppState.addEventListener("change", (nextAppState) => {
//       const wasBackground =
//         appStateRef.current !== "active" && nextAppState === "active";
//       appStateRef.current = nextAppState;

//       // If coming from background to foreground, refresh immediately
//       if (wasBackground) {
//         fetchUnreadCount();
//       }
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, [fetchUnreadCount]);

//   // Register this component in the active components tracker
//   useEffect(() => {
//     GLOBAL_CACHE.activeComponents.unreadCount++;

//     return () => {
//       GLOBAL_CACHE.activeComponents.unreadCount--;

//       if (pollTimeoutRef.current) {
//         clearTimeout(pollTimeoutRef.current);
//         pollTimeoutRef.current = null;
//       }

//       isMountedRef.current = false;
//     };
//   }, []);

//   // Initial fetch on mount
//   useEffect(() => {
//     fetchUnreadCount();

//     return () => {
//       if (pollTimeoutRef.current) {
//         clearTimeout(pollTimeoutRef.current);
//       }
//     };
//   }, [fetchUnreadCount]);

//   // Manual refresh function
//   const refresh = useCallback(async () => {
//     if (pollTimeoutRef.current) {
//       clearTimeout(pollTimeoutRef.current);
//       pollTimeoutRef.current = null;
//     }

//     await fetchUnreadCount();
//     return GLOBAL_CACHE.unreadCount;
//   }, [fetchUnreadCount]);

//   return {
//     unreadCount,
//     loading,
//     error,
//     refresh,
//   };
// };

// /**
//  * Hook for using messages in a specific conversation
//  */
// export const useConversationMessages = (conversationId: string) => {
//   const cachedMessages = GLOBAL_CACHE.messages[conversationId] || [];

//   const [messages, setMessages] = useState<ChatMessage[]>(cachedMessages);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);

//   const isMountedRef = useRef<boolean>(true);

//   // Register this component in the active components tracker
//   useEffect(() => {
//     if (!GLOBAL_CACHE.activeComponents.messages[conversationId]) {
//       GLOBAL_CACHE.activeComponents.messages[conversationId] = 0;
//     }
//     GLOBAL_CACHE.activeComponents.messages[conversationId]++;

//     return () => {
//       if (GLOBAL_CACHE.activeComponents.messages[conversationId]) {
//         GLOBAL_CACHE.activeComponents.messages[conversationId]--;
//       }
//       isMountedRef.current = false;
//     };
//   }, [conversationId]);

//   // Fetch messages on mount
//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!conversationId) return;

//       setLoading(true);

//       try {
//         // First check AsyncStorage cache
//         try {
//           const cachedData = await AsyncStorage.getItem(
//             `cached_messages_${conversationId}`
//           );
//           if (cachedData) {
//             const parsed = JSON.parse(cachedData);
//             if (parsed.data && Array.isArray(parsed.data) && parsed.timestamp) {
//               // Check if cache is still valid (less than 30 minutes old)
//               const cacheAge = Date.now() - parsed.timestamp;
//               if (cacheAge < 1800000 && isMountedRef.current) {
//                 setMessages(parsed.data);
//                 GLOBAL_CACHE.messages[conversationId] = parsed.data;
//                 setLoading(false);
//                 safeLogger.debug(
//                   `Loaded ${parsed.data.length} messages from AsyncStorage cache`
//                 );
//               }
//             }
//           }
//         } catch (e) {
//           safeLogger.error("Error loading cached messages:", e);
//         }

//         // Make API call
//         const result = await safeApiCall(
//           async () => await chatService.getMessages(conversationId),
//           `messages_${conversationId}`,
//           conversationId
//         );

//         if (result && isMountedRef.current) {
//           setMessages(result);
//           GLOBAL_CACHE.messages[conversationId] = result;

//           // Save to AsyncStorage cache
//           try {
//             await AsyncStorage.setItem(
//               `cached_messages_${conversationId}`,
//               JSON.stringify({
//                 data: result,
//                 timestamp: Date.now(),
//               })
//             );
//           } catch (e) {
//             safeLogger.error("Error saving messages to cache:", e);
//           }
//         }

//         // Mark conversation as read
//         chatService.markConversationAsRead(conversationId).catch((e) => {
//           safeLogger.error("Error marking conversation as read:", e);
//         });
//       } catch (err: any) {
//         if (isMountedRef.current) {
//           setError(
//             new Error(
//               err?.message ||
//                 `Failed to fetch messages for conversation ${conversationId}`
//             )
//           );
//         }
//       } finally {
//         if (isMountedRef.current) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchMessages();
//   }, [conversationId]);

//   // Function to send a message
//   const sendMessage = useCallback(
//     async (content: string) => {
//       if (!conversationId || !content.trim()) {
//         throw new Error("Invalid message or conversation ID");
//       }

//       try {
//         const newMessage = await chatService.sendMessage(
//           conversationId,
//           content
//         );

//         // Update local messages state
//         if (newMessage && isMountedRef.current) {
//           setMessages((prev) => {
//             // Check if the message is already in the list
//             if (
//               prev.some(
//                 (m) => m._id === newMessage._id || m.id === newMessage.id
//               )
//             ) {
//               return prev;
//             }

//             const updatedMessages = [...prev, newMessage];
//             GLOBAL_CACHE.messages[conversationId] = updatedMessages;

//             // Update AsyncStorage cache
//             AsyncStorage.setItem(
//               `cached_messages_${conversationId}`,
//               JSON.stringify({
//                 data: updatedMessages,
//                 timestamp: Date.now(),
//               })
//             ).catch((e) => {
//               safeLogger.error("Error updating messages cache:", e);
//             });

//             return updatedMessages;
//           });
//         }

//         return newMessage;
//       } catch (err: any) {
//         safeLogger.error("Error sending message:", err);
//         throw new Error(err?.message || "Failed to send message");
//       }
//     },
//     [conversationId]
//   );

//   // Function to manually refresh messages
//   const refresh = useCallback(async () => {
//     if (!conversationId) return [];

//     setLoading(true);

//     try {
//       const result = await safeApiCall(
//         async () => await chatService.getMessages(conversationId),
//         `messages_${conversationId}`,
//         conversationId
//       );

//       if (result && isMountedRef.current) {
//         setMessages(result);
//         GLOBAL_CACHE.messages[conversationId] = result;
//         setError(null);

//         // Save to AsyncStorage cache
//         AsyncStorage.setItem(
//           `cached_messages_${conversationId}`,
//           JSON.stringify({
//             data: result,
//             timestamp: Date.now(),
//           })
//         ).catch((e) => {
//           safeLogger.error("Error saving messages to cache:", e);
//         });

//         return result;
//       }

//       return messages;
//     } catch (err: any) {
//       if (isMountedRef.current) {
//         setError(
//           new Error(
//             err?.message ||
//               `Failed to refresh messages for conversation ${conversationId}`
//           )
//         );
//       }
//       throw err;
//     } finally {
//       if (isMountedRef.current) {
//         setLoading(false);
//       }
//     }
//   }, [conversationId, messages]);

//   return {
//     messages,
//     loading,
//     error,
//     sendMessage,
//     refresh,
//   };
// };
