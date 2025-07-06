import React, { createContext, useContext, useState, useCallback } from "react";
import { useHostProperties } from "@features/properties/hooks";
import { Property as APIProperty } from "@core/types/property.types";

export interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  images: string[];
  isActive: boolean;
}

interface PropertyContextType {
  selectedProperty: Property | null;
  properties: Property[];
  setSelectedProperty: (property: Property | null) => void;
  getPropertyById: (id: string) => Property | undefined;
  isLoading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined
);

/**
 * Transform API Property to Calendar Property interface
 */
const transformAPIProperty = (apiProperty: APIProperty): Property => {
  return {
    id: apiProperty._id,
    name: apiProperty.name,
    address:
      `${apiProperty.address?.street || ""} ${
        apiProperty.address?.city || ""
      } ${apiProperty.address?.state || ""}`.trim() || "Address not available",
    type: apiProperty.type,
    images: apiProperty.images || [],
    isActive: apiProperty.isActive,
  };
};

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { properties: apiProperties, loading: isLoading } = useHostProperties();
  const [selectedProperty, setSelectedPropertyState] =
    useState<Property | null>(null);

  console.log("🏢 PropertyProvider: State update", {
    apiPropertiesCount: apiProperties.length,
    isLoading,
    selectedProperty: selectedProperty?.id,
    apiProperties: apiProperties.map((p) => ({
      id: p._id,
      name: p.name,
      isActive: p.isActive,
    })),
  });

  // Transform API properties to calendar properties - only active properties
  const properties = apiProperties
    .filter((property) => property.isActive) // Only show active properties
    .map(transformAPIProperty);

  console.log("🔄 PropertyProvider: Transformed properties", {
    filteredCount: properties.length,
    transformedProperties: properties.map((p) => ({ id: p.id, name: p.name })),
  });

  // Set default selected property when properties are loaded
  React.useEffect(() => {
    console.log("🎯 PropertyProvider: Effect for default selection", {
      propertiesLength: properties.length,
      hasSelectedProperty: !!selectedProperty,
      firstProperty: properties[0]?.id,
    });

    if (properties.length > 0 && !selectedProperty) {
      console.log(
        "✅ PropertyProvider: Setting default selected property",
        properties[0]
      );
      setSelectedPropertyState(properties[0]);
    }
  }, [properties]); // Removed selectedProperty dependency to prevent conflicts

  const setSelectedProperty = useCallback((property: Property | null) => {
    setSelectedPropertyState(property);
  }, []);

  const getPropertyById = useCallback(
    (id: string) => {
      return properties.find((property) => property.id === id);
    },
    [properties]
  );

  const value: PropertyContextType = {
    selectedProperty,
    properties,
    setSelectedProperty,
    getPropertyById,
    isLoading,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return context;
};
