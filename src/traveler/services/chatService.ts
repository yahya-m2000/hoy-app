// /**
//  * Enhanced Chat service configuration with improved logging
//  *
//  * This extends the authentication and request setup with better logging
//  * to help troubleshoot API and auth issues
//  */
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { ChatConversation, ChatMessage } from "../../common/types/chat";
// import { User } from "@common//types/user";
// import * as mockChatService from "./mockChatService";
// import axiosInstance, { AxiosResponse } from "@common/services/axiosConfig";
// import { logger } from "@common/utils";
// import * as safeLogger from "@common/utils/log/safeLogger";
// import {
//   shouldAllowApiCall,
//   cacheApiResponse,
//   getCachedApiResponse,
//   trackApiError,
//   cleanupExpiredCache,
// } from "@common/utils/api/rateLimiting";

// // Flag to track if we're in fallback mode
// let usingFallbackMode = false;

// // Track ongoing API calls to prevent duplicate requests
// const ongoingApiCalls: Record<string, Promise<any>> = {};

// /**
//  * Create authenticated API instance with improved logging
//  */
// const getAuthenticatedApiInstance = async () => {
//   try {
//     const token = await AsyncStorage.getItem("accessToken");
//     if (!token) {
//       logger.error("Authentication failed: No token available");
//       throw new Error("No authentication token available");
//     }

//     // Get API URL - ensure proper formatting
//     let apiUrl =
//       Constants.expoConfig?.extra?.apiUrl ||
//       process.env.EXPO_PUBLIC_API_URL ||
//       "http://localhost:3000/api/v1";

//     // Ensure URL has proper protocol
//     if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
//       apiUrl = "http://" + apiUrl;
//     }

//     // Remove trailing slash for consistency
//     if (apiUrl.endsWith("/")) {
//       apiUrl = apiUrl.slice(0, -1);
//     }

//     logger.info(`Connecting to API at: ${apiUrl}`);

//     // Configure axios with authentication and proper settings
//     axiosInstance.defaults.baseURL = apiUrl;
//     axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     axiosInstance.defaults.headers.common["Content-Type"] = "application/json";

//     // Add request interceptor for logging
//     axiosInstance.interceptors.request.use((request) => {
//       const fullUrl = request.baseURL
//         ? `${request.baseURL}${request.url}`
//         : request.url;
//       logger.info(`REQUEST: ${request.method?.toUpperCase()} ${fullUrl}`);
//       return request;
//     });

//     // Add response interceptor for logging
//     axiosInstance.interceptors.response.use(
//       (response) => {
//         const fullUrl = response.config.url || "";
//         logger.info(
//           `RESPONSE: ${fullUrl} - Status: ${response.status} ${JSON.stringify(
//             response.data
//           ).substring(0, 100)}...`
//         );
//         return response;
//       },
//       (error) => {
//         const fullUrl = error.config?.url || "unknown";
//         if (error.response) {
//           logger.error(
//             `API ERROR: ${error.response.status} ${fullUrl}`,
//             error.response.data
//           );
//         } else {
//           logger.error(`API REQUEST FAILED: ${fullUrl} - ${error.message}`);
//         }
//         return Promise.reject(error);
//       }
//     );

//     return axiosInstance;
//   } catch (error) {
//     logger.error("Failed to create authenticated API instance:", error);
//     throw error;
//   }
// };

// /**
//  * Check if response is a 404 error indicating missing endpoint
//  */
// const isMissingEndpointError = (error: any): boolean => {
//   return error?.response?.status === 404;
// };

// /**
//  * Enable fallback mode for all future requests
//  */
// export const enableFallbackMode = () => {
//   if (!usingFallbackMode) {
//     console.log(
//       "⚠️ Chat API not available - enabling mock chat service fallback"
//     );
//     usingFallbackMode = true;

//     // Set the current user ID for the mock service
//     AsyncStorage.getItem("currentUserId").then((userId) => {
//       if (userId) {
//         mockChatService.setCurrentUserId(userId);
//       }
//     });
//   }
// };

// /**
//  * Execute an API call with duplicate prevention and proper error handling
//  */
// const executeApiCall = async <T>(
//   endpoint: string,
//   callFunction: () => Promise<T>,
//   useMockOnFallback: boolean = true,
//   mockFunction?: () => Promise<T>
// ): Promise<T> => {
//   // Check if we're already in fallback mode and have a mock function
//   if (usingFallbackMode && useMockOnFallback && mockFunction) {
//     return mockFunction();
//   }

//   // Check if this API call should be rate limited
//   if (!shouldAllowApiCall(endpoint)) {
//     // Get cached data if available
//     const cachedData = getCachedApiResponse(endpoint);
//     if (cachedData !== null) {
//       return cachedData as T;
//     }

//     // If no cache is available but we have a mock function, use it
//     if (useMockOnFallback && mockFunction) {
//       safeLogger.warn(`Using mock data for ${endpoint} during rate limiting`);
//       return mockFunction();
//     }

//     // Log warning about missing cache
//     safeLogger.warn(
//       `No cached data available for ${endpoint} during rate limiting`
//     );
//     throw new Error(`Rate limited: ${endpoint}`);
//   }

//   // Check if an identical call is already in progress
//   if (ongoingApiCalls[endpoint]) {
//     safeLogger.debug(`Using ongoing API call for ${endpoint}`);
//     return ongoingApiCalls[endpoint] as Promise<T>;
//   }

//   // Execute the API call
//   const apiCallPromise = callFunction()
//     .then((result) => {
//       // Cache successful responses
//       cacheApiResponse(endpoint, result);

//       // Return the result
//       return result;
//     })
//     .catch((error) => {
//       // Track the error for adaptive rate limiting
//       trackApiError(endpoint, error);

