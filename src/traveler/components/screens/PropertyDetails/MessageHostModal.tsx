import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common-context/ThemeContext";
import type { ExtendedUser } from "./HostSection";

interface MessageHostModalProps {
  visible: boolean;
  onClose: () => void;
  host: ExtendedUser | null;
  propertyTitle: string;
  messageContent: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  sendingMessage: boolean;
}

const MessageHostModal: React.FC<MessageHostModalProps> = ({
  visible,
  onClose,
  host,
  propertyTitle,
  messageContent,
  onMessageChange,
  onSendMessage,
  sendingMessage,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.grayPalette[50],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                {
                  color: isDark
                    ? theme.colors.grayPalette[50]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              {t("property.messageToHost", {
                hostName: host?.firstName || t("property.host"),
              })}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.modalSubtitle,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("property.inquireAbout", {
              propertyTitle: propertyTitle || t("property.thisProperty"),
            })}
          </Text>

          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[200],
                color: isDark
                  ? theme.colors.grayPalette[50]
                  : theme.colors.grayPalette[900],
              },
            ]}
            placeholder={t("property.typeMessagePlaceholder")}
            placeholderTextColor={
              isDark ? theme.colors.gray[500] : theme.colors.gray[400]
            }
            multiline={true}
            value={messageContent}
            onChangeText={onMessageChange}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={onSendMessage}
            disabled={sendingMessage || !messageContent.trim()}
          >
            {sendingMessage ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>
                {t("property.sendMessage")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  messageInput: {
    borderRadius: 8,
    height: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: "top",
    marginBottom: 16,
    fontSize: 16,
  },
  sendButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default MessageHostModal;
