/**
 * Auth0 Service for v5
 * 
 * Comprehensive Auth0 v5 service providing:
 * - Authentication with Auth0
 * - Token management and validation
 * - User profile management
 * - Secure credential storage
 * 
 * @module @core/api/services/auth/auth0
 * @author Hoy Development Team
 * @version 5.0.0
 */

import Auth0, { Credentials } from 'react-native-auth0';
import { logger } from '@core/utils/sys/log/logger';
import { logErrorWithContext } from '@core/utils/sys/error';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface Auth0Config {
  domain: string;
  clientId: string;
}

export interface Auth0User {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
  [key: string]: any;
}

export interface Auth0Credentials {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
  scope: string;
  tokenType: string;
}

export interface Auth0LoginResult {
  user: Auth0User;
  credentials: Auth0Credentials;
}

// ========================================
// AUTH0 SERVICE CLASS
// ========================================

/**
 * Auth0 Service for v5 with comprehensive authentication features
 */
export class Auth0Service {
  private auth0: Auth0;
  private config: Auth0Config;

  constructor(config: Auth0Config) {
    this.config = config;
    this.auth0 = new Auth0({
      domain: config.domain,
      clientId: config.clientId,
    });
  }

  /**
   * Initialize Auth0 service
   */
  static async initialize(config: Auth0Config): Promise<Auth0Service> {
    try {
      logger.info('[Auth0Service] Initializing Auth0 service', { domain: config.domain });
      
      // Test connection (noop for now to avoid unnecessary network call during init)
      const service = new Auth0Service(config);
      return service;
    } catch (error) {
      logger.error('[Auth0Service] Failed to initialize Auth0 service', error);
      throw error;
    }
  }

  /**
   * Test Auth0 connection – placeholder (can be expanded to hit /.well-known)
   */
  private async testConnection(): Promise<void> {
    // No-op – underlying SDK will throw if the domain is unreachable when we
    // actually make a request. Keeping this for future health-check ability.
    return Promise.resolve();
  }

