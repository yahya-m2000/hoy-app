/**
 * Create Collection Modal Component
 * Modal for creating new collections
 */

import React from "react";
import { Modal, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Container, Tab, Text } from "@shared/components";
import { ModalHeader } from "./ModalHeader";
import { CreateCollectionForm } from "./CreateCollectionForm";
import { useTheme } from "src/core/hooks";
import { spacing } from "src/core/design";

interface CreateCollectionModalProps {
  visible: boolean;
  collectionName: string;
  creating: boolean;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onClear: () => void;
  onCreate: () => void;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> =
  React.memo(
    ({
      visible,
      collectionName,
      creating,
      onClose,
      onNameChange,
      onClear,
      onCreate,
    }) => {
      const { theme } = useTheme();
      const isValidName =
        collectionName.trim().length >= 3 && collectionName.trim().length <= 50;
      const characterCount = collectionName.length;
      return (
        <Modal
          visible={visible}
          animationType="slide"
          presentationStyle="formSheet"
          onRequestClose={onClose}
          onDismiss={onClose}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <Container
              backgroundColor="background"
              style={{
                minHeight: 250,
                maxHeight: "50%",
              }}
            >
              <ModalHeader
                title="Create Wishlist"
                onClose={onClose}
                showCloseIcon={false}
              />
              <CreateCollectionForm
                collectionName={collectionName}
                onNameChange={onNameChange}
                onClear={onClear}
                onCreate={onCreate}
                creating={creating}
                isValidName={isValidName}
                characterCount={characterCount}
              />
            </Container>
          </KeyboardAvoidingView>
          <Tab backgroundColor={theme.background} borderColor={theme.border}>
            <Container flexDirection="row" style={{ gap: spacing.md }}>
              <Container flex={1}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={onClear}
                  disabled={creating}
                  icon="close"
                />
              </Container>
              <Container flex={1}>
                <Button
                  title="Create Wishlist"
                  variant="primary"
                  onPress={onCreate}
                  loading={creating}
                  disabled={!isValidName || creating}
                  icon="heart"
                />
              </Container>
            </Container>
          </Tab>
        </Modal>
      );
    }
  );

CreateCollectionModal.displayName = "CreateCollectionModal";
