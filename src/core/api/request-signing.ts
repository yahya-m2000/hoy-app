/**
 * HMAC Request Signing System
 * 
 * Implements secure request signing to prevent:
 * - Replay attacks
 * - Request tampering
 * - Man-in-the-middle attacks
 * 
 * Features:
 * - HMAC-SHA256 signatures
 * - Timestamp validation
 * - Nonce-based replay protection
 * - Content integrity verification
 * - Automatic signature generation/validation
 * 
 * @module @core/api/request-signing
 * @author Hoy Development Team
 * @version 1.0.0 - Initial Implementation
 */

import { logger } from '@core/utils/sys/log';
import { getTokenFromStorage } from '@core/auth/storage';

// Use React Native compatible crypto libraries
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

// ========================================
// CONFIGURATION
// ========================================

/**
 * Request signing configuration
 */
export interface RequestSigningConfig {
  enabled: boolean;
  algorithm: 'HMAC-SHA256';
  timestampWindow: number;    // Maximum age of request in milliseconds
  nonceExpiry: number;        // How long to store nonces (milliseconds)
  signatureHeader: string;    // Header name for signature
  timestampHeader: string;    // Header name for timestamp
  nonceHeader: string;        // Header name for nonce
  secretRotationInterval: number; // How often to rotate secrets (milliseconds)
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: RequestSigningConfig = {
  enabled: true,
  algorithm: 'HMAC-SHA256',
  timestampWindow: 5 * 60 * 1000,  // 5 minutes
  nonceExpiry: 10 * 60 * 1000,     // 10 minutes
  signatureHeader: 'X-Request-Signature',
  timestampHeader: 'X-Request-Timestamp',
  nonceHeader: 'X-Request-Nonce',
  secretRotationInterval: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Signing configuration (can be overridden)
 */
let signingConfig: RequestSigningConfig = { ...DEFAULT_CONFIG };

// ========================================
// SECRET MANAGEMENT
// ========================================

/**
 * Signing secret interface
 */
interface SigningSecret {
  id: string;
  key: string;
  createdAt: number;
  isActive: boolean;
}

/**
 * In-memory secret storage (in production, use secure key management)
 */
class SecretManager {
  private secrets: Map<string, SigningSecret> = new Map();
  private activeSecretId: string | null = null;
  private lastRotation: number = 0;

  constructor() {
    this.initializeSecrets();
  }

  /**
   * Initialize with default secret
   */
  private initializeSecrets(): void {
    const defaultSecret = this.generateSecret();
    this.secrets.set(defaultSecret.id, defaultSecret);
    this.activeSecretId = defaultSecret.id;
    this.lastRotation = Date.now();
  }

  /**
   * Generate a new secret
   */
  private generateSecret(): SigningSecret {
    const id = Array.from(Crypto.getRandomBytes(16))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const key = Array.from(Crypto.getRandomBytes(32))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return {
      id,
      key,
      createdAt: Date.now(),
      isActive: true,
    };
  }

  /**
   * Get active secret for signing
   */
  public getActiveSecret(): SigningSecret | null {
    if (!this.activeSecretId) return null;
    return this.secrets.get(this.activeSecretId) || null;
  }

  /**
   * Get secret by ID for verification
   */
  public getSecret(id: string): SigningSecret | null {
    return this.secrets.get(id) || null;
  }

  /**
   * Rotate secrets if needed
   */
  public rotateSecretsIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastRotation > signingConfig.secretRotationInterval) {
      this.rotateSecrets();
    }
  }

  /**
   * Force secret rotation
   */
  public rotateSecrets(): void {
    logger.info('Rotating request signing secrets', undefined, {
      module: 'RequestSigning'
    });

    // Mark current secret as inactive
    if (this.activeSecretId) {
      const currentSecret = this.secrets.get(this.activeSecretId);
      if (currentSecret) {
        currentSecret.isActive = false;
      }
    }

    // Generate new secret
    const newSecret = this.generateSecret();
    this.secrets.set(newSecret.id, newSecret);
    this.activeSecretId = newSecret.id;
    this.lastRotation = Date.now();

    // Clean up old secrets (keep last 3 for verification)
    const sortedSecrets = Array.from(this.secrets.values())
      .sort((a, b) => b.createdAt - a.createdAt);
    
    if (sortedSecrets.length > 3) {
      const secretsToRemove = sortedSecrets.slice(3);
      secretsToRemove.forEach(secret => {
        this.secrets.delete(secret.id);
      });
    }
  }

  /**
   * Get all valid secrets for verification
   */
  public getValidSecrets(): SigningSecret[] {
    return Array.from(this.secrets.values());
  }
}

/**
 * Global secret manager instance
 */
