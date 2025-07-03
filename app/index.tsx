/**
 * Root index file for Hoy application
 * Acts as an entry point that redirects to the appropriate tab experience
 */

// Third-party libraries
import { Redirect } from "expo-router";

// App context
import { useUserRole } from "@core/context";

export default function Index() {
  const { userRole } = useUserRole();
  // Redirect to the appropriate experience based on user role
  return (
    <Redirect
      href={
        userRole === "host" ? "/(tabs)/host/today" : "/(tabs)/traveler/home"
      }
    />
  );
}
