/**
 * Notification Service
 * Handles push notifications, ZAAD payment notifications, and notification management
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface ZaadPaymentNotification {
  hostPhone: string;
  zaadNumber: string;
  amount: string;
  currency: string;
  reservationId: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface NotificationData {
  id: string;
  type: 'zaad_payment' | 'booking_confirmation' | 'general';
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationHistory: NotificationData[] = [];

  constructor() {
    this.setupNotificationHandler();
    this.setupNotificationChannels();
  }

  /**
   * Setup notification handler for displaying notifications
   */
  private setupNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  /**
   * Setup notification channels for Android
   */
  private async setupNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('zaad-payments', {
        name: 'ZAAD Payments',
        description: 'Notifications for ZAAD payment instructions',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('bookings', {
        name: 'Booking Updates',
        description: 'Notifications for booking confirmations and updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('general', {
        name: 'General',
        description: 'General app notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification');
      return false;
    }

    return true;
  }

  /**
   * Get Expo push token
   */
  async getExpoPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      this.expoPushToken = token.data;
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Send ZAAD payment notification
   */
  async sendZaadPaymentNotification(
    zaadData: ZaadPaymentNotification,
    language: 'en' | 'so' = 'en'
  ): Promise<void> {
    const isEnglish = language === 'en';
    
    const title = isEnglish 
      ? 'ZAAD Payment Required' 
      : 'Bixinta ZAAD waa loo baahan yahay';
    
    const body = isEnglish
      ? `Complete payment for ${zaadData.propertyName} using ZAAD`
      : `Dhammaystir bixinta ${zaadData.propertyName} iyadoo la adeegsanayo ZAAD`;

    const notificationData: NotificationData = {
      id: `zaad_${zaadData.reservationId}_${Date.now()}`,
      type: 'zaad_payment',
      title,
      body,
      data: zaadData,
      timestamp: Date.now(),
      read: false,
    };

    // Add to local history
    this.notificationHistory.unshift(notificationData);

    // Schedule local notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'zaad_payment',
          ...zaadData,
        },
        categoryIdentifier: 'zaad-payment',
        sound: 'default',
      },
      trigger: null, // Immediate
    });
  }

  /**
   * Get notification history
   */
  getNotificationHistory(): NotificationData[] {
    return [...this.notificationHistory];
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationHistory.forEach(notification => {
      notification.read = true;
    });
  }

  /**
   * Clear notification history
   */
  clearHistory(): void {
    this.notificationHistory = [];
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return this.notificationHistory.filter(n => !n.read).length;
  }

  /**
   * Handle notification received while app is open
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    // Handle notifications received while app is open
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Handle notification tap
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }

  /**
   * Generate USSD code for ZAAD payment (Android only)
   */
  generateZaadUSSD(zaadNumber: string, amount: string): string {
    // ZAAD USSD format: *712*zaadNumber*amount#
    return `*712*${zaadNumber}*${amount}#`;
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Format Somali phone numbers: +252 XX XXXXXXX
    if (phoneNumber.startsWith('+252')) {
      const number = phoneNumber.slice(4);
      return `+252 ${number.slice(0, 2)} ${number.slice(2)}`;
    }
    return phoneNumber;
  }
}

export const notificationService = new NotificationService();