# Environment Configuration

This document explains how to configure the mobile app using environment variables.

## Configuration Files

- `.env` - Environment variables for the app
- `src/shared/config/environment.ts` - Centralized environment configuration utility
- `src/shared/constants/api.ts` - API endpoints using environment variables

## Environment Variables

### API Configuration
- `API_BASE_URL` - Base URL for the API (default: development server)
- `API_VERSION` - API version to use (default: v1)

### External Services
- `MAPBOX_API_KEY` - API key for Mapbox services

### App Configuration
- `APP_NAME` - Application name (default: Hoy)
- `APP_VERSION` - Application version (default: 1.0.0)
- `ENVIRONMENT` - Environment mode (development/production)

### Cache Configuration
- `CACHE_VERSION` - Cache version for invalidation
- `CACHE_TTL` - Cache time-to-live in milliseconds
- `SESSION_TTL` - Session time-to-live in milliseconds

### Data Management Settings
- `ENABLE_DATA_INTEGRITY_CHECKS` - Enable data validation (default: true)
- `DISABLE_SEARCH_RESULTS_CACHE` - Disable search caching (default: true)
- `FORCE_FETCH_ON_SEARCH_RESULTS` - Force fresh data on search (default: true)
- `BYPASS_SEARCH_LOADING_DELAY` - Skip loading delays (default: true)

### API Endpoints
All API endpoints can be customized using environment variables:

#### Authentication
- `AUTH_LOGIN_ENDPOINT` - Login endpoint path
- `AUTH_REGISTER_ENDPOINT` - Registration endpoint path
- `AUTH_REFRESH_TOKEN_ENDPOINT` - Token refresh endpoint path
- `AUTH_FORGOT_PASSWORD_ENDPOINT` - Forgot password endpoint path
- `AUTH_RESET_PASSWORD_ENDPOINT` - Password reset endpoint path

#### Properties
- `PROPERTY_SEARCH_ENDPOINT` - Property search endpoint
- `PROPERTY_FEATURED_ENDPOINT` - Featured properties endpoint
- `PROPERTY_NEARBY_ENDPOINT` - Nearby properties endpoint
- `PROPERTY_DETAILS_ENDPOINT` - Property details base endpoint
- `PROPERTY_CALENDAR_ENDPOINT` - Property calendar suffix
- `PROPERTY_UNITS_ENDPOINT` - Property units suffix
- `PROPERTY_REVIEWS_ENDPOINT` - Property reviews suffix
- `PROPERTY_AVAILABILITY_ENDPOINT` - Property availability suffix

#### Search
- `SEARCH_GENERAL_ENDPOINT` - General search endpoint
- `SEARCH_SUGGESTIONS_ENDPOINT` - Search suggestions endpoint
- `SEARCH_NEARBY_ENDPOINT` - Nearby search endpoint
- `SEARCH_TRENDING_ENDPOINT` - Trending search endpoint

#### User/Traveler
- `USER_PROFILE_ENDPOINT` - User profile endpoint
- `USER_UPDATE_PROFILE_ENDPOINT` - Profile update endpoint
- `USER_BOOKINGS_ENDPOINT` - User bookings endpoint
- `USER_FAVORITES_ENDPOINT` - User favorites endpoint
- `USER_MESSAGES_ENDPOINT` - User messages endpoint

#### Host
- `HOST_DASHBOARD_ENDPOINT` - Host dashboard endpoint
- `HOST_PROPERTIES_ENDPOINT` - Host properties endpoint
- `HOST_EARNINGS_ENDPOINT` - Host earnings endpoint
- `HOST_RESERVATIONS_ENDPOINT` - Host reservations endpoint
- `HOST_MESSAGES_ENDPOINT` - Host messages endpoint
- `HOST_SETTINGS_ENDPOINT` - Host settings endpoint

#### Bookings
- `BOOKING_CREATE_ENDPOINT` - Create booking endpoint
- `BOOKING_USER_BOOKINGS_ENDPOINT` - User bookings endpoint

## Usage

### Using Environment Configuration
```typescript
import { APP_CONFIG, API_CONFIG, CACHE_CONFIG } from '@/shared/config';

// Access app configuration
console.log(APP_CONFIG.name); // 'Hoy'
console.log(APP_CONFIG.isDevelopment); // true/false

// Access API configuration
console.log(API_CONFIG.baseUrl); // API base URL

// Access cache configuration
console.log(CACHE_CONFIG.ttl); // 5000
```

### Using API Endpoints
```typescript
import { API_BASE_URL, AUTH_ENDPOINTS, PROPERTY_ENDPOINTS } from '@/shared/constants/api';

// Use endpoints
const loginUrl = API_BASE_URL + AUTH_ENDPOINTS.LOGIN;
const propertyDetailsUrl = API_BASE_URL + PROPERTY_ENDPOINTS.DETAILS('123');
```

### Custom Environment Variables
To add new environment variables:

1. Add the variable to `.env` file
2. Add getter in `src/shared/config/environment.ts`
3. Use throughout the app via the configuration objects

## Development vs Production

Set `ENVIRONMENT=development` or `ENVIRONMENT=production` to control app behavior.
Use `APP_CONFIG.isDevelopment` and `APP_CONFIG.isProduction` to conditionally execute code.
