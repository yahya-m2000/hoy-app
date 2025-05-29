// /**
//  * Mock Chat Service
//  *
//  * Provides fake data for when the real chat service is unavailable.
//  * This is used as a fallback when the chat API endpoints are not accessible.
//  */

// import { ChatConversation, ChatMessage } from "../../common/types/chat";
// import * as safeLogger from "@common/utils/log/safeLogger";

// // Simulated database of chat conversations
// const mockConversations: ChatConversation[] = [];
// // Simulated database of chat messages for each conversation
// const mockMessages: Record<string, ChatMessage[]> = {};
// // Stores the ID of the current user
// let currentUserId: string = "user123";

// // Generate some fake conversations if needed
// const ensureMockData = () => {
//   if (mockConversations.length === 0) {
//     // Generate some fake conversations
//     const hosts = [
//       {
//         id: "host1",
//         name: "Sarah Johnson",
//         avatar: "https://randomuser.me/api/portraits/women/32.jpg",
//       },
//       {
//         id: "host2",
//         name: "Michael Chen",
//         avatar: "https://randomuser.me/api/portraits/men/45.jpg",
//       },
//       {
//         id: "host3",
//         name: "Emma Rodriguez",
//         avatar: "https://randomuser.me/api/portraits/women/67.jpg",
//       },
//     ];

//     hosts.forEach((host, index) => {
//       const conversationId = `conv${index + 1}`;
//       const lastMessageTime = new Date(
//         Date.now() - index * 24 * 60 * 60 * 1000
//       ); // Each one is a day older

//       // Create conversation
//       const conversation: ChatConversation = {
//         id: conversationId,
//         participants: [
//           {
//             id: currentUserId,
//             name: "You",
//             avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
//           },
//           { id: host.id, name: host.name, avatar: host.avatar },
//         ],
//         lastMessage: {
//           id: `msg${index}_last`,
//           conversationId,
//           content:
//             index === 0
//               ? "Looking forward to your stay!"
//               : index === 1
//               ? "Let me know if you need anything else."
//               : "Thank you for choosing my property.",
//           senderId: index % 2 === 0 ? host.id : currentUserId,
//           timestamp: lastMessageTime.toISOString(),
//           isRead: index !== 0,
//           status: "delivered",
//         },
//         unreadCount: index === 0 ? 1 : 0,
//         updatedAt: lastMessageTime.toISOString(),
//         property: {
//           id: `prop${index + 1}`,
//           name:
//             index === 0
//               ? "Luxury Downtown Condo"
//               : index === 1
//               ? "Beachfront Villa"
//               : "Mountain Cabin Retreat",
//           image: `https://source.unsplash.com/featured/?property,${index}`,
//         },
//       };

//       mockConversations.push(conversation);

//       // Create messages for this conversation
//       const messages: ChatMessage[] = [];
//       // Add a welcome message
//       messages.push({
//         id: `msg${conversationId}_1`,
//         conversationId,
//         content: `Welcome! I'm ${host.name}, the host of ${conversation.property.name}. I'm looking forward to hosting you!`,
//         senderId: host.id,
//         timestamp: new Date(
//           lastMessageTime.getTime() - 3 * 60 * 60 * 1000
//         ).toISOString(), // 3 hours before last message
//         isRead: true,
//         status: "delivered",
//       });

//       // Add a guest response
//       messages.push({
//         id: `msg${conversationId}_2`,
//         conversationId,
//         content:
//           "Thank you! I'm excited about my stay. Could you tell me about check-in procedures?",
//         senderId: currentUserId,
//         timestamp: new Date(
//           lastMessageTime.getTime() - 2 * 60 * 60 * 1000
//         ).toISOString(), // 2 hours before last message
//         isRead: true,
//         status: "delivered",
//       });

//       // Add host response about check-in
//       messages.push({
//         id: `msg${conversationId}_3`,
//         conversationId,
//         content:
//           "Certainly! Check-in is at 3 PM. You can use the keypad at the front door. I'll send you the code on the day of your arrival.",
//         senderId: host.id,
//         timestamp: new Date(
//           lastMessageTime.getTime() - 1 * 60 * 60 * 1000
//         ).toISOString(), // 1 hour before last message
//         isRead: true,
//         status: "delivered",
//       });

//       // Add the last message (same as the one in the conversation object)
//       messages.push({
//         id: `msg${index}_last`,
//         conversationId,
//         content:
//           index === 0
//             ? "Looking forward to your stay!"
//             : index === 1
//             ? "Let me know if you need anything else."
//             : "Thank you for choosing my property.",
//         senderId: index % 2 === 0 ? host.id : currentUserId,
//         timestamp: lastMessageTime.toISOString(),
//         isRead: index !== 0,
//         status: "delivered",
//       });

