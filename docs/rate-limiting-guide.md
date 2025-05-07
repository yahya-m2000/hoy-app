# API Rate Limiting Solution for Hoy Mobile App

## Overview

This document outlines the rate limiting solution implemented in the Hoy mobile app to prevent excessive API calls and 429 (Too Many Requests) errors. The solution includes multiple layers of throttling, caching, and backoff strategies to ensure smooth app operation even under high load conditions.

## Rate Limiting Strategies

We've implemented several levels of rate limiting:

### 1. Request Deduplication

- **Identical Request Detection**: Prevents duplicate identical requests from being made in quick succession
- **Implementation**: Uses request signature caching based on query parameters
- **Location**: `propertyService.ts`, `useProperties.ts`

### 2. Client-side Throttling

- **Time-based Throttling**: Enforces minimum intervals (10 seconds) between similar requests
- **Global Request Counter**: Limits to 10 requests per minute across the app
- **Implementation**: Global state tracking via singleton pattern
- **Location**: `propertyService.ts`, `rateLimitingUtils.ts`

### 3. Exponential Backoff

- **Progressive Delays**: When rate limits are hit, increases waiting time exponentially
- **Reset Mechanism**: Resets backoff time when successful requests are made
- **Implementation**: Backoff calculation with random jitter
- **Location**: `propertyService.ts`, `rateLimitingUtils.ts`

### 4. Response Caching

- **Cache Layer**: Stores successful API responses
- **TTL**: 5-minute cache lifetime for property search results
- **Conditional Refresh**: Uses cache while waiting for fresh data
- **Location**: `propertyService.ts`

## Component-level Optimizations

### Results Screen

- **Delayed Initialization**: Uses timeouts to prevent rapid API calls on component mount/remount
- **Cleanup Handling**: Properly cancels pending operations on unmount
- **Mount Detection**: Prevents duplicate API calls during component lifecycle
- **Location**: `Results.tsx`

### useProperties Hook

- **Debounced Dependencies**: Delays API calls when dependencies change rapidly
- **Pending Request Tracking**: Prevents multiple simultaneous API calls
- **Request ID Tracking**: Uses unique request IDs to identify duplicate calls
- **Location**: `useProperties.ts`

## Testing

A test script is available to verify the rate limiting solution:
- **File**: `test/test-rate-limiting.js`
- **Usage**: Run with `npm test` or directly with Node

## Monitoring & Debugging

- **Conditional Logging**: DEV-only logging with probability-based filtering
- **Rate Limit Detection**: Specific error handling for 429 responses
- **Request Tracking**: Unique request IDs for correlation in logs
- **Location**: Throughout the codebase

## Best Practices for Development

1. Always use the `useProperties` hook for data fetching instead of direct API calls
2. Don't modify rate limiting parameters without testing
3. Always implement proper cleanup in component unmount
4. Test thoroughly after making changes to the API interaction layer
5. Monitor logs for rate limiting warnings
