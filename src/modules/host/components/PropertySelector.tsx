/**
 * Property Selector Component
 * Allows hosts to select which property calendar to view
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@shared/hooks/useTheme";

interface Property {
  id: string;
  name: string;
  address: string;
}

interface PropertySelectorProps {
  properties: Property[];
  selectedPropertyId: string;
  onPropertySelect: (propertyId: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedPropertyId,
  onPropertySelect,
  isVisible,
  onClose,
}) => {
  const theme = useTheme();

  if (!isVisible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
      <View
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <View
          style={[styles.header, { borderBottomColor: theme.colors.border }]}
        >
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Select Property
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: theme.colors.primary }]}>
              Done
            </Text>
          </Pressable>
        </View>

        <View style={styles.propertiesList}>
          {properties.map((property) => (
            <Pressable
              key={property.id}
              style={[
                styles.propertyItem,
                {
                  backgroundColor:
                    property.id === selectedPropertyId
                      ? theme.colors.primaryLight
                      : "transparent",
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => {
                onPropertySelect(property.id);
                onClose();
              }}
            >
              <View style={styles.propertyInfo}>
                <Text
                  style={[styles.propertyName, { color: theme.text.primary }]}
                >
                  {property.name}
                </Text>
                <Text
                  style={[
                    styles.propertyAddress,
                    { color: theme.text.secondary },
                  ]}
                >
                  {property.address}
                </Text>
              </View>

              {property.id === selectedPropertyId && (
                <Text
                  style={[styles.checkmark, { color: theme.colors.primary }]}
                >
                  ✓
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  container: {
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  propertiesList: {
    padding: 16,
  },
  propertyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
  },
});

export default PropertySelector;
