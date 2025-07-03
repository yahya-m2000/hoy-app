import { adaptBookingsData } from "./adapters";
import { CalendarBookingData, DetailedBookingData } from "@core/types";

// Cache for expensive calculations
const bookingsCache = new Map<string, CalendarBookingData[]>();
const detailedBookingsCache = new Map<string, DetailedBookingData[]>();
const earningsCache = new Map<string, number>();
const densityCache = new Map<string, number>();

// Cache expiry time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;
let lastCacheTime = 0;

function clearCacheIfExpired() {
  const now = Date.now();
  if (now - lastCacheTime > CACHE_EXPIRY) {
    bookingsCache.clear();
    detailedBookingsCache.clear();
    earningsCache.clear();
    densityCache.clear();
    lastCacheTime = now;
  }
}

// Mock booking data for demonstration
export const mockDetailedBookings: DetailedBookingData[] = [
  {
    _id: "684603279dc69d38a0d623e6",
    userId: "68121f65ed875d433c8d3df0",
    unitId: null,
    propertyId: {
      _id: "6841de513b269513a6e77fb5",
      hostId: "67fe9ef1e0566b885496e993",
      name: "Modern Williamsburg Loft",
      type: "INDIVIDUAL",
      propertyType: "loft",
      description:
        "Trendy loft in Williamsburg with exposed brick and modern decor",
      images: [
        "https://example.com/williamsburg1.jpg",
        "https://example.com/williamsburg2.jpg",
      ],
      price: 195,
      currency: "USD",
      amenities: ["WiFi", "Kitchen", "Smart TV"],
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      maxGuests: 4,
      rating: 4.8,
      reviewCount: 23,
      reviews: ["6846f1ea7bc5cbbbf77f3ee1"],
      isActive: true,
      isFeatured: false,
      isSuperHost: false,
      units: [],
      calendar: [],
      address: {
        street: "501 Bedford Ave",
        city: "Brooklyn",
        state: "NY",
        postalCode: "11211",
        country: "USA",
      },
      coordinates: {
        latitude: 40.7146,
        longitude: -73.9572,
      },
      permissions: {
        canManageBookings: false,
        canCheckInGuests: false,
        canManageUnits: false,
        canHandleFinances: false,
      },
      cancellationPolicy: {
        policyType: "moderate",
        description: "Moderate cancellation policy",
        nonRefundableFees: ["Cleaning fee", "Service fee"],
        refundPercentages: [
          {
            _id: "685414e26b03394e990575ec",
            immediate: 100,
            beforeDays: 5,
            percentage: 50,
          },
          {
            _id: "685414e26b03394e990575ed",
            immediate: 0,
            beforeDays: 1,
            percentage: 0,
          },
        ],
      },
      houseRules: {
        checkInTime: {
          from: "15:00",
          to: "22:00",
        },
        quietHours: {
          from: "22:00",
          to: "08:00",
        },
        checkOutTime: "11:00",
        smokingAllowed: false,
        petsAllowed: false,
        partiesAllowed: false,
        additionalRules: [
          "No smoking inside the property",
          "Keep noise levels reasonable, especially during quiet hours",
          "Please treat the space with respect",
        ],
      },
      safetyFeatures: {
        securityCameras: {
          exterior: false,
          interior: false,
          description: "",
        },
        smokeDetector: true,
        carbonMonoxideDetector: false,
        fireExtinguisher: false,
        firstAidKit: false,
        weaponsOnProperty: false,
        dangerousAnimals: false,
        additionalSafetyInfo: [
          "Smoke detector installed",
          "Property is regularly maintained for safety",
          "Emergency contact information provided upon check-in",
        ],
      },
      createdAt: "2025-05-15T18:13:37.649Z",
      updatedAt: "2025-06-10T19:53:07.468Z",
      __v: 0,
    },
    checkIn: "2025-06-20T23:00:00.000Z",
    checkOut: "2025-06-25T23:00:00.000Z",
    totalPrice: 975,
    paymentStatus: "paid",
    bookingStatus: "confirmed",
    guests: {
      adults: 2,
      children: 0,
      infants: 0,
      pets: 0,
    },
    contactInfo: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1234567890",
    },
    specialRequests: "Late check-in requested",
    cancellationDetails: {
      refundAmount: 0,
      refundProcessed: false,
      cancellationFee: 0,
    },
    createdAt: "2025-06-01T10:30:00.000Z",
    updatedAt: "2025-06-01T10:30:00.000Z",
    __v: 0,
  },
  {
    _id: "684603279dc69d38a0d623e7",
    userId: "68121f65ed875d433c8d3df1",
    unitId: null,
    propertyId: {
      _id: "6841de513b269513a6e77fb6",
      hostId: "67fe9ef1e0566b885496e993",
      name: "Cozy Downtown Studio",
      type: "INDIVIDUAL",
      propertyType: "apartment",
      description: "Perfect studio apartment in the heart of downtown",
      images: [
        "https://example.com/studio1.jpg",
        "https://example.com/studio2.jpg",
      ],
      price: 120,
      currency: "USD",
      amenities: ["WiFi", "Kitchen", "AC"],
      bedrooms: 0,
      beds: 1,
      bathrooms: 1,
      maxGuests: 2,
      rating: 4.5,
      reviewCount: 15,
      isActive: true,
      isFeatured: false,
      isSuperHost: true,
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
      },
      coordinates: {
        latitude: 40.758,
        longitude: -73.9855,
      },
    },
    checkIn: "2025-06-01T23:00:00.000Z",
    checkOut: "2025-06-05T23:00:00.000Z",
    totalPrice: 480,
    paymentStatus: "paid",
    bookingStatus: "completed",
    guests: {
      adults: 1,
      children: 0,
      infants: 0,
      pets: 0,
    },
    contactInfo: {
      name: "Mike Chen",
      email: "mike@example.com",
      phone: "+1234567891",
    },
    specialRequests: "",
    cancellationDetails: {
      refundAmount: 0,
      refundProcessed: false,
      cancellationFee: 0,
    },
    createdAt: "2025-05-25T14:20:00.000Z",
    updatedAt: "2025-06-06T09:15:00.000Z",
  },
  {
    _id: "684603279dc69d38a0d623e8",
    userId: "68121f65ed875d433c8d3df2",
    unitId: null,
    propertyId: {
      _id: "6841de513b269513a6e77fb7",
      hostId: "67fe9ef1e0566b885496e993",
      name: "Luxury Manhattan Penthouse",
      type: "INDIVIDUAL",
      propertyType: "penthouse",
      description: "Stunning penthouse with panoramic city views",
      images: [
        "https://example.com/penthouse1.jpg",
        "https://example.com/penthouse2.jpg",
      ],
      price: 450,
      currency: "USD",
      amenities: ["WiFi", "Kitchen", "Balcony", "Gym", "Pool"],
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      maxGuests: 8,
      rating: 4.9,
      reviewCount: 87,
      isActive: true,
      isFeatured: true,
      isSuperHost: true,
      address: {
        street: "789 Fifth Ave",
        city: "New York",
        state: "NY",
        postalCode: "10022",
        country: "USA",
      },
      coordinates: {
        latitude: 40.7614,
        longitude: -73.9776,
      },
    },
    checkIn: "2025-06-28T23:00:00.000Z",
    checkOut: "2025-07-03T23:00:00.000Z",
    totalPrice: 2250,
    paymentStatus: "paid",
    bookingStatus: "confirmed",
    guests: {
      adults: 4,
      children: 2,
      infants: 0,
      pets: 0,
    },
    contactInfo: {
      name: "Emma Wilson",
      email: "emma@example.com",
      phone: "+1234567892",
    },
    specialRequests: "Celebrating anniversary, would appreciate room setup",
    cancellationDetails: {
      refundAmount: 0,
      refundProcessed: false,
      cancellationFee: 0,
    },
    createdAt: "2025-06-15T16:45:00.000Z",
    updatedAt: "2025-06-15T16:45:00.000Z",
  },
  {
    _id: "684603279dc69d38a0d623e9",
    userId: "68121f65ed875d433c8d3df3",
    unitId: null,
    propertyId: {
      _id: "6841de513b269513a6e77fb8",
      hostId: "67fe9ef1e0566b885496e993",
      name: "Brooklyn Heights Brownstone",
      type: "INDIVIDUAL",
      propertyType: "house",
      description: "Historic brownstone with modern amenities",
      images: [
        "https://example.com/brownstone1.jpg",
        "https://example.com/brownstone2.jpg",
      ],
      price: 275,
      currency: "USD",
      amenities: ["WiFi", "Kitchen", "Garden", "Parking"],
      bedrooms: 2,
      beds: 3,
      bathrooms: 2,
      maxGuests: 6,
      rating: 4.7,
      reviewCount: 34,
      isActive: true,
      isFeatured: false,
      isSuperHost: false,
      address: {
        street: "456 Remsen St",
        city: "Brooklyn",
        state: "NY",
        postalCode: "11201",
        country: "USA",
      },
      coordinates: {
        latitude: 40.6892,
        longitude: -73.9942,
      },
    },
    checkIn: "2025-06-10T23:00:00.000Z",
    checkOut: "2025-06-15T23:00:00.000Z",
    totalPrice: 1375,
    paymentStatus: "paid",
    bookingStatus: "confirmed",
    guests: {
      adults: 3,
      children: 1,
      infants: 0,
      pets: 0,
    },
    contactInfo: {
      name: "David Rodriguez",
      email: "david@example.com",
      phone: "+1234567893",
    },
    specialRequests: "Need crib for toddler",
    cancellationDetails: {
      refundAmount: 0,
      refundProcessed: false,
      cancellationFee: 0,
    },
    createdAt: "2025-05-28T11:30:00.000Z",
    updatedAt: "2025-05-28T11:30:00.000Z",
  },
  // October 2025 bookings
  {
    _id: "684603279dc69d38a0d623ea",
    userId: "68121f65ed875d433c8d3df4",
    unitId: null,
    propertyId: {
      _id: "6841de513b269513a6e77fb5",
      hostId: "67fe9ef1e0566b885496e993",
      name: "Modern Williamsburg Loft",
      type: "INDIVIDUAL",
      propertyType: "loft",
      description:
        "Trendy loft in Williamsburg with exposed brick and modern decor",
      images: [
        "https://example.com/williamsburg1.jpg",
        "https://example.com/williamsburg2.jpg",
      ],
      price: 195,
      currency: "USD",
      amenities: ["WiFi", "Kitchen", "Smart TV"],
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      maxGuests: 4,
      rating: 4.8,
      reviewCount: 23,
      isActive: true,
      isFeatured: false,
      isSuperHost: false,
      address: {
        street: "501 Bedford Ave",
        city: "Brooklyn",
        state: "NY",
        postalCode: "11211",
        country: "USA",
      },
      coordinates: {
        latitude: 40.7146,
        longitude: -73.9572,
      },
    },
    checkIn: "2025-10-05T23:00:00.000Z",
    checkOut: "2025-10-08T23:00:00.000Z",
    totalPrice: 585,
    paymentStatus: "paid",
    bookingStatus: "confirmed",
    guests: {
      adults: 2,
      children: 0,
      infants: 0,
      pets: 0,
    },
    contactInfo: {
      name: "Cora Martinez",
      email: "cora@example.com",
      phone: "+1234567894",
    },
    specialRequests: "",
    cancellationDetails: {
      refundAmount: 0,
      refundProcessed: false,
      cancellationFee: 0,
    },
    createdAt: "2025-09-20T14:20:00.000Z",
    updatedAt: "2025-09-20T14:20:00.000Z",
  },
];

