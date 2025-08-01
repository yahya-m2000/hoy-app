#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Sync versions from package.json to app.json and README.md
 * Runs after release-please creates new releases to keep everything in sync
 */

function syncVersions() {
  console.log('🔄 Syncing versions after release...');

  // Read package.json version (source of truth after release-please update)
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const sourceVersion = packageJson.version;

  console.log(`📦 Source version from package.json: ${sourceVersion}`);

  // Update app.json expo.version
  const appJsonPath = path.join(__dirname, '../app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  if (appJson.expo.version !== sourceVersion) {
    console.log(`📱 Updating app.json: ${appJson.expo.version} → ${sourceVersion}`);
    appJson.expo.version = sourceVersion;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  } else {
    console.log('📱 app.json version already up to date');
  }

  // Update README.md version references  
  const readmePath = path.join(__dirname, '../README.md');
  if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    const versionBadgePattern = /(https:\/\/img\.shields\.io\/badge\/version-)[0-9]+\.[0-9]+\.[0-9]+(-{1,2}[a-zA-Z0-9\.]+)?(-[a-zA-Z0-9]+\.svg)/g;
    
    const originalContent = readmeContent;
    // Replace the version part while keeping the rest of the URL intact
    // Convert single dash in version to double dash for shields.io URL encoding
    const shieldsVersion = sourceVersion.replace(/-/g, '--');
    readmeContent = readmeContent.replace(versionBadgePattern, (match, prefix, prerelease, suffix) => {
      return `${prefix}${shieldsVersion}${suffix}`;
    });
    
    if (originalContent !== readmeContent) {
      fs.writeFileSync(readmePath, readmeContent);
      console.log('📄 Updated README.md version badge');
    } else {
      console.log('📄 README.md version badge already up to date or not found');
    }
  }

  // Note: Release-please config doesn't need version syncing as it manages its own versioning
  const releasePleaseConfigPath = path.join(__dirname, '../config/release/release-please-config.json');
  if (fs.existsSync(releasePleaseConfigPath)) {
    console.log('📄 Release-please config found (manages its own versioning)');
  }

  console.log('✅ Version sync complete!');
  console.log(`🎯 All files now use version: ${sourceVersion}`);
  
  return sourceVersion;
}

// Run if called directly
if (require.main === module) {
  syncVersions();
}

module.exports = { syncVersions };