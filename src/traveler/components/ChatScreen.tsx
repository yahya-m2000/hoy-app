// import React, { useEffect, useRef, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import { useTheme } from "@common/context/ThemeContext";
// import { useTranslation } from "react-i18next";
// import { Ionicons } from "@expo/vector-icons";
// import { useAuth } from "@common/context/AuthContext";
// import { useChat } from "@common/context/ChatContext";
// import { ChatMessage as FrontendChatMessage } from "@common/types/chat";
// // import { ChatMessage as SocketChatMessage } from "@common/services/chatSocketService";
// import { fontSize } from "@common/constants/typography";
// import { spacing } from "@common/constants/spacing";
// import { radius } from "@common/constants/radius";
// import { getRelativeTime } from "@common/utils/formatting/dateUtils";
// // import { chatService } from "@common/services/chatService";

// // Helper function to convert between message types
// const convertSocketToFrontendMessage = (
//   message: SocketChatMessage
// ): FrontendChatMessage => {
//   return {
//     _id: message.id || "",
//     chatId: message.chatId,
//     senderId: message.senderId,
//     receiverId: message.receiverId,
//     content: message.content,
//     timestamp: message.timestamp,
//     isRead: message.isRead,
//     createdAt: message.createdAt,
//     updatedAt: message.updatedAt,
//   };
// };

// interface ChatScreenProps {
//   chatId: string;
// }

// const ChatScreen = ({ chatId }: ChatScreenProps) => {
//   const { theme } = useTheme();
//   const { t } = useTranslation();
//   const { user } = useAuth();
//   const flatListRef = useRef<FlatList>(null);
//   const { markChatAsRead, sendMessage, joinChatRoom, leaveChatRoom } =
//     useChat();

//   const [messageText, setMessageText] = useState("");
//   const [messages, setMessages] = useState<FrontendChatMessage[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSending, setIsSending] = useState(false);
//   // Auto-scroll to the latest message - wrapped in useCallback to avoid dependency issues
//   const scrollToBottom = useCallback(() => {
//     if (flatListRef.current && messages.length > 0) {
//       flatListRef.current.scrollToEnd({ animated: true });
//     }
//   }, [messages.length]);

//   // Handle sending a new message
//   const handleSendMessage = async () => {
//     if (!messageText.trim() || isSending) return;

//     setIsSending(true);
//     try {
//       await sendMessage(chatId, messageText.trim());
//       setMessageText("");
//     } catch (error) {
//       console.error("Failed to send message:", error);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // Initialize chat on component mount
//   useEffect(() => {
//     // Reference to the message handler function
//     let messageHandler: ((message: SocketChatMessage) => void) | null = null;

//     const setupChat = async () => {
//       setIsLoading(true);
//       try {
//         // Join the chat room
//         await joinChatRoom(chatId);

//         // Define message handler
//         messageHandler = (message: SocketChatMessage) => {
//           const frontendMessage = convertSocketToFrontendMessage(message);
//           if (frontendMessage.chatId === chatId) {
//             setMessages((prev) => {
//               // Check if message already exists to avoid duplicates
//               const exists = prev.some((m) => m._id === frontendMessage._id);
//               if (exists) return prev;
//               return [...prev, frontendMessage].sort(
//                 (a, b) =>
//                   new Date(a.timestamp).getTime() -
//                   new Date(b.timestamp).getTime()
//               );
//             });

//             // Auto-scroll to bottom on new message
//             setTimeout(() => scrollToBottom(), 100);

//             // Mark message as read if it's from the other person
//             if (frontendMessage.senderId !== user?.id) {
//               markChatAsRead(chatId);
//             }
//           }
//         };

//         // Add message listener
//         chatService.addMessageListener(chatId, messageHandler);

//         // Load initial messages
//         const initialMessages = await chatService.getChatMessages(chatId);
//         // Convert socket messages to frontend messages
//         const convertedMessages = initialMessages.map(
//           convertSocketToFrontendMessage
//         );
//         setMessages(convertedMessages);

//         // Mark all messages as read
//         markChatAsRead(chatId);
//       } catch (error) {
//         console.error("Error setting up chat:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     setupChat();