// Legacy export for backwards compatibility
export const mockBookings: CalendarBookingData[] =
  adaptBookingsData(mockDetailedBookings);

// Mock availability and pricing data
export const mockAvailability: Record<
  string,
  { price: number; isAvailable: boolean }
> = {
  // June 2025 pricing
  "2025-06-01": { price: 120, isAvailable: false }, // Booked
  "2025-06-02": { price: 120, isAvailable: false }, // Booked
  "2025-06-03": { price: 120, isAvailable: false }, // Booked
  "2025-06-04": { price: 120, isAvailable: false }, // Booked
  "2025-06-05": { price: 120, isAvailable: false }, // Booked
  "2025-06-06": { price: 130, isAvailable: true },
  "2025-06-07": { price: 150, isAvailable: true }, // Weekend
  "2025-06-08": { price: 150, isAvailable: true }, // Weekend
  "2025-06-09": { price: 130, isAvailable: true },
  "2025-06-10": { price: 140, isAvailable: false }, // Booked
  "2025-06-11": { price: 140, isAvailable: false }, // Booked
  "2025-06-12": { price: 140, isAvailable: false }, // Booked
  "2025-06-13": { price: 140, isAvailable: false }, // Booked
  "2025-06-14": { price: 150, isAvailable: false }, // Booked
  "2025-06-15": { price: 150, isAvailable: false }, // Booked
  "2025-06-16": { price: 130, isAvailable: true },
  "2025-06-17": { price: 130, isAvailable: true },
  "2025-06-18": { price: 130, isAvailable: true },
  "2025-06-19": { price: 130, isAvailable: true },
  "2025-06-20": { price: 140, isAvailable: false }, // Booked
  "2025-06-21": { price: 160, isAvailable: false }, // Booked (weekend)
  "2025-06-22": { price: 160, isAvailable: false }, // Booked (weekend)
  "2025-06-23": { price: 140, isAvailable: false }, // Booked
  "2025-06-24": { price: 140, isAvailable: false }, // Booked
  "2025-06-25": { price: 140, isAvailable: false }, // Booked
  "2025-06-26": { price: 130, isAvailable: true },
  "2025-06-27": { price: 130, isAvailable: true },
  "2025-06-28": { price: 150, isAvailable: false }, // Booked
  "2025-06-29": { price: 150, isAvailable: false }, // Booked
  "2025-06-30": { price: 150, isAvailable: false }, // Booked
};

