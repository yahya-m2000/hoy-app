/**
 * Unified Property Context
 *
 * Centralized state management for all property-related functionality
 * including wishlist state, property selection, and shared property operations.
 *
 * @module @features/properties/context/PropertyContext
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@core/context";
import { showAuthPrompt } from "@core/auth/utils";
import { WishlistService, WishlistCollection } from "@core/api/services";
import type { PropertyType } from "@core/types/property.types";
import { ContextErrorBoundary } from "@core/error/ContextErrorBoundary";

// ========================================
// TYPES
// ========================================

export interface PropertyState {
  // Property selection
  selectedProperty: PropertyType | null;
  properties: PropertyType[];

  // Wishlist state
  collections: WishlistCollection[];
  wishlistedProperties: Set<string>; // Set of property IDs that are wishlisted

  // UI state
  showCollectionsModal: boolean;
  collectionsModalPropertyId: string | null;

  // Loading states
  isLoadingCollections: boolean;
  isTogglingWishlist: boolean;

  // Error states
  collectionsError: string | null;
}

// Action types
type PropertyAction =
  | { type: "SET_SELECTED_PROPERTY"; payload: PropertyType | null }
  | { type: "SET_PROPERTIES"; payload: PropertyType[] }
  | { type: "SET_COLLECTIONS"; payload: WishlistCollection[] }
  | { type: "ADD_TO_WISHLIST"; payload: string } // propertyId
  | { type: "REMOVE_FROM_WISHLIST"; payload: string } // propertyId
  | { type: "SET_WISHLISTED_PROPERTIES"; payload: Set<string> }
  | { type: "SET_COLLECTIONS_MODAL_VISIBLE"; payload: boolean }
  | { type: "SET_COLLECTIONS_MODAL_PROPERTY_ID"; payload: string | null }
  | { type: "SET_LOADING_COLLECTIONS"; payload: boolean }
  | { type: "SET_TOGGLING_WISHLIST"; payload: boolean }
  | { type: "SET_COLLECTIONS_ERROR"; payload: string | null }
  | { type: "RESET_STATE" };

// Context type
export interface PropertyContextType {
  state: PropertyState;
  dispatch: React.Dispatch<PropertyAction>;

  // Property actions
  setSelectedProperty: (property: PropertyType | null) => void;
  setProperties: (properties: PropertyType[]) => void;

  // Wishlist actions
  loadCollections: () => Promise<void>;
  addToWishlist: (propertyId: string, collectionId?: string) => Promise<void>;
  removeFromWishlist: (propertyId: string) => Promise<void>;
  toggleWishlist: (propertyId: string) => Promise<void>;
  isPropertyWishlisted: (propertyId: string) => boolean;

  // Collections modal actions
  showCollectionsModal: (propertyId: string) => void;
  hideCollectionsModal: () => void;

  // Utility actions
  resetState: () => void;
}

// ========================================
// INITIAL STATE
// ========================================

const initialState: PropertyState = {
  selectedProperty: null,
  properties: [],
  collections: [],
  wishlistedProperties: new Set(),
  showCollectionsModal: false,
  collectionsModalPropertyId: null,
  isLoadingCollections: false,
  isTogglingWishlist: false,
  collectionsError: null,
};

// ========================================
// REDUCER
// ========================================

function propertyReducer(
  state: PropertyState,
  action: PropertyAction
): PropertyState {
  switch (action.type) {
    case "SET_SELECTED_PROPERTY":
      return { ...state, selectedProperty: action.payload };

    case "SET_PROPERTIES":
      return { ...state, properties: action.payload };

    case "SET_COLLECTIONS":
      return { ...state, collections: action.payload };

    case "ADD_TO_WISHLIST":
      return {
        ...state,
        wishlistedProperties: new Set([
          ...state.wishlistedProperties,
          action.payload,
        ]),
      };

    case "REMOVE_FROM_WISHLIST":
      const newWishlisted = new Set(state.wishlistedProperties);
      newWishlisted.delete(action.payload);
      return {
        ...state,
        wishlistedProperties: newWishlisted,
      };

    case "SET_WISHLISTED_PROPERTIES":
      return { ...state, wishlistedProperties: action.payload };

    case "SET_COLLECTIONS_MODAL_VISIBLE":
      return { ...state, showCollectionsModal: action.payload };

    case "SET_COLLECTIONS_MODAL_PROPERTY_ID":
      return { ...state, collectionsModalPropertyId: action.payload };

    case "SET_LOADING_COLLECTIONS":
      return { ...state, isLoadingCollections: action.payload };

    case "SET_TOGGLING_WISHLIST":
      return { ...state, isTogglingWishlist: action.payload };

    case "SET_COLLECTIONS_ERROR":
      return { ...state, collectionsError: action.payload };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
}

// ========================================
// CONTEXT CREATION
// ========================================

const PropertyContext = createContext<PropertyContextType | undefined>(
  undefined
);

// ========================================
// PROVIDER COMPONENT
// ========================================

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(propertyReducer, initialState);
  const queryClient = useQueryClient();
  const { isAuthenticated, isAuthChecked } = useAuth();
  const previousCollectionsRef = useRef<WishlistCollection[]>([]);

  // ========================================
  // QUERIES
  // ========================================

  // Get wishlist collections
  const { data: collectionsData = [], isLoading: isLoadingCollections } =
    useQuery({
      queryKey: ["wishlistCollections"],
      queryFn: () => WishlistService.getCollections(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: isAuthChecked && isAuthenticated,
    });

  // ========================================
  // MUTATIONS
  // ========================================

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async ({
      propertyId,
      collectionId,
    }: {
      propertyId: string;
      collectionId?: string;
    }) => {
      console.log(
        "PropertyContext: Adding property to wishlist:",
        propertyId,
        "collection:",
        collectionId
      );
      if (collectionId) {
        return await WishlistService.addPropertyToCollection(
          collectionId,
          propertyId
        );
      } else {
        // Use default collection
        const defaultCollection = await getDefaultCollection();
        return await WishlistService.addPropertyToCollection(
          defaultCollection._id,
          propertyId
        );
      }
    },
    onSuccess: (_, { propertyId }) => {
      console.log(
        "PropertyContext: Successfully added property to wishlist:",
        propertyId
      );
      dispatch({ type: "ADD_TO_WISHLIST", payload: propertyId });
      queryClient.invalidateQueries({ queryKey: ["wishlistCollections"] });
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      // Find all collections that contain this property and remove it
      const collectionsWithProperty = state.collections.filter((collection) =>
        collection.properties.includes(propertyId)
      );

      // Remove from all collections that contain it
      await Promise.all(
        collectionsWithProperty.map((collection) =>
          WishlistService.removePropertyFromCollection(
            collection._id,
            propertyId
          )
        )
      );
    },
    onSuccess: (_, propertyId) => {
      dispatch({ type: "REMOVE_FROM_WISHLIST", payload: propertyId });
      queryClient.invalidateQueries({ queryKey: ["wishlistCollections"] });
    },
  });

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  // Get or create default collection
  const getDefaultCollection = async (): Promise<WishlistCollection> => {
    if (state.collections.length === 0) {
      return await WishlistService.createCollection({
        name: "Favorites",
        description: "My favorite properties",
      });
    }
    return state.collections[0];
  };

  // Build wishlisted properties set from collections
  const buildWishlistedPropertiesSet = useCallback(
    (collections: WishlistCollection[]) => {
      const wishlistedSet = new Set<string>();
      collections.forEach((collection) => {
        if (collection.properties && Array.isArray(collection.properties)) {
          collection.properties.forEach((propertyId) => {
            wishlistedSet.add(propertyId);
          });
        }
      });
      return wishlistedSet;
    },
    []
  );

  // ========================================
  // EFFECTS
  // ========================================

  /**
   * Effect: collectionsData
   * ------------------------------------
   * 1. Only dispatch SET_COLLECTIONS & SET_WISHLISTED_PROPERTIES when the
   *    incoming React-Query data is genuinely different from what we already
   *    have. This prevents the render→dispatch→render feedback loop that was
   *    blowing up the update depth.
   * 2. Memoises the last processed collections via a ref for ultra-cheap
   *    shallow equality checks.
   */
  useEffect(() => {
    if (!collectionsData) return;

    const prev = previousCollectionsRef.current;

    const collectionsChanged =
      prev.length !== collectionsData.length ||
      prev.some(
        (p, i) =>
          p._id !== collectionsData[i]?._id ||
          (p.properties?.length ?? 0) !==
            (collectionsData[i]?.properties?.length ?? 0)
      );

    if (collectionsChanged) {
      // 1) Update collections
      dispatch({ type: "SET_COLLECTIONS", payload: collectionsData });

      // 2) Update derived wishlisted set in a single dispatch to avoid extra renders
      const wishlistedSet = buildWishlistedPropertiesSet(collectionsData);
      dispatch({ type: "SET_WISHLISTED_PROPERTIES", payload: wishlistedSet });

      // Cache snapshot for next comparison
      previousCollectionsRef.current = collectionsData;
    }
  }, [collectionsData]);

  /**
   * Effect: loading flag
   * Keep loading state in sync but isolated from collection updates so it
   * cannot retrigger the main collection effect.
   */
  useEffect(() => {
    dispatch({
      type: "SET_LOADING_COLLECTIONS",
      payload: isLoadingCollections,
    });
  }, [isLoadingCollections]);

  // ========================================
  // CONTEXT ACTIONS
  // ========================================

  // Property actions
  const setSelectedProperty = useCallback((property: PropertyType | null) => {
    dispatch({ type: "SET_SELECTED_PROPERTY", payload: property });
  }, []);

  const setProperties = useCallback((properties: PropertyType[]) => {
    dispatch({ type: "SET_PROPERTIES", payload: properties });
  }, []);

  // Wishlist actions
  const loadCollections = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: "SET_LOADING_COLLECTIONS", payload: true });
      dispatch({ type: "SET_COLLECTIONS_ERROR", payload: null });

      const collections = await WishlistService.getCollections();
      dispatch({ type: "SET_COLLECTIONS", payload: collections });
    } catch (error) {
      dispatch({
        type: "SET_COLLECTIONS_ERROR",
        payload:
          error instanceof Error ? error.message : "Failed to load collections",
      });
    } finally {
      dispatch({ type: "SET_LOADING_COLLECTIONS", payload: false });
    }
  }, [isAuthenticated]);

  const addToWishlist = useCallback(
    async (propertyId: string, collectionId?: string) => {
      if (!isAuthenticated) {
        showAuthPrompt({
          title: "Sign in Required",
          message: "You need to sign in to save properties to your wishlist.",
        });
        return;
      }

      dispatch({ type: "SET_TOGGLING_WISHLIST", payload: true });
      try {
        await addToWishlistMutation.mutateAsync({ propertyId, collectionId });
      } finally {
        dispatch({ type: "SET_TOGGLING_WISHLIST", payload: false });
      }
    },
    [isAuthenticated, addToWishlistMutation]
  );

  const removeFromWishlist = useCallback(
    async (propertyId: string) => {
      if (!isAuthenticated) return;

      dispatch({ type: "SET_TOGGLING_WISHLIST", payload: true });
      try {
        await removeFromWishlistMutation.mutateAsync(propertyId);
      } finally {
        dispatch({ type: "SET_TOGGLING_WISHLIST", payload: false });
      }
    },
    [isAuthenticated, removeFromWishlistMutation]
  );

  const toggleWishlist = useCallback(
    async (propertyId: string) => {
      if (!isAuthenticated) {
        showAuthPrompt({
          title: "Sign in Required",
          message: "You need to sign in to save properties to your wishlist.",
        });
        return;
      }

      const isWishlisted = state.wishlistedProperties.has(propertyId);

      if (isWishlisted) {
        await removeFromWishlist(propertyId);
      } else {
        await addToWishlist(propertyId);
      }
    },
    [
      isAuthenticated,
      state.wishlistedProperties,
      addToWishlist,
      removeFromWishlist,
    ]
  );

  const isPropertyWishlisted = useCallback(
    (propertyId: string) => {
      if (!isAuthenticated) return false;
      return state.wishlistedProperties.has(propertyId);
    },
    [isAuthenticated, state.wishlistedProperties]
  );

  // Collections modal actions
  const showCollectionsModal = useCallback((propertyId: string) => {
    console.log(
      "PropertyContext: Showing collections modal for property:",
      propertyId
    );
    dispatch({ type: "SET_COLLECTIONS_MODAL_VISIBLE", payload: true });
    dispatch({
      type: "SET_COLLECTIONS_MODAL_PROPERTY_ID",
      payload: propertyId,
    });
  }, []);

  const hideCollectionsModal = useCallback(() => {
    dispatch({ type: "SET_COLLECTIONS_MODAL_VISIBLE", payload: false });
    dispatch({ type: "SET_COLLECTIONS_MODAL_PROPERTY_ID", payload: null });
  }, []);

  // Utility actions
  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: PropertyContextType = useMemo(
    () => ({
      state,
      dispatch,
      setSelectedProperty,
      setProperties,
      loadCollections,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isPropertyWishlisted,
      showCollectionsModal,
      hideCollectionsModal,
      resetState,
    }),
    [
      state,
      setSelectedProperty,
      setProperties,
      loadCollections,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isPropertyWishlisted,
      showCollectionsModal,
      hideCollectionsModal,
      resetState,
    ]
  );

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  );
};

