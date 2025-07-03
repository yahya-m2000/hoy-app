/**
 * Core API Module
 * 
 * Exports all API-related functionality including:
 * - Endpoints configuration
 * - Domain-specific services  
 * - HTTP client and utilities
 * - Authentication management
 * - Token validation and caching
 * - Network utilities
 * - Circuit breaker functionality
 * - Certificate pinning system
 * - API key management system
 * - Socket.io client
 */

// Main exports
export * from "./endpoints";
export * from "./services";

// HTTP Client
export { default as api, api as apiClient } from "./client";

// Configuration and utilities
export * from "../config/api.config";
export * from "./auth-manager";
export * from "./token-cache";
export * from "./network-utils";
export * from "./circuit-breaker";
export * from "./request-signing";
export * from "./certificate-pinning-interceptor";
export * from "./api-key-interceptor";
export * from "./auth-token-interceptor";

// Socket.io functionality
export * from "./socket";

// Interceptors setup (for initialization)
export { setupApiInterceptors } from "./interceptors";

// Initialization
export { default as apiInit } from "./init";