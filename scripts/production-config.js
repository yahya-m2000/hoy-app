#!/usr/bin/env node

/**
 * Production Configuration Script
 * 
 * This script helps configure the app for production deployment
 * Usage: node scripts/production-config.js --api-url=https://api.example.com
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const config = {};

args.forEach(arg => {
    const [key, value] = arg.split('=');
    const cleanKey = key.replace(/^--/, '');
    config[cleanKey] = value;
});

// Default production values
const productionConfig = {
    apiUrl: config['api-url'] || 'https://api.hoyapp.com/api/v1',
    wsUrl: config['ws-url'] || 'wss://api.hoyapp.com/ws',
    environment: 'production',
    ...config
};

// Update app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

appJson.expo.extra = {
    ...appJson.expo.extra,
    apiUrl: productionConfig.apiUrl,
    wsUrl: productionConfig.wsUrl,
    environment: productionConfig.environment,
};

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log('✅ Production configuration updated:');
console.log('   API URL:', productionConfig.apiUrl);
console.log('   WebSocket URL:', productionConfig.wsUrl);
console.log('   Environment:', productionConfig.environment);

// Create .env.production file
const envContent = `# Production Environment Variables
EXPO_PUBLIC_API_URL=${productionConfig.apiUrl}
EXPO_PUBLIC_WS_URL=${productionConfig.wsUrl}
EXPO_PUBLIC_ENVIRONMENT=production

# API Keys (add your production keys here)
EXPO_PUBLIC_EXCHANGE_RATE_API_KEY=
EXPO_PUBLIC_CURRENCY_API_KEY=
EXPO_PUBLIC_MAPBOX_API_KEY=
EXPO_PUBLIC_ANALYTICS_API_KEY=

# Production Feature Flags
EXPO_PUBLIC_ENABLE_DEBUG_COMPONENTS=false
EXPO_PUBLIC_ENABLE_VERBOSE_LOGGING=false
EXPO_PUBLIC_ENABLE_MEMORY_MONITORING=false
EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
EXPO_PUBLIC_ENABLE_CERTIFICATE_PINNING=true
EXPO_PUBLIC_ENABLE_CSRF_PROTECTION=true
EXPO_PUBLIC_ENABLE_SESSION_MANAGEMENT=true
EXPO_PUBLIC_ENABLE_API_KEY_ROTATION=true
EXPO_PUBLIC_ENABLE_TOKEN_ENCRYPTION=true

# Production Performance Configuration
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_CACHE_TTL=3600000
EXPO_PUBLIC_SESSION_TTL=43200000
EXPO_PUBLIC_RATE_LIMIT_WINDOW=60000
EXPO_PUBLIC_RATE_LIMIT_MAX_REQUESTS=100
`;

const envPath = path.join(__dirname, '..', '.env.production');
fs.writeFileSync(envPath, envContent);

console.log('\n✅ Created .env.production file');
console.log('\n⚠️  Remember to:');
console.log('   1. Add your production API keys to .env.production');
console.log('   2. Update your server URL if different from the default');
console.log('   3. Run "expo prebuild" before building for production');
console.log('   4. Test thoroughly before deploying to app stores');
