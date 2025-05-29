// /**
//  * Conversation Screen for both Host and Traveler
//  * This screen displays individual conversation thread between users
//  */

// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRoute, useLocalSearchParams, useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";

// // Hooks & Context
// import { useTranslation } from "react-i18next";
// import { useTheme } from "@common-context/ThemeContext";
// import { useAuth } from "@common-context/AuthContext";
// // import { useChat } from "@traveler-hooks/useChat";

// // Types
// import { ChatMessage as Message } from "@common/types/chat";

// // Styles and Constants
// import { spacing } from "@common/constants/spacing";
// import { fontSize } from "@common/constants/typography";
// import { radius } from "@common/constants/radius";

// export default function ConversationScreen() {
//   const { t } = useTranslation();
//   const { theme, isDark } = useTheme();
//   const router = useRouter();
//   const route = useRoute();
//   const { id } = useLocalSearchParams();
//   const { user } = useAuth();
//   // const { getMessages, sendMessage, markAsRead } = useChat();

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [messageText, setMessageText] = useState("");
//   const [conversationDetails, setConversationDetails] = useState({
//     title: "",
//     hostName: "",
//     hostId: "",
//     propertyId: "",
//     propertyTitle: "",
//   });

//   const flatListRef = useRef<FlatList>(null);

//   // Load conversation messages
//   useEffect(() => {
//     const loadMessages = async () => {
//       if (!id) return;

//       try {
//         setLoading(true);
//         const conversationId = Array.isArray(id) ? id[0] : id;
//         const result = await getMessages(conversationId);

//         if (result.success && result.data) {
//           setMessages(result.data.messages || []);
//           setConversationDetails({
//             title: result.data.title || "",
//             hostName: result.data.hostName || "",
//             hostId: result.data.hostId || "",
//             propertyId: result.data.propertyId || "",
//             propertyTitle: result.data.propertyTitle || "",
//           });

//           // Mark conversation as read
//           markAsRead(conversationId);
//         }
//       } catch (error) {
//         console.error("Error loading messages:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadMessages();
//   }, [id]);
//   // Handle send message
//   const handleSendMessage = async () => {
//     alert("Messaging functionality is temporarily disabled");
//     return;

//     // if (!messageText.trim() || !id || !user) return;

//     // try {
//     //   setSending(true);
//     //   const conversationId = Array.isArray(id) ? id[0] : id;
//     //   const result = await sendMessage(conversationId, messageText.trim());

//     if (result.success && result.data) {
//       //     setMessages((prev) => [...prev, result.data]);
//       //     setMessageText("");
//       //     // Scroll to bottom
//       //     setTimeout(() => {
//       //       flatListRef.current?.scrollToEnd({ animated: true });
//       //     }, 100);
//       //   }
//       // } catch (error) {
//       //   console.error("Error sending message:", error);
//       // } finally {
//       //   setSending(false);
//       // }
//     }
//   };

//   // Message bubble renderer
//   const renderMessage = ({ item }: { item: Message }) => {
//     if (!item) return null;

//     const isUserMessage = item.senderId === user?.id;

