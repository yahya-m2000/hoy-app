// import React, { useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import { useChat } from "@common/context/ChatContext";
// import { useAuth } from "@common/context/AuthContext";
// import { Chat } from "@common/types/chat";
// import { useTheme } from "@common/context/ThemeContext";
// import { useTranslation } from "react-i18next";
// import { getRelativeTime } from "@common/utils/formatting/dateUtils";
// import { router } from "expo-router";
// import { spacing } from "@common/constants/spacing";
// import { radius } from "@common/constants/radius";
// import { fontSize } from "@common/constants/typography";

// const ChatList = () => {
//   const { chats, isLoading, refreshChats } = useChat();
//   const { user } = useAuth();
//   const { theme } = useTheme();
//   const { t } = useTranslation();

//   useEffect(() => {
//     refreshChats();
//   }, [refreshChats]);

//   const getChatDisplayInfo = (chat: Chat) => {
//     if (!user) return null;

//     // Determine if current user is host or traveler
//     const isHost = chat.hostId._id === user.id;
//     const otherUser = isHost ? chat.travelerId : chat.hostId;

//     return {
//       title: `${otherUser.firstName} ${otherUser.lastName}`,
//       subtitle: chat.propertyId.title,
//       image: otherUser.profilePicture,
//       otherUserId: otherUser._id,
//     };
//   };

//   const handleChatPress = (chat: Chat) => {
//     router.push(`/(tabs)/chat/${chat.chatId}`);
//   };

//   const renderChatItem = ({ item }: { item: Chat }) => {
//     const chatInfo = getChatDisplayInfo(item);
//     if (!chatInfo) return null;

//     return (
//       <TouchableOpacity
//         style={[
//           styles.chatItem,
//           {
//             backgroundColor: theme.white,
//             borderBottomColor: theme.colors.gray[200],
//           },
//         ]}
//         onPress={() => handleChatPress(item)}
//       >
//         {chatInfo.image ? (
//           <Image
//             source={{ uri: chatInfo.image }}
//             style={styles.avatar}
//             resizeMode="cover"
//           />
//         ) : (
//           <View
//             style={[
//               styles.avatar,
//               styles.avatarPlaceholder,
//               { backgroundColor: theme.primary },
//             ]}
//           >
//             <Text style={[styles.avatarText, { color: theme.white }]}>
//               {chatInfo.title.charAt(0).toUpperCase()}
//             </Text>
//           </View>
//         )}

//         <View style={styles.contentContainer}>
//           <View style={styles.headerContainer}>
//             <Text
//               style={[styles.name, { color: theme.black }]}
//               numberOfLines={1}
//             >
//               {chatInfo.title}
//             </Text>
//             <Text style={[styles.time, { color: theme.colors.gray[500] }]}>
//               {getRelativeTime(new Date(item.lastMessageTimestamp))}
//             </Text>
//           </View>

//           <View style={styles.messageContainer}>
//             <Text
//               style={[styles.propertyName, { color: theme.colors.gray[500] }]}
//               numberOfLines={1}
//             >
//               {chatInfo.subtitle}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (isLoading && chats.length === 0) {
//     return (
//       <View
//         style={[styles.centered, { backgroundColor: theme.colors.gray[50] }]}
//       >
//         <ActivityIndicator size="large" color={theme.primary} />
//       </View>
//     );
//   }

//   if (chats.length === 0 && !isLoading) {
//     return (
//       <View
//         style={[styles.centered, { backgroundColor: theme.colors.gray[50] }]}
//       >
//         <Text style={{ color: theme.black }}>{t("chat.noConversations")}</Text>
//       </View>
//     );
//   }

//   return (
//     <FlatList
//       data={chats}
//       keyExtractor={(item) => item.chatId}
//       renderItem={renderChatItem}
//       contentContainerStyle={[
//         styles.listContainer,
//         { backgroundColor: theme.colors.gray[50] },
//       ]}
//       refreshControl={
//         <RefreshControl
//           refreshing={isLoading}
//           onRefresh={refreshChats}
//           colors={["#1570EF"]}
//           tintColor={theme.primary}
//         />
//       }
//     />
//   );
// };

// const styles = StyleSheet.create({
//   listContainer: {
//     flexGrow: 1,
//     paddingBottom: spacing.lg,
//   },
//   chatItem: {
//     flexDirection: "row",
//     padding: spacing.md,
//     borderBottomWidth: 1,
//     alignItems: "center",
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: spacing.md,
//   },
//   avatarPlaceholder: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarText: {
//     fontSize: fontSize.lg,
//     fontWeight: "bold",
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   headerContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: spacing.xs,
//   },
//   name: {
//     fontSize: fontSize.md,
//     fontWeight: "bold",
//     flex: 1,
//     marginRight: spacing.sm,
//   },
//   time: {
//     fontSize: fontSize.sm,
//   },
//   messageContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   propertyName: {
//     fontSize: fontSize.sm,
//     flex: 1,
//   },
//   unreadBadge: {
//     backgroundColor: "red",
//     borderRadius: radius.full,
//     width: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: spacing.sm,
//   },
//   unreadCount: {
//     color: "white",
//     fontSize: fontSize.xs,
//     fontWeight: "bold",
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default ChatList;
