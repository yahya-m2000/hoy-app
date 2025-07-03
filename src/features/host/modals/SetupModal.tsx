/**
 * Host Setup Modal Component
 * Handles host onboarding and setup flow
 * Converted from route-based overlay to standalone modal component
 */

import React from "react";
import { Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Context and hooks
import { useTheme } from "src/core/hooks/useTheme";

// Components
import { Container, Button, Text } from "@shared/components";
import { HostSetupScreen } from "@features/host";
import { Ionicons } from "@expo/vector-icons";

// Constants
import { fontSize } from "@core/design";

interface HostSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSetupComplete?: () => void;
}

export function HostSetupModal({
  visible,
  onClose,
  onSetupComplete,
}: HostSetupModalProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const ModalHeader = () => (
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
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: "600",
          color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
        }}
      >
        Host Setup
      </Text>
      <Button
        onPress={onClose}
        variant="ghost"
        title=""
        style={{ width: 40, height: 40 }}
        icon={
          <Ionicons
            name="close"
            size={24}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
        }
      />
    </Container>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Container flex={1} backgroundColor="background">
        <ModalHeader />

        <Container flex={1} style={{ paddingBottom: insets.bottom }}>
          <HostSetupScreen />
        </Container>
      </Container>
    </Modal>
  );
}

// Provide both named and default export for compatibility
export { HostSetupModal as SetupModal };
export default HostSetupModal;
