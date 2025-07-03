/**
 * Security Module Exports
 * 
 * Central exports for all security-related functionality including
 * certificate pinning, CSRF protection, clickjacking protection, and other security utilities.
 * 
 * @module @core/security
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// CERTIFICATE PINNING
// ========================================

export {
  CertificatePinningManager,
  certificatePinningManager,
  validateCertificate,
  shouldBlockDomain,
  getCertificatePinningStats,
  clearCertificateCache,
} from './certificate-pinning';

export type {
  CertificatePinningConfig,
  DomainPinningConfig,
  CertificatePin,
  CertificateValidationResult,
} from './certificate-pinning';

// ========================================
// CSRF PROTECTION
// ========================================

export {
  CsrfTokenManager,
  csrfTokenManager,
  getCsrfToken,
  needsCsrfToken,
  getCsrfTokenHeader,
  clearCsrfToken,
} from './csrf-token-manager';

export type {
  CsrfTokenResponse,
  CsrfTokenInfo,
  CsrfManagerConfig,
  CsrfManagerStats,
} from './csrf-token-manager';

// ========================================
// CLICKJACKING PROTECTION
// ========================================

export {
  ClickjackingProtection,
  clickjackingProtection,
  getFrameBustingScript,
  getSecureWebViewConfig,
  generateCSPHeader,
  getSecurityHeaders,
  validateSecurityHeaders,
  handleWebViewMessage,
  performVisualIntegrityCheck,
  isDomainAllowed,
  getClickjackingStats,
  getClickjackingViolations,
} from './clickjacking-protection';

export type {
  ClickjackingProtectionConfig,
  ClickjackingViolation,
  ClickjackingStats,
  WebViewSecurityConfig,
  VisualIntegrityResult,
} from './clickjacking-protection';

// ========================================
// TOKEN ENCRYPTION
// ========================================

export {
  TokenEncryptionManager,
  tokenEncryptionManager,
  encryptAndStoreToken,
  retrieveAndDecryptToken,
  validateStoredTokenSecurity,
  rotateTokenSecurity,
  clearAllTokenSecurity,
  getTokenEncryptionStats,
  TokenEncryptionError,
} from './token-encryption';

export type {
  TokenEncryptionConfig,
  EncryptedTokenData,
  TokenSecurityMetadata,
  DeviceSecurityContext,
  TokenRotationResult,
  TokenValidationResult,
} from './token-encryption';

// ========================================
// API KEY MANAGEMENT
// ========================================

export {
  ApiKeyManager,
  apiKeyManager,
  getApiKey,
  setApiKey,
  rotateApiKey,
  validateApiKey,
  getApiKeyUsageStats,
  getApiProviders,
  getKeyValidationResults,
  ApiKeyManagerError,
} from './api-key-manager';

export type {
  ApiKeyConfig,
  ApiProvider,
  KeyRotationResult,
  KeyValidationResult,
  ApiKeyManagerConfig,
  KeyUsageStats,
} from './api-key-manager';

// ========================================
// CONVENIENCE EXPORTS
// ========================================

export * as certificatePinning from './certificate-pinning';
export * as csrfProtection from './csrf-token-manager';
export * as tokenEncryption from './token-encryption';
export * as apiKeyManagement from './api-key-manager';

// Session Management
export * from './session-manager';

// Enhanced Logout
export * from '../auth/enhanced-logout';