/**
 * ZAAD Payment Utilities
 * Handles ZAAD payment operations, USSD dialing, and contact management
 */

import { Platform, Linking, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import { notificationService } from '../services/notification.service';

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
    // ZAAD numbers are typically 6-10 digits
    const zaadRegex = /^\d{6,10}$/;
    return zaadRegex.test(zaadNumber.replace(/\s+/g, ''));
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
  static async addToContacts(paymentDetails: ZaadPaymentDetails): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('Adding contacts is only supported on Android');
      return false;
    }

    try {
      // Request contacts permission
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Contacts permission is required to save payment details.'
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
    language: 'en' | 'so' = 'en',
    onDialPress?: () => void,
    onAddContactPress?: () => void
  ): void {
    const isEnglish = language === 'en';
    
    const title = isEnglish ? 'ZAAD Payment Instructions' : 'Tilmaamahaaga Bixinta ZAAD';
    
    const instructions = isEnglish 
      ? `To complete your payment:\n\n1. Dial: ${this.generateUSSDCode(paymentDetails.zaadNumber, paymentDetails.amount)}\n2. Follow the prompts\n3. Enter your ZAAD PIN\n\nPayment Details:\nHost: ${paymentDetails.hostName}\nProperty: ${paymentDetails.propertyName}\nAmount: ${this.formatAmount(paymentDetails.amount, paymentDetails.currency)}`
      : `Si aad u dhamaysaysid bixintaada:\n\n1. Geli: ${this.generateUSSDCode(paymentDetails.zaadNumber, paymentDetails.amount)}\n2. Raac tilmaamaha\n3. Geli PIN-kaaga ZAAD\n\nFaahfaahinta Bixinta:\nMartida: ${paymentDetails.hostName}\nHantida: ${paymentDetails.propertyName}\nLacagta: ${this.formatAmount(paymentDetails.amount, paymentDetails.currency)}`;

    const buttons = [];

    // Add dial button for Android
    if (Platform.OS === 'android') {
      buttons.push({
        text: isEnglish ? 'Dial Now' : 'Hadda Wac',
        onPress: () => {
          if (onDialPress) {
            onDialPress();
          } else {
            this.dialUSSD(paymentDetails.zaadNumber, paymentDetails.amount);
          }
        },
      });

      buttons.push({
        text: isEnglish ? 'Save Contact' : 'Keydi Xiriirka',
        onPress: () => {
          if (onAddContactPress) {
            onAddContactPress();
          } else {
            this.addToContacts(paymentDetails);
          }
        },
      });
    }

    buttons.push({
      text: isEnglish ? 'OK' : 'Haa',
      style: 'cancel' as const,
    });

    Alert.alert(title, instructions, buttons, { cancelable: true });
  }

  /**
   * Copy USSD code to clipboard
   */
  static async copyUSSDToClipboard(zaadNumber: string, amount: string): Promise<void> {
    const ussdCode = this.generateUSSDCode(zaadNumber, amount);
    
    // Use Expo's Clipboard if available, otherwise try React Native's
    try {
      const { Clipboard } = await import('expo-clipboard');
      await Clipboard.setStringAsync(ussdCode);
    } catch {
      try {
        const { Clipboard } = await import('@react-native-clipboard/clipboard');
        Clipboard.setString(ussdCode);
      } catch (error) {
        console.error('Could not copy to clipboard:', error);
      }
    }
  }

  /**
   * Process ZAAD payment selection
   */
  static async processZaadPayment(
    paymentDetails: ZaadPaymentDetails,
    language: 'en' | 'so' = 'en'
  ): Promise<void> {
    try {
      // Send notification
      await notificationService.sendZaadPaymentNotification({
        hostPhone: paymentDetails.hostPhone,
        zaadNumber: paymentDetails.zaadNumber,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        reservationId: paymentDetails.reservationId,
        propertyName: paymentDetails.propertyName,
        checkInDate: '', // Will be passed from reservation context
        checkOutDate: '', // Will be passed from reservation context
      }, language);

      // Show instructions immediately
      this.showPaymentInstructions(paymentDetails, language);

    } catch (error) {
      console.error('Error processing ZAAD payment:', error);
      
      const isEnglish = language === 'en';
      Alert.alert(
        isEnglish ? 'Payment Error' : 'Khalad Bixin',
        isEnglish 
          ? 'There was an error processing your payment request. Please try again.'
          : 'Khalad ayaa ka dhacay bixintaada. Fadlan isku day mar kale.',
        [{ text: isEnglish ? 'OK' : 'Haa' }]
      );
    }
  }
}

export default ZaadUtils;