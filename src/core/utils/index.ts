/**
 * Core Utilities
 *
 * Centralized utility exports organized by domain for better
 * maintainability and consistent naming across the application.
 * 
 * @module @core/utils
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// DOMAIN-ORGANIZED UTILITIES
// ========================================

// API and HTTP utilities
export * as apiUtils from "./network/api";

// Asset management utilities
export * as assetUtils from "./sys/asset";

// Error handling and logging
export * as errorUtils from "./sys/error";

// Data formatting utilities
export * as formatUtils from "./data/formatting";

// Location parsing and geographical utilities
export * as locationUtils from "./user/location";

// Logging utilities
export * as logUtils from "./sys/log";

// Network and connectivity utilities
export * as networkUtils from "./network";

// Security utilities
export * as securityUtils from "./security";

// Storage and persistence utilities
export * as storageUtils from "./storage";

// User profile and authentication utilities
export * as userUtils from "./user";

// Data validation utilities
export * as validationUtils from "./data/validation";

// ========================================
// LEGACY COMPATIBILITY
// ========================================

// Font utilities (design system)
export * as fontUtils from "../design/fonts";

// Development-only helpers (excluded from production bundle)
// They are dynamically required so tree-shaking can drop them in release builds
if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(exports, require("../auth/debug-tokens"));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(exports, require("./sys/event-emitter"));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(exports, require("../../test/mocks/mockData"));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(exports, require("../../features/host/utils/policyHelpers"));
}
