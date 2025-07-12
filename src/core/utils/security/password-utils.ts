/**
 * Password Utilities
 * 
 * Provides password generation, validation, and strength assessment utilities
 * to support strong password suggestions and validation across the app.
 * 
 * @module @core/utils/security/password-utils
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from "../sys/log";

// ========================================
// PASSWORD STRENGTH CONSTANTS
// ========================================

/**
 * Password strength levels
 */
export enum PasswordStrength {
  WEAK = "weak",
  MEDIUM = "medium",
  STRONG = "strong",
  VERY_STRONG = "very_strong",
}

/**
 * Password requirements for strong passwords
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  SPECIAL_CHARS: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

// ========================================
// PASSWORD GENERATION
// ========================================

/**
 * Generate a strong password with specified requirements
 * 
 * @param length - Length of the password (default: 12)
 * @param includeSpecialChars - Whether to include special characters (default: true)
 * @returns Generated password string
 */
export function generateStrongPassword(
  length: number = 12,
  includeSpecialChars: boolean = true
): string {
  try {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = includeSpecialChars ? PASSWORD_REQUIREMENTS.SPECIAL_CHARS : "";
    
    // Ensure minimum requirements are met
    let password = "";
    
    // Add at least one character from each required category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    
    if (includeSpecialChars) {
      password += special[Math.floor(Math.random() * special.length)];
    }
    
    // Fill the rest with random characters
    const allChars = lowercase + uppercase + numbers + special;
    const remainingLength = length - password.length;
    
    for (let i = 0; i < remainingLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to avoid predictable patterns
    return shuffleString(password);
    
  } catch (error) {
    logger.error('[PasswordUtils] Error generating password:', error, {
      module: 'PasswordUtils'
    });
    // Fallback to a simple password
    return generateFallbackPassword(length);
  }
}

/**
 * Generate a fallback password if the main generation fails
 * 
 * @param length - Length of the password
 * @returns Fallback password string
 */
function generateFallbackPassword(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

/**
 * Shuffle a string to randomize character positions
 * 
 * @param str - String to shuffle
 * @returns Shuffled string
 */
function shuffleString(str: string): string {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

// ========================================
// PASSWORD VALIDATION
// ========================================

/**
 * Validate password strength and requirements
 * 
 * @param password - Password to validate
 * @returns Validation result with strength and issues
 */
export function validatePassword(password: string): {
  isValid: boolean;
  strength: PasswordStrength;
  issues: string[];
  score: number;
} {
  const issues: string[] = [];
  let score = 0;
  
  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    issues.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`);
  } else {
    score += Math.min(password.length * 2, 20); // Up to 20 points for length
  }
  
  if (password.length > PASSWORD_REQUIREMENTS.MAX_LENGTH) {
    issues.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters long`);
  }
  
  // Check character types
  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    issues.push("Password must contain at least one lowercase letter");
  } else {
    score += 10;
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    issues.push("Password must contain at least one uppercase letter");
  } else {
    score += 10;
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/\d/.test(password)) {
    issues.push("Password must contain at least one number");
  } else {
    score += 10;
  }
  
  if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    issues.push("Password must contain at least one special character");
  } else {
    score += 10;
  }
  
  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    issues.push("Password should not contain repeated characters");
    score -= 5;
  }
  
  if (/123|abc|qwe|password|admin/i.test(password)) {
    issues.push("Password should not contain common patterns");
    score -= 10;
  }
  
  // Determine strength based on score
  let strength: PasswordStrength;
  if (score < 30) {
    strength = PasswordStrength.WEAK;
  } else if (score < 50) {
    strength = PasswordStrength.MEDIUM;
  } else if (score < 70) {
    strength = PasswordStrength.STRONG;
  } else {
    strength = PasswordStrength.VERY_STRONG;
  }
  
  const isValid = issues.length === 0;
  
  return {
    isValid,
    strength,
    issues,
    score: Math.max(0, score),
  };
}

/**
 * Get password strength color for UI display
 * 
 * @param strength - Password strength level
 * @returns Color string for UI
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.WEAK:
      return "#FF3B30"; // Red
    case PasswordStrength.MEDIUM:
      return "#FF9500"; // Orange
    case PasswordStrength.STRONG:
      return "#34C759"; // Green
    case PasswordStrength.VERY_STRONG:
      return "#007AFF"; // Blue
    default:
      return "#8E8E93"; // Gray
  }
}

/**
 * Get password strength text for UI display
 * 
 * @param strength - Password strength level
 * @returns Display text
 */
export function getPasswordStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.WEAK:
      return "Weak";
    case PasswordStrength.MEDIUM:
      return "Medium";
    case PasswordStrength.STRONG:
      return "Strong";
    case PasswordStrength.VERY_STRONG:
      return "Very Strong";
    default:
      return "Unknown";
  }
}

// ========================================
// PASSWORD SUGGESTIONS
// ========================================

/**
 * Generate multiple password suggestions
 * 
 * @param count - Number of suggestions to generate (default: 3)
 * @returns Array of password suggestions
 */
export function generatePasswordSuggestions(count: number = 3): string[] {
  const suggestions: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate passwords of different lengths for variety
    const length = 10 + Math.floor(Math.random() * 6); // 10-15 characters
    const includeSpecial = Math.random() > 0.3; // 70% chance of special chars
    
    const password = generateStrongPassword(length, includeSpecial);
    suggestions.push(password);
  }
  
  return suggestions;
}

/**
 * Check if a password meets the app's requirements
 * 
 * @param password - Password to check
 * @returns True if password meets requirements
 */
export function meetsPasswordRequirements(password: string): boolean {
  const validation = validatePassword(password);
  return validation.isValid;
}

// ========================================
// EXPORTS
// ========================================

export default {
  generateStrongPassword,
  validatePassword,
  generatePasswordSuggestions,
  meetsPasswordRequirements,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  PasswordStrength,
  PASSWORD_REQUIREMENTS,
}; 