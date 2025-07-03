/**
 * Auth Modal Component
 * Placeholder for authentication modal
 */

import React from "react";
import { Modal, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "src/core/hooks/useTheme";
import { Container } from "../../layout";
import { Button } from "../../base/Button";
import { Text } from "../../base/Text";
import { Ionicons } from "@expo/vector-icons";
import { fontSize } from "@core/design";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AuthModal({ visible, onClose }: AuthModalProps) {
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
            Authentication
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
          <Text>Authentication content will be implemented here</Text>
        </Container>
      </Container>
    </Modal>
  );
}
