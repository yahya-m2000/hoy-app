import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import type { PropertyType } from "@common/types/property";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as userService from "@common/services/userService";
import * as propertyService from "@host/services/propertyService";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@common-context/ThemeContext";
import { useAuth } from "@common-context/AuthContext";
import { useDateSelection } from "@common-context/DateSelectionContext";
import { showAuthPrompt } from "@common/utils/authUtils";
import { format } from "date-fns";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";
// import { useChat as useChatContext } from "@common-context/ChatContext";

// Extended User interface with additional profile fields
interface ExtendedUser {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "host" | "admin";
  joinedDate: string;
  avatarUrl?: string;
  profileImage?: string;
  createdAt?: string;
}

// Amenity component
const Amenity: React.FC<{ name: string }> = ({ name }) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.amenity}>
      <Ionicons
        name="checkmark-circle-outline"
        size={16}
        color={theme.colors.primary}
      />
      <Text
        style={[
          styles.amenityText,
          {
            color: isDark
              ? theme.colors.grayPalette[50]
              : theme.colors.grayPalette[900],
          },
        ]}
      >
        {name}
      </Text>
    </View>
  );
};

// Main component
const PropertyModalScreen = () => {
  const { theme, isDark } = useTheme();
  const { user, accessToken } = useAuth();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const isAuthenticated = !!(user && accessToken);

  // Get property data from params - memoize to prevent re-creation on every render
  const propertyParam = params.property as string;
  const property: PropertyType = React.useMemo(() => {
    return propertyParam ? JSON.parse(propertyParam) : null;
  }, [propertyParam]);

  // Check for dates in params
  const startDateParam = params.startDate as string | undefined;
  const endDateParam = params.endDate as string | undefined;
  // Date selection context - remove optimal dates fetching to prevent API calls
  const { propertyDates, selectDatesForProperty } = useDateSelection(); // State
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [host, setHost] = useState<ExtendedUser | null>(null);
  const [hostLoading, setHostLoading] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false); // Access message context
  // const { createNewConversation } = useChatContext();

  // Animation values for scroll position
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0.8, 1],
    extrapolate: "clamp",
  });

  // Safe validation utility function to validate MongoDB ObjectId format
  // Returns a validation result object with success status and error message if any
  const validatePropertyId = (
    property: PropertyType | null | undefined
  ): { isValid: boolean; error?: string } => {
    // Check if property object exists
    if (!property) {
      return { isValid: false, error: "Property is null or undefined" };
    }

    // Check if property._id exists
    if (!property._id) {
      return { isValid: false, error: "Property ID is missing" };
    }

    // Validate property ID is a string
    if (typeof property._id !== "string") {
      return {
        isValid: false,
        error: `Property ID is not a string (${typeof property._id})`,
      };
    }

    // Validate MongoDB ObjectId format using a try-catch to prevent any potential errors
    try {
      // MongoDB ObjectIds are 24 character hex strings
      if (!property._id.match(/^[0-9a-fA-F]{24}$/)) {
        return {
          isValid: false,
          error: `Invalid MongoDB ObjectId format: ${property._id}`,
        };
      }
    } catch (error) {
      // If any error occurs during the match operation
      return {
        isValid: false,
        error: `Error validating property ID: ${error}`,
      };
    }

    // If all checks pass
    return { isValid: true };
  }; // Use a ref to track if we've initialized dates for this property
  const datesInitializedRef = useRef<{ [key: string]: boolean }>({});

  // Handle property change and dates initialization
  useEffect(() => {
    if (!property) return;

    // Validate property ID before proceeding
    const validationResult = validatePropertyId(property);
    if (!validationResult.isValid) {
      console.debug(`Cannot initialize dates: ${validationResult.error}`);
      return;
    }

    // Only initialize dates once per property ID to prevent loops
    if (!datesInitializedRef.current[property._id]) {
      datesInitializedRef.current[property._id] = true;
      // Handle explicit dates from URL params
      if (startDateParam && endDateParam) {
        try {
          const startDate = new Date(startDateParam);
          const endDate = new Date(endDateParam);

          // Check if dates are valid before setting them
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            selectDatesForProperty(property._id, { startDate, endDate });
            return;
          } else {
            console.warn("Invalid date formats provided in URL params");
          }
        } catch (error) {
          console.error("Error parsing dates from params:", error);
        }
      }

      // Note: We removed the optimal dates fetching to prevent excessive API calls
      // Users can manually select dates or they'll be prompted to select dates when booking
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?._id, startDateParam, endDateParam]); // Intentionally limited dependencies to prevent circular updates// Fetch host data
  React.useEffect(() => {
    const fetchHost = async () => {
      if (!property?.hostId) return;

      setHostLoading(true);
      try {
        // Instead of using userService.getUserById which causes 403 errors
        // Use the host information from the property directly

        // Get host data from property
        const hostInfo = propertyService.getPropertyHostInfo(property);

        // Set basic host info that's available from the property
        setHost({
          _id: hostInfo.hostId,
          id: hostInfo.hostId,
          firstName: hostInfo.hostName ? hostInfo.hostName.split(" ")[0] : "",
          lastName: hostInfo.hostName
            ? hostInfo.hostName.split(" ").slice(1).join(" ")
            : "",
          email: "",
          role: "host",
          joinedDate: new Date().toISOString(), // Default to current date if not available
          avatarUrl: hostInfo.hostImage,
          profileImage: hostInfo.hostImage,
        } as ExtendedUser);
      } catch (error) {
        console.error("Error setting host data:", error);
        setHost(null);
      } finally {
        setHostLoading(false);
      }
    };
    fetchHost();
  }, [property]); // Now safe to use property since it's memoized

  // Rest of the component code remains the same
  // ...
  // Wishlist state - only if authenticated
  const { data: savedProperties = [] } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: userService.getSavedProperties,
    enabled: isAuthenticated && !!property?._id, // Only run if authenticated
  });
  const isWishlisted = isAuthenticated
    ? savedProperties.some((p: any) => p._id === property?._id)
    : false;

  const addMutation = useMutation({
    mutationFn: () => userService.addSavedProperty(property._id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] }),
  });
  const removeMutation = useMutation({
    mutationFn: () => userService.removeSavedProperty(property._id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] }),
  });

  // Get the selected dates for this property
  const selectedDates = property?._id
    ? propertyDates.get(property._id)?.selectedDates
    : { startDate: null, endDate: null };

  // Format date strings for display
  const formattedStartDate = selectedDates?.startDate
    ? format(selectedDates.startDate, "EEE, MMM d")
    : "Select dates";

  const formattedEndDate = selectedDates?.endDate
    ? format(selectedDates.endDate, "EEE, MMM d")
    : "";

  // Calculate stay duration
  const calculateNights = () => {
    if (!selectedDates?.startDate || !selectedDates?.endDate) return 0;
    const diffTime = Math.abs(
      selectedDates.endDate.getTime() - selectedDates.startDate.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(); // Wishlist handler - prompt for authentication if not logged in
  const handleWishlist = () => {
    if (!isAuthenticated) {
      // Show authentication prompt
      showAuthPrompt({
        title: "Sign in Required",
        message: "You need to sign in to save properties to your wishlist.",
      });
      return;
    }
    if (isWishlisted) removeMutation.mutate();
    else addMutation.mutate();
  };

  // Share handler (stub)
  const handleShare = () => {
    // Implement share logic (e.g., Share API)
    alert("Share functionality coming soon!");
  };

  // Handle reserve button press
  const handleReserve = () => {
    if (!property) return;

    // Get the dates from context
    const dates = propertyDates.get(property._id)?.selectedDates;

    if (!dates?.startDate || !dates?.endDate) {
      alert("Please select dates for your stay first");
      return;
    }

    // Navigate to reservation modal with property and dates
    router.push({
      pathname: "/(modals)/traveler/reservation",
      params: {
        property: JSON.stringify(property),
        startDate: dates.startDate.toISOString(),
        endDate: dates.endDate.toISOString(),
      },
    });
  };

  // Helper to get property title
  const getPropertyTitle = () => {
    return property?.title || "Property Details";
  };
  // Handle change dates
  const handleChangeDates = () => {
    router.push({
      pathname: "/(modals)/traveler/search-dates",
      params: {
        propertyId: property._id,
        returnTo: "/(screens)/traveler/property-details",
        property: JSON.stringify(property),
      },
    });
  };
  // Handle message host
  const handleMessageHost = async () => {
    if (!property?._id) {
      console.error("Missing property ID", property);
      alert("Cannot message host: Missing property information");
      return;
    }

    if (!property?.hostId) {
      console.error("Missing host ID", property);
      alert("Cannot message host: Missing host information");
      return;
    }

    // Make sure we're tracking the correct host user
    if (property.hostId !== host?._id) {
      console.warn("Host ID mismatch detected", {
        propertyHostId: property.hostId,
        loadedHostId: host?._id,
      });
    }

    // Log info for debugging purposes
    console.log("Opening message modal for:", {
      propertyId: property._id,
      propertyTitle: property.title,
      hostId: property.hostId,
      hostName: host?.firstName,
    });

    setMessageModalVisible(true);
  }; // Send the message
  const handleSendMessage = async () => {
    if (!property?._id) {
      console.error("Missing property ID");
      alert("Cannot send message: Property information missing");
      return;
    }

    if (!messageContent.trim()) {
      alert("Please enter a message");
      return;
    }
    try {
      setSendingMessage(true);

      // // Validate property ID format
      // if (!property._id.match(/^[0-9a-fA-F]{24}$/)) {
      //   console.error(`Invalid property ID format: ${property._id}`);
      //   alert("Cannot send message: Invalid property ID format");
      //   return;
      // }

      // // Log critical info for debugging
      // console.log("Sending property inquiry", {
      //   propertyId: property._id,
      //   hostId: property.hostId,
      //   messageLength: messageContent.trim().length,
      // }); // Create a new conversation with the host
      // try {
      //   const conversation = await createNewConversation(
      //     property.hostId as string,
      //     messageContent.trim(),
      //     property._id
      //   );

      //   // Clear the input and hide the modal
      //   setMessageContent("");
      //   setMessageModalVisible(false);

      //   if (conversation) {
      //     // Show success message
      //     alert(
      //       "Message sent successfully! You can view the conversation in your inbox."
      //     );

      //     // Navigate to inbox with messages tab active
      //     router.push({
      //       pathname: "/traveler/inbox",
      //       params: { activeTab: "messages" },
      //     });
      //   } else {
      //     throw new Error("Failed to create conversation");
      //   }
      // } catch (error: any) {
      //   // Handle authentication errors specifically
      //   if (
      //     error?.message &&
      //     error.message.includes("Authentication required")
      //   ) {
      //     alert(
      //       "You need to be signed in to send messages. Please sign in and try again."
      //     );
      //   } else {
      //     alert(`Failed to send message: ${error?.message || "Unknown error"}`);
      //   }
      //   console.error("Failed to send message:", error);
      // }
    } catch (error) {
      console.error("Failed to send message:", error);

      // More detailed error message
      if (error instanceof Error) {
        alert(`Failed to send message: ${error.message}`);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  if (!property) {
    // Handle missing property data
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.colors.grayPalette[50],
          },
        ]}
      >
        <Text
          style={{
            color: isDark
              ? theme.colors.grayPalette[50]
              : theme.colors.grayPalette[900],
          }}
        >
          Property not found
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.grayPalette[50],
        },
      ]}
    >
      {/* Fixed header that appears on scroll */}
      <Animated.View
        style={[
          styles.fixedHeader,
          {
            opacity: headerOpacity,
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.colors.grayPalette[50],
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <Text
          style={[
            styles.fixedHeaderTitle,
            {
              color: isDark
                ? theme.colors.grayPalette[50]
                : theme.colors.grayPalette[900],
            },
          ]}
          numberOfLines={1}
        >
          {getPropertyTitle()}
        </Text>
      </Animated.View>

      {/* Fixed action buttons - always visible */}
      <View style={styles.fixedButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.circleButton,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.5)"
                : "rgba(255, 255, 255, 0.9)",
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={
              isDark
                ? theme.colors.grayPalette[50]
                : theme.colors.grayPalette[900]
            }
          />
        </TouchableOpacity>

        <View style={styles.rightButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.circleButton,
              {
                backgroundColor: isDark
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(255, 255, 255, 0.9)",
              },
            ]}
            onPress={handleShare}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={
                isDark
                  ? theme.colors.grayPalette[50]
                  : theme.colors.grayPalette[900]
              }
            />
          </TouchableOpacity>
          {/* Heart/Wishlist Button - Always visible */}
          <TouchableOpacity
            style={[
              styles.circleButton,
              {
                backgroundColor: isDark
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(255, 255, 255, 0.9)",
              },
            ]}
            onPress={handleWishlist}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={22}
              color={
                isWishlisted
                  ? "#ff385c"
                  : isDark
                  ? theme.colors.grayPalette[50]
                  : theme.colors.grayPalette[900]
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Property Images */}
        <Image
          source={{
            uri: property.images?.[0] || "https://via.placeholder.com/400x300",
          }}
          style={{ width: "100%", height: 300 }}
          resizeMode="cover"
        />

        {/* Property Info */}
        <View style={styles.contentContainer}>
          {/* Title and Rating */}
          <Text
            style={[
              styles.propertyTitle,
              {
                color: isDark
                  ? theme.colors.grayPalette[50]
                  : theme.colors.grayPalette[900],
              },
            ]}
          >
            {property.title}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={theme.colors.primary} />
            <Text
              style={[
                styles.ratingText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[50]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              {property.rating.toFixed(1)}
            </Text>
            <Text
              style={[
                styles.reviewCount,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              ({property.reviewCount} reviews)
            </Text>
          </View>

          <Text
            style={[
              styles.location,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            <Ionicons name="location-outline" size={14} /> {property.location}
          </Text>

          {/* Horizontal Rule */}
          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[300],
              },
            ]}
          />

          {/* Selected Dates Display */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme.colors.grayPalette[50]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              Your stay dates
            </Text>

            <View style={styles.dateSelectionContainer}>
              <View
                style={[
                  styles.datesBox,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[800]
                      : theme.colors.gray[100],
                    borderColor: isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[300],
                  },
                ]}
              >
                <>
                  <View style={styles.dateRow}>
                    <Text
                      style={[
                        styles.dateLabel,
                        {
                          color: isDark
                            ? theme.colors.gray[400]
                            : theme.colors.gray[600],
                        },
                      ]}
                    >
                      Check in
                    </Text>
                    <Text
                      style={[
                        styles.dateValue,
                        {
                          color: isDark
                            ? theme.colors.grayPalette[50]
                            : theme.colors.grayPalette[900],
                        },
                      ]}
                    >
                      {formattedStartDate}
                    </Text>
                  </View>

                  {selectedDates?.endDate && (
                    <>
                      <View
                        style={[
                          styles.dateDivider,
                          {
                            backgroundColor: isDark
                              ? theme.colors.gray[700]
                              : theme.colors.gray[300],
                          },
                        ]}
                      />

                      <View style={styles.dateRow}>
                        <Text
                          style={[
                            styles.dateLabel,
                            {
                              color: isDark
                                ? theme.colors.gray[400]
                                : theme.colors.gray[600],
                            },
                          ]}
                        >
                          Check out
                        </Text>
                        <Text
                          style={[
                            styles.dateValue,
                            {
                              color: isDark
                                ? theme.colors.grayPalette[50]
                                : theme.colors.grayPalette[900],
                            },
                          ]}
                        >
                          {formattedEndDate}{" "}
                        </Text>
                      </View>
                    </>
                  )}
                </>
              </View>

              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.primary,
                  borderRadius: radius.md,
                  padding: spacing.sm,
                  alignItems: "center",
                  marginTop: spacing.sm,
                }}
                onPress={handleChangeDates}
              >
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: "600",
                  }}
                >
                  Change dates
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stay summary */}
            {nights > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: spacing.md,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  marginTop: spacing.md,
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[300],
                }}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text
                  style={{
                    marginLeft: spacing.sm,
                    fontWeight: "500",
                    color: isDark
                      ? theme.colors.grayPalette[50]
                      : theme.colors.grayPalette[900],
                  }}
                >
                  {nights} night{nights > 1 ? "s" : ""} · ${property.price} per
                  night
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[300],
              },
            ]}
          />

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme.colors.grayPalette[50]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              About this place
            </Text>

            <Text
              style={[
                styles.description,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700],
                },
              ]}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {property.description}
            </Text>

            <TouchableOpacity
              onPress={() => setShowFullDescription(!showFullDescription)}
              style={{ marginTop: 8 }}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: "600",
                }}
              >
                {showFullDescription ? "Show less" : "Show more"}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[300],
              },
            ]}
          />

          {/* Amenities */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme.colors.grayPalette[50]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              What this place offers
            </Text>

            <View style={styles.amenitiesContainer}>
              {property.amenities?.slice(0, 6).map((amenity, index) => (
                <Amenity key={index} name={amenity} />
              ))}
            </View>

            {property.amenities && property.amenities.length > 6 && (
              <TouchableOpacity style={styles.showAllButton}>
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: "600",
                  }}
                >
                  Show all {property.amenities.length} amenities
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[300],
              },
            ]}
          />

          {/* Host Information */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme.colors.grayPalette[50]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              Hosted by {host?.firstName || "Host"}
            </Text>
            {hostLoading ? (
              <Text>Loading host information...</Text>
            ) : (
              <View style={styles.hostContainer}>
                <Image
                  source={{
                    uri:
                      host?.profileImage ||
                      "https://randomuser.me/api/portraits/men/32.jpg",
                  }}
                  style={styles.hostImage}
                />
                <View style={styles.hostInfo}>
                  <Text
                    style={[
                      styles.hostName,
                      {
                        color: isDark
                          ? theme.colors.grayPalette[50]
                          : theme.colors.grayPalette[900],
                      },
                    ]}
                  >
                    {host?.firstName} {host?.lastName}
                  </Text>
                  <Text
                    style={[
                      styles.hostDetails,
                      {
                        color: isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      },
                    ]}
                  >
                    Host since
                    {host?.createdAt
                      ? new Date(host.createdAt).getFullYear()
                      : "recently"}
                  </Text>

                  {/* Message Host Button */}
                  <TouchableOpacity
                    style={[
                      styles.messageHostButton,
                      {
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                    onPress={handleMessageHost}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color="white"
                    />
                    <Text style={styles.messageHostButtonText}>
                      Message Host
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Horizontal Rule */}
          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[300],
              },
            ]}
          />

          {/* Additional information sections could be added here */}
          <View style={{ height: 80 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Booking Bar - Fixed */}
      <View
        style={[
          styles.bookingBar,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.colors.grayPalette[50],
            borderTopColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <View>
          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.price,
                {
                  color: isDark
                    ? theme.colors.grayPalette[50]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              ${property.price}
            </Text>
            <Text
              style={[
                styles.perNight,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              night
            </Text>
          </View>

          {nights > 0 && (
            <Text
              style={[
                styles.totalPrice,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              ${property.price * nights} total
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.reserveButton,
            { backgroundColor: theme.colors.primary[200] },
          ]}
          onPress={handleReserve}
        >
          <Text style={styles.reserveButtonText}>
            {selectedDates?.startDate && selectedDates?.endDate
              ? "Reserve"
              : "Check availability"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Message Modal */}
      <Modal
        visible={messageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.grayPalette[50],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[50]
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                Message to {host?.firstName || "Host"}
              </Text>
              <TouchableOpacity
                onPress={() => setMessageModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={
                    isDark ? theme.colors.gray[400] : theme.colors.gray[600]
                  }
                />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.modalSubtitle,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              Inquire about {property?.title || "this property"}
            </Text>

            <TextInput
              style={[
                styles.messageInput,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[200],
                  color: isDark
                    ? theme.colors.grayPalette[50]
                    : theme.colors.grayPalette[900],
                },
              ]}
              placeholder="Type your message here..."
              placeholderTextColor={
                isDark ? theme.colors.gray[500] : theme.colors.gray[400]
              }
              multiline={true}
              value={messageContent}
              onChangeText={setMessageContent}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleSendMessage}
              disabled={sendingMessage || !messageContent.trim()}
            >
              {sendingMessage ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>Send Message</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles definition
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 88 : 60,
    backgroundColor: "#fff",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 44 : 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fixedHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  fixedButtonsContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 44 : 30,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  rightButtonsContainer: {
    flexDirection: "row",
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  propertyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
  },
  location: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: spacing.md,
  },
  sectionContainer: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenity: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: spacing.md,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
  },
  showAllButton: {
    marginTop: spacing.sm,
  },
  hostContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  hostImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  hostInfo: {
    flex: 1,
    marginLeft: 16,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "600",
  },
  hostDetails: {
    fontSize: 14,
  },
  bookingBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: spacing.md,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
  },
  perNight: {
    fontSize: 14,
    marginLeft: 4,
  },
  totalPrice: {
    fontSize: 14,
    marginTop: 2,
  },
  reserveButton: {
    backgroundColor: "#ff385c",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.md,
  },
  reserveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  dateSelectionContainer: {
    marginBottom: spacing.md,
  },
  datesBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: radius.md,
    overflow: "hidden",
  },
  dateRow: {
    flex: 1,
    padding: spacing.md,
  },
  dateDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  featureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    marginRight: 10,
  },
  messageHostButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  messageHostButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  messageInput: {
    borderRadius: 8,
    height: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: "top",
    marginBottom: 16,
    fontSize: 16,
  },
  sendButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PropertyModalScreen;
