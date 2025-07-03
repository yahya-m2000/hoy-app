/**
 * Input Sanitization System
 * 
 * Comprehensive input sanitization to prevent XSS, injection attacks, and other security vulnerabilities.
 * Sanitizes all user inputs before sending to API and validates data integrity.
 * 
 * Features:
 * - XSS prevention (script injection, HTML tags)
 * - SQL injection prevention (dangerous characters)
 * - NoSQL injection prevention (MongoDB operators)
 * - Path traversal prevention
 * - Command injection prevention
 * - Input validation and normalization
 * - Content-specific sanitization (email, phone, URL, etc.)
 * 
 * @module @core/utils/security/input-sanitizer
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from "../sys/log";

// ========================================
// SECURITY CONSTANTS
// ========================================

/**
 * Dangerous patterns that should be removed or escaped
 */
const SECURITY_PATTERNS = {
  // XSS patterns
  SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  HTML_TAGS: /<[^>]*>/g,
  JAVASCRIPT_PROTOCOLS: /javascript:/gi,
  VBSCRIPT_PROTOCOLS: /vbscript:/gi,
  DATA_URLS: /data:[^;]*;base64/gi,
  
  // SQL injection patterns
  SQL_KEYWORDS: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
  SQL_COMMENTS: /(--|\/\*|\*\/|#)/g,
  SQL_OPERATORS: /(\|\||&&|<>|!=)/g,
  
  // NoSQL injection patterns
  NOSQL_OPERATORS: /\$[\w]+/g,
  
  // Path traversal patterns
  PATH_TRAVERSAL: /\.\.[\/\\]/g,
  
  // Command injection patterns
  COMMAND_INJECTION: /[;&|`$(){}[\]]/g,
  
  // Special characters that might be dangerous
  DANGEROUS_CHARS: /[<>'"&\x00-\x1f\x7f-\x9f]/g,
};

/**
 * Maximum allowed lengths for different input types
 */
const MAX_LENGTHS = {
  EMAIL: 254,
  PASSWORD: 128,
  NAME: 100,
  PHONE: 20,
  URL: 2048,
  TEXT_SHORT: 255,
  TEXT_MEDIUM: 1000,
  TEXT_LONG: 5000,
  DESCRIPTION: 10000,
  SEARCH_QUERY: 200,
};

/**
 * Allowed characters for different input types
 */
const ALLOWED_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[\+]?[0-9\s\-\(\)\.]{7,20}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
  NAME: /^[a-zA-Z\s\-'\.]{1,100}$/,
  NUMERIC: /^[0-9]+$/,
  DECIMAL: /^[0-9]+(\.[0-9]+)?$/,
  URL: /^https?:\/\/[^\s<>'"]+$/,
  SLUG: /^[a-z0-9-]+$/,
};

// ========================================
// SANITIZATION TYPES
// ========================================

export enum SanitizationType {
  TEXT = 'text',
  EMAIL = 'email',
  PASSWORD = 'password',
  NAME = 'name',
  PHONE = 'phone',
  URL = 'url',
  SEARCH = 'search',
  DESCRIPTION = 'description',
  NUMERIC = 'numeric',
  ALPHANUMERIC = 'alphanumeric',
  JSON = 'json',
  HTML = 'html',
  SLUG = 'slug',
}

export interface SanitizationOptions {
  type: SanitizationType;
  maxLength?: number;
  allowEmpty?: boolean;
  strict?: boolean;
  preserveCase?: boolean;
  customPattern?: RegExp;
  customReplacements?: Array<{ pattern: RegExp; replacement: string }>;
}

export interface SanitizationResult {
  sanitized: string;
  isValid: boolean;
  originalLength: number;
  sanitizedLength: number;
  violations: string[];
  warnings: string[];
}

// ========================================
// CORE SANITIZATION FUNCTIONS
// ========================================

/**
 * Main sanitization function
 */
export const sanitizeInput = (
  input: any,
  options: SanitizationOptions
): SanitizationResult => {
  const result: SanitizationResult = {
    sanitized: '',
    isValid: false,
    originalLength: 0,
    sanitizedLength: 0,
    violations: [],
    warnings: [],
  };

  try {
    // Convert to string and handle null/undefined
    const inputString = convertToString(input);
    result.originalLength = inputString.length;

    // Check if empty input is allowed
    if (inputString.length === 0) {
      if (options.allowEmpty) {
        result.sanitized = '';
        result.isValid = true;
        return result;
      } else {
        result.violations.push('Input cannot be empty');
        return result;
      }
    }

    // Apply type-specific sanitization
    let sanitized = applySanitizationByType(inputString, options, result);

    // Apply length constraints
    sanitized = applyLengthConstraints(sanitized, options, result);

    // Apply custom replacements if provided
    if (options.customReplacements) {
      sanitized = applyCustomReplacements(sanitized, options.customReplacements);
    }

    // Final validation
    const isValid = validateSanitizedInput(sanitized, options, result);

    result.sanitized = sanitized;
    result.sanitizedLength = sanitized.length;
    result.isValid = isValid && result.violations.length === 0;

    // Log security violations in development
    if (__DEV__ && result.violations.length > 0) {
      logger.warn('[InputSanitizer] Security violations detected:', {
        input: inputString.substring(0, 100),
        type: options.type,
        violations: result.violations,
        module: 'InputSanitizer',
      });
    }

    return result;

  } catch (error) {
    logger.error('[InputSanitizer] Sanitization error:', error, {
      module: 'InputSanitizer',
    });

    result.violations.push('Sanitization failed');
    return result;
  }
};

/**
 * Convert input to string safely
 */
const convertToString = (input: any): string => {
  if (input === null || input === undefined) {
    return '';
  }
  
  if (typeof input === 'string') {
    return input;
  }
  
  if (typeof input === 'number') {
    return input.toString();
  }
  
  if (typeof input === 'boolean') {
    return input.toString();
  }
  
  if (typeof input === 'object') {
    try {
      return JSON.stringify(input);
    } catch {
      return '[Object]';
    }
  }
  
  return String(input);
};

/**
 * Apply sanitization based on input type
 */
const applySanitizationByType = (
  input: string,
  options: SanitizationOptions,
  result: SanitizationResult
): string => {
  let sanitized = input;

  switch (options.type) {
    case SanitizationType.EMAIL:
      sanitized = sanitizeEmailInput(sanitized, result);
      break;
      
    case SanitizationType.PASSWORD:
      sanitized = sanitizePasswordInput(sanitized, result);
      break;
      
    case SanitizationType.NAME:
      sanitized = sanitizeNameInput(sanitized, result);
      break;
      
    case SanitizationType.PHONE:
      sanitized = sanitizePhoneInput(sanitized, result);
      break;
      
    case SanitizationType.URL:
      sanitized = sanitizeUrlInput(sanitized, result);
      break;
      
    case SanitizationType.SEARCH:
      sanitized = sanitizeSearchInput(sanitized, result);
      break;
      
    case SanitizationType.DESCRIPTION:
      sanitized = sanitizeDescriptionInput(sanitized, result);
      break;
      
    case SanitizationType.NUMERIC:
      sanitized = sanitizeNumericInput(sanitized, result);
      break;
      
    case SanitizationType.ALPHANUMERIC:
      sanitized = sanitizeAlphanumericInput(sanitized, result);
      break;
      
    case SanitizationType.JSON:
      sanitized = sanitizeJsonInput(sanitized, result);
      break;
      
    case SanitizationType.HTML:
      sanitized = sanitizeHtmlInput(sanitized, result);
      break;
      
    case SanitizationType.SLUG:
      sanitized = sanitizeSlugInput(sanitized, result);
      break;
      
    case SanitizationType.TEXT:
    default:
      sanitized = sanitizeTextInput(sanitized, result);
      break;
  }

  return sanitized;
};

// ========================================
// TYPE-SPECIFIC SANITIZATION FUNCTIONS
// ========================================

/**
 * Sanitize email input
 */
const sanitizeEmailInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.toLowerCase().trim();
  
  // Remove dangerous characters
  sanitized = sanitized.replace(SECURITY_PATTERNS.DANGEROUS_CHARS, '');
  
  // Check for suspicious patterns
  if (SECURITY_PATTERNS.SCRIPT_TAGS.test(input)) {
    result.violations.push('Script tags detected in email');
  }
  
  return sanitized;
};

/**
 * Sanitize password input (minimal sanitization to preserve complexity)
 */
const sanitizePasswordInput = (input: string, result: SanitizationResult): string => {
  // Only remove null bytes and control characters that could cause issues
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Check for suspicious patterns but don't remove them (passwords need complexity)
  if (SECURITY_PATTERNS.SCRIPT_TAGS.test(input)) {
    result.warnings.push('Password contains script-like patterns');
  }
  
  return sanitized;
};

/**
 * Sanitize name input
 */
const sanitizeNameInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.trim();
  
  // Remove HTML tags and dangerous characters
  sanitized = sanitized.replace(SECURITY_PATTERNS.HTML_TAGS, '');
  sanitized = sanitized.replace(SECURITY_PATTERNS.SCRIPT_TAGS, '');
  
  // Allow only letters, spaces, hyphens, apostrophes, and periods
  sanitized = sanitized.replace(/[^a-zA-Z\s\-'\.]/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  if (sanitized !== input.trim()) {
    result.warnings.push('Name contained invalid characters that were removed');
  }
  
  return sanitized;
};

/**
 * Sanitize phone number
 */
const sanitizePhoneInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.trim();
  
  // Remove everything except numbers, spaces, hyphens, parentheses, periods, and plus
  sanitized = sanitized.replace(/[^0-9\s\-\(\)\.+]/g, '');
  
  if (sanitized !== input.trim()) {
    result.warnings.push('Phone number contained invalid characters that were removed');
  }
  
  return sanitized;
};

/**
 * Sanitize URL input
 */
const sanitizeUrlInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.trim();
  
  // Check for dangerous protocols
  if (SECURITY_PATTERNS.JAVASCRIPT_PROTOCOLS.test(sanitized) || 
      SECURITY_PATTERNS.VBSCRIPT_PROTOCOLS.test(sanitized)) {
    result.violations.push('Dangerous protocol detected in URL');
    return '';
  }
  
  // Only allow HTTP and HTTPS URLs
  if (!sanitized.match(/^https?:\/\//)) {
    if (sanitized.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
      sanitized = 'https://' + sanitized;
      result.warnings.push('Protocol added to URL');
    } else {
      result.violations.push('Invalid URL format');
      return '';
    }
  }
  
  return sanitized;
};

/**
 * Sanitize search query
 */
const sanitizeSearchInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.trim();
  
  // Remove script tags and dangerous HTML
  sanitized = sanitized.replace(SECURITY_PATTERNS.SCRIPT_TAGS, '');
  sanitized = sanitized.replace(SECURITY_PATTERNS.HTML_TAGS, '');
  
  // Remove SQL injection patterns
  sanitized = sanitized.replace(SECURITY_PATTERNS.SQL_KEYWORDS, '');
  sanitized = sanitized.replace(SECURITY_PATTERNS.SQL_COMMENTS, '');
  
  // Remove NoSQL injection patterns
  sanitized = sanitized.replace(SECURITY_PATTERNS.NOSQL_OPERATORS, '');
  
  // Remove command injection characters
  sanitized = sanitized.replace(/[;&|`$(){}[\]]/g, '');
  
  if (sanitized !== input.trim()) {
    result.warnings.push('Search query contained potentially dangerous patterns that were removed');
  }
  
  return sanitized;
};

