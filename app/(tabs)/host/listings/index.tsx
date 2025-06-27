import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useProperties } from "./hooks/useProperties";
import { Property } from "./utils/types";
import PropertyListItem from "./components/PropertyListItem";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";

export default function ListingsPage() {
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
    <View style={styles.container}>
      <FlatList
        data={properties}
        renderItem={renderProperty}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContainer,
          properties.length === 0 && styles.emptyContainer,
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
    </View>
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
