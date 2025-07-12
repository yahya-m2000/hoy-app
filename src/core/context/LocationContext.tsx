/**
 * Location Context for managing location permissions and current location
 * Provides centralized location management for the entire app
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as Location from "expo-location";
import { useToast } from "./ToastContext";
import { useTranslation } from "react-i18next";

// Types
interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: {
    city: string;
    country: string;
    countryCode: string;
    state: string;
  } | null;
  permissionStatus: Location.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;
  locationServicesEnabled: boolean | null;
  manualOverride: boolean | null; // New: manual override for testing
}

interface LocationContextType extends LocationState {
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  updateLocationFromCoordinates: (lat: number, lng: number) => Promise<void>;
  clearLocation: () => void;
  checkLocationServices: () => Promise<boolean>;
  setLocationServicesOverride: (enabled: boolean) => void; // New: manual override
  resetLocationServicesOverride: () => void; // New: reset to auto detection
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [locationState, setLocationState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    permissionStatus: null,
    isLoading: false,
    error: null,
    locationServicesEnabled: null,
    manualOverride: null,
  });

  // Check initial permission status and location services
  useEffect(() => {
    checkPermissionStatus();
    checkLocationServices();
  }, []);

  const checkPermissionStatus = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationState((prev) => ({ ...prev, permissionStatus: status }));
      console.log("Location permission status:", status);
    } catch (error) {
      console.error("Error checking location permission status:", error);
    }
  }, []);

  const checkLocationServices = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Checking location services...");
      console.log("Manual override status:", locationState.manualOverride);

      // Check if manual override is set
      if (locationState.manualOverride !== null) {
        console.log("Using manual override:", locationState.manualOverride);
        setLocationState((prev) => ({
          ...prev,
          locationServicesEnabled: locationState.manualOverride,
        }));
        return locationState.manualOverride;
      }

      // Try multiple methods to check if location services are available
      let isEnabled = false;

      try {
        // Method 1: Direct check
        isEnabled = await Location.hasServicesEnabledAsync();
        console.log("Location.hasServicesEnabledAsync():", isEnabled);
      } catch (error) {
        console.warn("hasServicesEnabledAsync failed:", error);
      }

      // Method 2: Try to get last known position (if permission granted)
      if (
        !isEnabled &&
        locationState.permissionStatus === Location.PermissionStatus.GRANTED
      ) {
        try {
          const lastKnownPosition = await Location.getLastKnownPositionAsync({
            maxAge: 60000, // 1 minute
          });
          if (lastKnownPosition) {
            console.log(
              "Last known position available:",
              lastKnownPosition.coords
            );
            isEnabled = true;
          }
        } catch (error) {
          console.warn("getLastKnownPositionAsync failed:", error);
        }
      }

      // Method 3: Try a quick location request (with very short timeout)
      if (!isEnabled) {
        try {
          const quickLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
            timeInterval: 2000, // 2 seconds timeout
            distanceInterval: 1000, // 1km
            mayShowUserSettingsDialog: false, // Don't show settings dialog for this check
          });
          if (quickLocation) {
            console.log(
              "Quick location check successful:",
              quickLocation.coords
            );
            isEnabled = true;
          }
        } catch (error) {
          console.warn("Quick location check failed:", error);
          // Don't treat this as a definitive failure
        }
      }

      setLocationState((prev) => ({
        ...prev,
        locationServicesEnabled: isEnabled,
      }));

      console.log("Final location services status:", isEnabled);
      return isEnabled;
    } catch (error) {
      console.error("Error checking location services:", error);
      setLocationState((prev) => ({
        ...prev,
        locationServicesEnabled: false,
      }));
      return false;
    }
  }, [locationState.permissionStatus, locationState.manualOverride]);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      setLocationState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationState((prev) => ({
        ...prev,
        permissionStatus: status,
        isLoading: false,
      }));

      if (status === Location.PermissionStatus.GRANTED) {
        // Re-check location services after permission is granted
        await checkLocationServices();

        showToast({
          type: "success",
          message: t("location.permissionGranted"),
        });
        return true;
      } else {
        showToast({
          type: "error",
          message: t("location.permissionDenied"),
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setLocationState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to request location permission",
      }));
      return false;
    }
  }, [showToast, t, checkLocationServices]);

  const getCurrentLocation = useCallback(async () => {
    try {
      setLocationState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Check if location services are enabled
      const isEnabled = await checkLocationServices();
      console.log(
        "Location services enabled for getCurrentLocation:",
        isEnabled
      );

      if (!isEnabled) {
        setLocationState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Location services are disabled",
        }));
        showToast({
          type: "error",
          message: t("location.servicesDisabled"),
        });
        return;
      }

      // Get current position with more lenient options
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // Use lower accuracy for faster response
        timeInterval: 10000, // 10 seconds timeout
        distanceInterval: 100, // 100 meters
        mayShowUserSettingsDialog: true, // Allow system to show location settings if needed
      });

      const { latitude, longitude } = location.coords;
      console.log("Location obtained:", { latitude, longitude });

      // Reverse geocode to get address
      const addressResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      console.log("Geocoding result:", addressResult);

      if (addressResult.length > 0) {
        const address = addressResult[0];
        const formattedAddress = {
          city: address.city || "",
          country: address.country || "",
          countryCode: address.isoCountryCode || "",
          state: address.region || "",
        };

        console.log("Formatted address:", formattedAddress);

        setLocationState((prev) => ({
          ...prev,
          latitude,
          longitude,
          address: formattedAddress,
          isLoading: false,
          error: null,
        }));

        showToast({
          type: "success",
          message: t("location.locationUpdated"),
        });
      } else {
        setLocationState((prev) => ({
          ...prev,
          latitude,
          longitude,
          address: null,
          isLoading: false,
          error: "Could not determine address from coordinates",
        }));

        showToast({
          type: "warning",
          message: t("location.noAddressFound"),
        });
      }
    } catch (error) {
      console.error("Error getting current location:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to get current location";
      if (error instanceof Error) {
        if (error.message.includes("Location service is disabled")) {
          errorMessage =
            "Location services are disabled. Please enable location in your device settings.";
        } else if (error.message.includes("permission")) {
          errorMessage =
            "Location permission denied. Please grant location permission in settings.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Location request timed out. Please try again.";
        }
      }

      setLocationState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      showToast({
        type: "error",
        message: errorMessage,
      });
    }
  }, [showToast, t, checkLocationServices]);

  const updateLocationFromCoordinates = useCallback(
    async (lat: number, lng: number) => {
      try {
        setLocationState((prev) => ({ ...prev, isLoading: true, error: null }));

        const addressResult = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });

        if (addressResult.length > 0) {
          const address = addressResult[0];
          const formattedAddress = {
            city: address.city || "",
            country: address.country || "",
            countryCode: address.isoCountryCode || "",
            state: address.region || "",
          };

          setLocationState((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: formattedAddress,
            isLoading: false,
            error: null,
          }));
        } else {
          setLocationState((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: null,
            isLoading: false,
            error: "Could not determine address from coordinates",
          }));
        }
      } catch (error) {
        console.error("Error updating location from coordinates:", error);
        setLocationState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to update location",
        }));
      }
    },
    []
  );

  const clearLocation = useCallback(() => {
    setLocationState({
      latitude: null,
      longitude: null,
      address: null,
      permissionStatus: locationState.permissionStatus,
      isLoading: false,
      error: null,
      locationServicesEnabled: locationState.locationServicesEnabled,
      manualOverride: null,
    });
  }, [locationState.permissionStatus, locationState.locationServicesEnabled]);

  const setLocationServicesOverride = useCallback((enabled: boolean) => {
    setLocationState((prev) => ({ ...prev, manualOverride: enabled }));
    console.log("Location services overridden to:", enabled);
  }, []);

  const resetLocationServicesOverride = useCallback(() => {
    setLocationState((prev) => ({ ...prev, manualOverride: null }));
    console.log("Location services override reset to auto-detection.");
  }, []);

  const contextValue: LocationContextType = {
    ...locationState,
    requestLocationPermission,
    getCurrentLocation,
    updateLocationFromCoordinates,
    clearLocation,
    checkLocationServices,
    setLocationServicesOverride,
    resetLocationServicesOverride,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};
