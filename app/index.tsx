/**
 * Root index file for Hoy application
 * Acts as an entry point that redirects to the appropriate tab experience
 */

// Third-party libraries
import { Redirect } from "expo-router";

// App context
import { useUserRole } from "@common-context/UserRoleContext";

export default function Index() {
  const { isHost } = useUserRole();

  // Redirect to the appropriate experience based on user role
  return (
    <Redirect
      href={isHost ? "(tabs)/host/dashboard" : "(tabs)/traveler/home"}
    />
  );
}
