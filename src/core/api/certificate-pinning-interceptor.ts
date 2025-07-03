/**
 * Certificate Pinning Interceptor
 * 
 * Integrates SSL certificate pinning validation with Axios HTTP client to prevent MITM attacks.
 * This interceptor validates certificates before making requests and handles certificate validation failures.
 * 
 * Features:
 * - Pre-request certificate validation
 * - Automatic request blocking for invalid certificates
 * - Certificate validation caching for performance
 * - Integration with existing error handling
 * - Detailed logging and monitoring
 * - Graceful fallback mechanisms
 * 
 * @module @core/api/certificate-pinning-interceptor
 * @author Hoy Development Team
 * @version 1.0.0 - Initial Implementation
 */

import { AxiosRequestConfig, AxiosResponse } from '@core/types/api.types';
import { 
  validateCertificate, 
  shouldBlockDomain,
  getCertificatePinningStats,
  CertificateValidationResult 
} from '@core/security/certificate-pinning';
import { logger } from '@core/utils/sys/log';

// ========================================
// ERROR CLASSES
// ========================================

/**
 * Certificate pinning validation error
 */
export class CertificatePinningError extends Error {
  public readonly name = 'CertificatePinningError';
  public readonly domain: string;
  public readonly validationResult: CertificateValidationResult;
  public readonly isRetryable: boolean;

  constructor(message: string, domain: string, validationResult: CertificateValidationResult) {
    super(message);
    this.domain = domain;
    this.validationResult = validationResult;
    this.isRetryable = false; // Certificate pinning failures are not retryable
  }
}

// ========================================
// INTERCEPTOR CONFIGURATION
// ========================================

/**
 * Certificate pinning interceptor configuration
 */
export interface CertificatePinningInterceptorConfig {
  enabled: boolean;
  blockOnValidationFailure: boolean;     // Block requests when validation fails
  validateOnRequest: boolean;            // Validate certificates on request
  validateOnResponse: boolean;           // Validate certificates on response
  logValidationResults: boolean;         // Log all validation results
  gracefulDegradation: boolean;          // Continue on validation errors (dev mode)
}

/**
 * Default interceptor configuration
 */
const DEFAULT_INTERCEPTOR_CONFIG: CertificatePinningInterceptorConfig = {
  enabled: true,
  blockOnValidationFailure: true,
  validateOnRequest: true,
  validateOnResponse: false,             // Response validation is optional
  logValidationResults: __DEV__,
  gracefulDegradation: __DEV__,          // Allow failures in development
};

// ========================================
// CERTIFICATE PINNING INTERCEPTOR CLASS
// ========================================

/**
 * Certificate pinning interceptor for Axios
 */