const secretManager = new SecretManager();

// ========================================
// NONCE MANAGEMENT
// ========================================

/**
 * Nonce storage for replay attack prevention
 */
class NonceManager {
  private usedNonces: Map<string, number> = new Map();

  /**
   * Generate a new nonce
   */
  public generateNonce(): string {
    const timestamp = Date.now();
    const random = Array.from(Crypto.getRandomBytes(16))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `${timestamp}-${random}`;
  }

  /**
   * Check if nonce has been used
   */
  public isNonceUsed(nonce: string): boolean {
    this.cleanupExpiredNonces();
    return this.usedNonces.has(nonce);
  }

  /**
   * Mark nonce as used
   */
  public markNonceAsUsed(nonce: string): void {
    this.usedNonces.set(nonce, Date.now());
  }

  /**
   * Clean up expired nonces
   */
  private cleanupExpiredNonces(): void {
    const now = Date.now();
    const expiry = signingConfig.nonceExpiry;
    
    for (const [nonce, timestamp] of this.usedNonces.entries()) {
      if (now - timestamp > expiry) {
        this.usedNonces.delete(nonce);
      }
    }
  }

  /**
   * Clear all nonces (for testing)
   */
  public clearNonces(): void {
    this.usedNonces.clear();
  }
}

/**
 * Global nonce manager instance
 */
const nonceManager = new NonceManager();

// ========================================
// SIGNATURE GENERATION
// ========================================

/**
 * Request signature data
 */
export interface RequestSignatureData {
  signature: string;
  timestamp: string;
  nonce: string;
  secretId: string;
}

/**
 * Generate canonical string for signing
 */
