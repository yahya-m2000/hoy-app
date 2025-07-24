// import { Property } from '../../../core/types/listings.types';

// export const mockProperties: Property[] = [
//   {
//     "_id": "684d7bd5a36191ddd3c98c36",
//     "hostId": "684d7bd5a36191ddd3c98c2f",
//     "name": "Modern Downtown Apartment",
//     "type": "INDIVIDUAL",
//     "propertyType": "apartment",
//     "description": "A beautiful modern apartment in the heart of downtown with stunning city views.",
//     "address": {
//       "street": "123 Main St",
//       "city": "New York",
//       "state": "NY",
//       "postalCode": "10001",
//       "country": "USA"
//     },
//     "coordinates": {
//       "latitude": 40.7589,
//       "longitude": -73.9851
//     },
//     "images": [
//       "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
//       "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400"
//     ],
//     "price": 150,
//     "currency": "USD",
//     "amenities": ["WiFi", "Kitchen", "AC", "TV", "Washer"],
//     "bedrooms": 2,
//     "beds": 2,
//     "bathrooms": 1,
//     "maxGuests": 4,
//     "rating": 4.8,
//     "reviewCount": 23,
//     "reviews": [],
//     "isActive": true,
//     "isFeatured": false,
//     "isSuperHost": false,
//     "units": [],
//     "permissions": {
//       "canManageBookings": true,
//       "canCheckInGuests": true,
//       "canManageUnits": false,
//       "canHandleFinances": true
//     },
//     "cancellationPolicy": {
//       "policyType": "moderate",
//       "description": "Moderate cancellation policy",
//       "nonRefundableFees": ["Cleaning fee", "Service fee"],
//       "refundPercentages": [
//         {
//           "_id": "684d7bd5a36191ddd3c98c37",
//           "immediate": 100,
//           "beforeDays": 5,
//           "percentage": 50
//         }
//       ]
//     },
//     "houseRules": {
//       "checkInTime": { "from": "15:00", "to": "22:00" },
//       "quietHours": { "from": "22:00", "to": "08:00" },
//       "checkOutTime": "11:00",
//       "smokingAllowed": false,
//       "petsAllowed": true,
//       "partiesAllowed": false,
//       "additionalRules": ["No smoking inside the property"]
//     },
//     "safetyFeatures": {
//       "securityCameras": { "exterior": false, "interior": false, "description": "" },
//       "smokeDetector": true,
//       "carbonMonoxideDetector": true,
//       "fireExtinguisher": true,
//       "firstAidKit": false,
//       "weaponsOnProperty": false,
//       "dangerousAnimals": false,
//       "additionalSafetyInfo": ["Smoke detector installed"]
//     },
//     "calendar": [],
//     "createdAt": "2025-06-14T13:40:37.127Z",
//     "updatedAt": "2025-06-14T13:40:37.127Z",
//     "__v": 0
//   },
//   {
//     "_id": "684d7bd5a36191ddd3c98c39",
//     "hostId": "684d7bd5a36191ddd3c98c2f",
//     "name": "Cozy Brooklyn Loft",
//     "type": "INDIVIDUAL",
//     "propertyType": "loft",
//     "description": "Industrial chic loft in trendy Brooklyn neighborhood with exposed brick walls.",
//     "address": {
//       "street": "456 Bedford Ave",
//       "city": "Brooklyn",
//       "state": "NY",
//       "postalCode": "11211",
//       "country": "USA"
//     },
//     "coordinates": {
//       "latitude": 40.7146,
//       "longitude": -73.9572
//     },
//     "images": [
//       "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=400",
//       "https://images.unsplash.com/photo-1540518614846-7eded1ba50d0?w=400"
//     ],
//     "price": 195,
//     "currency": "USD",
//     "amenities": ["WiFi", "Kitchen", "Smart TV", "Workspace", "Balcony"],
//     "bedrooms": 1,
//     "beds": 1,
//     "bathrooms": 1,
//     "maxGuests": 2,
//     "rating": 4.9,
//     "reviewCount": 15,
//     "reviews": [],
//     "isActive": true,
//     "isFeatured": true,
//     "isSuperHost": true,
//     "units": [],
//     "permissions": {
//       "canManageBookings": true,
//       "canCheckInGuests": true,
//       "canManageUnits": false,
//       "canHandleFinances": true
//     },
//     "cancellationPolicy": {
//       "policyType": "strict",
//       "description": "Strict cancellation policy",
//       "nonRefundableFees": ["Cleaning fee"],
//       "refundPercentages": []
//     },
//     "houseRules": {
//       "checkInTime": { "from": "16:00", "to": "20:00" },
//       "quietHours": { "from": "21:00", "to": "09:00" },
//       "checkOutTime": "10:00",
//       "smokingAllowed": false,
//       "petsAllowed": false,
//       "partiesAllowed": false,
//       "additionalRules": ["Please remove shoes", "No loud music after 9 PM"]
//     },
//     "safetyFeatures": {
//       "securityCameras": { "exterior": true, "interior": false, "description": "Exterior camera at entrance" },
//       "smokeDetector": true,
//       "carbonMonoxideDetector": true,
//       "fireExtinguisher": true,
//       "firstAidKit": true,
//       "weaponsOnProperty": false,
//       "dangerousAnimals": false,
//       "additionalSafetyInfo": ["Fire escape accessible", "Emergency contacts provided"]
//     },
//     "calendar": [],
//     "createdAt": "2025-06-10T10:15:20.000Z",
//     "updatedAt": "2025-06-10T10:15:20.000Z",
//     "__v": 0
//   },
//   {
//     "_id": "684d7bd5a36191ddd3c98c40",
//     "hostId": "684d7bd5a36191ddd3c98c2f",
//     "name": "Luxury Penthouse Suite",
//     "type": "INDIVIDUAL",
//     "propertyType": "penthouse",
//     "description": "Stunning penthouse with panoramic city views and premium amenities.",
//     "address": {
//       "street": "789 Fifth Ave",
//       "city": "New York",
//       "state": "NY",
//       "postalCode": "10022",
//       "country": "USA"
//     },
//     "coordinates": {
//       "latitude": 40.7614,
//       "longitude": -73.9776
//     },
//     "images": [
//       "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
//       "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
//     ],
//     "price": 450,
//     "currency": "USD",
//     "amenities": ["WiFi", "Kitchen", "AC", "TV", "Pool", "Gym", "Balcony", "Parking"],
//     "bedrooms": 3,
//     "beds": 4,
//     "bathrooms": 3,
//     "maxGuests": 8,
//     "rating": 4.7,
//     "reviewCount": 8,
//     "reviews": [],
//     "isActive": false,
//     "isFeatured": false,
//     "isSuperHost": false,
//     "units": [],
//     "permissions": {
//       "canManageBookings": true,
//       "canCheckInGuests": false,
//       "canManageUnits": false,
//       "canHandleFinances": true
//     },
//     "cancellationPolicy": {
//       "policyType": "flexible",
//       "description": "Flexible cancellation policy",
//       "nonRefundableFees": [],
//       "refundPercentages": [
//         {
//           "_id": "684d7bd5a36191ddd3c98c41",
//           "immediate": 100,
//           "beforeDays": 1,
//           "percentage": 100
//         }
//       ]
//     },
//     "houseRules": {
//       "checkInTime": { "from": "15:00", "to": "23:00" },
//       "quietHours": { "from": "22:00", "to": "08:00" },
//       "checkOutTime": "12:00",
//       "smokingAllowed": false,
//       "petsAllowed": false,
//       "partiesAllowed": true,
//       "additionalRules": ["Maximum 8 guests", "No smoking anywhere in building"]
//     },
//     "safetyFeatures": {
//       "securityCameras": { "exterior": true, "interior": false, "description": "24/7 building security" },
//       "smokeDetector": true,
//       "carbonMonoxideDetector": true,
//       "fireExtinguisher": true,
//       "firstAidKit": true,
//       "weaponsOnProperty": false,
//       "dangerousAnimals": false,
//       "additionalSafetyInfo": ["Concierge on duty 24/7", "Secure building access"]
//     },
//     "calendar": [],
//     "createdAt": "2025-06-05T14:20:30.000Z",
//     "updatedAt": "2025-06-16T09:45:15.000Z",
//     "__v": 0
//   }
// ];

// // Helper function to generate new property ID
// export const generatePropertyId = (): string => {
//   return `684d7bd5a36191ddd3c98c${Math.random().toString(36).substr(2, 2)}`;
// };

// // Helper function to get property by ID
// export const getPropertyById = (id: string): Property | undefined => {
//   return mockProperties.find(property => property._id === id);
// };

// // Helper function to add new property
// export const addProperty = (property: Omit<Property, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Property => {
//   const newProperty: Property = {
//     ...property,
//     _id: generatePropertyId(),
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     __v: 0
//   };
  
//   mockProperties.push(newProperty);
//   return newProperty;
// };

// // Helper function to update property
// export const updateProperty = (id: string, updates: Partial<Property>): Property | null => {
//   const index = mockProperties.findIndex(property => property._id === id);
//   if (index === -1) return null;
  
//   mockProperties[index] = {
//     ...mockProperties[index],
//     ...updates,
//     updatedAt: new Date().toISOString()
//   };
  
//   return mockProperties[index];
// };

// // Helper function to delete property
// export const deleteProperty = (id: string): boolean => {
//   const index = mockProperties.findIndex(property => property._id === id);
//   if (index === -1) return false;
  
//   mockProperties.splice(index, 1);
//   return true;
// };