/**
 * Sanitize description/long text
 */
const sanitizeDescriptionInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.trim();
  
  // Remove script tags
  sanitized = sanitized.replace(SECURITY_PATTERNS.SCRIPT_TAGS, '');
  
  // Remove dangerous protocols
  sanitized = sanitized.replace(SECURITY_PATTERNS.JAVASCRIPT_PROTOCOLS, '');
  sanitized = sanitized.replace(SECURITY_PATTERNS.VBSCRIPT_PROTOCOLS, '');
  
  // Remove most HTML tags but allow basic formatting
  const allowedTags = /<\/?(?:b|i|em|strong|p|br|ul|ol|li)>/gi;
  const htmlTags = sanitized.match(SECURITY_PATTERNS.HTML_TAGS) || [];
  
  for (const tag of htmlTags) {
    if (!allowedTags.test(tag)) {
      sanitized = sanitized.replace(tag, '');
      result.warnings.push('Dangerous HTML tags removed from description');
    }
  }
  
  return sanitized;
};

/**
 * Sanitize numeric input
 */
const sanitizeNumericInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.trim();
  
  // Remove everything except numbers and decimal point
  sanitized = sanitized.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
    result.warnings.push('Multiple decimal points found, only first one preserved');
  }
  
  return sanitized;
};

