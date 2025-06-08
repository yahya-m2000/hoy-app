/**
 * useDeepCompareMemo hook
 * Stub implementation to prevent TypeScript errors
 */

import { useMemo } from "react";

export function useDeepCompareMemo<T>(factory: () => T, deps: any[]): T {
  // Simplified implementation - just use regular useMemo for now
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
