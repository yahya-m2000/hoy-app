import type { AxiosRequestConfig } from '@core/types/api.types';
import { getTokenFromStorage } from '@core/auth/storage';
import { logger } from '@core/utils/sys/log';

/**
 * Auth Token Interceptor
 * Adds Authorization: Bearer <accessToken> if available.
 */
export const setupAuthTokenInterceptor = (axiosInstance: any): void => {
  axiosInstance.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      if (config.headers?.Authorization) {
        // Do not override existing Authorization header
        return config;
      }
      const token = await getTokenFromStorage();
      if (token) {
        if (!config.headers) config.headers = {} as any;
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  logger.info('[AuthTokenInterceptor] setup complete', undefined, {
    module: 'AuthTokenInterceptor',
  });
}; 