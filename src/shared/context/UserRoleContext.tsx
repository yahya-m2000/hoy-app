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
import { useQueryClient } from "@tanstack/react-query";
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
  const { isAuthenticated, checkAuthenticationState } = useAuth();
  const queryClient = useQueryClient();
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
    if (!isAuthenticated) {
      // Reset to traveler if user signs out
      setUserRoleState("traveler");
      AsyncStorage.setItem("@userRole", "traveler").catch(console.error);
    }
  }, [isAuthenticated]); // Save user role when it changes
  const setUserRole = useCallback(
    async (newRole: UserRoleType) => {
      setIsRoleLoading(true);
      try {
        await AsyncStorage.setItem("@userRole", newRole);
        setUserRoleState(newRole);

        // Emit event for any components that need to react to role changes
        eventEmitter.emit(AppEvents.USER_ROLE_CHANGED, { newRole });

        // Invalidate user-related queries to prevent stale data issues
        queryClient.invalidateQueries({ queryKey: ["user"] });

        // Add longer delay to ensure all navigation and auth states are stable
        // This prevents race conditions with API calls during role switching
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refresh authentication state to ensure tokens are valid after role switch
        if (isAuthenticated) {
          await checkAuthenticationState();
        }
      } catch (error) {
        console.error("Failed to save user role:", error);
      } finally {
        setIsRoleLoading(false);
      }
    },
    [checkAuthenticationState, isAuthenticated, queryClient]
  ); // Toggle between traveler and host with setup flow
  const toggleUserRole = useCallback(async () => {
    const newRole = userRole === "traveler" ? "host" : "traveler";
    await setUserRole(newRole);
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
