/**
 * Create Collection Modal Component
 * Modal for creating new collections
 */

import React from "react";
import { Modal, KeyboardAvoidingView, Platform } from "react-native";
import { Container } from "@shared/components/base";
import { ModalHeader } from "./ModalHeader";
import { CreateCollectionForm } from "./CreateCollectionForm";

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
              />
            </Container>
          </KeyboardAvoidingView>
        </Modal>
      );
    }
  );