/**
 * Get availability and pricing for a specific date
 */
export function getDateAvailability(date: Date): {
  price: number;
  isAvailable: boolean;
} {
  const dateKey = date.toISOString().split("T")[0];
  return mockAvailability[dateKey] || { price: 120, isAvailable: true };
}

/**
 * Get bookings that intersect with a given month (with caching)
 */
export function getBookingsForMonth(date: Date): CalendarBookingData[] {
  clearCacheIfExpired();

  const cacheKey = `${date.getFullYear()}-${date.getMonth()}`;

  if (bookingsCache.has(cacheKey)) {
    return bookingsCache.get(cacheKey)!;
  }
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  // Convert detailed bookings to simplified format
  const adaptedBookings = adaptBookingsData(mockDetailedBookings);

  const result = adaptedBookings.filter(
    (booking) => booking.startDate <= monthEnd && booking.endDate >= monthStart
  );

  bookingsCache.set(cacheKey, result);
  return result;
}

/**
 * Get bookings for a specific property in a given month (with caching)
 */
export function getBookingsForPropertyMonth(
  date: Date,
  propertyId?: string
): CalendarBookingData[] {
  clearCacheIfExpired();

  const cacheKey = `${date.getFullYear()}-${date.getMonth()}-${
    propertyId || "all"
  }`;

  if (bookingsCache.has(cacheKey)) {
    return bookingsCache.get(cacheKey)!;
  }

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  // Convert detailed bookings to simplified format
  const adaptedBookings = adaptBookingsData(mockDetailedBookings);

  let result = adaptedBookings.filter(
    (booking) => booking.startDate <= monthEnd && booking.endDate >= monthStart
  );

  // Filter by property ID if provided
  if (propertyId) {
    result = result.filter((booking) => {
      // Find the corresponding detailed booking to get property ID
      const detailedBooking = mockDetailedBookings.find(
        (b) => b._id === booking.id
      );
      return detailedBooking?.propertyId._id === propertyId;
    });
  }

  bookingsCache.set(cacheKey, result);
  return result;
}

