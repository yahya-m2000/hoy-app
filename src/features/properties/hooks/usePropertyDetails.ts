import { useState, useRef, useEffect } from "react";
import { useAuth } from "@core/context/AuthContext";
import type { PropertyType } from "@core/types/property.types";
import type { ExtendedUser } from "@core/types/user.types";

export const usePropertyDetails = (property: PropertyType | null) => {
  const { isAuthenticated } = useAuth();
  
  // TODO: Implement useDateSelection hook
  const propertyDates = new Map();
  
  // TODO: Implement useWishlist hook
  const isPropertyWishlisted = (id: string) => false;
  const toggleWishlist = (id: string) => {};
  const isToggling = false;

  // State
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [host, setHost] = useState<ExtendedUser | null>(null);
  const [hostLoading, setHostLoading] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Safe validation utility function to validate MongoDB ObjectId format
  const validatePropertyId = (
    property: PropertyType | null | undefined
  ): { isValid: boolean; error?: string } => {
    if (!property) {
      return { isValid: false, error: "Property is null or undefined" };
    }

    if (!property._id) {
      return { isValid: false, error: "Property ID is missing" };
    }

    if (typeof property._id !== "string") {
      return {
        isValid: false,
        error: `Property ID is not a string (${typeof property._id})`,
      };
    }

    try {
      if (!property._id.match(/^[0-9a-fA-F]{24}$/)) {
        return {
          isValid: false,
          error: `Invalid MongoDB ObjectId format: ${property._id}`,
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: `Error validating property ID: ${error}`,
      };
    }

    return { isValid: true };
  };
  // Wishlist status - using the new collections system
  const isWishlisted = property?._id
    ? isPropertyWishlisted(property._id)
    : false; // Process host data from property
  useEffect(() => {
    if (!property) {
      setHost(null);
      setHostLoading(false);
      return;
    }

    setHostLoading(true);

    try {
      // Use host object from property data (already included from backend)
      const hostData = (property as any)?.host;

      if (hostData) {
        setHost({
          _id: hostData.id,
          id: hostData.id,
          firstName: hostData.firstName || "",
          lastName: hostData.lastName || "",
          email: "", // Not included in host object, could be added if needed
          role: "host",
          joinedDate: hostData.hostingSince || new Date().toISOString(),
          avatarUrl: hostData.profilePicture,
          profileImage: hostData.profilePicture,
          // Add additional host information
          phone: "", // Not included in host object
          hostType: "individual",
          isSuperHost: hostData.isSuperHost || false,
          responseRate: "New Host", // Could be added to backend
          responseTime: "New Host", // Could be added to backend
          // Add the host's data from property
          averageRating: hostData.rating || 0,
          hostingSince: hostData.hostingSince,
          hostingYears: hostData.hostingYears || 0,
          totalProperties: hostData.totalProperties || 0,
          activeProperties: hostData.activeProperties || 0,
          properties: hostData.properties || [],
        } as ExtendedUser & {
          averageRating: number;
          hostingSince: string;
          hostingYears: number;
          totalProperties: number;
          activeProperties: number;
          properties: any[];
        });
      } else {
        // If no host object, set basic fallback
        setHost({
          _id: property.hostId || "",
          id: property.hostId || "",
          firstName: "Host",
          lastName: "",
          email: "",
          role: "host",
          joinedDate: new Date().toISOString(),
          avatarUrl: undefined,
          profileImage: undefined,
          phone: "",
          hostType: "individual",
          isSuperHost: false,
          responseRate: "New Host",
          responseTime: "New Host",
          averageRating: 0,
        } as ExtendedUser & { averageRating: number });
      }
    } catch (error) {
      console.error("Error processing host data:", error);
      setHost(null);
    } finally {
      setHostLoading(false);
    }
  }, [property]);
  // Handle wishlist
  const handleWishlist = () => {
    if (!property?._id) return;
    toggleWishlist(property._id);
  };

  // Handle dates initialization
  const datesInitializedRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!property) return;

    const validationResult = validatePropertyId(property);
    if (!validationResult.isValid) {
      console.debug(`Cannot initialize dates: ${validationResult.error}`);
      return;
    }

    if (!datesInitializedRef.current[property._id]) {
      datesInitializedRef.current[property._id] = true;
    }
  }, [property]);

  // Get selected dates
  const selectedDates = property?._id
    ? propertyDates.get(property._id)?.selectedDates
    : { startDate: null, endDate: null };

  // Calculate nights
  const calculateNights = () => {
    if (!selectedDates?.startDate || !selectedDates?.endDate) return 0;
    const diffTime = Math.abs(
      selectedDates.endDate.getTime() - selectedDates.startDate.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  return {
    // State
    showFullDescription,
    setShowFullDescription,
    host,
    hostLoading,
    messageModalVisible,
    setMessageModalVisible,
    messageContent,
    setMessageContent,
    sendingMessage,
    setSendingMessage,

    // Computed values
    isAuthenticated,
    isWishlisted,
    selectedDates,
    nights,

    // Actions
    handleWishlist,
    validatePropertyId,

    // Loading states
    isToggling,
  };
};
