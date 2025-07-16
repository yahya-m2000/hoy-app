/**
 * Session Management System
 * 
 * Comprehensive session management to prevent session fixation, hijacking, and
 * ensure proper session lifecycle management including:
 * - Session ID generation and rotation
 * - Device fingerprinting for session binding
 * - Session timeout and automatic invalidation
 * - Session fixation prevention
 * - Session hijacking detection
 * - Secure session storage and cleanup
 * 
 * Features:
 * - Device-bound sessions with fingerprinting
 * - Automatic session rotation on login
 * - Session timeout management
 * - Concurrent session detection
 * - Secure session invalidation
 * - Session activity tracking
 * - Debug and monitoring capabilities
 * 
 * @module @core/security/session-manager
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { logger } from '@core/utils/sys/log';
import { api } from '@core/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

let SecureStore: typeof import('expo-secure-store') | undefined;
if (Platform.OS !== 'web' && typeof navigator !== 'undefined') {
  SecureStore = require('expo-secure-store');
}

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceFingerprint: string;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
  isActive: boolean;
  loginMethod: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeviceFingerprint {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  osName: string;
  osVersion: string;
  appVersion: string;
  screenResolution: string;
  timezone: string;
  language: string;
  hash: string;
}

export interface SessionManagerConfig {
  enabled: boolean;
  sessionTimeout: number;          // Session timeout in ms
  maxConcurrentSessions: number;   // Maximum concurrent sessions per user
  deviceBindingEnabled: boolean;   // Enable device fingerprinting
  rotateOnLogin: boolean;          // Rotate session ID on each login
  trackActivity: boolean;          // Track session activity
  secureStorage: boolean;          // Use secure storage for sensitive data
  debugMode: boolean;              // Enable debug logging
}

export interface SessionManagerStats {
  sessionsCreated: number;
  sessionsInvalidated: number;
  sessionRotations: number;
  timeoutExpirations: number;
  hijackingAttempts: number;
  fixationAttempts: number;
  deviceMismatches: number;
  lastSessionActivity: number;
  activeSessions: number;
}

export interface SessionValidationResult {
  isValid: boolean;
  reason?: string;
  shouldRotate?: boolean;
  securityAlert?: boolean;
  newSessionId?: string;
}

// ========================================
// CONFIGURATION
// ========================================

const DEFAULT_CONFIG: SessionManagerConfig = {
  enabled: true,
  sessionTimeout: 12 * 60 * 60 * 1000, // 12 hours
  maxConcurrentSessions: 3,
  deviceBindingEnabled: true,
  rotateOnLogin: true,
  trackActivity: true,
  secureStorage: true,
  debugMode: __DEV__,
};

const STORAGE_KEYS = {
  SESSION_INFO: 'session_info',
  DEVICE_FINGERPRINT: 'device_fingerprint',
  SESSION_HISTORY: 'session_history',
  LAST_ACTIVITY: 'last_session_activity',
} as const;

// ========================================
// SESSION MANAGER CLASS
// ========================================

export class SessionManager {
  private config: SessionManagerConfig;
  private stats: SessionManagerStats;
  private currentSession: SessionInfo | null = null;
  private deviceFingerprint: DeviceFingerprint | null = null;
  private activityTimer: NodeJS.Timeout | null = null;
  private lastInvalidationTime: number = 0;
  private invalidationDebounceMs: number = 5000; // Prevent rapid invalidations within 5 seconds
  private lastSessionCreationTime: number = 0;
  private sessionCreationDebounceMs: number = 1000; // Prevent rapid session creation within 1 second

  constructor(config: Partial<SessionManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      sessionsCreated: 0,
      sessionsInvalidated: 0,
      sessionRotations: 0,
      timeoutExpirations: 0,
      hijackingAttempts: 0,
      fixationAttempts: 0,
      deviceMismatches: 0,
      lastSessionActivity: 0,
      activeSessions: 0,
    };

    // Initialize device fingerprint
    this.initializeDeviceFingerprint();
    
    // Start activity tracking
    if (this.config.trackActivity) {
      this.startActivityTracking();
    }
  }

  /**
   * Create a new session for user login
   */
  public async createSession(
    userId: string,
    loginMethod: string = 'password',
    additionalData: Partial<SessionInfo> = {}
  ): Promise<SessionInfo> {
    try {
      const currentTime = Date.now();
      
      // Debounce rapid session creation calls to prevent loops
      if (currentTime - this.lastSessionCreationTime < this.sessionCreationDebounceMs) {
        logger.debug('[SessionManager] Session creation debounced', {
          userId,
          loginMethod,
          timeSinceLastCreation: currentTime - this.lastSessionCreationTime,
        }, {
          module: 'SessionManager'
        });
        // Return existing session if available, otherwise create one without invalidation
        const existingSession = await this.getCurrentSession();
        if (existingSession && existingSession.userId === userId) {
          return existingSession;
        }
      }
      
      this.lastSessionCreationTime = currentTime;

      // Invalidate any existing session first (prevent session fixation)
      await this.invalidateCurrentSession('new_login');

      // Generate new session ID
      const sessionId = this.generateSessionId();
      
      // Get device fingerprint
      const fingerprint = await this.getDeviceFingerprint();
      
      const now = Date.now();
      const sessionInfo: SessionInfo = {
        sessionId,
        userId,
        deviceFingerprint: fingerprint.hash,
        createdAt: now,
        lastActivity: now,
        expiresAt: now + this.config.sessionTimeout,
        isActive: true,
        loginMethod,
        ...additionalData,
      };

      // Store session securely
      await this.storeSession(sessionInfo);
      
      // Update current session
      this.currentSession = sessionInfo;
      this.stats.sessionsCreated++;
      this.stats.activeSessions++;
      this.stats.lastSessionActivity = now;

      // Notify server about new session
      await this.notifyServerNewSession(sessionInfo);

      logger.info('[SessionManager] New session created', {
        sessionId: sessionId.substring(0, 8) + '...',
        userId,
        loginMethod,
        deviceFingerprint: fingerprint.hash.substring(0, 8) + '...',
      }, {
        module: 'SessionManager'
      });

      return sessionInfo;

    } catch (error) {
      logger.error('[SessionManager] Failed to create session:', error, {
        module: 'SessionManager'
      });
      throw new Error('Session creation failed');
    }
  }

  /**
   * Validate current session
   */
  public async validateSession(): Promise<SessionValidationResult> {
    try {
      if (!this.config.enabled) {
        return { isValid: true };
      }

      const session = await this.getCurrentSession();
      if (!session) {
        return { 
          isValid: false, 
          reason: 'no_session' 
        };
      }

      const now = Date.now();

      // Check if session has expired
      if (now > session.expiresAt) {
        await this.invalidateCurrentSession('timeout');
        this.stats.timeoutExpirations++;
        return { 
          isValid: false, 
          reason: 'session_expired' 
        };
      }

      // Check if session is still active
      if (!session.isActive) {
        return { 
          isValid: false, 
          reason: 'session_inactive' 
        };
      }

      // Validate device fingerprint (prevent session hijacking)
      if (this.config.deviceBindingEnabled) {
        const currentFingerprint = await this.getDeviceFingerprint();
        if (currentFingerprint.hash !== session.deviceFingerprint) {
          logger.warn('[SessionManager] Device fingerprint mismatch detected', {
            expected: session.deviceFingerprint.substring(0, 8) + '...',
            actual: currentFingerprint.hash.substring(0, 8) + '...',
          }, {
            module: 'SessionManager'
          });

          this.stats.hijackingAttempts++;
          await this.invalidateCurrentSession('device_mismatch');
          return { 
            isValid: false, 
            reason: 'device_mismatch',
            securityAlert: true 
          };
        }
      }

      // Update last activity
      await this.updateSessionActivity();

      // Check if session should be rotated
      const shouldRotate = this.shouldRotateSession(session);
      if (shouldRotate) {
        const newSessionId = await this.rotateSession();
        return {
          isValid: true,
          shouldRotate: true,
          newSessionId,
        };
      }

      return { isValid: true };

    } catch (error) {
      logger.error('[SessionManager] Session validation error:', error, {
        module: 'SessionManager'
      });
      return { 
        isValid: false, 
        reason: 'validation_error' 
      };
    }
  }

  /**
   * Invalidate current session
   */
  public async invalidateCurrentSession(reason: string = 'manual'): Promise<void> {
    try {
      const currentTime = Date.now();
      
      // Debounce rapid invalidation calls to prevent loops
      if (currentTime - this.lastInvalidationTime < this.invalidationDebounceMs) {
        logger.debug('[SessionManager] Session invalidation debounced', {
          reason,
          timeSinceLastInvalidation: currentTime - this.lastInvalidationTime,
        }, {
          module: 'SessionManager'
        });
        return;
      }
      
      this.lastInvalidationTime = currentTime;

      const session = await this.getCurrentSession();
      if (!session) {
        return;
      }

      // Mark session as inactive
      session.isActive = false;
      await this.storeSession(session);

      // Notify server about session invalidation
      await this.notifyServerSessionInvalidation(session.sessionId, reason);

      // Clear session data
      await this.clearSessionData();

      // Update stats
      this.stats.sessionsInvalidated++;
      this.stats.activeSessions = Math.max(0, this.stats.activeSessions - 1);

      logger.info('[SessionManager] Session invalidated', {
        sessionId: session.sessionId.substring(0, 8) + '...',
        reason,
      }, {
        module: 'SessionManager'
      });

      this.currentSession = null;

    } catch (error) {
      logger.error('[SessionManager] Failed to invalidate session:', error, {
        module: 'SessionManager'
      });
    }
  }

  /**
   * Rotate session ID (prevent session fixation)
   */
  public async rotateSession(): Promise<string> {
    try {
      const currentSession = await this.getCurrentSession();
      if (!currentSession) {
        throw new Error('No active session to rotate');
      }

      const oldSessionId = currentSession.sessionId;
      const newSessionId = this.generateSessionId();
      
      // Update session with new ID
      currentSession.sessionId = newSessionId;
      currentSession.lastActivity = Date.now();
      
      // Store updated session
      await this.storeSession(currentSession);
      
      // Notify server about session rotation
      await this.notifyServerSessionRotation(oldSessionId, newSessionId);

      this.stats.sessionRotations++;
      this.currentSession = currentSession;

      logger.info('[SessionManager] Session rotated', {
        oldSessionId: oldSessionId.substring(0, 8) + '...',
        newSessionId: newSessionId.substring(0, 8) + '...',
      }, {
        module: 'SessionManager'
      });

      return newSessionId;

    } catch (error) {
      logger.error('[SessionManager] Session rotation failed:', error, {
        module: 'SessionManager'
      });
      throw error;
    }
  }

  /**
   * Update session activity timestamp
   */
  public async updateSessionActivity(): Promise<void> {
    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return;
      }

      const now = Date.now();
      session.lastActivity = now;
      this.stats.lastSessionActivity = now;

      await this.storeSession(session);

      // Update activity in storage for quick access
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());

    } catch (error) {
      logger.error('[SessionManager] Failed to update session activity:', error, {
        module: 'SessionManager'
      });
    }
  }

  /**
   * Get current session information
   */
  public async getCurrentSession(): Promise<SessionInfo | null> {
    try {
      if (this.currentSession) {
        return this.currentSession;
      }

      const sessionData = this.config.secureStorage
        ? await SecureStore?.getItemAsync(STORAGE_KEYS.SESSION_INFO)
        : await AsyncStorage.getItem(STORAGE_KEYS.SESSION_INFO);

      if (!sessionData) {
        return null;
      }

      const session: SessionInfo = JSON.parse(sessionData);
      this.currentSession = session;
      return session;

    } catch (error) {
      logger.error('[SessionManager] Failed to get current session:', error, {
        module: 'SessionManager'
      });
      return null;
    }
  }

  /**
   * Get session statistics
   */
  public getStats(): SessionManagerStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      sessionsCreated: 0,
      sessionsInvalidated: 0,
      sessionRotations: 0,
      timeoutExpirations: 0,
      hijackingAttempts: 0,
      fixationAttempts: 0,
      deviceMismatches: 0,
      lastSessionActivity: 0,
      activeSessions: 0,
    };
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * Generate a cryptographically secure session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    const devicePart = this.deviceFingerprint?.deviceId.substring(0, 8) || 'unknown';
    
    return `${timestamp}-${randomPart}-${devicePart}`;
  }

  /**
   * Initialize device fingerprint
   */
  private async initializeDeviceFingerprint(): Promise<void> {
    try {
      // Check if we already have a cached fingerprint
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_FINGERPRINT);
      if (cached) {
        this.deviceFingerprint = JSON.parse(cached);
        return;
      }

      // Generate new fingerprint
      const fingerprint = await this.generateDeviceFingerprint();
      this.deviceFingerprint = fingerprint;

      // Cache the fingerprint
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_FINGERPRINT, JSON.stringify(fingerprint));

    } catch (error) {
      logger.error('[SessionManager] Failed to initialize device fingerprint:', error, {
        module: 'SessionManager'
      });
    }
  }

  /**
   * Generate device fingerprint
   */
  private async generateDeviceFingerprint(): Promise<DeviceFingerprint> {
    try {
      const deviceInfo = {
        deviceId: Constants.sessionId || 'unknown',
        deviceName: Device.deviceName || 'Unknown Device',
        deviceType: Device.deviceType?.toString() || 'unknown',
        osName: Device.osName || 'unknown',
        osVersion: Device.osVersion || 'unknown',
        appVersion: Constants.expoConfig?.version || 'unknown',
        screenResolution: `${Constants.screenDimensions?.width || 0}x${Constants.screenDimensions?.height || 0}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: Constants.systemFonts?.[0] || 'unknown',
      };

      // Create a hash of the device information
      const fingerprintString = Object.values(deviceInfo).join('|');
      const hash = await this.simpleHash(fingerprintString);

      return {
        ...deviceInfo,
        hash,
      };

    } catch (error) {
      logger.error('[SessionManager] Failed to generate device fingerprint:', error, {
        module: 'SessionManager'
      });
      
      // Return a fallback fingerprint
      return {
        deviceId: 'fallback',
        deviceName: 'Unknown',
        deviceType: 'unknown',
        osName: 'unknown',
        osVersion: 'unknown',
        appVersion: 'unknown',
        screenResolution: '0x0',
        timezone: 'UTC',
        language: 'unknown',
        hash: 'fallback-hash',
      };
    }
  }

  /**
   * Get device fingerprint
   */
  private async getDeviceFingerprint(): Promise<DeviceFingerprint> {
    if (!this.deviceFingerprint) {
      await this.initializeDeviceFingerprint();
    }
    return this.deviceFingerprint!;
  }

  /**
   * Simple hash function for device fingerprinting
   */
  private async simpleHash(str: string): Promise<string> {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Store session information securely
   */
  private async storeSession(session: SessionInfo): Promise<void> {
    const sessionData = JSON.stringify(session);
    
    if (this.config.secureStorage) {
      await SecureStore?.setItemAsync(STORAGE_KEYS.SESSION_INFO, sessionData);
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_INFO, sessionData);
    }
  }

  /**
   * Clear all session data
   */
  private async clearSessionData(): Promise<void> {
    try {
      if (this.config.secureStorage) {
        await SecureStore?.deleteItemAsync(STORAGE_KEYS.SESSION_INFO).catch(() => {});
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_INFO);
      }
      
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
      
    } catch (error) {
      logger.error('[SessionManager] Failed to clear session data:', error, {
        module: 'SessionManager'
      });
    }
  }

  /**
   * Check if session should be rotated
   */
  private shouldRotateSession(session: SessionInfo): boolean {
    if (!this.config.rotateOnLogin) {
      return false;
    }

    const now = Date.now();
    const sessionAge = now - session.createdAt;
    const rotationThreshold = this.config.sessionTimeout / 4; // Rotate after 1/4 of session lifetime

    return sessionAge > rotationThreshold;
  }

  /**
   * Start activity tracking timer
   */
  private startActivityTracking(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }

    // Update activity every 5 minutes
    this.activityTimer = setInterval(() => {
      this.updateSessionActivity().catch(error => {
        logger.error('[SessionManager] Activity tracking update failed:', error, {
          module: 'SessionManager'
        });
      });
    }, 5 * 60 * 1000);
  }

  /**
   * Notify server about new session
   */
  private async notifyServerNewSession(session: SessionInfo): Promise<void> {
    try {
      await api.post('/auth/session/create', {
        sessionId: session.sessionId,
        deviceFingerprint: session.deviceFingerprint,
        loginMethod: session.loginMethod,
      });
    } catch (error) {
      logger.warn('[SessionManager] Failed to notify server about new session:', error, {
        module: 'SessionManager'
      });
    }
  }

  /**
   * Notify server about session invalidation
   */
  private async notifyServerSessionInvalidation(sessionId: string, reason: string): Promise<void> {
    try {
      await api.post('/auth/session/invalidate', {
        sessionId,
        reason,
      });
    } catch (error) {
      logger.warn('[SessionManager] Failed to notify server about session invalidation:', error, {
        module: 'SessionManager'
      });
    }
  }

  /**
   * Notify server about session rotation
   */
  private async notifyServerSessionRotation(oldSessionId: string, newSessionId: string): Promise<void> {
    try {
      await api.post('/auth/session/rotate', {
        oldSessionId,
        newSessionId,
      });
    } catch (error) {
      logger.warn('[SessionManager] Failed to notify server about session rotation:', error, {
        module: 'SessionManager'
      });
    }
  }

  /**
   * Cleanup on destroy
   */
  public destroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const sessionManager = new SessionManager();

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================

/**
 * Create a new session
 */
export const createSession = async (
  userId: string,
  loginMethod?: string,
  additionalData?: Partial<SessionInfo>
): Promise<SessionInfo> => {
  return await sessionManager.createSession(userId, loginMethod, additionalData);
};

/**
 * Validate current session
 */
export const validateSession = async (): Promise<SessionValidationResult> => {
  return await sessionManager.validateSession();
};

/**
 * Invalidate current session
 */
export const invalidateSession = async (reason?: string): Promise<void> => {
  return await sessionManager.invalidateCurrentSession(reason);
};

/**
 * Get current session
 */
export const getCurrentSession = async (): Promise<SessionInfo | null> => {
  return await sessionManager.getCurrentSession();
};

/**
 * Update session activity
 */
export const updateSessionActivity = async (): Promise<void> => {
  return await sessionManager.updateSessionActivity();
};

/**
 * Get session statistics
 */
export const getSessionStats = (): SessionManagerStats => {
  return sessionManager.getStats();
};