function generateCanonicalString(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: string,
  timestamp: string,
  nonce: string
): string {
  // Normalize method and URL
  const normalizedMethod = method.toUpperCase();
  const normalizedUrl = url.toLowerCase();
  
  // Sort headers for consistent ordering
  const sortedHeaders = Object.keys(headers)
    .filter(key => key.toLowerCase().startsWith('x-') || 
                   key.toLowerCase() === 'content-type' ||
                   key.toLowerCase() === 'authorization')
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key]}`)
    .join('\n');
  
  // Create canonical string
  const canonicalString = [
    normalizedMethod,
    normalizedUrl,
    sortedHeaders,
    body,
    timestamp,
    nonce
  ].join('\n');
  
  return canonicalString;
}

/**
 * Generate HMAC signature for request
 */
export function generateRequestSignature(
  method: string,
  url: string,
  headers: Record<string, string> = {},
  body: any = null
): RequestSignatureData {
  if (!signingConfig.enabled) {
    throw new Error('Request signing is disabled');
  }

  // Rotate secrets if needed
  secretManager.rotateSecretsIfNeeded();

  // Get active secret
  const secret = secretManager.getActiveSecret();
  if (!secret) {
    throw new Error('No active signing secret available');
  }

  // Generate timestamp and nonce
  const timestamp = Date.now().toString();
  const nonce = nonceManager.generateNonce();

  // Serialize body
  const bodyString = body ? JSON.stringify(body) : '';

  // Generate canonical string
  const canonicalString = generateCanonicalString(
    method,
    url,
    headers,
    bodyString,
    timestamp,
    nonce
  );

  // Generate HMAC signature
  const signature = CryptoJS.HmacSHA256(canonicalString, secret.key).toString();

  // Only log request signatures for specific debug scenarios (not every request)
  if (__DEV__ && (url.includes('/debug/') || process.env.EXPO_PUBLIC_LOG_REQUEST_SIGNING === 'true')) {
    logger.debug('Generated request signature', {
      method,
      url: url.substring(0, 100), // Truncate URL for logging
      timestamp,
      nonce,
      secretId: secret.id,
    }, {
      module: 'RequestSigning'
    });
  }

  return {
    signature,
    timestamp,
    nonce,
    secretId: secret.id,
  };
}

// ========================================
// SIGNATURE VERIFICATION
// ========================================

/**
 * Verification result
 */
export interface SignatureVerificationResult {
  isValid: boolean;
  error?: string;
  details?: {
    timestampValid: boolean;
    nonceValid: boolean;
    signatureValid: boolean;
  };
}

/**
 * Verify request signature
 */
export function verifyRequestSignature(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: any,
  signatureData: {
    signature: string;
    timestamp: string;
    nonce: string;
    secretId: string;
  }
): SignatureVerificationResult {
  if (!signingConfig.enabled) {
    return { isValid: true }; // Allow requests when signing is disabled
  }

  const { signature, timestamp, nonce, secretId } = signatureData;

  // Validate timestamp
  const requestTime = parseInt(timestamp);
  const now = Date.now();
  const timestampValid = (now - requestTime) <= signingConfig.timestampWindow;

  if (!timestampValid) {
    return {
      isValid: false,
      error: 'Request timestamp is too old or invalid',
      details: { timestampValid: false, nonceValid: true, signatureValid: false }
    };
  }

  // Validate nonce (check for replay attacks)
  const nonceValid = !nonceManager.isNonceUsed(nonce);
  if (!nonceValid) {
    return {
      isValid: false,
      error: 'Nonce has already been used (replay attack detected)',
      details: { timestampValid: true, nonceValid: false, signatureValid: false }
    };
  }

  // Get secret for verification
  const secret = secretManager.getSecret(secretId);
  if (!secret) {
    return {
      isValid: false,
      error: 'Unknown secret ID',
      details: { timestampValid: true, nonceValid: true, signatureValid: false }
    };
  }

  // Generate expected signature
  const bodyString = body ? JSON.stringify(body) : '';
  const canonicalString = generateCanonicalString(
    method,
    url,
    headers,
    bodyString,
    timestamp,
    nonce
  );
  
  const expectedSignature = CryptoJS.HmacSHA256(canonicalString, secret.key).toString();

  // Verify signature
  const signatureValid = signature === expectedSignature;

  if (signatureValid) {
    // Mark nonce as used to prevent replay
    nonceManager.markNonceAsUsed(nonce);
  }

  return {
    isValid: signatureValid,
    error: signatureValid ? undefined : 'Invalid signature',
    details: { timestampValid: true, nonceValid: true, signatureValid }
  };
}

// ========================================
// AXIOS INTEGRATION
// ========================================

/**
 * Add signature headers to axios request config
 */
export async function addSignatureHeaders(config: any): Promise<any> {
  if (!signingConfig.enabled) {
    return config;
  }

  try {
    const method = config.method || 'GET';
    const url = `${config.baseURL || ''}${config.url || ''}`;
    const headers = config.headers || {};
    const body = config.data;

    // Generate signature
    const signatureData = generateRequestSignature(method, url, headers, body);

    // Add signature headers
    const updatedConfig = {
      ...config,
      headers: {
        ...headers,
        [signingConfig.signatureHeader]: signatureData.signature,
        [signingConfig.timestampHeader]: signatureData.timestamp,
        [signingConfig.nonceHeader]: signatureData.nonce,
        'X-Secret-Id': signatureData.secretId,
      },
    };

    return updatedConfig;
  } catch (error) {
    logger.error('Failed to add signature headers:', error, {
      module: 'RequestSigning'
    });
    // Return original config if signing fails
    return config;
  }
}

// ========================================
// CONFIGURATION MANAGEMENT
// ========================================

/**
 * Update signing configuration
 */
export function updateSigningConfig(newConfig: Partial<RequestSigningConfig>): void {
  signingConfig = { ...signingConfig, ...newConfig };
  
  logger.info('Updated request signing configuration', {
    enabled: signingConfig.enabled,
    timestampWindow: signingConfig.timestampWindow,
    algorithm: signingConfig.algorithm,
  }, {
    module: 'RequestSigning'
  });
}

/**
 * Get current signing configuration
 */
export function getSigningConfig(): RequestSigningConfig {
  return { ...signingConfig };
}

/**
 * Enable/disable request signing
 */
export function setSigningEnabled(enabled: boolean): void {
  signingConfig.enabled = enabled;
  logger.info(`Request signing ${enabled ? 'enabled' : 'disabled'}`, undefined, {
    module: 'RequestSigning'
  });
}

/**
 * Force secret rotation (for testing/security incidents)
 */
export function forceSecretRotation(): void {
  secretManager.rotateSecrets();
}

/**
 * Clear nonce cache (for testing)
 */
export function clearNonceCache(): void {
  nonceManager.clearNonces();
}

// ========================================
// HEALTH MONITORING
// ========================================

/**
 * Get signing system health
 */
export function getSigningHealth(): {
  enabled: boolean;
  activeSecretId: string | null;
  secretCount: number;
  lastRotation: number;
  nonceCount: number;
} {
  const activeSecret = secretManager.getActiveSecret();
  const validSecrets = secretManager.getValidSecrets();
  
  return {
    enabled: signingConfig.enabled,
    activeSecretId: activeSecret?.id || null,
    secretCount: validSecrets.length,
    lastRotation: validSecrets[0]?.createdAt || 0,
    nonceCount: nonceManager['usedNonces'].size, // Access private property for monitoring
  };
}

// ========================================
// ADDITIONAL EXPORTS
// ========================================

export {
  secretManager,
  nonceManager,
  signingConfig,
}; 