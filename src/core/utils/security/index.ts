/**
 * Security Utilities
 * 
 * Comprehensive security utilities for input sanitization, validation,
 * and protection against various security vulnerabilities.
 * 
 * @module @core/utils/security
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// INPUT SANITIZATION
// ========================================

export {
  sanitizeInput,
  sanitizeEmail,
  sanitizeName,
  sanitizePhone,
  sanitizeUrl,
  sanitizeSearch,
  sanitizeText,
  sanitizeObject,
  isInputSafe,
  SanitizationType,
} from './input-sanitizer';

export type {
  SanitizationOptions,
  SanitizationResult,
} from './input-sanitizer';

// ========================================
// CONVENIENCE EXPORTS
// ========================================

import InputSanitizer from './input-sanitizer';

export { InputSanitizer };
export default InputSanitizer; 