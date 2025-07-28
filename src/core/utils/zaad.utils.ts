/**
 * ZAAD Payment Utilities
 * Handles ZAAD payment operations, USSD dialing, and contact management
 */

import { Platform, Linking, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import { notificationService } from '@core/services/notification.service';

export interface ZaadPaymentDetails {
  hostPhone: string;
  zaadNumber: string;
  amount: string;
  currency: string;
  reservationId: string;
  propertyName: string;
  hostName: string;
}

export class ZaadUtils {
  /**
   * Validate ZAAD number format
   */
  static validateZaadNumber(zaadNumber: string): boolean {
    if (!zaadNumber || typeof zaadNumber !== 'string') {
      return false;
    }
    
    // Remove all spaces, dashes, parentheses, and plus signs
    const cleanNumber = zaadNumber.replace(/[\s+\-()]/g, '');
    
    // Accept phone numbers starting with 252 (after cleaning +)
    if (cleanNumber.startsWith('252')) {
      // Should be 252 followed by 8-9 digits (total 11-12 digits)
      return cleanNumber.length >= 11 && cleanNumber.length <= 12 && /^\d+$/.test(cleanNumber);
    }
    
    // Accept shorter ZAAD account numbers (6-12 digits only)
    const zaadRegex = /^\d{6,12}$/;
    return zaadRegex.test(cleanNumber);
  }

  /**
   * Validate phone number format (Somali)
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Somali phone numbers: +252 followed by 8-9 digits
    const phoneRegex = /^\+252[67]\d{7,8}$/;
    return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: string, currency: string = 'USD'): string {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;

    if (currency === 'USD') {
      return `$${numAmount.toFixed(2)}`;
    }
    return `${numAmount.toFixed(2)} ${currency}`;
  }

  /**
   * Generate USSD code for ZAAD payment
   */
  static generateUSSDCode(zaadNumber: string, amount: string): string {
    const cleanZaadNumber = zaadNumber.replace(/\s+/g, '');
    const cleanAmount = amount.replace(/[^\d.]/g, '');
    return `*712*${cleanZaadNumber}*${cleanAmount}#`;
  }

  /**
   * Attempt to dial USSD code (Android only)
   */
  static async dialUSSD(zaadNumber: string, amount: string): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('USSD dialing is only supported on Android');
      return false;
    }

    try {
      const ussdCode = this.generateUSSDCode(zaadNumber, amount);
      const url = `tel:${ussdCode}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        console.error('Cannot open USSD URL');
        return false;
      }
    } catch (error) {
      console.error('Error dialing USSD:', error);
      return false;
    }
  }

  /**
   * Add ZAAD payment contact to phone book (Android only)
   */
  static async addToContacts(
    paymentDetails: ZaadPaymentDetails, 
    t: (key: string, fallback: string) => string
  ): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('Adding contacts is only supported on Android');
      return false;
    }

    try {
      // Request contacts permission
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('ui.feedback.notifications.permissionRequired', 'Permission Required'),
          t('ui.feedback.notifications.contactsPermissionMessage', 'Contacts permission is required to save payment details.')
        );
        return false;
      }

      const contactName = `ZAAD Payment - ${paymentDetails.hostName}`;
      const ussdCode = this.generateUSSDCode(paymentDetails.zaadNumber, paymentDetails.amount);
      
      const contact: Contacts.Contact = {
        name: contactName,
        phoneNumbers: [
          {
            number: paymentDetails.hostPhone,
            label: 'Host Phone',
            isPrimary: true,
          },
          {
            number: ussdCode,
            label: 'ZAAD Payment Code',
            isPrimary: false,
          },
        ],
        note: `Property: ${paymentDetails.propertyName}\nAmount: ${this.formatAmount(paymentDetails.amount, paymentDetails.currency)}\nReservation: ${paymentDetails.reservationId}`,
      };

      const contactId = await Contacts.addContactAsync(contact);
      return !!contactId;
    } catch (error) {
      console.error('Error adding contact:', error);
      return false;
    }
  }

  /**
   * Show payment instructions dialog
   */
  static showPaymentInstructions(
    paymentDetails: ZaadPaymentDetails,
    t: (key: string, fallback: string, params?: any) => string,
    onDialPress?: () => void,
    onAddContactPress?: () => void
  ): void {
    const title = t('ui.feedback.notifications.zaadPaymentInstructions', 'ZAAD Payment Instructions');
    
    const ussdCode = this.generateUSSDCode(paymentDetails.zaadNumber, paymentDetails.amount);
    const formattedAmount = this.formatAmount(paymentDetails.amount, paymentDetails.currency);
    
    const instructions = t('ui.feedback.notifications.paymentInstructions', 
      'To complete your payment:\n\n1. Dial: {{ussdCode}}\n2. Follow the prompts\n3. Enter your ZAAD PIN\n\nPayment Details:\nHost: {{hostName}}\nProperty: {{propertyName}}\nAmount: {{amount}}',
      {
        ussdCode,
        hostName: paymentDetails.hostName,
        propertyName: paymentDetails.propertyName,
        amount: formattedAmount
      }
    );

    const buttons = [];

    // Add dial button for Android
    if (Platform.OS === 'android') {
      buttons.push({
        text: t('ui.feedback.notifications.dialNow', 'Dial Now'),
        onPress: () => {
          if (onDialPress) {
            onDialPress();
          } else {
            this.dialUSSD(paymentDetails.zaadNumber, paymentDetails.amount);
          }
        },
      });

      buttons.push({
        text: t('ui.feedback.notifications.saveContact', 'Save Contact'),
        onPress: () => {
          if (onAddContactPress) {
            onAddContactPress();
          } else {
            this.addToContacts(paymentDetails, t);
          }
        },
      });
    }

    buttons.push({
      text: t('ui.feedback.alerts.actions.ok', 'OK'),
      style: 'cancel' as const,
    });

    Alert.alert(title, instructions, buttons, { cancelable: true });
  }

  /**
   * Copy USSD code to clipboard
   */
  static async copyUSSDToClipboard(zaadNumber: string, amount: string): Promise<void> {
    const ussdCode = this.generateUSSDCode(zaadNumber, amount);
    
    try {
      await Clipboard.setStringAsync(ussdCode);
    } catch (error) {
      console.error('Could not copy to clipboard:', error);
    }
  }

  /**
   * Process ZAAD payment selection
   */
  static async processZaadPayment(
    paymentDetails: ZaadPaymentDetails,
    t: (key: string, fallback: string, params?: any) => string
  ): Promise<void> {
    try {
      // Send notification (service will store language-agnostic data)
      await notificationService.sendZaadPaymentNotification({
        hostPhone: paymentDetails.hostPhone,
        zaadNumber: paymentDetails.zaadNumber,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        reservationId: paymentDetails.reservationId,
        propertyName: paymentDetails.propertyName,
        checkInDate: '', // Will be passed from reservation context
        checkOutDate: '', // Will be passed from reservation context
      });

      // Show instructions immediately
      this.showPaymentInstructions(paymentDetails, t);

    } catch (error) {
      console.error('Error processing ZAAD payment:', error);
      
      Alert.alert(
        t('ui.feedback.notifications.paymentError', 'Payment Error'),
        t('ui.feedback.notifications.paymentErrorMessage', 'There was an error processing your payment request. Please try again.'),
        [{ text: t('ui.feedback.alerts.actions.ok', 'OK') }]
      );
    }
  }
}

export default ZaadUtils;