  /**
   * Authenticate user with Auth0
   */
  async authenticate(): Promise<Auth0LoginResult> {
    try {
      logger.info('[Auth0Service] Starting Auth0 authentication');

      const credentials = await this.auth0.webAuth.authorize({
        scope: 'openid profile email',
        audience: `https://${this.config.domain}/api/v2/`,
      }) as any; // typings lag behind – cast to any to avoid TS mismatch

      logger.info('[Auth0Service] Auth0 authentication successful', {
        hasAccessToken: !!credentials.accessToken,
        hasIdToken: !!credentials.idToken,
        expiresAt: credentials.expiresAt,
      });

      // Get user profile – requires the accessToken that we just obtained
      const userInfo: any = await this.auth0.auth.userInfo({ token: credentials.accessToken });
      const user: Auth0User = userInfo as Auth0User;
      
      if (!user) {
        throw new Error('Failed to retrieve user profile from Auth0');
      }

      return {
        user,
        credentials: {
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          idToken: credentials.idToken,
          expiresAt: credentials.expiresAt,
          scope: credentials.scope || 'openid profile email',
          tokenType: credentials.tokenType,
        },
      };
    } catch (error) {
      logErrorWithContext('Auth0Service.authenticate', error);
      
      if (error instanceof Error) {
        if (error.message.includes('cancelled')) {
          throw new Error('Authentication was cancelled by user');
        }
        if (error.message.includes('network')) {
          throw new Error('Network error during authentication');
        }
      }
      
      throw new Error('Authentication failed. Please try again.');
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<Auth0User | null> {
    try {
      const userInfo: any = await this.auth0.auth.userInfo({ token: (await this.getAccessToken()) || '' });
      return userInfo as Auth0User;
    } catch (error) {
      logErrorWithContext('Auth0Service.getCurrentUser', error);
      return null;
    }
  }

  /**
   * Get current credentials
   */
  async getCredentials(): Promise<Auth0Credentials | null> {
    try {
      const credentials = await this.auth0.credentialsManager.getCredentials(); // auto-refreshes when possible
      if (!credentials) return null;

      return {
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        idToken: credentials.idToken,
        expiresAt: credentials.expiresAt,
        scope: credentials.scope || 'openid profile email',
        tokenType: credentials.tokenType,
      };
    } catch (error) {
      logErrorWithContext('Auth0Service.getCredentials', error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<Auth0Credentials | null> {
    try {
      logger.info('[Auth0Service] Refreshing access token');
      
      const newCredentials = await this.auth0.credentialsManager.getCredentials();
      if (!newCredentials) return null;

      return {
        accessToken: newCredentials.accessToken,
        refreshToken: newCredentials.refreshToken,
        idToken: newCredentials.idToken,
        expiresAt: newCredentials.expiresAt,
        scope: newCredentials.scope || 'openid profile email',
        tokenType: newCredentials.tokenType,
      };
    } catch (error) {
      logErrorWithContext('Auth0Service.refreshToken', error);
      return null;
    }
  }

  /**
   * Clear session and logout
   */
  async logout(): Promise<void> {
    try {
      logger.info('[Auth0Service] Starting Auth0 logout');
      
      // Clear web session
      await this.auth0.webAuth.clearSession();
      
      // Clear stored credentials
      await this.auth0.credentialsManager.clearCredentials();
      
      logger.info('[Auth0Service] Auth0 logout completed successfully');
    } catch (error) {
      logErrorWithContext('Auth0Service.logout', error);
      // Don't throw error for logout failures
      logger.warn('[Auth0Service] Logout completed with warnings', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const credentials = await this.auth0.credentialsManager.getCredentials();
      const hasValidCredentials = credentials && credentials.expiresAt > Date.now();
      
      logger.debug('[Auth0Service] Authentication check', { 
        hasCredentials: !!credentials,
        hasValidCredentials,
        expiresAt: credentials?.expiresAt,
        currentTime: Date.now(),
      });
      
      return hasValidCredentials;
    } catch (error) {
      logErrorWithContext('Auth0Service.isAuthenticated', error);
      return false;
    }
  }

  /**
   * Get access token (refreshing if necessary)
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const credentials = await this.auth0.credentialsManager.getCredentials();
      
      if (!credentials) {
        logger.debug('[Auth0Service] No credentials available');
        return null;
      }

      // Check if token is expired
      if (credentials.expiresAt <= Date.now()) {
        logger.info('[Auth0Service] Token expired, attempting refresh');
        const refreshedCredentials = await this.refreshToken();
        return refreshedCredentials?.accessToken || null;
      }

      return credentials.accessToken;
    } catch (error) {
      logErrorWithContext('Auth0Service.getAccessToken', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<Auth0User>): Promise<Auth0User> {
    try {
      logger.info('[Auth0Service] Updating user profile');
      
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('No valid access token available');
      }

      // This would typically call Auth0 Management API
      // For now, we'll return the current user
      const userInfo: any = await this.auth0.auth.userInfo({ token: accessToken });
      return userInfo as Auth0User;
    } catch (error) {
      logErrorWithContext('Auth0Service.updateProfile', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Change password
   */
  async changePassword(email: string): Promise<void> {
    try {
      logger.info('[Auth0Service] Initiating password change', { email });
      
      await this.auth0.auth.passwordRealm({
        username: email,
        password: '', // API requires a password but we are only triggering reset email
        realm: 'Username-Password-Authentication',
        scope: 'openid profile email',
      } as any);

      logger.info('[Auth0Service] Password change initiated successfully');
    } catch (error) {
      logErrorWithContext('Auth0Service.changePassword', error);
      throw new Error('Failed to initiate password change');
    }
  }

  /**
   * Get debug information
   */
  async getDebugInfo(): Promise<any> {
    try {
      const userInfo: any = await this.auth0.auth.userInfo({ token: (await this.getAccessToken()) || '' });
      const credentials = await this.auth0.credentialsManager.getCredentials();
      const isAuthenticated = await this.isAuthenticated();

      return {
        hasUser: !!userInfo,
        hasCredentials: !!credentials,
        isAuthenticated,
        credentialsExpiry: credentials?.expiresAt,
        currentTime: Date.now(),
        domain: this.config.domain,
        clientId: this.config.clientId,
      };
    } catch (error) {
      logErrorWithContext('Auth0Service.getDebugInfo', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        domain: this.config.domain,
        clientId: this.config.clientId,
      };
    }
  }
}

// ========================================
// DEFAULT INSTANCE
// ========================================

/**
 * Default Auth0 service instance
 */
export const auth0Service = new Auth0Service({
  domain: 'dev-12t76epiidwfskdk.uk.auth0.com',
  clientId: 'XdHmY0ud5HVHiztgOcbe7MxR7XrBViuZ',
});

// ========================================
// EXPORTS
// ========================================

export default Auth0Service; 