/**
 * Test Component for ZAAD Payment Integration
 * This component allows testing the ZAAD payment flow
 */

import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Container, Text, Button } from "@shared/components";
import { useTheme } from "@core/hooks/useTheme";
import { ZaadUtils } from "@core/utils/zaad.utils";
import { notificationService } from "@core/services/notification.service";

export default function ZaadPaymentTest() {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  const testZaadPayment = async () => {
    setIsProcessing(true);
    
    try {
      const testPaymentDetails = {
        hostPhone: "+252634567890",
        zaadNumber: "123456789",
        amount: "50.00",
        currency: "USD",
        reservationId: "test_reservation_123",
        propertyName: "Test Beach Villa",
        hostName: "Ahmed Hassan",
      };

      await ZaadUtils.processZaadPayment(testPaymentDetails, 'en');
      
      Alert.alert("Success", "Test ZAAD payment notification sent!");
    } catch (error) {
      console.error("Test error:", error);
      Alert.alert("Error", "Failed to send test notification");
    } finally {
      setIsProcessing(false);
    }
  };

  const testNotificationCount = () => {
    const count = notificationService.getUnreadCount();
    Alert.alert("Notification Count", `Unread notifications: ${count}`);
  };

  return (
    <Container flex={1} padding="lg" justifyContent="center">
      <Text variant="h4" weight="bold" style={{ marginBottom: 24, textAlign: 'center' }}>
        ZAAD Payment Test
      </Text>
      
      <Button
        title="Test ZAAD Payment"
        onPress={testZaadPayment}
        loading={isProcessing}
        disabled={isProcessing}
        style={{ marginBottom: 16 }}
      />
      
      <Button
        title="Check Notification Count"
        onPress={testNotificationCount}
        variant="outline"
        style={{ marginBottom: 16 }}
      />
      
      <Button
        title="Clear All Notifications"
        onPress={() => {
          notificationService.clearHistory();
          Alert.alert("Cleared", "All notifications cleared");
        }}
        variant="outline"
        style={{ marginBottom: 16 }}
      />
      
      <Text variant="caption" style={{ textAlign: 'center', marginTop: 24 }}>
        This is a test component for ZAAD payment integration.
        Use this to test notifications and payment flows.
      </Text>
    </Container>
  );
}