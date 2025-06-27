import { Linking, Alert } from "react-native";

/**
 * Utility functions for host-related operations
 */

/**
 * Initiates a phone call to the provided phone number
 * @param phoneNumber - The phone number to call
 */
export const handleCall = async (phoneNumber: string): Promise<void> => {
  try {
    const phoneUrl = `tel:${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);

    if (canOpen) {
      await Linking.openURL(phoneUrl);
    } else {
      Alert.alert("Error", "Unable to make phone calls on this device");
    }
  } catch (error) {
    console.error("Error making phone call:", error);
    Alert.alert("Error", "Unable to make phone calls on this device");
  }
};

/**
 * Opens WhatsApp with the provided phone number
 * @param phoneNumber - The phone number to message on WhatsApp
 */
export const handleWhatsApp = async (phoneNumber: string): Promise<void> => {
  try {
    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

    // Try to open WhatsApp app first
    const whatsappUrl = `whatsapp://send?phone=${cleanNumber}`;
    const canOpenApp = await Linking.canOpenURL(whatsappUrl);

    if (canOpenApp) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fall back to web WhatsApp
      const webWhatsappUrl = `https://web.whatsapp.com/send?phone=${cleanNumber}`;
      const canOpenWeb = await Linking.canOpenURL(webWhatsappUrl);

      if (canOpenWeb) {
        await Linking.openURL(webWhatsappUrl);
      } else {
        Alert.alert("Error", "Unable to open WhatsApp");
      }
    }
  } catch (error) {
    console.error("Error opening WhatsApp:", error);
    Alert.alert("Error", "Unable to open WhatsApp");
  }
};

/**
 * Generate initials from first and last name
 * @param firstName - The first name
 * @param lastName - The last name
 * @returns The initials as a string
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Generate a consistent color for an avatar based on a name
 * @param name - The name to generate a color for
 * @returns A hex color string
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};
