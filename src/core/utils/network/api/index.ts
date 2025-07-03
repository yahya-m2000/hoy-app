/**
 * API Utilities
 *
 * Consolidated exports for API-related utility functions including:
 * - Request handling and HTTP client utilities
 * - Error handling and user-friendly formatting
 * - Rate limiting and throttling mechanisms
 * - Property data transformations and search
 * - MongoDB utilities and general helpers
 * 
 * @module @core/utils/api
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// CORE API UTILITIES
// ========================================

// HTTP request utilities and client configuration
export * from "./http-client";

// Error handling and formatting
export * from "src/core/utils/network/api/error-interceptor";

// API throttling mechanisms
export * from "./request-throttler";

// Comprehensive rate limiting with caching and adaptive backoff
export * from "./rate-limiter";

// General API utilities (URL building, parameter formatting)
export * from "./api-helpers";

// ========================================
// SPECIALIZED UTILITIES
// ========================================

// Property-specific transformations and search
export * from "../../data/property-transformer";
export * from "./search-client";

// MongoDB utilities and database helpers
export * from "../../data/mongo-helpers";

// ========================================
// LEGACY COMPATIBILITY
// ========================================

// Note: Legacy imports will be handled by the transition period
// Old files will be removed after confirming no external dependencies
