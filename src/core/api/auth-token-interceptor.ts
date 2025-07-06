import type { AxiosRequestConfig } from '@core/types/api.types';
import { getTokenFromStorage } from '@core/auth/storage';
import { logger } from '@core/utils/sys/log';

/**
 * Auth Token Interceptor
 * Adds Authorization: Bearer <accessToken> if available.
 */
export const setupAuthTokenInterceptor = (axiosInstance: any): void => {
  logger.info('[AuthTokenInterceptor] Setting up auth token interceptor...', undefined, {
    module: 'AuthTokenInterceptor',
  });

  axiosInstance.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      const url = config.url || 'unknown';
      logger.debug(`[AuthTokenInterceptor] Processing request to ${url}`, undefined, {
        module: 'AuthTokenInterceptor',
      });

      // Skip token attachment for public endpoints
      if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/session/')) {
        logger.debug(`[AuthTokenInterceptor] Skipping token for public endpoint: ${url}`, undefined, {
          module: 'AuthTokenInterceptor',
        });
        return config;
      }

      if (config.headers?.Authorization) {
        logger.debug(`[AuthTokenInterceptor] Request already has Authorization header for ${url}`, undefined, {
          module: 'AuthTokenInterceptor',
        });
        return config;
      }

      try {
        logger.debug(`[AuthTokenInterceptor] Attempting to retrieve token for ${url}`, undefined, {
          module: 'AuthTokenInterceptor',
        });
        
        const token = await getTokenFromStorage();
        logger.debug(`[AuthTokenInterceptor] Token retrieval result for ${url}: ${token ? `EXISTS (${token.substring(0, 20)}...)` : 'NULL'}`, undefined, {
          module: 'AuthTokenInterceptor',
        });

        if (token) {
          if (!config.headers) config.headers = {} as any;
          (config.headers as any).Authorization = `Bearer ${token}`;
          logger.info(`[AuthTokenInterceptor] ✅ Added Bearer token to ${url}`, undefined, {
            module: 'AuthTokenInterceptor',
          });
        } else {
          logger.warn(`[AuthTokenInterceptor] ⚠️ No token found for ${url}`, undefined, {
            module: 'AuthTokenInterceptor',
          });
        }
      } catch (error) {
        logger.error(`[AuthTokenInterceptor] ❌ Error retrieving token for ${url}`, error, {
          module: 'AuthTokenInterceptor',
        });
      }

      return config;
    },
    (error: any) => {
      logger.error(`[AuthTokenInterceptor] Request interceptor error`, error, {
        module: 'AuthTokenInterceptor',
      });
      return Promise.reject(error);
    }
  );

  logger.info('[AuthTokenInterceptor] ✅ Auth token interceptor setup complete', undefined, {
    module: 'AuthTokenInterceptor',
  });
};

/**
 * Test function to verify interceptor is working
 */
export const testAuthTokenInterceptor = async (): Promise<boolean> => {
  try {
    logger.info('[AuthTokenInterceptor] Testing interceptor functionality...', undefined, {
      module: 'AuthTokenInterceptor',
    });

    const token = await getTokenFromStorage();
    const hasToken = !!token;
    
    logger.info(`[AuthTokenInterceptor] Test result: ${hasToken ? 'Token found' : 'No token'}`, undefined, {
      module: 'AuthTokenInterceptor',
    });

    return hasToken;
  } catch (error) {
    logger.error('[AuthTokenInterceptor] Test failed', error, {
      module: 'AuthTokenInterceptor',
    });
    return false;
  }
}; 