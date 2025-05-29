/**
 * User Role Context for the Hoy application
 * Manages user role state (traveler/host) and provides switching capability
 */

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";
import { eventEmitter, AppEvents } from "../utils/eventEmitter";

export type UserRoleType = "traveler" | "host";

interface UserRoleContextType {
  userRole: UserRoleType;
  isHost: boolean;
  isRoleLoading: boolean;
  toggleUserRole: () => Promise<void>;
  setUserRole: (role: UserRoleType) => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(
  undefined
);

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [userRole, setUserRoleState] = useState<UserRoleType>("traveler");
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(false);

  // Initialize user role from storage
  useEffect(() => {
    const initUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("@userRole");
        if (storedRole === "host" || storedRole === "traveler") {
          setUserRoleState(storedRole);
        } else {
          // Default to traveler if no role is stored or an invalid value is stored
          setUserRoleState("traveler");
        }
      } catch (error) {
        console.error("Failed to load user role:", error);
        setUserRoleState("traveler");
      }
    };

    initUserRole();
  }, []);

  // Update when user signs in or out
  useEffect(() => {
    if (!user) {
      // Reset to traveler if user signs out
      setUserRoleState("traveler");
      AsyncStorage.setItem("@userRole", "traveler").catch(console.error);
    }
  }, [user]);

  // Save user role when it changes
  const setUserRole = useCallback(async (newRole: UserRoleType) => {
    setIsRoleLoading(true);
    try {
      await AsyncStorage.setItem("@userRole", newRole);
      setUserRoleState(newRole);

      // Emit event for any components that need to react to role changes
      eventEmitter.emit(AppEvents.USER_ROLE_CHANGED, { newRole });

      // Simulate a delay to ensure UI components have time to adjust
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to save user role:", error);
    } finally {
      setIsRoleLoading(false);
    }
  }, []);
  // Toggle between traveler and host
  // Original function - temporarily commented out
  /*
  const toggleUserRole = useCallback(async () => {
    const newRole = userRole === "traveler" ? "host" : "traveler";
    await setUserRole(newRole);
  }, [userRole, setUserRole]);
  */
  // Temporary function that shows an alert instead of switching roles
  const toggleUserRole = useCallback(async () => {
    Alert.alert(
      "Host Mode Under Development",
      "The Host mode functionality is currently under development. Please check back soon!",
      [
        {
          text: "OK",
          onPress: () => console.log("Host mode alert acknowledged"),
        },
      ]
    );

    // Keep user in traveler mode
    if (userRole === "host") {
      await setUserRole("traveler");
    }
  }, [userRole, setUserRole]);

  return (
    <UserRoleContext.Provider
      value={{
        userRole,
        isHost: userRole === "host",
        isRoleLoading,
        toggleUserRole,
        setUserRole,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = (): UserRoleContextType => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
};