//     // Clean up on unmount
//     return () => {
//       if (chatId && messageHandler) {
//         chatService.removeMessageListener(chatId, messageHandler);
//         leaveChatRoom(chatId);
//       }
//     };
//   }, [
//     chatId,
//     joinChatRoom,
//     leaveChatRoom,
//     markChatAsRead,
//     user?.id,
//     scrollToBottom,
//   ]);

//   // Render a message
//   const renderMessage = ({ item }: { item: FrontendChatMessage }) => {
//     const isFromMe = item.senderId === user?.id;

//     return (
//       <View style={styles.messageContainer}>
//         <View
//           style={[
//             styles.messageBubble,
//             isFromMe
//               ? [styles.myMessage, { backgroundColor: theme.primary }]
//               : [
//                   styles.otherMessage,
//                   { backgroundColor: theme.colors.gray[100] },
//                 ],
//           ]}
//         >
//           <Text
//             style={[
//               styles.messageText,
//               { color: isFromMe ? theme.white : theme.black },
//             ]}
//           >
//             {item.content}
//           </Text>
//           <Text
//             style={[
//               styles.timestamp,
//               {
//                 color: theme.colors.gray[500],
//               },
//             ]}
//           >
//             {getRelativeTime(item.timestamp)}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   // If loading, show a spinner
//   if (isLoading) {
//     return (
//       <View
//         style={[styles.centered, { backgroundColor: theme.colors.gray[50] }]}
//       >
//         <ActivityIndicator size="large" color={theme.primary} />
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container, { backgroundColor: theme.colors.gray[50] }]}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//     >
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item._id}
//         contentContainerStyle={styles.messagesContainer}
//         onContentSizeChange={scrollToBottom}
//         onLayout={scrollToBottom}
//       />

//       <View
//         style={[
//           styles.inputContainer,
//           {
//             backgroundColor: theme.white,
//             borderTopColor: theme.colors.gray[200],
//           },
//         ]}
//       >
//         <TextInput
//           style={[
//             styles.input,
//             {
//               backgroundColor: theme.colors.gray[50],
//               color: theme.black,
//               borderColor: theme.colors.gray[200],
//             },
//           ]}
//           value={messageText}
//           onChangeText={setMessageText}
//           placeholder={t("chat.typeSomething")}
//           placeholderTextColor={theme.colors.gray[400]}
//           multiline
//         />

//         <TouchableOpacity
//           onPress={handleSendMessage}
//           disabled={!messageText.trim() || isSending}
//           style={[
//             styles.sendButton,
//             {
//               backgroundColor: theme.primary,
//               opacity: messageText.trim() ? 1 : 0.5,
//             },
//           ]}
//         >
//           {isSending ? (
//             <ActivityIndicator size="small" color={theme.white} />
//           ) : (
//             <Ionicons name="send" size={18} color={theme.white} />
//           )}
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   messagesContainer: {
//     padding: spacing.md,
//     flexGrow: 1,
//   },
//   messageContainer: {
//     marginBottom: spacing.md,
//     maxWidth: "80%",
//   },
//   myMessageWrapper: {
//     alignSelf: "flex-end",
//     alignItems: "flex-end",
//   },
//   otherMessageWrapper: {
//     alignSelf: "flex-start",
//     alignItems: "flex-start",
//   },
//   messageBubble: {
//     borderRadius: radius.lg,
//     padding: spacing.sm,
//     marginBottom: spacing.xs,
//   },
//   myMessage: {
//     borderBottomRightRadius: radius.xs,
//   },
//   otherMessage: {
//     borderBottomLeftRadius: radius.xs,
//   },
//   messageText: {
//     fontSize: fontSize.md,
//   },
//   timestamp: {
//     fontSize: fontSize.xs,
//     marginTop: 2,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: spacing.sm,
//     borderTopWidth: 1,
//   },
//   input: {
//     flex: 1,
//     borderRadius: radius.md,
//     borderWidth: 1,
//     padding: spacing.sm,
//     maxHeight: 100,
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: spacing.sm,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default ChatScreen;
