/**
 * List component types for Properties module
 * Contains types for property list-related components
 */

import type { PropertyType } from "@shared/types/property";
import { RecentReservation } from "@shared/types";

/**
 * Props for PropertyList component
 */
export interface PropertyListProps {
  properties: PropertyType[];
  refreshing: boolean;
  onRefresh: () => void;
  onPropertyPress: (property: PropertyType) => void;
}

/**
 * Props for ReservationsList component
 */
export interface ReservationsListProps {
  isLoading: boolean;
  reservations: RecentReservation[] | undefined;
}