//       // If the endpoint is missing, switch to fallback mode
//       if (isMissingEndpointError(error) && useMockOnFallback && mockFunction) {
//         enableFallbackMode();
//         return mockFunction();
//       }

//       // Re-throw the error for the caller to handle
//       throw error;
//     })
//     .finally(() => {
//       // Remove this API call from the ongoing calls
//       delete ongoingApiCalls[endpoint];
//     });

//   // Store the promise for potential duplicate calls
//   ongoingApiCalls[endpoint] = apiCallPromise;

//   // Return the promise
//   return apiCallPromise;
// };

// /**
//  * Get all chat conversations for the current user
//  */
// export const getConversations = async (): Promise<ChatConversation[]> => {
//   return executeApiCall(
//     "/chat",
//     async () => {
//       const api = await getAuthenticatedApiInstance();
//       const response = await api.get("/chat");
//       const responseData = response.data as { data: ChatConversation[] };
//       return responseData.data || [];
//     },
//     true,
//     async () => mockChatService.getConversations()
//   );
// };

// /**
//  * Get a specific conversation by ID
//  */
// export const getConversation = async (
//   conversationId: string
// ): Promise<ChatConversation> => {
//   return executeApiCall(
//     `/chat/${conversationId}`,
//     async () => {
//       const api = await getAuthenticatedApiInstance();
//       const response: AxiosResponse<{ data: ChatConversation }> = await api.get(
//         `/chat/${conversationId}`
//       );
//       return response.data.data;
//     },
//     true,
//     async () => mockChatService.getConversation(conversationId)
//   );
// };

// /**
//  * Get all messages in a conversation
//  */
// export const getMessages = async (
//   conversationId: string,
//   limit = 50,
//   before?: Date
// ): Promise<ChatMessage[]> => {
//   return executeApiCall(
//     `/chat/${conversationId}/messages`,
//     async () => {
//       const api = await getAuthenticatedApiInstance();
//       let url = `/chat/${conversationId}/messages?limit=${limit}`;
//       if (before) {
//         url += `&before=${before.toISOString()}`;
//       }
//       const response: AxiosResponse<{ data: ChatMessage[] }> = await api.get(
//         url
//       );
//       return response.data.data || [];
//     },
//     true,
//     async () => mockChatService.getChatMessages(conversationId, limit, before)
//   );
// };

// /**
//  * Get all messages for a specific chat (alias for getMessages)
//  */
// export const getChatMessages = getMessages;

// /**
//  * Create a new conversation with a user
//  */
// export const createConversation = async (
//   recipientId: string,
//   message: string,
//   propertyId?: string
// ): Promise<ChatConversation> => {
//   return executeApiCall(
//     `/chat/new/${recipientId}`,
//     async () => {
//       const api = await getAuthenticatedApiInstance();

//       const payload: {
//         recipientId: string;
//         message: string;
//         propertyId?: string;
//       } = {
//         recipientId,
//         message,
//       };

//       if (propertyId) {
//         payload.propertyId = propertyId;
//       }

//       const response: AxiosResponse<{ data: ChatConversation }> =
//         await api.post("/chat", payload);
//       return response.data.data;
//     },
//     true,
//     async () =>
//       mockChatService.createConversation(recipientId, message, propertyId)
//   );
// };

// /**
//  * Send a message in a conversation
//  */
// export const sendMessage = async (
//   conversationId: string,
//   text: string,
//   attachment?: { url: string; type: "image" | "file"; name?: string }
// ): Promise<ChatMessage> => {
//   return executeApiCall(
//     `/chat/${conversationId}/messages/send`,
//     async () => {
//       const api = await getAuthenticatedApiInstance();

//       const payload: {
//         text: string;
//         attachment?: typeof attachment;
//       } = { text };

//       if (attachment) {
//         payload.attachment = attachment;
//       }
//       const response: AxiosResponse<{ data: ChatMessage }> = await api.post(
//         `/chat/${conversationId}/messages`,
//         payload
//       );
//       return response.data.data;
//     },
//     true,
//     async () => mockChatService.sendMessage(conversationId, text, attachment)
//   );
// };

// /**
//  * Mark all messages in a conversation as read
//  */
// export const markMessagesAsRead = async (
//   conversationId: string
// ): Promise<boolean> => {
//   return executeApiCall(
//     `/chat/${conversationId}/read`,
//     async () => {
//       const api = await getAuthenticatedApiInstance();
//       await api.post(`/chat/${conversationId}/read`);
//       return true;
//     },
//     true,
//     async () => mockChatService.markMessagesAsRead(conversationId)
//   );
// };

// /**
//  * Mark conversation as read (alias for markMessagesAsRead)
//  */
// export const markConversationAsRead = markMessagesAsRead;

// /**
//  * Get the total unread message count
//  */
// export const getUnreadMessageCount = async (): Promise<number> => {
//   return executeApiCall(
//     "/chat/unread/count",
//     async () => {
//       const api = await getAuthenticatedApiInstance();
//       const response: AxiosResponse<{ data: { count: number } }> =
//         await api.get("/chat/unread/count");
//       return response.data.data.count || 0;
//     },
//     true,
//     async () => mockChatService.getUnreadMessageCount()
//   );
// };

// /**
//  * Get unread message count for the current user (alias for getUnreadMessageCount)
//  */
// export const getUnreadCount = getUnreadMessageCount;

// /**
//  * Clean up any resources used by the chat service
//  */
// export const cleanup = async (): Promise<void> => {
//   // Clear ongoing API calls
//   for (const key in ongoingApiCalls) {
//     delete ongoingApiCalls[key];
//   }

//   // Clean up expired cache entries
//   cleanupExpiredCache();

//   safeLogger.debug("Chat service resources cleaned up");
// };