/**
 * Get total earnings for a month (with caching)
 */
export function getMonthlyEarnings(date: Date, propertyId?: string): number {
  clearCacheIfExpired();

  const cacheKey = `${date.getFullYear()}-${date.getMonth()}-${
    propertyId || "all"
  }`;

  if (earningsCache.has(cacheKey)) {
    return earningsCache.get(cacheKey)!;
  }

  const bookings = propertyId
    ? getBookingsForPropertyMonth(date, propertyId)
    : getBookingsForMonth(date);

  const result = bookings.reduce((total, booking) => {
    if (booking.status === "past" || booking.status === "active") {
      return total + booking.totalPrice;
    }
    return total;
  }, 0);

  earningsCache.set(cacheKey, result);
  return result;
}

/**
 * Calculate booking density for a month (0-1 scale) (with caching)
 */
export function getMonthBookingDensity(
  date: Date,
  propertyId?: string
): number {
  clearCacheIfExpired();

  const cacheKey = `${date.getFullYear()}-${date.getMonth()}-${
    propertyId || "all"
  }`;

  if (densityCache.has(cacheKey)) {
    return densityCache.get(cacheKey)!;
  }

  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();

  let bookedDays = 0;
  const bookings = propertyId
    ? getBookingsForPropertyMonth(date, propertyId)
    : getBookingsForMonth(date);

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
    const isBooked = bookings.some(
      (booking) =>
        currentDate >= booking.startDate && currentDate <= booking.endDate
    );
    if (isBooked) bookedDays++;
  }

  const result = bookedDays / daysInMonth;
  densityCache.set(cacheKey, result);
  return result;
}
