/**
 * Auth0 Integration Hook
 * 
 * Integrates Auth0 v5 with the existing authentication system
 * 
 * @module @core/hooks/useAuth0Integration
 * @author Hoy Development Team
 * @version 5.0.0
 */

import { useCallback, useState } from 'react';
import { useAuth0 } from 'react-native-auth0';
import { auth0Service } from '@core/api/services/auth/auth0.service';
import { logger } from '@core/utils/sys/log/logger';
import { logErrorWithContext } from '@core/utils/sys/error';
import * as AuthSession from 'expo-auth-session';
import type { WebAuthorizeParameters, WebAuthorizeOptions } from 'react-native-auth0';
import { AuthService } from '@core/api/services/auth';
import { saveTokenToStorage, saveRefreshTokenToStorage, clearTokenInvalidation } from '@core/auth/storage';
import { setUserIdentity } from '@core/utils/data/validation/integrity-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '@core/context/AuthContext';

export interface Auth0IntegrationResult {
  authenticateWithAuth0: (connection?: 'google-oauth2' | 'facebook') => Promise<void>;
  logoutFromAuth0: () => Promise<void>;
  isAuth0Loading: boolean;
  auth0Error: string | null;
  auth0User: any | null;
  isAuth0Authenticated: boolean;
  getAuth0DebugInfo: () => Promise<any>;
}