//       mockMessages[conversationId] = messages;
//     });

//     safeLogger.info("Generated mock chat data");
//   }
// };

// /**
//  * Set the current user ID
//  */
// export const setCurrentUserId = (userId: string) => {
//   currentUserId = userId;
//   safeLogger.info(`Mock chat service: Set current user ID to ${userId}`);
// };

// /**
//  * Get all chat conversations
//  */
// export const getConversations = (): ChatConversation[] => {
//   ensureMockData();
//   safeLogger.info(
//     `Mock chat service: Returning ${mockConversations.length} conversations`
//   );
//   return [...mockConversations];
// };

// /**
//  * Get a specific conversation by ID
//  */
// export const getConversation = (conversationId: string): ChatConversation => {
//   ensureMockData();
//   const conversation = mockConversations.find((c) => c.id === conversationId);

//   if (!conversation) {
//     throw new Error(`Conversation with ID ${conversationId} not found`);
//   }

//   safeLogger.info(
//     `Mock chat service: Returning conversation ${conversationId}`
//   );
//   return { ...conversation };
// };

// /**
//  * Send a message in a conversation
//  */
// export const sendMessage = (
//   conversationId: string,
//   content: string
// ): ChatMessage => {
//   ensureMockData();
//   const conversation = mockConversations.find((c) => c.id === conversationId);

//   if (!conversation) {
//     throw new Error(`Conversation with ID ${conversationId} not found`);
//   }

//   // Create new message
//   const newMessage: ChatMessage = {
//     id: `msg_${Date.now()}`,
//     conversationId,
//     content,
//     senderId: currentUserId,
//     timestamp: new Date().toISOString(),
//     isRead: false,
//     status: "delivered",
//   };

//   // Add to conversation messages
//   if (!mockMessages[conversationId]) {
//     mockMessages[conversationId] = [];
//   }
//   mockMessages[conversationId].push(newMessage);

//   // Update conversation's last message
//   conversation.lastMessage = newMessage;
//   conversation.updatedAt = newMessage.timestamp;

//   safeLogger.info(
//     `Mock chat service: Sent message in conversation ${conversationId}`
//   );
//   return newMessage;
// };

// /**
//  * Get messages for a conversation
//  */
// export const getMessages = (conversationId: string): ChatMessage[] => {
//   ensureMockData();
//   const messages = mockMessages[conversationId] || [];

//   safeLogger.info(
//     `Mock chat service: Returning ${messages.length} messages for conversation ${conversationId}`
//   );
//   return [...messages];
// };

// /**
//  * Mark a conversation as read
//  */
// export const markConversationAsRead = (conversationId: string): boolean => {
//   ensureMockData();
//   const conversation = mockConversations.find((c) => c.id === conversationId);

//   if (!conversation) {
//     safeLogger.error(
//       `Mock chat service: Conversation ${conversationId} not found`
//     );
//     return false;
//   }

//   // Mark conversation as read
//   conversation.unreadCount = 0;

//   // Mark all messages in this conversation as read
//   if (mockMessages[conversationId]) {
//     mockMessages[conversationId].forEach((message) => {
//       if (message.senderId !== currentUserId) {
//         message.isRead = true;
//       }
//     });
//   }

//   safeLogger.info(
//     `Mock chat service: Marked conversation ${conversationId} as read`
//   );
//   return true;
// };

// /**
//  * Mark a specific message as read
//  */
// export const markMessageAsRead = (messageId: string): boolean => {
//   ensureMockData();

//   // Find the message in all conversations
//   for (const conversationId in mockMessages) {
//     const messageIndex = mockMessages[conversationId].findIndex(
//       (m) => m.id === messageId
//     );

//     if (messageIndex !== -1) {
//       // Mark message as read
//       mockMessages[conversationId][messageIndex].isRead = true;

//       // Recalculate unread count for this conversation
//       const conversation = mockConversations.find(
//         (c) => c.id === conversationId
//       );
//       if (conversation) {
//         conversation.unreadCount = mockMessages[conversationId].filter(
//           (m) => m.senderId !== currentUserId && !m.isRead
//         ).length;
//       }

//       safeLogger.info(`Mock chat service: Marked message ${messageId} as read`);
//       return true;
//     }
//   }

//   safeLogger.error(`Mock chat service: Message ${messageId} not found`);
//   return false;
// };

// /**
//  * Get unread message count across all conversations
//  */
// export const getUnreadCount = (): number => {
//   ensureMockData();

//   const count = mockConversations.reduce((total, conversation) => {
//     return total + (conversation.unreadCount || 0);
//   }, 0);

//   safeLogger.info(`Mock chat service: Returning unread count of ${count}`);
//   return count;
// };
