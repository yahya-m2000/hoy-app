# Secure Configuration Setup

This project uses a secure configuration system to keep sensitive data (like API URLs and secret keys) out of the repository while maintaining a clean development experience.

## Files Structure

### Committed Files (Safe to Share)
- `src/shared/config/secure.config.example.ts` - Example template showing the structure
- `src/shared/config/environment.ts` - Main configuration that imports secure config
- `src/shared/config/envConfig.ts` - Public environment settings
- `src/shared/constants/api.ts` - API endpoints using the configuration

### Private Files (NEVER Commit)
- `src/shared/config/secure.config.ts` - Contains actual sensitive data
- `.env` - Environment variables (already in .gitignore)

## Setup Instructions

### 1. Create Your Secure Configuration
Copy the example file and fill in your actual values:

```bash
cp src/shared/config/secure.config.example.ts src/shared/config/secure.config.ts
```

### 2. Edit the Secure Config
Open `src/shared/config/secure.config.ts` and replace the placeholder values:

```typescript
export const SECURE_CONFIG = {
  // Replace with your actual API URL
  API_BASE_URL: "https://your-actual-api-domain.com/api/v1",
  
  // Replace with your actual Mapbox API key
  MAPBOX_API_KEY: "your_actual_mapbox_api_key_here",
  
  // Add other sensitive configuration here
} as const;
```

### 3. Verify .gitignore
The `.gitignore` file already includes:
```
# Secure configuration files - NEVER COMMIT THESE
src/shared/config/secure.config.ts
```

## How It Works

### Development Mode
- If `secure.config.ts` exists → Uses your actual configuration
- If `secure.config.ts` is missing → Uses fallback localhost values with warnings

### Production Mode
- Requires `secure.config.ts` to exist with proper values
- Build will fail if sensitive configuration is missing

### Configuration Access
```typescript
import { API_CONFIG, EXTERNAL_SERVICES } from '@/shared/config';

// Access API URL (from secure config)
const apiUrl = API_CONFIG.baseUrl;

// Access Mapbox key (from secure config)
const mapboxKey = EXTERNAL_SERVICES.mapboxApiKey;
```

## Security Benefits

1. **No Secrets in Git**: Sensitive data never gets committed to the repository
2. **Developer Friendly**: Easy setup with clear documentation
3. **Team Collaboration**: Everyone can have their own secure.config.ts
4. **Environment Flexibility**: Different configs for dev/staging/production
5. **TypeScript Safety**: Full type checking for configuration

## Team Workflow

### For New Team Members
1. Clone the repository
2. Copy `secure.config.example.ts` to `secure.config.ts`
3. Ask team lead for the actual API URLs and keys
4. Fill in the secure.config.ts file
5. Start development

### For Deployment
1. Create secure.config.ts on the deployment server
2. Fill in production API URLs and keys
3. Build and deploy

## Warning ⚠️

**NEVER commit `src/shared/config/secure.config.ts` to the repository!**

If you accidentally commit it:
1. Immediately remove it from git: `git rm --cached src/shared/config/secure.config.ts`
2. Rotate any exposed API keys/secrets
3. Update the .gitignore if needed
4. Force push to rewrite history if the secret was pushed to remote

## Troubleshooting

### "secure.config.ts not found" Warning
This is normal if you haven't created the secure config file yet. The app will use fallback localhost values.

### TypeScript Errors
Make sure your `secure.config.ts` follows the same structure as `secure.config.example.ts`.

### API Not Working
Check that your `API_BASE_URL` in `secure.config.ts` is correct and accessible.
