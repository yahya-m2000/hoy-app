/**
 * Privacy Security Modal Component
 * Placeholder - content will be migrated from overlay
 */

import React from "react";
import { Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "src/core/hooks/useTheme";
import { Container, Button, Text } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { fontSize } from "@core/design";

interface PrivacySecurityModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacySecurityModal({
  visible,
  onClose,
}: PrivacySecurityModalProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        <Container
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="lg"
          paddingVertical="md"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          }}
        >
          <View style={{ width: 40 }} />
          <Text style={{ fontSize: fontSize.lg, fontWeight: "600" }}>
            Privacy & Security
          </Text>
          <Button
            onPress={onClose}
            variant="ghost"
            title=""
            style={{ width: 40, height: 40 }}
            icon={<Ionicons name="close" size={24} />}
          />
        </Container>
        <Container
          flex={1}
          padding="lg"
          style={{ paddingBottom: insets.bottom }}
        >
          <Text>Privacy & security content will be migrated here</Text>
        </Container>
      </Container>
    </Modal>
  );
}
