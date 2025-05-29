/**
 * Host Index page - redirects to the host dashboard
 * Default landing page for hosts when they access the host tabs
 */

// Expo routing
import { Redirect } from "expo-router";

export default function HostIndex() {
  return <Redirect href="dashboard" />;
}