export class CertificatePinningInterceptor {
  private config: CertificatePinningInterceptorConfig;
  private validationStats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    blockedRequests: 0,
    lastValidationTime: 0
  };

  constructor(config?: Partial<CertificatePinningInterceptorConfig>) {
    this.config = { ...DEFAULT_INTERCEPTOR_CONFIG, ...config };
    
    if (this.config.logValidationResults) {
      logger.log('[CertificatePinningInterceptor] Initialized with config:', {
        enabled: this.config.enabled,
        blockOnValidationFailure: this.config.blockOnValidationFailure,
        validateOnRequest: this.config.validateOnRequest,
        module: 'CertificatePinningInterceptor'
      });
    }
  }

  /**
   * Request interceptor function
   */
  public requestInterceptor = async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    try {
      if (!this.config.enabled || !this.config.validateOnRequest) {
        return config;
      }

      const url = this.buildFullUrl(config);
      
      // Check if domain should be blocked due to previous failures
      if (shouldBlockDomain(url)) {
        const error = new CertificatePinningError(
          'Request blocked due to certificate pinning failures',
          this.extractDomain(url),
          {
            isValid: false,
            domain: this.extractDomain(url),
            validationMethod: 'pre-blocked',
            error: 'Domain blocked due to previous certificate validation failures',
            warnings: [],
            metadata: { validationTime: 0 }
          }
        );
        
        this.validationStats.blockedRequests++;
        throw error;
      }

      // Perform certificate validation
      const validationResult = await this.performCertificateValidation(url);
      
      // Update statistics
      this.updateValidationStats(validationResult);

      // Handle validation result
      if (!validationResult.isValid && this.config.blockOnValidationFailure) {
        if (this.config.gracefulDegradation) {
          logger.warn('[CertificatePinningInterceptor] Certificate validation failed but continuing due to graceful degradation:', {
            domain: validationResult.domain,
            error: validationResult.error,
            module: 'CertificatePinningInterceptor'
          });
        } else {
          throw new CertificatePinningError(
            `Certificate pinning validation failed: ${validationResult.error}`,
            validationResult.domain,
            validationResult
          );
        }
      }

      // Add validation metadata to request headers for monitoring
      if (config.headers) {
        config.headers['X-Certificate-Validation'] = validationResult.isValid ? 'passed' : 'failed';
        config.headers['X-Certificate-Validation-Method'] = validationResult.validationMethod;
      }

      return config;

    } catch (error) {
      if (error instanceof CertificatePinningError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('[CertificatePinningInterceptor] Request interceptor error:', error, {
        module: 'CertificatePinningInterceptor'
      });

      // In case of unexpected errors, decide whether to continue or fail
      if (this.config.gracefulDegradation) {
        return config;
      } else {
        throw new CertificatePinningError(
          `Certificate pinning interceptor error: ${errorMessage}`,
          'unknown',
          {
            isValid: false,
            domain: 'unknown',
            validationMethod: 'interceptor-error',
            error: errorMessage,
            warnings: [],
            metadata: { validationTime: 0 }
          }
        );
      }
    }
  };

  /**
   * Response interceptor function
   */
  public responseInterceptor = (response: AxiosResponse): AxiosResponse => {
    try {
      if (!this.config.enabled || !this.config.validateOnResponse) {
        return response;
      }

      // Optional: Validate certificate on response
      // This could be used to validate the actual certificate received
      // For now, we'll just log successful responses with certificate validation info
      
      if (this.config.logValidationResults) {
        const validationHeader = response.config.headers?.['X-Certificate-Validation'];
        if (validationHeader) {
          logger.log('[CertificatePinningInterceptor] Response received with certificate validation:', {
            url: response.config.url,
            status: response.status,
            validationStatus: validationHeader,
            module: 'CertificatePinningInterceptor'
          });
        }
      }

      return response;

    } catch (error) {
      logger.error('[CertificatePinningInterceptor] Response interceptor error:', error, {
        module: 'CertificatePinningInterceptor'
      });
      return response;
    }
  };

  /**
   * Error interceptor function
   */
  public errorInterceptor = (error: any): Promise<never> => {
    // Handle certificate pinning errors specifically
    if (error instanceof CertificatePinningError) {
      logger.error('[CertificatePinningInterceptor] Certificate pinning error:', {
        domain: error.domain,
        message: error.message,
        validationResult: error.validationResult,
        module: 'CertificatePinningInterceptor'
      });
    }

    // Re-throw the error for upstream handling
    return Promise.reject(error);
  };

  /**
   * Get interceptor statistics
   */
  public getStatistics(): any {
    return {
      ...this.validationStats,
      certificatePinningStats: getCertificatePinningStats(),
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  public resetStatistics(): void {
    this.validationStats = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      blockedRequests: 0,
      lastValidationTime: 0
    };
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * Perform certificate validation for URL
   */
  private async performCertificateValidation(url: string): Promise<CertificateValidationResult> {
    try {
      const result = await validateCertificate(url);
      
      if (this.config.logValidationResults) {
        const logLevel = result.isValid ? 'log' : 'warn';
        logger[logLevel]('[CertificatePinningInterceptor] Certificate validation result:', {
          domain: result.domain,
          isValid: result.isValid,
          method: result.validationMethod,
          validationTime: result.metadata.validationTime,
          error: result.error,
          module: 'CertificatePinningInterceptor'
        });
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      logger.error('[CertificatePinningInterceptor] Certificate validation error:', error, {
        module: 'CertificatePinningInterceptor'
      });

      return {
        isValid: false,
        domain: this.extractDomain(url),
        validationMethod: 'validation-error',
        error: `Certificate validation error: ${errorMessage}`,
        warnings: [],
        metadata: { validationTime: 0 }
      };
    }
  }

  /**
   * Build full URL from Axios config
   */
  private buildFullUrl(config: AxiosRequestConfig): string {
    const baseURL = config.baseURL || '';
    const url = config.url || '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    return baseURL + url;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.toLowerCase();
    } catch (error) {
      const match = url.match(/https?:\/\/([^\/]+)/);
      return match ? match[1].toLowerCase() : 'unknown';
    }
  }

  /**
   * Update validation statistics
   */
  private updateValidationStats(result: CertificateValidationResult): void {
    this.validationStats.totalValidations++;
    this.validationStats.lastValidationTime = Date.now();
    
    if (result.isValid) {
      this.validationStats.successfulValidations++;
    } else {
      this.validationStats.failedValidations++;
    }
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

/**
 * Global certificate pinning interceptor instance
 */
export const certificatePinningInterceptor = new CertificatePinningInterceptor();

// ========================================
// SETUP FUNCTIONS
// ========================================

/**
 * Setup certificate pinning interceptors for an Axios instance
 */
export const setupCertificatePinningInterceptors = (axiosInstance: any): void => {
  // Add request interceptor
  axiosInstance.interceptors.request.use(
    certificatePinningInterceptor.requestInterceptor,
    certificatePinningInterceptor.errorInterceptor
  );

  // Add response interceptor
  axiosInstance.interceptors.response.use(
    certificatePinningInterceptor.responseInterceptor,
    certificatePinningInterceptor.errorInterceptor
  );

  logger.log('[CertificatePinningInterceptor] Certificate pinning interceptors added to Axios instance', {
    module: 'CertificatePinningInterceptor'
  });
};

/**
 * Get certificate pinning interceptor statistics
 */
export const getCertificatePinningInterceptorStats = (): any => {
  return certificatePinningInterceptor.getStatistics();
};

/**
 * Reset certificate pinning interceptor statistics
 */
export const resetCertificatePinningInterceptorStats = (): void => {
  certificatePinningInterceptor.resetStatistics();
}; 