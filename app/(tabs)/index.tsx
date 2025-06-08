/**
 * Default route for (tabs) directory
 * Redirects to the appropriate experience based on user role (host or traveler)
 */

// Expo routing
import { Redirect } from "expo-router";

// App context
import { useUserRole } from "@shared/context";

export default function TabsIndex() {
  const { isHost } = useUserRole();

  // Redirect to the appropriate experience based on user role
  return <Redirect href={isHost ? "host" : "traveler"} />;
}