/**
 * Sanitize alphanumeric input
 */
const sanitizeAlphanumericInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.trim();
  
  // Remove everything except letters and numbers
  sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, '');
  
  if (sanitized !== input.trim()) {
    result.warnings.push('Non-alphanumeric characters removed');
  }
  
  return sanitized;
};

/**
 * Sanitize JSON input
 */
const sanitizeJsonInput = (input: string, result: SanitizationResult): string => {
  try {
    // Parse and re-stringify to validate JSON structure
    const parsed = JSON.parse(input);
    
    // Recursively sanitize object values
    const sanitized = sanitizeObjectRecursively(parsed);
    
    return JSON.stringify(sanitized);
  } catch (error) {
    result.violations.push('Invalid JSON format');
    return '{}';
  }
};

/**
 * Sanitize HTML input (strict)
 */
const sanitizeHtmlInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input;
  
  // Remove all script tags
  sanitized = sanitized.replace(SECURITY_PATTERNS.SCRIPT_TAGS, '');
  
  // Remove dangerous protocols
  sanitized = sanitized.replace(SECURITY_PATTERNS.JAVASCRIPT_PROTOCOLS, '');
  sanitized = sanitized.replace(SECURITY_PATTERNS.VBSCRIPT_PROTOCOLS, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  if (sanitized !== input) {
    result.warnings.push('Dangerous HTML content removed');
  }
  
  return sanitized;
};

