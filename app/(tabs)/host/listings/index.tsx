import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

// Navigation
import { router } from "expo-router";

// Features
import { useProperties } from "@features/host/hooks/useProperties";
import { Property } from "@core/types/listings.types";
import PropertyListItem from "@features/host/components/listings/PropertyListItem";
import EmptyState from "@features/host/components/listings/EmptyState";
import LoadingState from "@features/host/components/listings/LoadingState";
import { Ionicons } from "node_modules/@expo/vector-icons/build/Icons";
import { useTheme } from "@core/hooks";

// Shared Components
import { Container, Header } from "@shared/components";
import { spacing } from "src/core/design";

export default function ListingsPage() {
  const { theme, isDark } = useTheme();
  const { properties, loading, error, refreshing, refresh, deleteProperty } =
    useProperties();
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(
    null
  );
  const handlePropertyPress = (property: Property) => {
    router.push({
      pathname: "/(tabs)/host/listings/property-details",
      params: { id: property._id },
    });
  };

  const handleEditProperty = (property: Property) => {
    router.push({
      pathname: "/(tabs)/host/listings/add-property",
      params: {
        mode: "edit",
        propertyId: property._id,
      },
    });
  };

  const HeaderAddButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/host/listings/add-property")}
      style={{ padding: 8 }}
    >
      <Ionicons
        name="add"
        size={24}
        color={isDark ? theme.white : theme.colors.gray[900]}
      />
    </TouchableOpacity>
  );

  const handleDeleteProperty = (property: Property) => {
    Alert.alert(
      "Delete Property",
      `Are you sure you want to delete "${property.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingPropertyId(property._id);
              await deleteProperty(property._id);
              Alert.alert("Success", "Property deleted successfully");
            } catch {
              Alert.alert(
                "Error",
                "Failed to delete property. Please try again."
              );
            } finally {
              setDeletingPropertyId(null);
            }
          },
        },
      ]
    );
  };
  const handleAddProperty = () => {
    router.push("/(tabs)/host/listings/add-property");
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <PropertyListItem
      property={item}
      onPress={() => handlePropertyPress(item)}
      onEdit={() => handleEditProperty(item)}
      onDelete={() => handleDeleteProperty(item)}
      isDeleting={deletingPropertyId === item._id}
    />
  );
  if (loading) {
    return <LoadingState />;
  }

  return (
    <Container flex={1} backgroundColor="background">
      <Header
        title="My Properties"
        rightIcon="add"
        onRightPress={handleAddProperty}
      />
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContainer,
          properties.length === 0 && styles.emptyContainer,
          { paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={() => (
          <EmptyState
            onAddProperty={handleAddProperty}
            hasError={!!error}
            errorMessage={error}
            onRetry={refresh}
          />
        )}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
