import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as userService from "@common/services/userService";
import * as propertyService from "@host/services/propertyService";
import { useAuth } from "@common-context/AuthContext";
import { useDateSelection } from "@common-context/DateSelectionContext";
import { showAuthPrompt } from "@common/utils/authUtils";
import type { PropertyType } from "@common/types/property";
import type { ExtendedUser } from "../components/screens/PropertyDetails/HostSection";

export const usePropertyDetails = (property: PropertyType | null) => {
  const { user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const { propertyDates } = useDateSelection();

  // State
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [host, setHost] = useState<ExtendedUser | null>(null);
  const [hostLoading, setHostLoading] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = !!(user && accessToken);

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

  // Wishlist queries and mutations
  const { data: savedProperties = [] } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: userService.getSavedProperties,
    enabled: isAuthenticated && !!property?._id,
  });

  const isWishlisted = isAuthenticated
    ? savedProperties.some((p: any) => p._id === property?._id)
    : false;

  const addMutation = useMutation({
    mutationFn: () => userService.addSavedProperty(property!._id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] }),
  });

  const removeMutation = useMutation({
    mutationFn: () => userService.removeSavedProperty(property!._id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] }),
  });
  // Fetch host data
  useEffect(() => {
    const fetchHost = async () => {
      if (!property?._id) return;

      setHostLoading(true);
      try {
        // Use the new API endpoint to get detailed host information
        const hostInfo = await propertyService.fetchPropertyHostInfo(
          property._id
        );

        setHost({
          _id: hostInfo.hostId,
          id: hostInfo.hostId,
          firstName: hostInfo.hostName ? hostInfo.hostName.split(" ")[0] : "",
          lastName: hostInfo.hostName
            ? hostInfo.hostName.split(" ").slice(1).join(" ")
            : "",
          email: hostInfo.email || "",
          role: "host",
          joinedDate: hostInfo.joinedDate || new Date().toISOString(),
          avatarUrl: hostInfo.hostImage,
          profileImage: hostInfo.hostImage,
          // Add additional host information
          phone: hostInfo.phone || "",
          hostType: hostInfo.hostType || "individual",
          isSuperHost: hostInfo.isSuperHost || false,
          responseRate: hostInfo.responseRate || "New Host",
          responseTime: hostInfo.responseTime || "New Host",
        } as ExtendedUser);
      } catch (error) {
        console.error("Error setting host data:", error);
        setHost(null);
      } finally {
        setHostLoading(false);
      }
    };
    fetchHost();
  }, [property]);

  // Handle wishlist
  const handleWishlist = () => {
    if (!isAuthenticated) {
      showAuthPrompt({
        title: "Sign in Required",
        message: "You need to sign in to save properties to your wishlist.",
      });
      return;
    }
    if (isWishlisted) removeMutation.mutate();
    else addMutation.mutate();
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
  };
};