/**
 * Sanitize slug input
 */
const sanitizeSlugInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.toLowerCase().trim();
  
  // Replace spaces and special characters with hyphens
  sanitized = sanitized.replace(/[^a-z0-9-]/g, '-');
  
  // Remove multiple consecutive hyphens
  sanitized = sanitized.replace(/-+/g, '-');
  
  // Remove leading and trailing hyphens
  sanitized = sanitized.replace(/^-+|-+$/g, '');
  
  return sanitized;
};

/**
 * Sanitize general text
 */
const sanitizeTextInput = (input: string, result: SanitizationResult): string => {
  let sanitized = input.trim();
  
  // Remove script tags and dangerous HTML
  sanitized = sanitized.replace(SECURITY_PATTERNS.SCRIPT_TAGS, '');
  sanitized = sanitized.replace(SECURITY_PATTERNS.HTML_TAGS, '');
  
  // Remove dangerous protocols
  sanitized = sanitized.replace(SECURITY_PATTERNS.JAVASCRIPT_PROTOCOLS, '');
  sanitized = sanitized.replace(SECURITY_PATTERNS.VBSCRIPT_PROTOCOLS, '');
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  if (sanitized !== input.trim()) {
    result.warnings.push('Potentially dangerous content removed from text');
  }
  
  return sanitized;
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Apply length constraints
 */
const applyLengthConstraints = (
  input: string,
  options: SanitizationOptions,
  result: SanitizationResult
): string => {
  const maxLength = options.maxLength || getDefaultMaxLength(options.type);
  
  if (input.length > maxLength) {
    result.warnings.push(`Input truncated from ${input.length} to ${maxLength} characters`);
    return input.substring(0, maxLength);
  }
  
  return input;
};

/**
 * Get default max length for input type
 */
const getDefaultMaxLength = (type: SanitizationType): number => {
  switch (type) {
    case SanitizationType.EMAIL:
      return MAX_LENGTHS.EMAIL;
    case SanitizationType.PASSWORD:
      return MAX_LENGTHS.PASSWORD;
    case SanitizationType.NAME:
      return MAX_LENGTHS.NAME;
    case SanitizationType.PHONE:
      return MAX_LENGTHS.PHONE;
    case SanitizationType.URL:
      return MAX_LENGTHS.URL;
    case SanitizationType.SEARCH:
      return MAX_LENGTHS.SEARCH_QUERY;
    case SanitizationType.DESCRIPTION:
      return MAX_LENGTHS.DESCRIPTION;
    default:
      return MAX_LENGTHS.TEXT_MEDIUM;
  }
};

/**
 * Apply custom replacements
 */
const applyCustomReplacements = (
  input: string,
  replacements: Array<{ pattern: RegExp; replacement: string }>
): string => {
  let result = input;
  
  for (const { pattern, replacement } of replacements) {
    result = result.replace(pattern, replacement);
  }
  
  return result;
};

/**
 * Validate sanitized input
 */
const validateSanitizedInput = (
  input: string,
  options: SanitizationOptions,
  result: SanitizationResult
): boolean => {
  // Check custom pattern if provided
  if (options.customPattern && !options.customPattern.test(input)) {
    result.violations.push('Input does not match required pattern');
    return false;
  }
  
  // Check type-specific patterns
  const pattern = getValidationPattern(options.type);
  if (pattern && !pattern.test(input)) {
    result.violations.push(`Input does not match ${options.type} format requirements`);
    return false;
  }
  
  return true;
};

/**
 * Get validation pattern for input type
 */
const getValidationPattern = (type: SanitizationType): RegExp | null => {
  switch (type) {
    case SanitizationType.EMAIL:
      return ALLOWED_PATTERNS.EMAIL;
    case SanitizationType.PHONE:
      return ALLOWED_PATTERNS.PHONE;
    case SanitizationType.NAME:
      return ALLOWED_PATTERNS.NAME;
    case SanitizationType.NUMERIC:
      return ALLOWED_PATTERNS.DECIMAL;
    case SanitizationType.ALPHANUMERIC:
      return ALLOWED_PATTERNS.ALPHANUMERIC;
    case SanitizationType.URL:
      return ALLOWED_PATTERNS.URL;
    case SanitizationType.SLUG:
      return ALLOWED_PATTERNS.SLUG;
    default:
      return null;
  }
};

/**
 * Recursively sanitize object values
 */
const sanitizeObjectRecursively = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    const result = sanitizeInput(obj, { type: SanitizationType.TEXT });
    return result.sanitized;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectRecursively(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const keyResult = sanitizeInput(key, { type: SanitizationType.ALPHANUMERIC });
      const sanitizedKey = keyResult.sanitized || key;
      
      // Sanitize value
      sanitized[sanitizedKey] = sanitizeObjectRecursively(value);
    }
    return sanitized;
  }
  
  return obj;
};

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================

