import React, { createContext, useContext, useState, useCallback } from "react";

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
  setSelectedProperty: (property: Property) => void;
  getPropertyById: (id: string) => Property | undefined;
  isLoading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined
);

// Mock properties data - in real app this would come from API
const mockProperties: Property[] = [
  {
    id: "6841de513b269513a6e77fb5",
    name: "Modern Williamsburg Loft",
    address: "501 Bedford Ave, Brooklyn, NY 11211",
    type: "loft",
    images: ["https://example.com/williamsburg1.jpg"],
    isActive: true,
  },
  {
    id: "6841de513b269513a6e77fb6",
    name: "Cozy Downtown Studio",
    address: "123 Main St, New York, NY 10001",
    type: "apartment",
    images: ["https://example.com/studio1.jpg"],
    isActive: true,
  },
  {
    id: "6841de513b269513a6e77fb7",
    name: "Luxury Manhattan Penthouse",
    address: "789 Fifth Ave, New York, NY 10022",
    type: "penthouse",
    images: ["https://example.com/penthouse1.jpg"],
    isActive: true,
  },
  {
    id: "6841de513b269513a6e77fb8",
    name: "Brooklyn Heights Brownstone",
    address: "456 Remsen St, Brooklyn, NY 11201",
    type: "house",
    images: ["https://example.com/brownstone1.jpg"],
    isActive: true,
  },
];

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedProperty, setSelectedPropertyState] =
    useState<Property | null>(
      mockProperties[0] // Default to first property
    );
  const [properties] = useState<Property[]>(mockProperties);
  const [isLoading] = useState(false);

  const setSelectedProperty = useCallback((property: Property) => {
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
