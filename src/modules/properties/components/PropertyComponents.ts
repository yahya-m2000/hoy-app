/**
 * Centralized exports for property-related components
 * Modular components for PropertyDetailsScreen sections
 *
 * Note: Detail-specific components have been moved to ../details/components
 * This file provides backward compatibility exports
 */

// Re-export detail components from their new location
export {
  PropertyHeader,
  CheckInDatesSection,
  ExperienceCard,
  PropertyDescription,
  AmenitiesGrid,
  HouseRulesSection,
  PropertyTab,
  PolicyNavigationItem,
  SectionDivider,
  PropertyImageCarousel,
} from "../details/components";

// Legacy components still in main components folder
export {
  RatingsReviewsSection,
  DescriptionSection,
  AmenitiesSection,
  LocationMapSection,
  DatesSection,
  HostSection,
} from "./index";