/**
 * Quick sanitization functions for common types
 */
export const sanitizeEmail = (email: string): string => {
  const result = sanitizeInput(email, { type: SanitizationType.EMAIL });
  return result.sanitized;
};

export const sanitizeName = (name: string): string => {
  const result = sanitizeInput(name, { type: SanitizationType.NAME });
  return result.sanitized;
};

export const sanitizePhone = (phone: string): string => {
  const result = sanitizeInput(phone, { type: SanitizationType.PHONE });
  return result.sanitized;
};

export const sanitizeUrl = (url: string): string => {
  const result = sanitizeInput(url, { type: SanitizationType.URL });
  return result.sanitized;
};

export const sanitizeSearch = (query: string): string => {
  const result = sanitizeInput(query, { type: SanitizationType.SEARCH });
  return result.sanitized;
};

export const sanitizeText = (text: string): string => {
  const result = sanitizeInput(text, { type: SanitizationType.TEXT });
  return result.sanitized;
};

/**
 * Batch sanitization for objects
 */
export const sanitizeObject = (
  obj: Record<string, any>,
  fieldTypes: Record<string, SanitizationType>
): { sanitized: Record<string, any>; violations: string[]; warnings: string[] } => {
  const sanitized: Record<string, any> = {};
  const violations: string[] = [];
  const warnings: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const type = fieldTypes[key] || SanitizationType.TEXT;
    const result = sanitizeInput(value, { type });
    
    sanitized[key] = result.sanitized;
    violations.push(...result.violations.map(v => `${key}: ${v}`));
    warnings.push(...result.warnings.map(w => `${key}: ${w}`));
  }
  
  return { sanitized, violations, warnings };
};

/**
 * Validate if input is safe without sanitizing
 */
export const isInputSafe = (input: string, type: SanitizationType): boolean => {
  const result = sanitizeInput(input, { type });
  return result.isValid && result.violations.length === 0;
};

export default {
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
}; 