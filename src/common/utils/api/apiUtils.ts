/**
 * General API utility functions
 *
 * Provides helper functions for common API operations such as
 * parameter formatting, response parsing, and URL construction.
 */

/**
 * Convert an object to URL query parameters
 * @param params Object containing query parameters
 * @returns URL query string (without leading ?)
 */
export const objectToQueryParams = (params: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return "";
  }

  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      // Handle arrays
      if (Array.isArray(value)) {
        return value
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
          .join("&");
      }

      // Handle objects (convert to JSON)
      if (typeof value === "object") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          JSON.stringify(value)
        )}`;
      }

      // Handle primitive values
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");
};

/**
 * Build a URL with query parameters
 * @param baseUrl Base URL
 * @param params Query parameters object
 * @returns Full URL with query string
 */
export const buildUrl = (
  baseUrl: string,
  params?: Record<string, any>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryString = objectToQueryParams(params);
  const separator = baseUrl.includes("?") ? "&" : "?";

  return queryString ? `${baseUrl}${separator}${queryString}` : baseUrl;
};

/**
 * Parse a URL to extract query parameters
 * @param url URL to parse
 * @returns Object containing query parameters
 */
export const parseUrlParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch (error) {
    // Handle relative URLs or invalid URLs
    const queryStart = url.indexOf("?");
    if (queryStart !== -1) {
      const queryString = url.slice(queryStart + 1);
      queryString.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key) {
          params[decodeURIComponent(key)] = value
            ? decodeURIComponent(value)
            : "";
        }
      });
    }
  }

  return params;
};

/**
 * Extract a specific parameter from a URL
 * @param url URL to parse
 * @param paramName Parameter name to extract
 * @returns Parameter value or null if not found
 */
export const getUrlParam = (url: string, paramName: string): string | null => {
  const params = parseUrlParams(url);
  return params[paramName] || null;
};

/**
 * Check if a URL is absolute (includes protocol and domain)
 * @param url URL to check
 * @returns True if URL is absolute
 */
export const isAbsoluteUrl = (url: string): boolean => {
  return /^(?:[a-z]+:)?\/\//i.test(url);
};

/**
 * Join URL path segments, handling trailing/leading slashes
 * @param segments URL path segments to join
 * @returns Joined URL path
 */
export const joinUrlPaths = (...segments: string[]): string => {
  return segments
    .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
};
