#!/usr/bin/env node

/**
 * Production Build Script
 * 
 * Prepares the app for production by:
 * - Stripping debug components
 * - Removing console statements
 * - Validating configuration
 * - Optimizing assets
 * - Setting production flags
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

// Log helpers
const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
};

// Configuration
const config = {
    debugComponentsPath: path.join(__dirname, '../src/shared/components/debug'),
    envExamplePath: path.join(__dirname, '../.env.example'),
    envPath: path.join(__dirname, '../.env'),
    requiredEnvVars: [
        'EXPO_PUBLIC_API_URL',
        'EXPO_PUBLIC_EXCHANGE_RATE_API_KEY',
        'EXPO_PUBLIC_CURRENCY_API_KEY',
    ],
    filesToClean: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
    ],
};

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Validate environment variables
 */
function validateEnvironment() {
    log.info('Validating environment configuration...');

    // Check if .env exists
    if (!fs.existsSync(config.envPath)) {
        log.error('.env file not found! Please create one from .env.example');
        process.exit(1);
    }

    // Read .env file
    const envContent = fs.readFileSync(config.envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envVars[match[1].trim()] = match[2].trim();
        }
    });

    // Check required variables
    const missing = [];
    const invalid = [];

    config.requiredEnvVars.forEach(varName => {
        if (!envVars[varName] || envVars[varName] === '') {
            missing.push(varName);
        } else {
            // Validate specific variables
            if (varName === 'EXPO_PUBLIC_API_URL') {
                const apiUrl = envVars[varName];
                if (apiUrl.includes('localhost') || apiUrl.includes('ngrok')) {
                    invalid.push(`${varName}: Cannot use localhost or ngrok in production`);
                }
            }
        }
    });

    if (missing.length > 0) {
        log.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    if (invalid.length > 0) {
        invalid.forEach(err => log.error(err));
        process.exit(1);
    }

    log.success('Environment configuration validated');
}

/**
 * Check for debug code
 */
function checkForDebugCode() {
    log.info('Checking for debug code...');

    const patterns = [
        { pattern: /console\.(log|debug|info)/g, name: 'console.log statements' },
        { pattern: /__DEV__\s*&&\s*console/g, name: 'DEV console statements' },
        { pattern: /debugger;/g, name: 'debugger statements' },
        { pattern: /TODO:|FIXME:|HACK:/g, name: 'TODO/FIXME comments' },
    ];

    const srcPath = path.join(__dirname, '../src');
    let warningsFound = false;

    const checkFile = (filePath) => {
        const content = fs.readFileSync(filePath, 'utf8');

        patterns.forEach(({ pattern, name }) => {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                log.warn(`Found ${matches.length} ${name} in ${path.relative(srcPath, filePath)}`);
                warningsFound = true;
            }
        });
    };

    const walkDir = (dir) => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                walkDir(fullPath);
            } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
                checkFile(fullPath);
            }
        });
    };

    walkDir(srcPath);

    if (warningsFound) {
        log.warn('Debug code found in source files. Consider removing before production.');
    } else {
        log.success('No debug code found');
    }
}

// ========================================
// BUILD OPTIMIZATION FUNCTIONS
// ========================================

/**
 * Create production metro config
 */
function createProductionMetroConfig() {
    log.info('Creating production Metro configuration...');

    const metroConfig = `
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Production optimizations
config.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
  },
  compress: {
    drop_console: true,
    drop_debugger: true,
  },
  output: {
    ascii_only: true,
    quote_style: 3,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  ie8: false,
};

// Exclude debug components in production
config.resolver.blockList = [
  /src\\/shared\\/components\\/debug\\/.*/,
  /.*\\.test\\.(ts|tsx)$/,
  /.*\\/__tests__\\/.*/,
  /.*\\/__mocks__\\/.*/,
];

module.exports = config;
`;

    fs.writeFileSync(
        path.join(__dirname, '../metro.config.production.js'),
        metroConfig.trim()
    );

    log.success('Production Metro configuration created');
}

/**
 * Create production babel config
 */
function createProductionBabelConfig() {
    log.info('Creating production Babel configuration...');

    const babelConfig = {
        presets: ['babel-preset-expo'],
        plugins: [
            // Remove console statements
            ['transform-remove-console', {
                exclude: ['error', 'warn'],
            }],
            // Remove debug imports
            ['transform-imports', {
                '@shared/components/debug': {
                    transform: () => null,
                },
            }],
        ],
        env: {
            production: {
                plugins: [
                    'transform-remove-console',
                    '@babel/plugin-transform-react-inline-elements',
                    '@babel/plugin-transform-react-constant-elements',
                ],
            },
        },
    };

    fs.writeFileSync(
        path.join(__dirname, '../babel.config.production.json'),
        JSON.stringify(babelConfig, null, 2)
    );

    log.success('Production Babel configuration created');
}

/**
 * Set production environment
 */
function setProductionEnvironment() {
    log.info('Setting production environment...');

    // Create .env.production
    const envProd = `
# Production Environment
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_ENABLE_DEBUG_COMPONENTS=false
EXPO_PUBLIC_ENABLE_VERBOSE_LOGGING=false
EXPO_PUBLIC_ENABLE_MEMORY_MONITORING=false
EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
EXPO_PUBLIC_ENABLE_CERTIFICATE_PINNING=true
EXPO_PUBLIC_ENABLE_CSRF_PROTECTION=true
EXPO_PUBLIC_ENABLE_SESSION_MANAGEMENT=true
EXPO_PUBLIC_ENABLE_API_KEY_ROTATION=true
EXPO_PUBLIC_ENABLE_TOKEN_ENCRYPTION=true
`;

    fs.writeFileSync(
        path.join(__dirname, '../.env.production'),
        envProd.trim()
    );

    log.success('Production environment set');
}

// ========================================
// MAIN BUILD PROCESS
// ========================================

async function buildProduction() {
    console.log('\n🚀 Starting Production Build Process\n');

    try {
        // Step 1: Validate environment
        validateEnvironment();

        // Step 2: Check for debug code
        checkForDebugCode();

        // Step 3: Create production configs
        createProductionMetroConfig();
        createProductionBabelConfig();
        setProductionEnvironment();

        // Step 4: Clean build
        log.info('Cleaning previous builds...');
        execSync('npx expo prebuild --clean', { stdio: 'inherit' });

        // Step 5: Build production app
        log.info('Building production app...');

        // For iOS
        if (process.platform === 'darwin') {
            log.info('Building iOS production app...');
            execSync('npx eas build --platform ios --profile production', { stdio: 'inherit' });
        }

        // For Android
        log.info('Building Android production app...');
        execSync('npx eas build --platform android --profile production', { stdio: 'inherit' });

        console.log('\n✅ Production build completed successfully!\n');

    } catch (error) {
        log.error(`Build failed: ${error.message}`);
        process.exit(1);
    }
}

// ========================================
// UTILITY COMMANDS
// ========================================

const commands = {
    validate: validateEnvironment,
    check: checkForDebugCode,
    config: () => {
        createProductionMetroConfig();
        createProductionBabelConfig();
        setProductionEnvironment();
    },
    build: buildProduction,
};

// Parse command line arguments
const command = process.argv[2];

if (command && commands[command]) {
    commands[command]();
} else {
    // Default to full build
    buildProduction();
}

module.exports = {
    validateEnvironment,
    checkForDebugCode,
    createProductionMetroConfig,
    createProductionBabelConfig,
    setProductionEnvironment,
    buildProduction,
}; 