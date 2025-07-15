/**
 * Collections Modal Component
 * Main modal for wishlist collections with create functionality
 */

import React, { useState, useEffect, useCallback } from "react";
import { Modal, Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@core/hooks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { logger } from "@core/utils/sys/log/";
import { WishlistService, WishlistCollection } from "@core/api/services";
import { useWishlistState } from "@features/properties/context/PropertyContext";

// Base components
import { Button, Container, Tab } from "@shared/components";

// Local components
import { ModalHeader } from "./ModalHeader";
import { CollectionsList } from "./CollectionsList";
import { CreateCollectionModal } from "./CreateCollectionModal";

interface CollectionsModalProps {
  visible: boolean;
  propertyId?: string;
  onClose: () => void;
  onCollectionToggle?: (collectionId: string, isAdded: boolean) => void;
}

// Main Collections Modal Component
const CollectionsModal: React.FC<CollectionsModalProps> = ({
  visible,
  propertyId,
  onClose,
  onCollectionToggle,
}) => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    collections,
    isLoadingCollections,
    addToWishlist,
    removeFromWishlist,
  } = useWishlistState();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creating, setCreating] = useState(false);

  // Debug: Track showCreateModal changes
  // Remove debug logging to prevent console spam
  // useEffect(() => {
  //   console.log("showCreateModal changed to:", showCreateModal);
  // }, [showCreateModal]);

  const handleCreateCollection = useCallback(async () => {
    if (!newCollectionName.trim()) {
      Alert.alert("Error", "Please enter a collection name");
      return;
    }

    try {
      setCreating(true);
      const newCollection = await WishlistService.createCollection({
        name: newCollectionName.trim(),
        description: undefined,
      });

      // Add property to the new collection if propertyId is provided
      if (propertyId) {
        await addToWishlist(propertyId, newCollection._id);
        onCollectionToggle?.(newCollection._id, true);
      }

      // Close both modals and refresh
      setShowCreateModal(false);
      setNewCollectionName("");

      // Close main modal first
      onClose();
    } catch (err) {
      logger.error("Failed to create collection:", err);
      Alert.alert("Error", "Failed to create collection");
    } finally {
      setCreating(false);
    }
  }, [
    newCollectionName,
    propertyId,
    onCollectionToggle,
    onClose,
    addToWishlist,
  ]);

  const handleCollectionPress = useCallback(
    async (collection: WishlistCollection) => {
      if (!propertyId) return;

      try {
        const isPropertyInCollection =
          collection.properties.includes(propertyId);

        if (isPropertyInCollection) {
          await removeFromWishlist(propertyId);
          onCollectionToggle?.(collection._id, false);
        } else {
          await addToWishlist(propertyId, collection._id);
          onCollectionToggle?.(collection._id, true);
        }

        // Close modal first to prevent UI issues
        onClose();
      } catch (error) {
        logger.error("Failed to toggle property in collection:", error);
        Alert.alert("Error", "Failed to update collection");
      }
    },
    [propertyId, onCollectionToggle, onClose, removeFromWishlist, addToWishlist]
  );

  const handleClearName = useCallback(() => {
    setNewCollectionName("");
  }, []);

  const handleCreatePress = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setNewCollectionName("");
  }, []);

  return (
    <Container>
      <Modal
        visible={visible && !showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
        onDismiss={onClose} // Add explicit dismiss handler
        supportedOrientations={["portrait"]} // Ensure consistent presentation
      >
        <Container flex={1} backgroundColor="background">
          <ModalHeader
            title="Save to wishlist"
            onClose={onClose}
            showCloseIcon={true}
          />

          {/* Content - Scrollable area */}
          <Container flex={1} paddingHorizontal="lg">
            <CollectionsList
              collections={collections}
              propertyId={propertyId}
              loading={isLoadingCollections}
              onCollectionPress={handleCollectionPress}
              onCreatePress={handleCreatePress}
            />
          </Container>

          {/* Fixed bottom button - Always visible at bottom */}
          <Tab backgroundColor={theme.background} borderColor={theme.border}>
            <Button
              onPress={handleCreatePress}
              title="Create a Wishlist"
              variant="primary"
            />
          </Tab>
        </Container>
      </Modal>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        visible={showCreateModal}
        collectionName={newCollectionName}
        creating={creating}
        onClose={handleCloseCreateModal}
        onNameChange={setNewCollectionName}
        onClear={handleClearName}
        onCreate={handleCreateCollection}
      />
    </Container>
  );
};

export default CollectionsModal;
