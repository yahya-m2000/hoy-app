# SSO Authentication Setup Guide

This guide will help you set up Google and Facebook OAuth authentication for your Hoy app.

## Prerequisites

- Google Cloud Console account
- Facebook Developer account
- Expo development environment

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Hoy"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if needed

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Android" for mobile app
4. Fill in the details:
   - Package name: `com.ym2000.hoy`
   - SHA-1 certificate fingerprint: Get this from your keystore
5. Copy the Client ID and Client Secret

### 4. Configure Environment Variables

Add these to your `.env` file:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Choose "Consumer" app type
4. Fill in the app details

### 2. Configure Facebook Login

1. In your app dashboard, go to "Add Product" > "Facebook Login"
2. Choose "Android" platform
3. Configure the settings:
   - Package Name: `com.ym2000.hoy`
   - Class Name: `com.ym2000.hoy.MainActivity`
   - Key Hashes: Add your app's key hashes
4. Add permissions: `email`, `public_profile`

### 3. Get App Credentials

1. Go to "Settings" > "Basic"
2. Copy the App ID
3. Go to "Settings" > "Advanced"
4. Copy the Client Token

### 4. Configure Environment Variables

Add these to your `.env` file:

```env
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN=your_facebook_client_token
```

## App Configuration

### 1. Update app.json

Make sure your `app.json` has the correct scheme:

```json
{
  "expo": {
    "scheme": "hoy",
    "ios": {
      "bundleIdentifier": "com.ym2000.hoy"
    },
    "android": {
      "package": "com.ym2000.hoy"
    }
  }
}
```

### 2. Configure Redirect URIs

For Google OAuth, add these redirect URIs in Google Cloud Console:
- `com.ym2000.hoy://auth`
- `https://auth.expo.io/@your-expo-username/hoy`

For Facebook OAuth, add these in Facebook App settings:
- `com.ym2000.hoy://auth`
- `https://auth.expo.io/@your-expo-username/hoy`

## Testing

1. Start your development server: `npm start`
2. Open the app on a device or simulator
3. Try signing in with Google or Facebook
4. Check the console for any errors

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URIs are correctly configured in both Google and Facebook consoles
   - Check that the scheme in `app.json` matches your app's bundle identifier

2. **"App not configured" error**
   - Verify that your app is properly configured in the respective developer consoles
   - Check that all required permissions are added

3. **"Client ID not found" error**
   - Ensure the environment variables are correctly set
   - Restart your development server after changing environment variables

### Debug Mode

Enable debug logging by setting:

```env
EXPO_PUBLIC_ENABLE_VERBOSE_LOGGING=true
```

This will show detailed logs about the SSO authentication process.

## Security Notes

- Never commit your `.env` file to version control
- Use different OAuth credentials for development and production
- Regularly rotate your client secrets
- Monitor your OAuth usage and set up alerts

## Production Deployment

When deploying to production:

1. Update the OAuth consent screen to "In production"
2. Add your production domain to authorized domains
3. Update redirect URIs to use your production domain
4. Use production OAuth credentials
5. Enable additional security features like certificate pinning

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify your OAuth configuration in the respective developer consoles
3. Test with a fresh app installation
4. Check that all required permissions are granted 