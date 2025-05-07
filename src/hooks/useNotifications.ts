import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/messageService";
import { eventEmitter } from "../utils/eventEmitter";
import { SocketEvents } from "../services/socketService";
import { useEffect } from "react";
import { NotificationType } from "../types/message";
import { isValidDate } from "../utils/dateUtils";
import { isValidObjectId } from "../utils/mongoUtils";

/**
 * Hook for managing user notifications
 */
export const useNotifications = () => {
  const queryClient = useQueryClient();
  const maxRetries = 3;

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      if (failureCount >= maxRetries) {
        console.error("Max retries reached for notifications query:", error);
        return false;
      }
      return true;
    },
    select: (data: NotificationType[]) => {
      // Validate notification data
      return data.filter((notification) => {
        // Check for required fields
        if (!notification.id || !notification.title) {
          console.warn("Notification missing required fields:", notification);
          return false;
        }

        // Validate dates
        if (notification.createdAt && !isValidDate(notification.createdAt)) {
          console.warn(
            "Notification has invalid date:",
            notification.createdAt
          );
          // Don't filter out, just log the warning
        }

        // Validate IDs if present
        if (
          notification.relatedTo?.id &&
          !isValidObjectId(notification.relatedTo.id)
        ) {
          console.warn(
            "Notification has invalid related ID:",
            notification.relatedTo.id
          );
          // Still include the notification, just remove the invalid relation
          notification.relatedTo = { ...notification.relatedTo, id: undefined };
        }

        return true;
      });
    },
  }); // Get unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: fetchUnreadNotificationCount,
    staleTime: 1000 * 60, // 1 minute
    retry: (failureCount, error: Error) => {
      if (failureCount >= maxRetries) {
        console.error("Max retries reached for unread count query:", error);
        return false;
      }
      return true;
    },
  });

  // Mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  }); // Listen for real-time notification events
  useEffect(() => {
    // When a new notification is received
    const notificationReceivedHandler = (notification: any) => {
      try {
        if (!notification || typeof notification !== "object") {
          console.warn(
            "Received invalid notification in useNotifications hook",
            notification
          );
          return;
        }

        // Validate notification data
        if (!notification.id && !notification.title) {
          console.warn("Notification missing required fields", notification);
        }

        // Validate date
        if (notification.createdAt && !isValidDate(notification.createdAt)) {
          console.warn("Notification has invalid date", notification.createdAt);
        }

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({
          queryKey: ["unreadNotificationCount"],
        });

        console.log(
          "Successfully processed new notification in useNotifications hook"
        );
      } catch (error) {
        console.error(
          "Error handling notification in useNotifications hook:",
          error
        );
      }
    };

    // When a notification is marked as read
    const notificationReadHandler = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    };

    // When all notifications are marked as read
    const allNotificationsReadHandler = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    };

    // Subscribe to events
    eventEmitter.on(
      SocketEvents.NOTIFICATION_RECEIVED,
      notificationReceivedHandler
    );
    eventEmitter.on(SocketEvents.NOTIFICATION_READ, notificationReadHandler);
    eventEmitter.on(
      SocketEvents.ALL_NOTIFICATIONS_READ,
      allNotificationsReadHandler
    ); // Cleanup
    return () => {
      eventEmitter.off(
        SocketEvents.NOTIFICATION_RECEIVED,
        notificationReceivedHandler
      );
      eventEmitter.off(SocketEvents.NOTIFICATION_READ, notificationReadHandler);
      eventEmitter.off(
        SocketEvents.ALL_NOTIFICATIONS_READ,
        allNotificationsReadHandler
      );
    };
  }, [queryClient]); // Calculate total unread count from notification data as well (as a fallback)
  const calculatedUnreadCount = notifications.reduce(
    (sum, notification) => sum + (notification.isRead ? 0 : 1),
    0
  );

  // Use the higher of the two counts to ensure we don't miss any unread notifications
  const totalUnreadCount = Math.max(unreadCount, calculatedUnreadCount);

  return {
    notifications: notifications || [],
    isLoading,
    isError,
    unreadCount,
    totalUnreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    refresh: refetch,
  };
};
