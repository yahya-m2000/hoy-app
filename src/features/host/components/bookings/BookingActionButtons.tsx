import React from "react";
import { View, StyleSheet, Linking, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Button, Icon } from "@shared/components";
import { spacing } from "@core/design";

interface BookingActionButtonsProps {
  bookingId: string;
  propertyAddress?: string;
  hostPhoneNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  canCancel?: boolean;
  onCancel?: () => void;
  onShare?: () => void;
}

export const BookingActionButtons: React.FC<BookingActionButtonsProps> = ({
  bookingId,
  propertyAddress,
  hostPhoneNumber,
  checkInDate,
  checkOutDate,
  canCancel = true,
  onCancel,
  onShare,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleAddToCalendar = async () => {
    try {
      // This would integrate with the device calendar
      // For now, show a placeholder
      Alert.alert(
        t("features.booking.actions.addToCalendar"),
        "This will add your booking to your device calendar"
      );
    } catch (error) {
      Alert.alert(t("common.error"), t("features.booking.calendar.calendarError"));
    }
  };

  const handleGetDirections = async () => {
    if (!propertyAddress) {
      Alert.alert(t("common.error"), "Property address not available");
      return;
    }

    try {
      const encodedAddress = encodeURIComponent(propertyAddress);
      // Open in default map app
      const url = `https://maps.google.com/maps?q=${encodedAddress}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t("common.error"), "Unable to open maps");
      }
    } catch (error) {
      Alert.alert(t("common.error"), "Failed to open directions");
    }
  };

  const handleWhatsAppContact = async () => {
    if (!hostPhoneNumber) {
      Alert.alert(t("common.error"), "Host contact information not available");
      return;
    }

    try {
      // Format phone number for WhatsApp (remove non-digits)
      const cleanPhone = hostPhoneNumber.replace(/\D/g, "");
      const message = encodeURIComponent(
        `Hi! I have a booking (ID: ${bookingId}) at your property. I wanted to get in touch regarding my stay.`
      );
      const url = `whatsapp://send?phone=${cleanPhone}&text=${message}`;

      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t("common.error"), "WhatsApp is not installed");
      }
    } catch (error) {
      Alert.alert(t("common.error"), "Failed to open WhatsApp");
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      Alert.alert(
        t("features.booking.actions.shareBooking"),
        "This will share your booking details"
      );
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      Alert.alert(
        t("features.booking.actions.cancelBooking"),
        "This will start the cancellation process"
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Primary Actions Row */}
      <View style={styles.primaryActions}>
        <Button
          title={t("features.booking.actions.addToCalendar")}
          variant="outline"
          onPress={handleAddToCalendar}
          style={styles.actionButton}
          icon={
            <Icon
              name="calendar-outline"
              size={20}
              color={theme.colors.primary}
            />
          }
        />
        <Button
          title={t("features.booking.actions.directions")}
          variant="outline"
          onPress={handleGetDirections}
          style={styles.actionButton}
          icon={
            <Icon
              name="location-outline"
              size={20}
              color={theme.colors.primary}
            />
          }
        />
      </View>
      {/* Secondary Actions Row */}
      <View style={styles.secondaryActions}>
        {hostPhoneNumber && (
          <Button
            title={t("features.booking.actions.whatsappContact")}
            variant="outline"
            onPress={handleWhatsAppContact}
            style={styles.actionButton}
            icon={
              <Icon
                name="logo-whatsapp"
                size={20}
                color={theme.colors.success}
              />
            }
          />
        )}
        <Button
          title={t("features.booking.actions.shareBooking")}
          variant="outline"
          onPress={handleShare}
          style={styles.actionButton}
          icon={
            <Icon name="share-outline" size={20} color={theme.colors.primary} />
          }
        />
      </View>
      {/* Cancel Action */}
      {canCancel && (
        <View style={styles.cancelAction}>
          <Button
            title={t("features.booking.actions.cancelBooking")}
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            textStyle={{ color: theme.colors.error }}
            icon={
              <Icon
                name="close-circle-outline"
                size={20}
                color={theme.colors.error}
              />
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  primaryActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
  cancelAction: {
    marginTop: spacing.sm,
  },
  cancelButton: {
    minHeight: 48,
  },
});
