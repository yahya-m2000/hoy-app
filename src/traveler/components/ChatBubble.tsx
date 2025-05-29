// /**
//  * ChatBubble component for displaying chat messages
//  * Shows message text, timestamp, read status, and attachment if any
//  */

// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useTheme } from "@common/context/ThemeContext";
// import { ChatMessage } from "@common/types/chat";
// import { getRelativeTime } from "@common/utils/formatting/dateUtils";
// import { spacing } from "@common/constants/spacing";
// import { radius } from "@common/constants/radius";
// import { fontSize } from "@common/constants/typography";
// import Avatar from "@common/components/Avatar";

// interface ChatBubbleProps {
//   message: ChatMessage;
//   isOwnMessage: boolean;
//   showAvatar?: boolean;
//   onPress?: () => void;
//   onLongPress?: () => void;
//   showStatus?: boolean;
//   senderName?: string;
//   isLastInGroup?: boolean;
// }

// const ChatBubble: React.FC<ChatBubbleProps> = ({
//   message,
//   isOwnMessage,
//   showAvatar = true,
//   onPress,
//   onLongPress,
//   showStatus = true,
//   senderName,
//   isLastInGroup = true,
// }) => {
//   const { theme, isDark } = useTheme();

//   // Format the message timestamp
//   const formattedTime = React.useMemo(() => {
//     return getRelativeTime(new Date(message.createdAt));
//   }, [message.createdAt]);

//   // Determine if the message has an image attachment
//   const hasImageAttachment = message.attachment?.type === "image";

//   // Determine if the message has a file attachment
//   const hasFileAttachment = message.attachment?.type === "file";

//   // Get file name for file attachments
//   const getFileName = () => {
//     if (!message.attachment?.name) {
//       return "File";
//     }

//     const name = message.attachment.name;
//     return name.length > 20 ? name.substring(0, 17) + "..." : name;
//   };

//   return (
//     <View
//       style={[
//         styles.container,
//         isOwnMessage
//           ? styles.ownMessageContainer
//           : styles.otherMessageContainer,
//         !isLastInGroup && { marginBottom: spacing.xs },
//       ]}
//     >
//       {!isOwnMessage && showAvatar && (
//         <View style={styles.avatarContainer}>
//           <Avatar
//             size="sm"
//             source={message.sender?.avatarUrl}
//             name={message.sender?.firstName || senderName || ""}
//           />
//         </View>
//       )}

//       <TouchableOpacity
//         style={[
//           styles.bubble,
//           isOwnMessage
//             ? [styles.ownBubble, { backgroundColor: theme.colors.primary }]
//             : [
//                 styles.otherBubble,
//                 {
//                   backgroundColor: isDark
//                     ? theme.colors.gray[800]
//                     : theme.colors.gray[100],
//                 },
//               ],
//           (hasImageAttachment || hasFileAttachment) && styles.mediaBubble,
//         ]}
//         activeOpacity={0.9}
//         onPress={onPress}
//         onLongPress={onLongPress}
//       >
//         {/* If there's a sender name and it's not own message, display it */}
//         {!isOwnMessage && senderName && (
//           <Text
//             style={[styles.senderName, { color: theme.colors.primary }]}
//           >
//             {senderName}
//           </Text>
//         )}

//         {/* Display image attachment if any */}
//         {hasImageAttachment && (
//           <Image
//             source={{ uri: message.attachment?.url }}
//             style={styles.imageAttachment}
//             resizeMode="cover"
//           />
//         )}

//         {/* Display file attachment if any */}
//         {hasFileAttachment && (
//           <View
//             style={[
//               styles.fileAttachment,
//               {
//                 backgroundColor: isDark
//                   ? theme.colors.gray[700]
//                   : theme.colors.gray[200],
//               },
//             ]}
//           >
//             <Ionicons
//               name="document-outline"
//               size={20}
//               color={theme.colors.primary}
//             />
//             <Text
//               style={[
//                 styles.fileName,
//                 { color: isDark ? "#FFFFFF" : theme.colors.gray[900] },
//               ]}
//             >
//               {getFileName()}
//             </Text>
//           </View>
//         )}

//         {/* Display message text */}
//         {message.text && (
//           <Text
//             style={[
//               styles.messageText,
//               {
//                 color: isOwnMessage
//                   ? "#FFFFFF"
//                   : isDark
//                   ? "#FFFFFF"
//                   : theme.colors.gray[900],
//               },
//             ]}
//           >
//             {message.text}
//           </Text>
//         )}

//         {/* Display message timestamp and read status */}
//         {showStatus && (
//           <View style={styles.statusContainer}>
//             <Text
//               style={[
//                 styles.timeText,
//                 {
//                   color: isOwnMessage
//                     ? "rgba(255, 255, 255, 0.7)"
//                     : isDark
//                     ? theme.colors.gray[400]
//                     : theme.colors.gray[500],
//                 },
//               ]}
//             >
//               {formattedTime}
//             </Text>

//             {isOwnMessage && (
//               <Ionicons
//                 name={message.read ? "checkmark-done" : "checkmark"}
//                 size={14}
//                 color={
//                   message.read
//                     ? theme.colors.success[300]
//                     : "rgba(255, 255, 255, 0.7)"
//                 }
//                 style={styles.readIcon}
//               />
//             )}
//           </View>
//         )}
//       </TouchableOpacity>

//       {isOwnMessage && showAvatar && (
//         <View style={styles.avatarContainer}>
//           {/* Empty view for layout balance */}
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     marginVertical: spacing.xxs,
//     paddingHorizontal: spacing.sm,
//   },
//   ownMessageContainer: {
//     justifyContent: "flex-end",
//   },
//   otherMessageContainer: {
//     justifyContent: "flex-start",
//   },
//   avatarContainer: {
//     width: 32,
//     height: 32,
//     marginHorizontal: spacing.xs,
//     alignSelf: "flex-end",
//   },
//   bubble: {
//     padding: spacing.sm,
//     borderRadius: radius.lg,
//     maxWidth: "80%",
//   },
//   ownBubble: {
//     borderBottomRightRadius: radius.xs,
//     marginLeft: spacing.lg,
//   },
//   otherBubble: {
//     borderBottomLeftRadius: radius.xs,
//     marginRight: spacing.lg,
//   },
//   mediaBubble: {
//     padding: spacing.xs,
//   },
//   messageText: {
//     fontSize: fontSize.md,
//     fontWeight: "400",
//   },
//   statusContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-end",
//     marginTop: spacing.xxs,
//   },
//   timeText: {
//     fontSize: fontSize.xs,
//   },
//   readIcon: {
//     marginLeft: spacing.xxs,
//   },
//   imageAttachment: {
//     width: "100%",
//     height: 150,
//     borderRadius: radius.md,
//     marginBottom: spacing.xs,
//   },
//   fileAttachment: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: spacing.xs,
//     borderRadius: radius.md,
//     marginBottom: spacing.xs,
//   },
//   fileName: {
//     fontSize: fontSize.sm,
//     marginLeft: spacing.xs,
//     flex: 1,
//   },
//   senderName: {
//     fontSize: fontSize.sm,
//     fontWeight: "600",
//     marginBottom: spacing.xxs,
//   },
// });

// export default ChatBubble;
