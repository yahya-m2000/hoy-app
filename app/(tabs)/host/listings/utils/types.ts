// Types for property data structure
export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PropertyCoordinates {
  latitude: number;
  longitude: number;
}

export interface PropertyPermissions {
  canManageBookings: boolean;
  canCheckInGuests: boolean;
  canManageUnits: boolean;
  canHandleFinances: boolean;
}

export interface RefundPercentage {
  _id: string;
  immediate: number;
  beforeDays: number;
  percentage: number;
}

export interface CancellationPolicy {
  policyType: string;
  description: string;
  nonRefundableFees: string[];
  refundPercentages: RefundPercentage[];
}

export interface CheckTime {
  from: string;
  to: string;
}

export interface HouseRules {
  checkInTime: CheckTime;
  quietHours: CheckTime;
  checkOutTime: string;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partiesAllowed: boolean;
  additionalRules: string[];
}

export interface SecurityCameras {
  exterior: boolean;
  interior: boolean;
  description: string;
}

export interface SafetyFeatures {
  securityCameras: SecurityCameras;
  smokeDetector: boolean;
  carbonMonoxideDetector: boolean;
  fireExtinguisher: boolean;
  firstAidKit: boolean;
  weaponsOnProperty: boolean;
  dangerousAnimals: boolean;
  additionalSafetyInfo: string[];
}

export interface Host {
  id: string;
  rating: number;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  isSuperHost: boolean;
  hostingSince: string;
  hostingYears: number;
  totalProperties: number;
  activeProperties: number;
  properties: {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
  }[];
}

export interface Property {
  _id: string;
  hostId: string;
  name: string;
  type: "INDIVIDUAL" | "SHARED";
  propertyType: "apartment" | "house" | "loft" | "penthouse" | "studio";
  description: string;
  address: PropertyAddress;
  coordinates: PropertyCoordinates;
  images: string[];
  price: number;
  currency: string;
  amenities: string[];
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  rating: number;
  reviewCount: number;
  reviews: string[];
  isActive: boolean;
  isFeatured: boolean;
  isSuperHost: boolean;
  units: any[];
  permissions: PropertyPermissions;
  cancellationPolicy: CancellationPolicy;
  houseRules: HouseRules;
  safetyFeatures: SafetyFeatures;
  calendar: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  host?: Host;
}

// Form data for creating/editing properties
export interface PropertyFormData {
  name: string;
  type: "INDIVIDUAL" | "SHARED";
  propertyType: "apartment" | "house" | "loft" | "penthouse" | "studio";
  description: string;
  address: PropertyAddress;
  coordinates: PropertyCoordinates;
  images: string[];
  price: number;
  currency: string;
  amenities: string[];
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  houseRules: Partial<HouseRules>;
  safetyFeatures: Partial<SafetyFeatures>;
}

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "loft", label: "Loft" },
  { value: "penthouse", label: "Penthouse" },
  { value: "studio", label: "Studio" },
] as const;

export const AMENITIES = [
  "WiFi",
  "Kitchen",
  "AC",
  "Heating",
  "TV",
  "Washer",
  "Dryer",
  "Parking",
  "Pool",
  "Gym",
  "Balcony",
  "Garden",
  "Smart TV",
  "Netflix",
  "Dishwasher",
  "Microwave",
  "Coffee Maker",
  "Hair Dryer",
  "Iron",
  "Workspace",
] as const;
