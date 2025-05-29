// import React from "react";
// import { Text, TouchableOpacity, StyleSheet } from "react-native";
// import { useTheme } from "src/common/context/ThemeContext";
// import { useTranslation } from "react-i18next";
// import { Ionicons } from "@expo/vector-icons";
// import { useChat } from "src/common/context/ChatContext";
// import { useAuth } from "src/common/context/AuthContext";
// import { router } from "expo-router";
// import { fontSize } from "@common/constants/typography";
// import { spacing } from "@common/constants/spacing";
// import { radius } from "@common/constants/radius";

// interface ChatWithHostButtonProps {
//   propertyId: string;
//   hostId: string;
//   propertyTitle?: string;
// }

// const ChatWithHostButton = ({
//   propertyId,
//   hostId,
//   propertyTitle,
// }: ChatWithHostButtonProps) => {
//   const { theme } = useTheme();
//   const { t } = useTranslation();
//   // const { getOrCreateChat } = useChat();
//   const { user } = useAuth();

//   const handleChatWithHost = async () => {
//     if (!user) {
//       // Redirect to login if user is not authenticated
//       router.push("/login");
//       return;
//     }

//     try {
//       // Get or create chat between user and host
//       const chat = await getOrCreateChat(hostId, user.id, propertyId);

//       if (chat) {
//         // Navigate to chat screen
//         router.push(`/(tabs)/chat/${chat.chatId}`);
//       } else {
//         console.error("Failed to create chat");
//       }
//     } catch (error) {
//       console.error("Error creating chat:", error);
//     }
//   };

//   return (
//     <TouchableOpacity
//       style={[styles.button, { backgroundColor: theme.colors.primary }]}
//       onPress={handleChatWithHost}
//     >
//       <Ionicons
//         name="chatbubble-outline"
//         size={20}
//         color={theme.colors.white}
//       />
//       <Text style={[styles.buttonText, { color: theme.colors.white }]}>
//         {t("property.chatWithHost")}
//       </Text>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   button: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: spacing.sm,
//     paddingHorizontal: spacing.md,
//     borderRadius: radius.md,
//     marginVertical: spacing.md,
//   },
//   buttonText: {
//     fontSize: fontSize.md,
//     fontWeight: "bold",
//     marginLeft: spacing.sm,
//   },
// });

// export default ChatWithHostButton;
