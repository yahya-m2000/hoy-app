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
    
    // Look for common version patterns in README
    const patterns = [
      { 
        regex: /(version-)[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+(\.[0-9]+)?)?/g,
        replacement: `$1${sourceVersion}`
      },
      {
        regex: /(Version: )[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+(\.[0-9]+)?)?/g,
        replacement: `$1${sourceVersion}`
      },
      {
        regex: /(v)[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+(\.[0-9]+)?)?(?=\s|$|[^\d\.])/g,
        replacement: `$1${sourceVersion}`
      }
    ];
    
    let updated = false;
    patterns.forEach(({ regex, replacement }) => {
      const originalContent = readmeContent;
      readmeContent = readmeContent.replace(regex, replacement);
      if (originalContent !== readmeContent) {
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(readmePath, readmeContent);
      console.log('📄 Updated README.md version references');
    } else {
      console.log('📄 No version references found in README.md to update');
    }
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