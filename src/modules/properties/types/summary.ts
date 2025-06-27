/**
 * Summary component types for Properties module
 * Contains types for property summary-related components
 */

import { HostDashboard } from "@shared/types";

/**
 * Props for PropertySummary component
 */
export interface PropertySummaryProps {
  isLoading: boolean;
  data: HostDashboard | undefined;
}

/**
 * Props for EarningsSummary component
 */
export interface EarningsSummaryProps {
  isLoading: boolean;
  data: HostDashboard | undefined;
}
