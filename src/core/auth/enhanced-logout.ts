/**
 * Enhanced Logout Service
 * 
 * Comprehensive logout functionality that addresses session management,
 * session fixation prevention, and security cleanup including:
 * - Proper session invalidation
 * - Server-side session cleanup
 * - Device unbinding
 * - Security token cleanup
 * - Activity tracking cleanup
 * - Debug and audit logging
 * 
 * Features:
 * - Multi-layer session invalidation
 * - Server-side session termination
 * - Device fingerprint cleanup
 * - Token blacklisting
 * - Activity audit trail
 * - Emergency logout capabilities
 * - Concurrent session management
 * - Security event logging
 * 
 * @module @core/auth/enhanced-logout
 * @author Hoy Development Team
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { logger } from '@core/utils/sys/log';
import { apiClient } from '@core/api/client';
import { 
  sessionManager, 
  invalidateSession,
  getCurrentSession,
  type SessionInfo 
} from '@core/security/session-manager';
import {
  clearTokensFromStorage,
  markTokensAsInvalid,
  getTokenFromStorage,
  getRefreshTokenFromStorage,
} from '@core/auth/storage';
import { clearUserData } from '@core/auth/clear-user-data';

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface LogoutOptions {
  reason?: string;
  invalidateAllSessions?: boolean;
  notifyServer?: boolean;
  clearDeviceBinding?: boolean;
  emergencyLogout?: boolean;
  auditLog?: boolean;
}

export interface LogoutResult {
  success: boolean;
  sessionInvalidated: boolean;
  serverNotified: boolean;
  tokensCleared: boolean;
  deviceUnbound: boolean;
  dataCleared: boolean;
  auditLogged: boolean;
  errors: string[];
  warnings: string[];
  timestamp: number;
  sessionId?: string;
  userId?: string;
}

export interface LogoutAuditEntry {
  timestamp: number;
  sessionId: string;
  userId: string;
  reason: string;
  method: string;
  deviceFingerprint: string;
  success: boolean;
  errors: string[];
  ipAddress?: string;
  userAgent?: string;
}

export interface EmergencyLogoutOptions {
  clearAllData?: boolean;
  resetDeviceBinding?: boolean;
  notifyAllSessions?: boolean;
  securityIncident?: boolean;
}

// ========================================
// CONFIGURATION
// ========================================

const LOGOUT_CONFIG = {
  defaultTimeout: 10000, // 10 seconds
  maxRetries: 3,
  auditRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
  emergencyTimeoutMs: 5000, // 5 seconds for emergency logout
} as const;

const AUDIT_STORAGE_KEY = 'logout_audit_log';

// ========================================
// ENHANCED LOGOUT SERVICE
// ========================================

export class EnhancedLogoutService {
  private isLoggingOut = false;
  private logoutPromise: Promise<LogoutResult> | null = null;

  /**
   * Perform comprehensive logout with session management
   */
  public async logout(options: LogoutOptions = {}): Promise<LogoutResult> {
    // Prevent concurrent logout attempts
    if (this.isLoggingOut && this.logoutPromise) {
      logger.warn('[EnhancedLogout] Logout already in progress, returning existing promise', undefined, {
        module: 'EnhancedLogout'
      });
      return await this.logoutPromise;
    }

    this.isLoggingOut = true;
    this.logoutPromise = this.performLogout(options);

    try {
      const result = await this.logoutPromise;
      return result;
    } finally {
      this.isLoggingOut = false;
      this.logoutPromise = null;
    }
  }

  /**
   * Emergency logout - fast, aggressive cleanup
   */
  public async emergencyLogout(options: EmergencyLogoutOptions = {}): Promise<LogoutResult> {
    logger.warn('[EnhancedLogout] Emergency logout initiated', undefined, {
      module: 'EnhancedLogout'
    });

    const logoutOptions: LogoutOptions = {
      reason: 'emergency',
      invalidateAllSessions: true,
      notifyServer: true,
      clearDeviceBinding: options.resetDeviceBinding ?? true,
      emergencyLogout: true,
      auditLog: true,
    };

    // Use shorter timeout for emergency logout
    return await Promise.race([
      this.performLogout(logoutOptions),
      new Promise<LogoutResult>((resolve) => {
        setTimeout(() => {
          resolve({
            success: false,
            sessionInvalidated: false,
            serverNotified: false,
            tokensCleared: false,
            deviceUnbound: false,
            dataCleared: false,
            auditLogged: false,
            errors: ['Emergency logout timeout'],
            warnings: [],
            timestamp: Date.now(),
          });
        }, LOGOUT_CONFIG.emergencyTimeoutMs);
      }),
    ]);
  }

  /**
   * Logout from all sessions (current user)
   */
  public async logoutAllSessions(): Promise<LogoutResult> {
    return await this.logout({
      reason: 'logout_all_sessions',
      invalidateAllSessions: true,
      notifyServer: true,
      clearDeviceBinding: false,
      auditLog: true,
    });
  }

  /**
   * Security logout - when security breach is detected
   */
  public async securityLogout(reason: string): Promise<LogoutResult> {
    logger.error('[EnhancedLogout] Security logout triggered', { reason }, {
      module: 'EnhancedLogout'
    });

    return await this.logout({
      reason: `security_${reason}`,
      invalidateAllSessions: true,
      notifyServer: true,
      clearDeviceBinding: true,
      emergencyLogout: true,
      auditLog: true,
    });
  }

  /**
   * Get logout audit history
   */
  public async getLogoutAuditHistory(limit: number = 50): Promise<LogoutAuditEntry[]> {
    try {
      const auditData = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);
      if (!auditData) {
        return [];
      }

      const auditEntries: LogoutAuditEntry[] = JSON.parse(auditData);
      
      // Filter out old entries
      const cutoffTime = Date.now() - LOGOUT_CONFIG.auditRetention;
      const validEntries = auditEntries.filter(entry => entry.timestamp > cutoffTime);
      
      // Save filtered entries back
      if (validEntries.length !== auditEntries.length) {
        await AsyncStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(validEntries));
      }

      return validEntries.slice(-limit);

    } catch (error) {
      logger.error('[EnhancedLogout] Failed to get audit history:', error, {
        module: 'EnhancedLogout'
      });
      return [];
    }
  }

  /**
   * Clear logout audit history
   */
  public async clearAuditHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUDIT_STORAGE_KEY);
      logger.info('[EnhancedLogout] Audit history cleared', undefined, {
        module: 'EnhancedLogout'
      });
    } catch (error) {
      logger.error('[EnhancedLogout] Failed to clear audit history:', error, {
        module: 'EnhancedLogout'
      });
    }
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * Perform the actual logout process
   */
  private async performLogout(options: LogoutOptions): Promise<LogoutResult> {
    const result: LogoutResult = {
      success: false,
      sessionInvalidated: false,
      serverNotified: false,
      tokensCleared: false,
      deviceUnbound: false,
      dataCleared: false,
      auditLogged: false,
      errors: [],
      warnings: [],
      timestamp: Date.now(),
    };

    const startTime = Date.now();
    let currentSession: SessionInfo | null = null;

    try {
      // Get current session for audit
      currentSession = await getCurrentSession();
      if (currentSession) {
        result.sessionId = currentSession.sessionId;
        result.userId = currentSession.userId;
      }

      logger.info('[EnhancedLogout] Starting logout process', {
        reason: options.reason || 'manual',
        sessionId: currentSession?.sessionId?.substring(0, 8) + '...',
        userId: currentSession?.userId,
        options,
      }, {
        module: 'EnhancedLogout'
      });

      // Step 1: Invalidate current session
      await this.invalidateCurrentSession(options, result);

      // Step 2: Notify server about logout
      if (options.notifyServer !== false) {
        await this.notifyServerLogout(options, result, currentSession);
      }

      // Step 3: Clear authentication tokens
      await this.clearAuthenticationTokens(result);

      // Step 4: Clear device binding if requested
      if (options.clearDeviceBinding) {
        await this.clearDeviceBinding(result);
      }

      // Step 5: Clear user data
      await this.clearAllUserData(result);

      // Step 6: Create audit log entry
      if (options.auditLog !== false) {
        await this.createAuditLogEntry(options, result, currentSession);
      }

      // Determine overall success
      result.success = result.sessionInvalidated && result.tokensCleared && result.dataCleared;

      const duration = Date.now() - startTime;
      logger.info('[EnhancedLogout] Logout process completed', {
        success: result.success,
        duration: `${duration}ms`,
        errors: result.errors,
        warnings: result.warnings,
      }, {
        module: 'EnhancedLogout'
      });

      return result;

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown logout error';
      result.errors.push(errorMessage);
      
      logger.error('[EnhancedLogout] Logout process failed:', error, {
        module: 'EnhancedLogout'
      });

      // Still try to create audit entry for failed logout
      if (options.auditLog !== false) {
        try {
          await this.createAuditLogEntry(options, result, currentSession);
        } catch (auditError) {
          logger.error('[EnhancedLogout] Failed to create audit entry:', auditError, {
            module: 'EnhancedLogout'
          });
        }
      }

      return result;
    }
  }

  /**
   * Invalidate current session
   */
  private async invalidateCurrentSession(options: LogoutOptions, result: LogoutResult): Promise<void> {
    try {
      const reason = options.reason || 'manual_logout';
      
      if (options.invalidateAllSessions) {
        // This would require server-side implementation to invalidate all user sessions
        logger.info('[EnhancedLogout] Invalidating all user sessions', undefined, {
          module: 'EnhancedLogout'
        });
      }

      await invalidateSession(reason);
      result.sessionInvalidated = true;

      logger.debug('[EnhancedLogout] Session invalidated successfully', undefined, {
        module: 'EnhancedLogout'
      });

    } catch (error: any) {
      const errorMessage = `Session invalidation failed: ${error.message}`;
      result.errors.push(errorMessage);
      logger.error('[EnhancedLogout] Session invalidation error:', error, {
        module: 'EnhancedLogout'
      });
    }
  }

  /**
   * Notify server about logout
   */
  private async notifyServerLogout(
    options: LogoutOptions, 
    result: LogoutResult, 
    session: SessionInfo | null
  ): Promise<void> {
    try {
      const refreshToken = await getRefreshTokenFromStorage();
      
      const logoutPayload: any = {
        reason: options.reason || 'manual',
        sessionId: session?.sessionId,
        invalidateAllSessions: options.invalidateAllSessions || false,
        emergencyLogout: options.emergencyLogout || false,
      };

      if (refreshToken) {
        logoutPayload.refreshToken = refreshToken;
      }

      const timeout = options.emergencyLogout 
        ? LOGOUT_CONFIG.emergencyTimeoutMs 
        : LOGOUT_CONFIG.defaultTimeout;

      await Promise.race([
        apiClient.post('/auth/logout', logoutPayload),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Server logout timeout')), timeout);
        }),
      ]);

      result.serverNotified = true;
      logger.debug('[EnhancedLogout] Server notified successfully', undefined, {
        module: 'EnhancedLogout'
      });

    } catch (error: any) {
      const errorMessage = `Server notification failed: ${error.message}`;
      result.warnings.push(errorMessage);
      logger.warn('[EnhancedLogout] Server notification error:', error, {
        module: 'EnhancedLogout'
      });
    }
  }

  /**
   * Clear authentication tokens
   */
  private async clearAuthenticationTokens(result: LogoutResult): Promise<void> {
    try {
      // Mark tokens as invalid first
      await markTokensAsInvalid();
      
      // Then clear them from storage
      await clearTokensFromStorage();
      
      result.tokensCleared = true;
      logger.debug('[EnhancedLogout] Tokens cleared successfully', undefined, {
        module: 'EnhancedLogout'
      });

    } catch (error: any) {
      const errorMessage = `Token clearing failed: ${error.message}`;
      result.errors.push(errorMessage);
      logger.error('[EnhancedLogout] Token clearing error:', error, {
        module: 'EnhancedLogout'
      });
    }
  }

  /**
   * Clear device binding
   */
  private async clearDeviceBinding(result: LogoutResult): Promise<void> {
    try {
      // Clear device fingerprint from storage
      await AsyncStorage.removeItem('device_fingerprint');
      
      // Clear any device-specific session data
      const keys = await AsyncStorage.getAllKeys();
      const deviceKeys = keys.filter(key => 
        key.includes('device') || 
        key.includes('fingerprint') ||
        key.includes('binding')
      );
      
      if (deviceKeys.length > 0) {
        await AsyncStorage.multiRemove(deviceKeys);
      }

      result.deviceUnbound = true;
      logger.debug('[EnhancedLogout] Device binding cleared', undefined, {
        module: 'EnhancedLogout'
      });

    } catch (error: any) {
      const errorMessage = `Device unbinding failed: ${error.message}`;
      result.warnings.push(errorMessage);
      logger.warn('[EnhancedLogout] Device unbinding error:', error, {
        module: 'EnhancedLogout'
      });
    }
  }

  /**
   * Clear all user data
   */
  private async clearAllUserData(result: LogoutResult): Promise<void> {
    try {
      await clearUserData();
      result.dataCleared = true;
      
      logger.debug('[EnhancedLogout] User data cleared successfully', undefined, {
        module: 'EnhancedLogout'
      });

    } catch (error: any) {
      const errorMessage = `Data clearing failed: ${error.message}`;
      result.errors.push(errorMessage);
      logger.error('[EnhancedLogout] Data clearing error:', error, {
        module: 'EnhancedLogout'
      });
    }
  }

  /**
   * Create audit log entry
   */
  private async createAuditLogEntry(
    options: LogoutOptions, 
    result: LogoutResult, 
    session: SessionInfo | null
  ): Promise<void> {
    try {
      const auditEntry: LogoutAuditEntry = {
        timestamp: result.timestamp,
        sessionId: session?.sessionId || 'unknown',
        userId: session?.userId || 'unknown',
        reason: options.reason || 'manual',
        method: options.emergencyLogout ? 'emergency' : 'normal',
        deviceFingerprint: session?.deviceFingerprint || 'unknown',
        success: result.success,
        errors: result.errors,
        ipAddress: session?.ipAddress,
        userAgent: session?.userAgent,
      };

      // Get existing audit entries
      const existingData = await AsyncStorage.getItem(AUDIT_STORAGE_KEY);
      const auditEntries: LogoutAuditEntry[] = existingData ? JSON.parse(existingData) : [];
      
      // Add new entry
      auditEntries.push(auditEntry);
      
      // Keep only recent entries
      const cutoffTime = Date.now() - LOGOUT_CONFIG.auditRetention;
      const validEntries = auditEntries.filter(entry => entry.timestamp > cutoffTime);
      
      // Save back to storage
      await AsyncStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(validEntries));
      
      result.auditLogged = true;
      logger.debug('[EnhancedLogout] Audit entry created', undefined, {
        module: 'EnhancedLogout'
      });

    } catch (error: any) {
      const errorMessage = `Audit logging failed: ${error.message}`;
      result.warnings.push(errorMessage);
      logger.warn('[EnhancedLogout] Audit logging error:', error, {
        module: 'EnhancedLogout'
      });
    }
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const enhancedLogoutService = new EnhancedLogoutService();

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================

/**
 * Perform enhanced logout
 */
export const performEnhancedLogout = async (options?: LogoutOptions): Promise<LogoutResult> => {
  return await enhancedLogoutService.logout(options);
};

/**
 * Emergency logout
 */
export const performEmergencyLogout = async (options?: EmergencyLogoutOptions): Promise<LogoutResult> => {
  return await enhancedLogoutService.emergencyLogout(options);
};

/**
 * Security logout
 */
export const performSecurityLogout = async (reason: string): Promise<LogoutResult> => {
  return await enhancedLogoutService.securityLogout(reason);
};

/**
 * Logout from all sessions
 */
export const logoutAllSessions = async (): Promise<LogoutResult> => {
  return await enhancedLogoutService.logoutAllSessions();
};

/**
 * Get logout audit history
 */
export const getLogoutAuditHistory = async (limit?: number): Promise<LogoutAuditEntry[]> => {
  return await enhancedLogoutService.getLogoutAuditHistory(limit);
};