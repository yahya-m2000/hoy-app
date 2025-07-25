/**
 * Property Data Transformers
 *
 * Utility functions for transforming property data from the API
 * to match the app's expected data structure and format.
 * 
 * @module @core/utils/api/property-transformers
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { PropertyType } from "@core/types/property.types";
import { logger } from "../sys/log";

/**
 * Transform API property data to match the app's expected data structure
 * Now using the standardized property model with 'name' instead of 'title'
 */
export const transformPropertyData = (apiProperty: any): PropertyType => {
  try {
    // Check for null/undefined input
    if (!apiProperty) {
      logger.error("transformPropertyData received null/undefined input");
      return {} as PropertyType;
    }

    // Log the raw property to debug
    if (__DEV__ && Math.random() < 0.2) {
      logger.log(
        "Raw property data:",
        JSON.stringify(apiProperty._id || "no-id")
      );
      logger.log("Property keys:", Object.keys(apiProperty).join(", "));
    } // Transform property data using the new standardized structure
    return {
      // Required fields
      _id: apiProperty._id,
      title: apiProperty.title || apiProperty.name || "Untitled Property",
      description: apiProperty.description || "",
      type: apiProperty.type || "apartment",
      status: apiProperty.status || "published",
      guestAccessType: apiProperty.guestAccessType || "entire_place",
      hostType: apiProperty.hostType || "individual",
      tags: apiProperty.tags || [],
      weekdayPrice: apiProperty.weekdayPrice || apiProperty.price?.amount || apiProperty.price || 0,
      weekendPrice: apiProperty.weekendPrice || apiProperty.price?.amount || apiProperty.price || 0,
      discounts: apiProperty.discounts || {
        newListingPromo: false,
        lastMinuteDiscount: false,
        weeklyDiscount: { enabled: false, percentage: 0 },
        monthlyDiscount: { enabled: false, percentage: 0 },
      },
      price: apiProperty.price
        ? typeof apiProperty.price === "object"
          ? apiProperty.price
          : {
              amount: apiProperty.price,
              currency: apiProperty.currency || "USD",
              period: "night",
            }
        : {
            amount: 0,
            currency: "USD",
            period: "night",
          },
      address: apiProperty.address || {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },
      coordinates: apiProperty.coordinates || {
        latitude: 0,
        longitude: 0,
      },
      amenities: apiProperty.amenities || [],
      maxGuests: apiProperty.maxGuests || 2,
      bedrooms: apiProperty.bedrooms || 1,
      bathrooms: apiProperty.bathrooms || 1,
      images: apiProperty.images || [],
      host: apiProperty.host || apiProperty.hostId || "",
      createdAt: apiProperty.createdAt || new Date().toISOString(),
      updatedAt: apiProperty.updatedAt || new Date().toISOString(), // Optional fields
      id: apiProperty._id, // Compatibility alias
      name: apiProperty.name || apiProperty.title || "Untitled Property",
      propertyType: apiProperty.propertyType || "apartment",
      beds: apiProperty.beds || 1,
      rating: apiProperty.rating || 0,
      reviewCount: apiProperty.reviewCount || 0,
      reviews: [], // Empty array for reviews IDs
      hostId: apiProperty.hostId || apiProperty.host,
      hostName: apiProperty.hostName,
      hostImage: apiProperty.hostImage,
      isActive: apiProperty.isActive !== false,
      isFeatured: apiProperty.isFeatured || false,
      featuredUntil: apiProperty.featuredUntil,
      isSuperHost: apiProperty.isSuperHost || false,
      isWishlisted: false, // Will be set by wishlist service
      phone: apiProperty.phone,
      email: apiProperty.email,
      website: apiProperty.website,
      logo: apiProperty.logo,
      currency: apiProperty.currency || "USD",
    };
  } catch (error) {
    logger.error("Error transforming property data:", error);
    logger.log(
      "Problem property:",
      JSON.stringify(apiProperty?._id || "unknown")
    ); // Return a basic property object to avoid app crashes
    return {
      _id: apiProperty?._id || "error",
      title: apiProperty?.name || "Error loading property",
      name: apiProperty?.name || "Error loading property",
      type: "apartment",
      propertyType: "apartment",
      description: "No description available",
      status: "published" as const,
      guestAccessType: "entire_place",
      hostType: "individual",
      tags: [],
      weekdayPrice: 0,
      weekendPrice: 0,
      discounts: {
        newListingPromo: false,
        lastMinuteDiscount: false,
        weeklyDiscount: { enabled: false, percentage: 0 },
        monthlyDiscount: { enabled: false, percentage: 0 },
      },
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      images: [],
      price: { amount: 0, currency: "USD", period: "night" as const },
      currency: "USD",
      amenities: [],
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      maxGuests: 2,
      host: "unknown",
      hostId: "unknown",
      hostName: "Unknown Host",
      hostImage: "",
      rating: 0,
      reviewCount: 0,
      isActive: true,
      isFeatured: false,
      isSuperHost: false,
      id: apiProperty?._id || "error",
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as PropertyType;
  }
}; 