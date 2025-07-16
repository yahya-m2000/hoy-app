/**
 * Clickjacking Protection System
 * 
 * Comprehensive clickjacking protection for React Native mobile applications including:
 * - Frame-busting techniques for WebView components
 * - Content Security Policy (CSP) header management
 * - X-Frame-Options header enforcement
 * - UI redressing attack prevention
 * - WebView security hardening
 * - Visual integrity verification
 * 
 * Features:
 * - WebView-specific frame-busting
 * - CSP frame-ancestors directive management
 * - Overlay attack detection
 * - Visual jacking prevention
 * - Security header validation
 * - Real-time monitoring and alerting
 * - Debug and testing capabilities
 * 
 * @module @core/security/clickjacking-protection
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from '@core/utils/sys/log';
import { Dimensions, Alert, Platform } from 'react-native';

// ========================================
// TYPES AND INTERFACES
// ========================================

export interface ClickjackingProtectionConfig {
  enabled: boolean;
  webViewProtection: boolean;
  overlayDetection: boolean;
  visualIntegrityCheck: boolean;
  securityHeaders: boolean;
  frameAncestors: string[];
  allowedDomains: string[];
  debugMode: boolean;
  alertOnViolation: boolean;
  blockSuspiciousActivity: boolean;
}

export interface ClickjackingViolation {
  type: 'frame_detection' | 'overlay_attack' | 'visual_jacking' | 'security_header_missing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface ClickjackingStats {
  violationsDetected: number;
  frameAttemptsBlocked: number;
  overlayAttacksDetected: number;
  visualIntegrityChecks: number;
  securityHeadersValidated: number;
  webViewsProtected: number;
  lastViolationTime: number;
  protectionActiveTime: number;
}

export interface WebViewSecurityConfig {
  javaScriptEnabled: boolean;
  domStorageEnabled: boolean;
  allowsInlineMediaPlayback: boolean;
  allowsAirPlayForMediaPlayback: boolean;
  allowsBackForwardNavigationGestures: boolean;
  allowsLinkPreview: boolean;
  fraudulentWebsiteWarningEnabled: boolean;
  injectedJavaScript?: string;
}

export interface VisualIntegrityResult {
  isValid: boolean;
  suspiciousOverlays: boolean;
  unexpectedElements: boolean;
  dimensionChanges: boolean;
  transparencyIssues: boolean;
  warnings: string[];
}

// ========================================
// CONFIGURATION
// ========================================

const DEFAULT_CONFIG: ClickjackingProtectionConfig = {
  enabled: true,
  webViewProtection: true,
  overlayDetection: true,
  visualIntegrityCheck: true,
  securityHeaders: true,
  frameAncestors: ["'self'"],
  allowedDomains: [],
  debugMode: __DEV__,
  alertOnViolation: true,
  blockSuspiciousActivity: true,
};

const SECURITY_HEADERS = {
  X_FRAME_OPTIONS: 'X-Frame-Options',
  CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  X_XSS_PROTECTION: 'X-XSS-Protection',
  REFERRER_POLICY: 'Referrer-Policy',
} as const;

// ========================================
// FRAME-BUSTING JAVASCRIPT
// ========================================

const FRAME_BUSTING_SCRIPT = `
(function() {
  'use strict';
  
  // Enhanced frame-busting techniques
  var isFramed = false;
  
  try {
    // Check if we're in a frame
    if (typeof window !== 'undefined') {
      isFramed = (window.self !== window.top);
      // Additional checks for sophisticated frame attacks
      if (!isFramed) {
        isFramed = (window.frameElement !== null);
      }
      if (!isFramed && typeof document !== 'undefined') {
        isFramed = (document.referrer && document.referrer !== window.location.href);
      }
      // Check for parent frame access
      if (!isFramed) {
        try {
          isFramed = (window.parent && window.parent !== window);
        } catch (e) {
          // Cross-origin parent access blocked - might be framed
          isFramed = true;
        }
      }
      if (isFramed) {
        // Log the violation
        console.warn('[ClickjackingProtection] Frame-busting activated - potential clickjacking attempt detected');
        // Multiple frame-busting techniques
        try {
          // Technique 1: Break out of frame
          if (window.top) {
            window.top.location = window.location;
          }
        } catch (e) {
          // Technique 2: Replace parent window
          try {
            window.parent.location = window.location;
          } catch (e2) {
            // Technique 3: Block the page
            if (typeof document !== 'undefined') {
              document.body.style.display = 'none';
              document.body.innerHTML = '<div style="background: red; color: white; padding: 20px; text-align: center; font-size: 18px;">Security Warning: This page cannot be displayed in a frame for your protection.</div>';
            }
          }
        }
        // Notify the mobile app about the violation
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CLICKJACKING_VIOLATION',
            severity: 'high',
            description: 'Frame-busting activated',
            timestamp: Date.now()
          }));
        }
      }
      // Monitor for dynamic frame injection
      if (typeof document !== 'undefined') {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                  var tagName = node.tagName ? node.tagName.toLowerCase() : '';
                  if (tagName === 'iframe' || tagName === 'frame' || tagName === 'object' || tagName === 'embed') {
                    console.warn('[ClickjackingProtection] Suspicious frame element added:', tagName);
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'SUSPICIOUS_FRAME_INJECTION',
                        severity: 'medium',
                        description: 'Dynamic frame element detected: ' + tagName,
                        timestamp: Date.now()
                      }));
                    }
                  }
                }
              });
            }
          });
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        // Prevent frame overlay attacks
        document.addEventListener('click', function(event) {
          var element = event.target;
          var computedStyle = window.getComputedStyle(element);
          // Check for suspicious overlay elements
          if (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') {
            var zIndex = parseInt(computedStyle.zIndex) || 0;
            if (zIndex > 999999) { // Suspiciously high z-index
              console.warn('[ClickjackingProtection] Suspicious overlay element detected');
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'SUSPICIOUS_OVERLAY',
                  severity: 'medium',
                  description: 'High z-index overlay element detected',
                  timestamp: Date.now(),
                  zIndex: zIndex
                }));
              }
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('[ClickjackingProtection] Frame-busting script error:', error);
  }
})();
`;

// ========================================
// CLICKJACKING PROTECTION CLASS
// ========================================

export class ClickjackingProtection {
  private config: ClickjackingProtectionConfig;
  private stats: ClickjackingStats;
  private violations: ClickjackingViolation[] = [];
  private lastDimensions: { width: number; height: number };
  private protectionStartTime: number;

  constructor(config: Partial<ClickjackingProtectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      violationsDetected: 0,
      frameAttemptsBlocked: 0,
      overlayAttacksDetected: 0,
      visualIntegrityChecks: 0,
      securityHeadersValidated: 0,
      webViewsProtected: 0,
      lastViolationTime: 0,
      protectionActiveTime: 0,
    };
    
    this.lastDimensions = Dimensions.get('window');
    this.protectionStartTime = Date.now();
    
    // Start monitoring
    this.initializeProtection();
  }

  /**
   * Initialize clickjacking protection
   */
  private initializeProtection(): void {
    if (!this.config.enabled) {
      return;
    }

    // Monitor dimension changes
    if (this.config.visualIntegrityCheck) {
      this.startDimensionMonitoring();
    }

    // Log protection activation
    logger.info('[ClickjackingProtection] Protection system initialized', {
      webViewProtection: this.config.webViewProtection,
      overlayDetection: this.config.overlayDetection,
      visualIntegrityCheck: this.config.visualIntegrityCheck,
    }, {
      module: 'ClickjackingProtection'
    });
  }

  /**
   * Get frame-busting JavaScript for WebView injection
   */
  public getFrameBustingScript(): string {
    if (!this.config.webViewProtection) {
      return '';
    }

    return FRAME_BUSTING_SCRIPT;
  }

  /**
   * Get secure WebView configuration
   */
  public getSecureWebViewConfig(): WebViewSecurityConfig {
    return {
      javaScriptEnabled: true, // Required for frame-busting
      domStorageEnabled: false, // Minimize attack surface
      allowsInlineMediaPlayback: false,
      allowsAirPlayForMediaPlayback: false,
      allowsBackForwardNavigationGestures: false,
      allowsLinkPreview: false,
      fraudulentWebsiteWarningEnabled: true,
      injectedJavaScript: this.getFrameBustingScript(),
    };
  }

  /**
   * Generate Content Security Policy header value
   */
  public generateCSPHeader(): string {
    if (!this.config.securityHeaders) {
      return '';
    }

    const frameAncestors = this.config.frameAncestors.join(' ');
    const allowedDomains = this.config.allowedDomains.length > 0 
      ? this.config.allowedDomains.join(' ') 
      : "'none'";

    return [
      `frame-ancestors ${frameAncestors}`,
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline'`, // Required for frame-busting
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: https:`,
      `connect-src 'self' ${allowedDomains}`,
      `font-src 'self'`,
      `object-src 'none'`,
      `media-src 'self'`,
      `child-src 'none'`, // Prevent frame embedding
    ].join('; ');
  }

  /**
   * Get security headers for API requests
   */
  public getSecurityHeaders(): Record<string, string> {
    if (!this.config.securityHeaders) {
      return {};
    }

    return {
      [SECURITY_HEADERS.X_FRAME_OPTIONS]: 'DENY',
      [SECURITY_HEADERS.CONTENT_SECURITY_POLICY]: this.generateCSPHeader(),
      [SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS]: 'nosniff',
      [SECURITY_HEADERS.X_XSS_PROTECTION]: '1; mode=block',
      [SECURITY_HEADERS.REFERRER_POLICY]: 'strict-origin-when-cross-origin',
    };
  }

  /**
   * Validate security headers in response
   */
  public validateSecurityHeaders(headers: Record<string, string>): boolean {
    if (!this.config.securityHeaders) {
      return true;
    }

    this.stats.securityHeadersValidated++;
    let isValid = true;
    const missingHeaders: string[] = [];

    // Check X-Frame-Options
    const xFrameOptions = headers[SECURITY_HEADERS.X_FRAME_OPTIONS.toLowerCase()];
    if (!xFrameOptions || (xFrameOptions !== 'DENY' && xFrameOptions !== 'SAMEORIGIN')) {
      missingHeaders.push('X-Frame-Options');
      isValid = false;
    }

    // Check Content-Security-Policy
    const csp = headers[SECURITY_HEADERS.CONTENT_SECURITY_POLICY.toLowerCase()];
    if (!csp || !csp.includes('frame-ancestors')) {
      missingHeaders.push('Content-Security-Policy frame-ancestors');
      isValid = false;
    }

    if (!isValid) {
      this.reportViolation({
        type: 'security_header_missing',
        severity: 'medium',
        description: `Missing security headers: ${missingHeaders.join(', ')}`,
        timestamp: Date.now(),
        metadata: { missingHeaders, responseHeaders: headers },
      });
    }

    return isValid;
  }

  /**
   * Handle WebView message for clickjacking violations
   */
  public handleWebViewMessage(message: string): void {
    try {
      const data = JSON.parse(message);
      
      if (data.type && data.type.includes('CLICKJACKING') || data.type.includes('SUSPICIOUS')) {
        this.reportViolation({
          type: 'frame_detection',
          severity: data.severity || 'medium',
          description: data.description || 'WebView clickjacking violation',
          timestamp: data.timestamp || Date.now(),
          metadata: data,
        });

        if (data.type === 'CLICKJACKING_VIOLATION') {
          this.stats.frameAttemptsBlocked++;
        } else if (data.type === 'SUSPICIOUS_OVERLAY') {
          this.stats.overlayAttacksDetected++;
        }
      }
    } catch (error) {
      logger.error('[ClickjackingProtection] Failed to parse WebView message:', error, {
        module: 'ClickjackingProtection'
      });
    }
  }

  /**
   * Perform visual integrity check
   */
  public performVisualIntegrityCheck(): VisualIntegrityResult {
    if (!this.config.visualIntegrityCheck) {
      return {
        isValid: true,
        suspiciousOverlays: false,
        unexpectedElements: false,
        dimensionChanges: false,
        transparencyIssues: false,
        warnings: [],
      };
    }

    this.stats.visualIntegrityChecks++;
    const result: VisualIntegrityResult = {
      isValid: true,
      suspiciousOverlays: false,
      unexpectedElements: false,
      dimensionChanges: false,
      transparencyIssues: false,
      warnings: [],
    };

    // Check for dimension changes
    const currentDimensions = Dimensions.get('window');
    if (currentDimensions.width !== this.lastDimensions.width || 
        currentDimensions.height !== this.lastDimensions.height) {
      
      const widthChange = Math.abs(currentDimensions.width - this.lastDimensions.width);
      const heightChange = Math.abs(currentDimensions.height - this.lastDimensions.height);
      
      // Significant dimension changes might indicate overlay attacks
      if (widthChange > 50 || heightChange > 50) {
        result.dimensionChanges = true;
        result.isValid = false;
        result.warnings.push(`Significant dimension change detected: ${widthChange}x${heightChange}`);
      }
      
      this.lastDimensions = currentDimensions;
    }

    if (!result.isValid) {
      this.reportViolation({
        type: 'visual_jacking',
        severity: 'medium',
        description: 'Visual integrity check failed',
        timestamp: Date.now(),
        metadata: { 
          result,
          dimensions: currentDimensions,
          previousDimensions: this.lastDimensions,
        },
      });
    }

    return result;
  }

  /**
   * Check if domain is allowed for framing
   */
  public isDomainAllowed(domain: string): boolean {
    if (this.config.allowedDomains.length === 0) {
      return false; // Default deny
    }

    return this.config.allowedDomains.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const baseDomain = allowed.substring(2);
        return domain.endsWith(baseDomain);
      }
      return domain === allowed;
    });
  }

  /**
   * Report clickjacking violation
   */
  private reportViolation(violation: ClickjackingViolation): void {
    this.violations.push(violation);
    this.stats.violationsDetected++;
    this.stats.lastViolationTime = violation.timestamp;

    // Keep only last 100 violations
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-100);
    }

    logger.warn('[ClickjackingProtection] Violation detected', {
      type: violation.type,
      severity: violation.severity,
      description: violation.description,
      metadata: violation.metadata,
    }, {
      module: 'ClickjackingProtection'
    });

    // Show alert if configured
    if (this.config.alertOnViolation && violation.severity === 'high') {
      Alert.alert(
        'Security Alert',
        `Clickjacking protection activated: ${violation.description}`,
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Start dimension monitoring
   */
  private startDimensionMonitoring(): void {
    // Monitor dimension changes every 5 seconds
    setInterval(() => {
      this.performVisualIntegrityCheck();
    }, 5000);
  }

  /**
   * Get protection statistics
   */
  public getStats(): ClickjackingStats {
    this.stats.protectionActiveTime = Date.now() - this.protectionStartTime;
    return { ...this.stats };
  }

  /**
   * Get recent violations
   */
  public getViolations(limit: number = 50): ClickjackingViolation[] {
    return this.violations.slice(-limit);
  }

  /**
   * Clear violation history
   */
  public clearViolations(): void {
    this.violations = [];
    logger.info('[ClickjackingProtection] Violation history cleared', undefined, {
      module: 'ClickjackingProtection'
    });
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      violationsDetected: 0,
      frameAttemptsBlocked: 0,
      overlayAttacksDetected: 0,
      visualIntegrityChecks: 0,
      securityHeadersValidated: 0,
      webViewsProtected: 0,
      lastViolationTime: 0,
      protectionActiveTime: 0,
    };
    this.protectionStartTime = Date.now();
  }

  /**
   * Enable/disable protection
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    logger.info(`[ClickjackingProtection] Protection ${enabled ? 'enabled' : 'disabled'}`, undefined, {
      module: 'ClickjackingProtection'
    });
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ClickjackingProtectionConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('[ClickjackingProtection] Configuration updated', config, {
      module: 'ClickjackingProtection'
    });
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const clickjackingProtection = new ClickjackingProtection();

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================

/**
 * Get frame-busting script for WebView
 */
export const getFrameBustingScript = (): string => {
  return clickjackingProtection.getFrameBustingScript();
};

/**
 * Get secure WebView configuration
 */
export const getSecureWebViewConfig = (): WebViewSecurityConfig => {
  return clickjackingProtection.getSecureWebViewConfig();
};

/**
 * Generate CSP header value
 */
export const generateCSPHeader = (): string => {
  return clickjackingProtection.generateCSPHeader();
};

/**
 * Get security headers
 */
export const getSecurityHeaders = (): Record<string, string> => {
  return clickjackingProtection.getSecurityHeaders();
};

/**
 * Validate security headers
 */
export const validateSecurityHeaders = (headers: Record<string, string>): boolean => {
  return clickjackingProtection.validateSecurityHeaders(headers);
};

/**
 * Handle WebView message
 */
export const handleWebViewMessage = (message: string): void => {
  return clickjackingProtection.handleWebViewMessage(message);
};

/**
 * Perform visual integrity check
 */
export const performVisualIntegrityCheck = (): VisualIntegrityResult => {
  return clickjackingProtection.performVisualIntegrityCheck();
};

/**
 * Check if domain is allowed
 */
export const isDomainAllowed = (domain: string): boolean => {
  return clickjackingProtection.isDomainAllowed(domain);
};

/**
 * Get protection statistics
 */
export const getClickjackingStats = (): ClickjackingStats => {
  return clickjackingProtection.getStats();
};

/**
 * Get recent violations
 */
export const getClickjackingViolations = (limit?: number): ClickjackingViolation[] => {
  return clickjackingProtection.getViolations(limit);
}; 