/**
 * Production Type Declarations
 * 
 * Type definitions for production build optimizations
 * and debug component stripping
 */

declare global {
  /**
   * Production build flag
   */
  const __PRODUCTION__: boolean;
  
  /**
   * Debug components module
   * In production, all exports are replaced with no-ops
   */
  declare module '@shared/components/debug' {
    export const DebugBanner: () => null;
    export const DebugButton: () => null;
    export const DebugCard: () => null;
    export const DebugContainer: () => null;
    export const DebugError: () => null;
    export const DebugInfo: () => null;
    export const DebugJson: () => null;
    export const DebugModal: () => null;
    export const DebugOverlay: () => null;
    export const DebugPanel: () => null;
    export const DebugSection: () => null;
    export const DebugStats: () => null;
    export const DebugTab: () => null;
    export const DebugTable: () => null;
    export const DebugText: () => null;
    export const DebugValue: () => null;
    export const MemoryMonitor: () => null;
    export const NetworkLogger: () => null;
    export const PerformanceMonitor: () => null;
    export const StateInspector: () => null;
    
    // Debug screens
    export const ApiKeyManagementDebug: () => null;
    export const CertificatePinningDebug: () => null;
    export const ClickjackingProtectionDebug: () => null;
    export const CsrfProtectionDebug: () => null;
    export const SessionManagementDebug: () => null;
    export const TokenStorageSecurityDebug: () => null;
  }
  
  /**
   * Console methods that will be stripped in production
   */
  interface Console {
    log: __PRODUCTION__ extends true ? never : Console['log'];
    debug: __PRODUCTION__ extends true ? never : Console['debug'];
    info: __PRODUCTION__ extends true ? never : Console['info'];
  }
}

/**
 * Production-safe imports
 * Use these types to ensure debug imports are properly handled
 */
export type ProductionSafeComponent<T = any> = __PRODUCTION__ extends true ? () => null : T;

export type ProductionSafeHook<T = any> = __PRODUCTION__ extends true ? () => undefined : T;

export type ProductionSafeFunction<T = any> = __PRODUCTION__ extends true ? () => void : T;

/**
 * Environment configuration types
 */
export interface ProductionEnvironment {
  readonly IS_PRODUCTION: true;
  readonly ENABLE_DEBUG_COMPONENTS: false;
  readonly ENABLE_VERBOSE_LOGGING: false;
  readonly ENABLE_MEMORY_MONITORING: false;
}

export interface DevelopmentEnvironment {
  readonly IS_PRODUCTION: false;
  readonly ENABLE_DEBUG_COMPONENTS: true;
  readonly ENABLE_VERBOSE_LOGGING: true;
  readonly ENABLE_MEMORY_MONITORING: true;
}

export type Environment = ProductionEnvironment | DevelopmentEnvironment; 