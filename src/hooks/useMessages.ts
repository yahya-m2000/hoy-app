import { useQuery } from "@tanstack/react-query";
import {
  fetchMessages,
  fetchUnreadCount,
  fetchConversation,
  sendMessage,
} from "../services/messageService";
import { MessageType } from "../types/message";

/**
 * Hook to fetch all messages in inbox
 */
export const useMessages = () =>
  useQuery<MessageType[], Error>({
    queryKey: ["messages"],
    queryFn: fetchMessages,
  });

/**
 * Hook to fetch unread messages count
 */
export const useUnreadCount = () =>
  useQuery<number, Error>({
    queryKey: ["unreadCount"],
    queryFn: fetchUnreadCount,
  });

/**
 * Hook to fetch conversation with a specific user
 */
export const useConversation = (userId: string) =>
  useQuery<MessageType[], Error>({
    queryKey: ["conversation", userId],
    queryFn: () => fetchConversation(userId),
    enabled: Boolean(userId),
  });

/**
 * Function to send a new message
 * We can wrap with useMutation in the component
 */
export const sendNewMessage = sendMessage;
