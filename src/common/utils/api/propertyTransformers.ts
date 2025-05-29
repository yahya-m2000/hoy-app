/**
 * Utility functions for transforming property data from the API
 */
import { PropertyType } from "../../types/property";

/**
 * Transform API property data to match the app's expected data structure
 */
export const transformPropertyData = (apiProperty: any): PropertyType => {
  try {
    // Check for null/undefined input
    if (!apiProperty) {
      console.error("transformPropertyData received null/undefined input");
      return {} as PropertyType;
    }

    // Log the raw property to debug
    if (__DEV__ && Math.random() < 0.2) {
      console.log(
        "Raw property data:",
        JSON.stringify(apiProperty._id || "no-id")
      );
      console.log("Property keys:", Object.keys(apiProperty).join(", "));
    }

    // Calculate average rating if reviews exist
    const rating =
      apiProperty.rating !== undefined
        ? apiProperty.rating
        : apiProperty.reviews?.length > 0
        ? apiProperty.reviews.reduce(
            (sum: number, review: any) => sum + (review.rating || 0),
            0
          ) / apiProperty.reviews.length
        : 0;

    // Extract the first unit price or default to 0
    const price =
      apiProperty.price !== undefined
        ? apiProperty.price
        : apiProperty.units && apiProperty.units.length > 0
        ? apiProperty.units[0].price || 0
        : 0;

    // Transform property data structure
    return {
      _id: apiProperty._id,
      title: apiProperty.name || apiProperty.title, // API uses 'name' instead of 'title'
      description: apiProperty.description,
      images: apiProperty.photos || apiProperty.images || [], // Check both photos and images arrays
      price: apiProperty.price || price, // Use direct price if available, otherwise calculate from units
      currency: apiProperty.currency || "USD", // Use provided currency or default
      location: `${apiProperty.address?.city || ""}, ${
        apiProperty.address?.country || ""
      }`,
      city: apiProperty.address?.city,
      country: apiProperty.address?.country,
      address: apiProperty.address?.street,
      rating: rating,
      reviewCount: apiProperty.reviews?.length || 0,
      isSuperHost: apiProperty.isSuperHost || false, // Use provided value if available
      isWishlisted: apiProperty.isWishlisted || false, // Use provided value if available
      amenities: apiProperty.commonAmenities || apiProperty.amenities || [],
      bedrooms: apiProperty.units?.[0]?.bedrooms || 1,
      beds: apiProperty.units?.[0]?.beds || 1,
      bathrooms: apiProperty.units?.[0]?.bathrooms || 1,
      maxGuests:
        apiProperty.maxGuests || apiProperty.units?.[0]?.maxGuests || 2,
      coordinates:
        apiProperty.coordinates ||
        (apiProperty.location?.coordinates
          ? {
              latitude: apiProperty.location.coordinates[1], // GeoJSON uses [longitude, latitude]
              longitude: apiProperty.location.coordinates[0],
            }
          : undefined),
      hostId: apiProperty.hostId,
      hostName: apiProperty.hostName || "", // Not always provided in API response
      hostImage: apiProperty.hostImage || "", // Not always provided in API response
    };
  } catch (error) {
    console.error("Error transforming property data:", error);
    console.log(
      "Problem property:",
      JSON.stringify(apiProperty?._id || "unknown")
    );

    // Return a basic property object to avoid app crashes
    return {
      _id: apiProperty?._id || "error",
      title:
        apiProperty?.name || apiProperty?.title || "Error loading property",
      price: 0,
      location: "",
      rating: 0,
      reviewCount: 0,
      images: [],
      amenities: [],
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      maxGuests: 2,
    } as PropertyType;
  }
};