// ========================================
// CONTEXT HOOK
// ========================================

export const usePropertyContext = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error(
      "usePropertyContext must be used within a PropertyProvider"
    );
  }
  return context;
};

// ========================================
// SELECTOR HOOKS
// ========================================

export const usePropertySelection = () => {
  const { state, setSelectedProperty, setProperties } = usePropertyContext();
  return {
    selectedProperty: state.selectedProperty,
    properties: state.properties,
    setSelectedProperty,
    setProperties,
  };
};

export const useWishlistState = () => {
  const {
    state,
    loadCollections,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isPropertyWishlisted,
    showCollectionsModal,
    hideCollectionsModal,
  } = usePropertyContext();

  return {
    collections: state.collections,
    wishlistedProperties: state.wishlistedProperties,
    showCollectionsModal: state.showCollectionsModal,
    collectionsModalPropertyId: state.collectionsModalPropertyId,
    isLoadingCollections: state.isLoadingCollections,
    isTogglingWishlist: state.isTogglingWishlist,
    collectionsError: state.collectionsError,
    loadCollections,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isPropertyWishlisted,
    showCollectionsModalAction: showCollectionsModal,
    hideCollectionsModal,
  };
};

// ========================================
// PROVIDER WITH ERROR BOUNDARY
// ========================================

export const PropertyProviderWithErrorBoundary: React.FC<
  PropertyProviderProps
> = ({ children }) => (
  <ContextErrorBoundary contextName="Property" critical={false}>
    <PropertyProvider>{children}</PropertyProvider>
  </ContextErrorBoundary>
);
