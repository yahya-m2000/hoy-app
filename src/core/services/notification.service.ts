/**
 * Notification Service
 * Handles push notifications, ZAAD payment notifications, and notification management
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  // Add language-agnostic data for ZAAD notifications
  zaadData?: ZaadPaymentNotification;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationHistory: NotificationData[] = [];
  private readonly STORAGE_KEY = 'notification_history';

  constructor() {
    this.setupNotificationHandler();
    this.setupNotificationChannels();
    // Initialize push token and load stored notifications
    this.getExpoPushToken().catch(console.error);
    this.loadStoredNotifications().catch(console.error);
  }

  /**
   * Setup notification handler for displaying notifications
   */
  private setupNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  /**
   * Setup notification channels for Android
   */
  private async setupNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

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

    if (!Device.isDevice) {
      console.warn('Must use physical device for push notifications');
      return null;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      console.log('Push token obtained:', pushTokenString);
      this.expoPushToken = pushTokenString;
      return pushTokenString;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Send push notification using Expo push service
   */
  async sendPushNotification(expoPushToken: string, title: string, body: string, data?: any): Promise<void> {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Load stored notifications from AsyncStorage
   */
  private async loadStoredNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.notificationHistory = JSON.parse(stored);
        console.log('Loaded stored notifications:', this.notificationHistory.length);
      }
    } catch (error) {
      console.error('Error loading stored notifications:', error);
    }
  }

  /**
   * Save notifications to AsyncStorage
   */
  private async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notificationHistory));
    } catch (error) {
      console.error('Error saving notifications:', error);
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
    
    // Generate localized text for push notification only
    const title = isEnglish 
      ? 'ZAAD Payment Required' 
      : 'Bixinta ZAAD waa loo baahan yahay';
    
    const body = isEnglish
      ? `Complete payment for ${zaadData.propertyName} using ZAAD`
      : `Dhammaystir bixinta ${zaadData.propertyName} iyadoo la adeegsanayo ZAAD`;

    const notificationData: NotificationData = {
      id: `zaad_${zaadData.reservationId}_${Date.now()}`,
      type: 'zaad_payment',
      title: '', // Will be generated dynamically in UI
      body: '', // Will be generated dynamically in UI
      data: zaadData,
      timestamp: Date.now(),
      read: false,
      zaadData, // Store language-agnostic data for dynamic generation
    };

    // Add to local history and save to storage
    this.notificationHistory.unshift(notificationData);
    await this.saveNotifications();

    // Get push token and send push notification
    const pushToken = await this.getExpoPushToken();
    if (pushToken) {
      await this.sendPushNotification(pushToken, title, body, {
        type: 'zaad_payment',
        ...zaadData,
      });
    }

    // Also schedule local notification as fallback
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'zaad_payment',
          ...zaadData,
        },
        sound: 'default',
      },
      trigger: null, // Immediate
    });

    console.log('ZAAD payment notification sent and stored:', { title, body });
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
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveNotifications();
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    this.notificationHistory.forEach(notification => {
      notification.read = true;
    });
    await this.saveNotifications();
  }

  /**
   * Clear notification history
   */
  async clearHistory(): Promise<void> {
    this.notificationHistory = [];
    await this.saveNotifications();
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return this.notificationHistory.filter(n => !n.read).length;
  }

  /**
   * Debug function to check notification storage
   */
  async debugNotificationStorage(): Promise<void> {
    console.log('=== NOTIFICATION STORAGE DEBUG ===');
    
    // Check in-memory notifications
    console.log('In-memory notifications:', this.notificationHistory.length);
    this.notificationHistory.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} (${notification.read ? 'read' : 'unread'}) - ${new Date(notification.timestamp).toLocaleString()}`);
    });

    // Check AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        console.log('AsyncStorage notifications:', parsedNotifications.length);
        parsedNotifications.forEach((notification: NotificationData, index: number) => {
          console.log(`Storage ${index + 1}. ${notification.title} (${notification.read ? 'read' : 'unread'}) - ${new Date(notification.timestamp).toLocaleString()}`);
        });
      } else {
        console.log('No notifications found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
    }

    console.log('=== END DEBUG ===');
  }

  /**
   * Test function to create a sample notification
   */
  async createTestNotification(): Promise<void> {
    const zaadData: ZaadPaymentNotification = {
      hostPhone: '+252123456789',
      zaadNumber: '123456789',
      amount: '50.00',
      currency: 'USD', 
      reservationId: 'test_reservation',
      propertyName: 'Test Property',
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date().toISOString(),
    };

    const testNotification: NotificationData = {
      id: `test_${Date.now()}`,
      type: 'zaad_payment',
      title: '', // Will be generated dynamically in UI
      body: '', // Will be generated dynamically in UI
      data: zaadData,
      timestamp: Date.now(),
      read: false,
      zaadData, // Store language-agnostic data for dynamic generation
    };

    this.notificationHistory.unshift(testNotification);
    await this.saveNotifications();
    console.log('Test notification created and saved');
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