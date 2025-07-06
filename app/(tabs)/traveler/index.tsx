/**
 * Traveler Index page - redirects to the traveler home screen
 * Default landing page for travelers when they access the traveler tabs
 */

// Expo routing
import { Redirect } from "expo-router";

export default function TravelerIndex() {
  return <Redirect href="/(tabs)/traveler/home" />;
}