export const useAuth0Integration = (): Auth0IntegrationResult => {
  const { authorize, clearSession, user: auth0User } = useAuth0();
  const { markAsAuthenticated } = useAuth();
  const [isAuth0Loading, setIsAuth0Loading] = useState(false);
  const [auth0Error, setAuth0Error] = useState<string | null>(null);

  const authenticateWithAuth0 = useCallback(
    async (connection?: 'google-oauth2' | 'facebook') => {
      setIsAuth0Loading(true);
      setAuth0Error(null);
      try {
        logger.info('[useAuth0Integration] Starting Auth0 authentication', { connection });
        
        // Configure Auth0 parameters
        const params: any = {
          scope: 'openid profile email',
          audience: `https://dev-12t76epiidwfskdk.uk.auth0.com/api/v2/`,
          redirectUri: AuthSession.makeRedirectUri({ 
            scheme: 'hoy',
            path: 'callback'
          })
        };
        
        console.log('Auth0 params', params);
        if (connection) params.connection = connection;
        
        // Get Auth0 credentials
        const credentials = await authorize(params);
        if (!credentials?.accessToken || !credentials?.idToken) {
          throw new Error('Failed to obtain Auth0 credentials');
        }
        
        logger.info('[useAuth0Integration] Auth0 authentication successful', {
          hasAccessToken: !!credentials.accessToken,
          hasIdToken: !!credentials.idToken,
          expiresAt: credentials.expiresAt,
        });
        
        // Decode the ID token to get user info
        const decodedToken: any = jwtDecode(credentials.idToken);
        
        logger.info('[useAuth0Integration] Decoded Auth0 ID token', {
          email: decodedToken.email,
          sub: decodedToken.sub,
        });
        
        // Map provider name for backend
        const provider = connection === 'google-oauth2' ? 'google' : 
                        connection === 'facebook' ? 'facebook' : 'auth0';
        
        // Call our backend SSO endpoint
        try {
          const ssoResponse = await AuthService.ssoAuth({
            email: decodedToken.email || '',
            provider,
            ssoId: decodedToken.sub || '', // This is the unique identifier from Auth0
            firstName: decodedToken.given_name || decodedToken.name?.split(' ')[0],
            lastName: decodedToken.family_name || decodedToken.name?.split(' ').slice(1).join(' '),
            profilePicture: decodedToken.picture,
          });
          
          logger.info('[useAuth0Integration] Backend SSO authentication successful', {
            email: ssoResponse.user.email,
            userId: ssoResponse.user.id,
          });
          
          // Store tokens from our backend
          if (ssoResponse.accessToken) {
            await saveTokenToStorage(ssoResponse.accessToken);
            logger.info('[useAuth0Integration] Access token saved to storage');
          }
          
          if (ssoResponse.refreshToken) {
            await saveRefreshTokenToStorage(ssoResponse.refreshToken);
            logger.info('[useAuth0Integration] Refresh token saved to storage');
          }
          
          // Clear any previous token invalidation
          await clearTokenInvalidation();
          
          // Store user ID and identity
          const userId = ssoResponse.user.id || (ssoResponse.user as any)._id;
          await AsyncStorage.setItem('currentUserId', userId);
          await setUserIdentity(userId, ssoResponse.user.email);
          
          // Mark user as authenticated in AuthContext
          markAsAuthenticated(ssoResponse.user);
          
          logger.info('[useAuth0Integration] Auth0 integration completed successfully');
        } catch (ssoError: any) {
          // Check if the error indicates user needs signup
          if (ssoError.message === 'USER_NEEDS_SIGNUP') {
            const signupData = ssoError.signupData || {
              provider,
              ssoId: decodedToken.sub,
              email: decodedToken.email,
              firstName: decodedToken.given_name || decodedToken.name?.split(' ')[0],
              lastName: decodedToken.family_name || decodedToken.name?.split(' ').slice(1).join(' '),
              profilePicture: decodedToken.picture,
            };
            
            logger.info('[useAuth0Integration] User needs signup, storing SSO data', {
              email: decodedToken.email,
              signupData,
            });
            
            // Store SSO data temporarily for signup
            await AsyncStorage.setItem('ssoSignupData', JSON.stringify(signupData));
            
            throw new Error('USER_NEEDS_SIGNUP');
          }
          
          // Check if the error indicates account linking is required
          if (ssoError.message === 'ACCOUNT_LINKING_REQUIRED') {
            logger.info('[useAuth0Integration] ACCOUNT_LINKING_REQUIRED error received', {
              ssoError,
              context: ssoError.context,
              fullError: JSON.stringify(ssoError, null, 2)
            });
            
            const linkingData = {
              existingUser: ssoError.context?.existingUser,
              newProvider: ssoError.context?.newProvider,
              ssoId: ssoError.context?.ssoId,
              profilePicture: decodedToken.picture,
            };
            
            logger.info('[useAuth0Integration] Account linking required', {
              email: decodedToken.email,
              existingUser: linkingData.existingUser,
              newProvider: linkingData.newProvider,
              linkingData
            });
            
            // Store linking data temporarily
            await AsyncStorage.setItem('ssoLinkingData', JSON.stringify(linkingData));
            
            throw new Error('ACCOUNT_LINKING_REQUIRED');
          }
          
          // Handle other SSO errors
          logger.error('[useAuth0Integration] SSO authentication failed', ssoError);
          throw new Error(ssoError.message || 'SSO authentication failed');
        }
      } catch (error) {
        // Don't log expected flows as errors
        if (error instanceof Error && 
            (error.message === 'USER_NEEDS_SIGNUP' || error.message === 'ACCOUNT_LINKING_REQUIRED')) {
          // These are expected flows, not errors
          setAuth0Error(null);
          throw error; // Re-throw without logging as error
        }
        
        // Log actual errors
        logErrorWithContext('useAuth0Integration.authenticateWithAuth0', error);
        let errorMessage = 'Authentication failed';
        if (error instanceof Error) {
          if (error.message.includes('cancelled')) {
            errorMessage = 'Authentication was cancelled';
          } else if (error.message.includes('network')) {
            errorMessage = 'Network error during authentication';
          } else {
            errorMessage = error.message;
          }
        }
        setAuth0Error(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsAuth0Loading(false);
      }
    },
    [authorize]
  );

  const logoutFromAuth0 = useCallback(async () => {
    setIsAuth0Loading(true);
    setAuth0Error(null);
    try {
      logger.info('[useAuth0Integration] Starting Auth0 logout');
      await clearSession();
      await auth0Service.logout();
      logger.info('[useAuth0Integration] Auth0 logout completed successfully');
    } catch (error) {
      logErrorWithContext('useAuth0Integration.logoutFromAuth0', error);
      setAuth0Error('Logout failed');
      throw new Error('Logout failed');
    } finally {
      setIsAuth0Loading(false);
    }
  }, [clearSession]);

  const getAuth0DebugInfo = useCallback(async () => {
    try {
      const debugInfo = await auth0Service.getDebugInfo();
      return {
        ...debugInfo,
        hookState: {
          isAuth0Loading,
          auth0Error,
          hasAuth0User: !!auth0User,
        },
      };
    } catch (error) {
      logErrorWithContext('useAuth0Integration.getAuth0DebugInfo', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        hookState: {
          isAuth0Loading,
          auth0Error,
          hasAuth0User: !!auth0User,
        },
      };
    }
  }, [isAuth0Loading, auth0Error, auth0User]);

  return {
    authenticateWithAuth0,
    logoutFromAuth0,
    isAuth0Loading,
    auth0Error,
    auth0User,
    isAuth0Authenticated: !!auth0User,
    getAuth0DebugInfo,
  };
}; 