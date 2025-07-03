/**
 * Formatting Utilities
 *
 * Utilities for formatting dates, numbers, strings, and other data types
 * with internationalization support and consistent formatting patterns.
 * 
 * @module @core/utils/formatting
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// DATA FORMATTERS
// ========================================

// General data formatting utilities (excluding date functions)
export { 
  formatCurrency, 
  formatNumber, 
  formatPhone,
  formatFileSize,
  truncateText
} from "./data-formatters";

// ========================================
// DATE & TIME FORMATTING
// ========================================

// Date formatting and manipulation utilities
export * from "./date-utils";
