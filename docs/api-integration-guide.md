# API Integration Guide

## Overview

This document provides guidelines for integrating with the Hoy API from the mobile app. Following these guidelines will help prevent common issues such as incorrect URL paths and ensure consistent API usage throughout the application.

## API Base URL

The base URL for all API requests is configured in `src/services/api.ts` and already includes the `/api/v1` prefix. When making API calls, you should **not** include this prefix in your endpoint paths.

```javascript
// Correct
api.get('/properties/search', { params });

// Incorrect - will result in /api/v1/api/v1/properties/search
api.get('/api/v1/properties/search', { params });

// Incorrect - will result in /api/v1/v1/properties/search
api.get('/v1/properties/search', { params });
```

## Using API Endpoint Constants

To ensure consistency and prevent URL path errors, we've created a centralized constants file for all API endpoints. Always use these constants when making API requests:

```javascript
import { PROPERTY_ENDPOINTS, USER_ENDPOINTS } from '../constants/apiEndpoints';

// Fetch properties
const response = await api.get(PROPERTY_ENDPOINTS.SEARCH, { params });

// Fetch user profile
const profile = await api.get(USER_ENDPOINTS.PROFILE);
```

## Common API Issues and Solutions

### 404 Route Not Found Errors

If you're getting 404 "Route not found" errors, check:

1. The endpoint path doesn't include redundant prefixes like `/api/v1` or `/v1`
2. The endpoint spelled correctly and matches exactly what's defined in the server routes
3. Any URL parameters like IDs are properly formatted and valid

### Validation Errors (400)

If you're getting 400 validation errors:

1. Check that all required parameters are included in your request
2. Ensure parameter types match what the server expects (numbers vs strings)
3. Check for any formatting issues in date fields, coordinates, etc.

## Debugging API Calls

When troubleshooting API issues:

1. Check the network logs in the DevTools console to see the exact request URL and parameters
2. Verify that the server has the expected route registered
3. Test the endpoint directly with a tool like Postman or curl
4. Add detailed error logging to understand what's failing

## Relevant Files

- `src/services/api.ts` - Base API configuration
- `src/constants/apiEndpoints.ts` - Centralized API endpoint paths
- `src/services/propertyService.ts` - Property-related API calls
- `src/services/authService.ts` - Authentication-related API calls
