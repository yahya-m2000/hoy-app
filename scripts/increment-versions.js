#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Increment version script for automated builds
 * Supports semantic versioning and Android version codes
 */

const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    process.exit(1);
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    process.exit(1);
  }
}

function incrementVersionCode(appJson) {
  const currentVersionCode = appJson.expo.android.versionCode || 1;
  const newVersionCode = currentVersionCode + 1;
  
  appJson.expo.android.versionCode = newVersionCode;
  
  console.log(`✓ Android versionCode: ${currentVersionCode} → ${newVersionCode}`);
  return appJson;
}

function incrementSemanticVersion(version, type = 'patch') {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function incrementAppVersion(appJson, packageJson, versionType) {
  const currentVersion = appJson.expo.version;
  const newVersion = incrementSemanticVersion(currentVersion, versionType);
  
  // Update app.json
  appJson.expo.version = newVersion;
  
  // Update package.json if it exists and has a version
  if (packageJson.version) {
    const currentPackageVersion = packageJson.version;
    // Handle alpha/beta versions
    if (currentPackageVersion.includes('alpha') || currentPackageVersion.includes('beta')) {
      // Keep the pre-release suffix for package.json
      const [baseVersion, suffix] = currentPackageVersion.split('-');
      packageJson.version = `${newVersion}-${suffix}`;
    } else {
      packageJson.version = newVersion;
    }
    console.log(`✓ Package version: ${currentPackageVersion} → ${packageJson.version}`);
  }
  
  console.log(`✓ App version: ${currentVersion} → ${newVersion}`);
  return { appJson, packageJson };
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'patch';
  
  console.log('🚀 Incrementing app versions...\n');
  
  // Read current configurations
  const appJson = readJsonFile(APP_JSON_PATH);
  const packageJson = readJsonFile(PACKAGE_JSON_PATH);
  
  console.log('Current versions:');
  console.log(`  App version: ${appJson.expo.version}`);
  console.log(`  Android versionCode: ${appJson.expo.android.versionCode || 1}`);
  console.log(`  Package version: ${packageJson.version || 'N/A'}\n`);
  
  // Increment versions based on command
  switch (command) {
    case 'versionCode':
    case 'android':
      incrementVersionCode(appJson);
      writeJsonFile(APP_JSON_PATH, appJson);
      break;
      
    case 'major':
    case 'minor':
    case 'patch':
      const { appJson: updatedAppJson, packageJson: updatedPackageJson } = 
        incrementAppVersion(appJson, packageJson, command);
      incrementVersionCode(updatedAppJson);
      
      writeJsonFile(APP_JSON_PATH, updatedAppJson);
      writeJsonFile(PACKAGE_JSON_PATH, updatedPackageJson);
      break;
      
    case 'all':
      const { appJson: allAppJson, packageJson: allPackageJson } = 
        incrementAppVersion(appJson, packageJson, 'patch');
      incrementVersionCode(allAppJson);
      
      writeJsonFile(APP_JSON_PATH, allAppJson);
      writeJsonFile(PACKAGE_JSON_PATH, allPackageJson);
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Usage: node increment-versions.js [versionCode|patch|minor|major|all]');
      process.exit(1);
  }
  
  console.log('\n✅ Version increment completed!');
}

if (require.main === module) {
  main();
}

module.exports = {
  incrementVersionCode,
  incrementSemanticVersion,
  incrementAppVersion
};