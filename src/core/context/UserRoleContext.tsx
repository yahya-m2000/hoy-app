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
import { eventEmitter, AppEvents } from "../utils/sys/event-emitter";
import { logger } from "../utils/sys/log";
import { ContextErrorBoundary } from "../error/ContextErrorBoundary";

export type UserRoleType = "traveler" | "host";

interface UserRoleContextType {
  userRole: UserRoleType;
  setUserRole: (role: UserRoleType) => Promise<void>;
  isRoleLoading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(
  undefined
);

const UserRoleProviderInternal = ({ children }: { children: ReactNode }) => {
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
        logger.error("Failed to load user role:", error);
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
      AsyncStorage.setItem("@userRole", "traveler").catch(logger.error);
    }
  }, [isAuthenticated]);

  const setUserRole = useCallback(
    async (role: UserRoleType) => {
      setIsRoleLoading(true);

      try {
        // Store the role in AsyncStorage
        await AsyncStorage.setItem("@userRole", role);

        // Update the state
        setUserRoleState(role);

        // Clear query cache when switching roles
        queryClient.clear();
        // Emit role change event
        eventEmitter.emit(AppEvents.USER_ROLE_CHANGED, { newRole: role });

        // Re-check authentication state to ensure everything is in sync
        await checkAuthenticationState();

        logger.log(`User role changed to: ${role}`);
      } catch (error) {
        logger.error("Failed to set user role:", error);
      } finally {
        setIsRoleLoading(false);
      }
    },
    [queryClient, checkAuthenticationState]
  );

  return (
    <UserRoleContext.Provider
      value={{
        userRole,
        setUserRole,
        isRoleLoading,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const UserRoleProvider = ({ children }: { children: ReactNode }) => (
  <ContextErrorBoundary
    contextName="UserRole"
    critical={false}
    enableRetry={true}
    maxRetries={2}
  >
    <UserRoleProviderInternal>{children}</UserRoleProviderInternal>
  </ContextErrorBoundary>
);

export const useUserRole = (): UserRoleContextType => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
};