//     return (
//       <View
//         style={[
//           styles.messageBubble,
//           isUserMessage ? styles.userMessage : styles.otherMessage,          {
//             backgroundColor: isUserMessage
//               ? theme.colors.primary
//               : isDark
//               ? theme.colors.grayPalette[800]
//               : theme.colors.grayPalette[200],
//           },
//         ]}
//       >
//         <Text
//           style={[
//             styles.messageText,
//             {
//               color: isUserMessage
//                 ? "#FFFFFF"                : isDark
//                 ? theme.colors.grayPalette[200]
//                 : theme.colors.grayPalette[800],
//             },
//           ]}
//         >
//           {item.content || ""}
//         </Text>
//         <Text
//           style={[
//             styles.messageTime,
//             {              color: isUserMessage
//                 ? "rgba(255, 255, 255, 0.7)"
//                 : isDark
//                 ? theme.colors.grayPalette[400]
//                 : theme.colors.grayPalette[500],
//             },
//           ]}
//         >
//           {item.createdAt
//             ? new Date(item.createdAt).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })
//             : ""}
//         </Text>
//       </View>
//     );
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <SafeAreaView
//         style={[
//           styles.container,          {
//             backgroundColor: isDark
//               ? theme.colors.grayPalette[900]
//               : theme.colors.grayPalette[50],
//             justifyContent: "center",
//             alignItems: "center",
//           },
//         ]}
//       >
//         <StatusBar style={isDark ? "light" : "dark"} />
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//         <Text
//           style={{
//             marginTop: spacing.md,
//             color: isDark ? theme.colors.grayPalette[400] : theme.colors.grayPalette[600],
//           }}
//         >
//           {t("chat.loading")}
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         {
//           backgroundColor: isDark
//             ? theme.colors.gray[900]
//             : theme.colors.gray[50],
//         },
//       ]}
//     >
//       <StatusBar style={isDark ? "light" : "dark"} />

//       {/* Header */}
//       <View
//         style={[
//           styles.header,
//           {
//             borderBottomColor: isDark
//               ? theme.colors.gray[800]
//               : theme.colors.gray[200],
//           },
//         ]}
//       >
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <Ionicons
//             name="chevron-back"
//             size={24}
//             color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
//           />
//         </TouchableOpacity>

//         <View style={styles.headerTitleContainer}>
//           <Text
//             style={[
//               styles.headerTitle,
//               {
//                 color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
//               },
//             ]}
//             numberOfLines={1}
//           >
//             {conversationDetails.hostName || "Conversation"}
//           </Text>
//           {conversationDetails.propertyTitle && (
//             <Text
//               style={[
//                 styles.headerSubtitle,
//                 {
//                   color: isDark
//                     ? theme.colors.gray[400]
//                     : theme.colors.gray[600],
//                 },
//               ]}
//               numberOfLines={1}
//             >
//               {conversationDetails.propertyTitle}
//             </Text>
//           )}
//         </View>

//         <TouchableOpacity style={styles.infoButton}>
//           <Ionicons
//             name="information-circle-outline"
//             size={24}
//             color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Messages List */}
//       <KeyboardAvoidingView
//         style={styles.keyboardAvoidingView}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//       >
//         {" "}
//         <FlatList
//           ref={flatListRef}
//           data={messages || []}
//           renderItem={renderMessage}
//           keyExtractor={(item) => item?.id || String(Math.random())}
//           contentContainerStyle={styles.messageList}
//           inverted={false}
//           onLayout={() => {
//             if (messages && messages.length > 0) {
//               flatListRef.current?.scrollToEnd({ animated: false });
//             }
//           }}
//         />
//         {/* Message Input */}
//         <View
//           style={[
//             styles.inputContainer,
//             {
//               backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
//               borderTopColor: isDark
//                 ? theme.colors.gray[700]
//                 : theme.colors.gray[200],
//             },
//           ]}
//         >
//           <TextInput
//             style={[
//               styles.input,
//               {
//                 backgroundColor: isDark
//                   ? theme.colors.gray[700]
//                   : theme.colors.gray[200],
//                 color: isDark ? theme.white : theme.colors.gray[900],
//               },
//             ]}
//             placeholder={t("chat.typePlaceholder")}
//             placeholderTextColor={
//               isDark ? theme.colors.gray[400] : theme.colors.gray[500]
//             }
//             value={messageText}
//             onChangeText={setMessageText}
//             multiline
//           />

//           <TouchableOpacity
//             style={[
//               styles.sendButton,
//               {
//                 backgroundColor: theme.colors.primary[500],
//                 opacity: messageText.trim() ? 1 : 0.5,
//               },
//             ]}
//             onPress={handleSendMessage}
//             disabled={!messageText.trim() || sending}
//           >
//             {sending ? (
//               <ActivityIndicator size="small" color="#FFFFFF" />
//             ) : (
//               <Ionicons name="send" size={18} color="#FFFFFF" />
//             )}
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.sm,
//     borderBottomWidth: 1,
//   },
//   backButton: {
//     padding: spacing.xs,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     marginHorizontal: spacing.sm,
//   },
//   headerTitle: {
//     fontSize: fontSize.md,
//     fontWeight: "600",
//   },
//   headerSubtitle: {
//     fontSize: fontSize.sm,
//     marginTop: 2,
//   },
//   infoButton: {
//     padding: spacing.xs,
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//   },
//   messageList: {
//     flexGrow: 1,
//     padding: spacing.md,
//   },
//   messageBubble: {
//     maxWidth: "80%",
//     borderRadius: radius.md,
//     padding: spacing.sm,
//     marginBottom: spacing.sm,
//   },
//   userMessage: {
//     alignSelf: "flex-end",
//   },
//   otherMessage: {
//     alignSelf: "flex-start",
//   },
//   messageText: {
//     fontSize: fontSize.md,
//   },
//   messageTime: {
//     fontSize: fontSize.xs,
//     alignSelf: "flex-end",
//     marginTop: spacing.xs,
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
//     padding: spacing.sm,
//     paddingTop: spacing.sm,
//     minHeight: 40,
//     maxHeight: 100,
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     marginLeft: spacing.sm,
//   },
// });
