/**
 * Collections Modal Component
 * Allows users to add properties to wishlist collections
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { useTheme } from "@shared/context/ThemeContext";
import { useTranslation } from "react-i18next";
import * as SafeLogger from "@shared/utils/log/safeLogger";
import {
  wishlistCollectionsService,
  WishlistCollection,
} from "@shared/services/api/wishlist";

import { spacing } from "@shared/constants/spacing";
import { fontSize, fontWeight, radius } from "@shared/constants";

interface CollectionsModalProps {
  visible: boolean;
  propertyId?: string; // Made optional for general collection management
  onClose: () => void;
  onCollectionToggle?: (collectionId: string, isAdded: boolean) => void;
}

const CollectionsModal: React.FC<CollectionsModalProps> = ({
  visible,
  propertyId,
  onClose,
  onCollectionToggle,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [collections, setCollections] = useState<WishlistCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Load collections when modal opens
  useEffect(() => {
    if (visible) {
      loadCollections();
    }
  }, [visible]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const collectionsData = await wishlistCollectionsService.getCollections();
      setCollections(collectionsData);
    } catch (err) {
      SafeLogger.error("Failed to load collections:", err);
      Alert.alert("Error", "Failed to load collections");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert("Error", "Please enter a collection name");
      return;
    }

    try {
      setCreating(true);
      const newCollection = await wishlistCollectionsService.createCollection({
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || undefined,
      });

      // Only add property to collection if propertyId is provided
      if (propertyId) {
        await wishlistCollectionsService.addPropertyToCollection(
          newCollection._id,
          propertyId
        );
        onCollectionToggle?.(newCollection._id, true);
      }

      setCollections([...collections, newCollection]);
      setNewCollectionName("");
      setNewCollectionDescription("");
      setShowCreateForm(false);

      // Invalidate collections query to update useWishlist hook
      queryClient.invalidateQueries({ queryKey: ["wishlistCollections"] });
    } catch (err) {
      SafeLogger.error("Failed to create collection:", err);
      Alert.alert("Error", "Failed to create collection");
    } finally {
      setCreating(false);
    }
  };
  const handleToggleProperty = async (
    collectionId: string,
    isCurrentlyInCollection: boolean
  ) => {
    if (!propertyId) return; // Can't toggle property if no propertyId provided

    try {
      if (isCurrentlyInCollection) {
        await wishlistCollectionsService.removePropertyFromCollection(
          collectionId,
          propertyId
        );
        onCollectionToggle?.(collectionId, false);
      } else {
        await wishlistCollectionsService.addPropertyToCollection(
          collectionId,
          propertyId
        );
        onCollectionToggle?.(collectionId, true);
      }

      // Update local state
      setCollections(
        collections.map((collection) => {
          if (collection._id === collectionId) {
            const properties = isCurrentlyInCollection
              ? collection.properties.filter((id) => id !== propertyId)
              : [...collection.properties, propertyId];
            return { ...collection, properties };
          }
          return collection;
        })
      );

      // Invalidate collections query to update useWishlist hook
      queryClient.invalidateQueries({ queryKey: ["wishlistCollections"] });
    } catch (error) {
      SafeLogger.error("Failed to toggle property in collection:", error);
      Alert.alert("Error", "Failed to update collection");
    }
  };

  const isPropertyInCollection = (collection: WishlistCollection) => {
    if (!propertyId) return false;
    return collection.properties.includes(propertyId);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {" "}
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.gray[900]
              : theme.colors.gray[50],
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
            },
          ]}
        >
          {" "}
          <Text
            style={[
              styles.title,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {propertyId
              ? t("wishlist.addToCollection")
              : t("wishlist.manageCollections")}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons
              name="close"
              size={24}
              color={isDark ? theme.colors.gray[50] : theme.colors.gray[900]}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={[
                  styles.loadingText,
                  {
                    color: isDark
                      ? theme.colors.gray[50]
                      : theme.colors.gray[900],
                  },
                ]}
              >
                {t("common.loading")}
              </Text>
            </View>
          ) : (
            <>
              {/* Collections List */}
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection._id}
                  style={[
                    styles.collectionItem,
                    {
                      backgroundColor: isDark
                        ? theme.colors.gray[800]
                        : theme.colors.gray[50],
                      borderColor: isDark
                        ? theme.colors.gray[700]
                        : theme.colors.gray[200],
                    },
                  ]}
                  onPress={() =>
                    handleToggleProperty(
                      collection._id,
                      isPropertyInCollection(collection)
                    )
                  }
                >
                  <View style={styles.collectionInfo}>
                    <Text
                      style={[
                        styles.collectionName,
                        {
                          color: isDark
                            ? theme.colors.gray[50]
                            : theme.colors.gray[900],
                        },
                      ]}
                    >
                      {collection.name}
                    </Text>
                    {collection.description && (
                      <Text
                        style={[
                          styles.collectionDescription,
                          {
                            color: isDark
                              ? theme.colors.gray[400]
                              : theme.colors.gray[600],
                          },
                        ]}
                      >
                        {collection.description}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.propertyCount,
                        {
                          color: isDark
                            ? theme.colors.gray[400]
                            : theme.colors.gray[600],
                        },
                      ]}
                    >
                      {collection.properties.length}{" "}
                      {collection.properties.length === 1
                        ? "property"
                        : "properties"}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      isPropertyInCollection(collection)
                        ? "checkmark-circle"
                        : "add-circle-outline"
                    }
                    size={24}
                    color={
                      isPropertyInCollection(collection)
                        ? theme.colors.primary
                        : isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600]
                    }
                  />
                </TouchableOpacity>
              ))}
              {/* Create New Collection Button */}
              {!showCreateForm && (
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    {
                      backgroundColor: isDark
                        ? theme.colors.gray[800]
                        : theme.colors.gray[50],
                      borderColor: isDark
                        ? theme.colors.gray[700]
                        : theme.colors.gray[200],
                    },
                  ]}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Ionicons name="add" size={24} color={theme.colors.primary} />
                  <Text
                    style={[
                      styles.createButtonText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {t("wishlist.createNewCollection")}
                  </Text>
                </TouchableOpacity>
              )}
              {/* Create Collection Form */}{" "}
              {showCreateForm && (
                <View
                  style={[
                    styles.createForm,
                    {
                      backgroundColor: isDark
                        ? theme.colors.gray[800]
                        : theme.colors.gray[50],
                      borderColor: isDark
                        ? theme.colors.gray[700]
                        : theme.colors.gray[200],
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark
                          ? theme.colors.gray[900]
                          : theme.colors.white,
                        color: isDark
                          ? theme.colors.gray[50]
                          : theme.colors.gray[900],
                        borderColor: isDark
                          ? theme.colors.gray[700]
                          : theme.colors.gray[200],
                      },
                    ]}
                    placeholder={t("wishlist.collectionName")}
                    placeholderTextColor={
                      isDark ? theme.colors.gray[400] : theme.colors.gray[600]
                    }
                    value={newCollectionName}
                    onChangeText={setNewCollectionName}
                    maxLength={50}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        backgroundColor: isDark
                          ? theme.colors.gray[900]
                          : theme.colors.white,
                        color: isDark
                          ? theme.colors.gray[50]
                          : theme.colors.gray[900],
                        borderColor: isDark
                          ? theme.colors.gray[700]
                          : theme.colors.gray[200],
                      },
                    ]}
                    placeholder={t("wishlist.collectionDescription")}
                    placeholderTextColor={
                      isDark ? theme.colors.gray[400] : theme.colors.gray[600]
                    }
                    value={newCollectionDescription}
                    onChangeText={setNewCollectionDescription}
                    maxLength={200}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={styles.formButtons}>
                    {" "}
                    <TouchableOpacity
                      style={[
                        styles.cancelButton,
                        {
                          borderColor: isDark
                            ? theme.colors.gray[700]
                            : theme.colors.gray[200],
                        },
                      ]}
                      onPress={() => {
                        setShowCreateForm(false);
                        setNewCollectionName("");
                        setNewCollectionDescription("");
                      }}
                    >
                      <Text
                        style={[
                          styles.cancelButtonText,
                          {
                            color: isDark
                              ? theme.colors.gray[400]
                              : theme.colors.gray[600],
                          },
                        ]}
                      >
                        {t("common.cancel")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        { backgroundColor: theme.colors.primary },
                        creating && styles.disabledButton,
                      ]}
                      onPress={handleCreateCollection}
                      disabled={creating}
                    >
                      {creating ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.saveButtonText}>
                          {t("common.save")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
  },
  collectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  collectionDescription: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  propertyCount: {
    fontSize: fontSize.sm,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  createButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
  },
  createForm: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
  },
  saveButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: "white",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CollectionsModal;
