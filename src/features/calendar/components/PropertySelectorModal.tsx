import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { iconSize, fontSize, fontWeight, spacing, radius } from "@core/design";
import { useTheme } from "@core/hooks";
import { Property } from "../hooks/useProperty";
import { Icon, BottomSheetModal } from "@shared/components";

interface PropertySelectorModalProps {
  isVisible: boolean;
  onClose: () => void;
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property) => void;
}

const PropertySelectorModal: React.FC<PropertySelectorModalProps> = memo(
  ({ isVisible, onClose, properties, selectedProperty, onPropertySelect }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();

    const handlePropertySelect = (property: Property) => {
      onPropertySelect(property);
      onClose();
    };

    if (!isVisible) return null;

    return (
      <BottomSheetModal
        title={t("calendar.selectProperty")}
        onClose={onClose}
        showSaveButton={false}
        testID="property-selector-modal"
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.propertiesList}>
            {properties.map((property) => {
              const isSelected = selectedProperty?.id === property.id;

              return (
                <TouchableOpacity
                  key={property.id}
                  style={[
                    styles.propertyItem,
                    {
                      backgroundColor: isSelected
                        ? theme.colors?.primary + "10" || "#007AFF10"
                        : theme.white || "#FFFFFF",
                      borderColor: isSelected
                        ? theme.colors?.primary || "#007AFF"
                        : theme.colors?.gray?.[200] || "#E0E0E0",
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => handlePropertySelect(property)}
                  activeOpacity={0.7}
                >
                  {/* Property Icon */}
                  <View
                    style={[
                      styles.propertyIcon,
                      {
                        backgroundColor: isSelected
                          ? theme.colors?.primary || "#007AFF"
                          : theme.colors?.gray?.[400] || "#9CA3AF",
                      },
                    ]}
                  >
                    <Icon name="home" size={iconSize.sm} color="#FFFFFF" />
                  </View>

                  {/* Property Info */}
                  <View style={styles.propertyInfo}>
                    <Text
                      style={[
                        styles.propertyName,
                        {
                          color: theme.text?.primary || "#000000",
                          fontWeight: isSelected
                            ? fontWeight.semibold
                            : fontWeight.medium,
                        },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {property.name}
                    </Text>
                    <Text
                      style={[
                        styles.propertyAddress,
                        { color: theme.text?.secondary || "#666666" },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {property.address}
                    </Text>
                    <View style={styles.propertyMeta}>
                      <Text
                        style={[
                          styles.propertyType,
                          { color: theme.text?.tertiary || "#999999" },
                        ]}
                      >
                        {property.type.charAt(0).toUpperCase() +
                          property.type.slice(1)}
                      </Text>
                      {property.isActive && (
                        <View
                          style={[
                            styles.activeIndicator,
                            {
                              backgroundColor:
                                theme.colors?.success || "#22C55E",
                            },
                          ]}
                        >
                          <Text style={styles.activeText}>
                            {t("property.status.active")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <View style={styles.selectionIndicator}>
                      <Icon
                        name="checkmark"
                        size={iconSize.sm}
                        color={theme.colors?.primary || "#007AFF"}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: 400,
  },
  propertiesList: {
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  propertyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  propertyIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  propertyInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  propertyName: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  propertyAddress: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  propertyMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  propertyType: {
    fontSize: fontSize.xs,
    marginRight: spacing.sm,
  },
  activeIndicator: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  activeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: fontWeight.medium,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});

PropertySelectorModal.displayName = "PropertySelectorModal";

export default PropertySelectorModal;
