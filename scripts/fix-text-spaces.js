#!/usr/bin/env node

/**
 * Script to fix React Native text space issues
 * Replaces {" "} with proper spacing solutions
 */

const fs = require('fs');
const path = require('path');

// Patterns to fix
const patterns = [
  // Pattern 1: {" "} inside a View or Pressable (needs to be removed or moved to Text)
  {
    search: /\s*\{"\s*"\}\s*(?=\n\s*<(?:Icon|Image|View|Pressable))/g,
    replace: '',
    description: 'Remove standalone {" "} before non-text components'
  },
  
  // Pattern 2: Text content followed by {" "} and more content
  {
    search: /(\{[^}]+\})\{"\s*"\}\s*(?=\n)/g,
    replace: '$1 ',
    description: 'Replace {" "} after text content with regular space'
  },
  
  // Pattern 3: {" "} at the end of Text content
  {
    search: /\{"\s*"\}\s*(?=\n\s*<\/Text>)/g,
    replace: ' ',
    description: 'Replace {" "} before closing Text tag with regular space'
  },
  
  // Pattern 4: {" "} between Text elements - convert to margin/padding
  {
    search: /(<\/Text>)\s*\{"\s*"\}\s*(?=\n\s*<Text)/g,
    replace: '$1',
    description: 'Remove {" "} between Text elements (should use margin/padding instead)'
  }
];

function fixTextSpaces(content, filename) {
  let fixed = content;
  let changes = [];
  
  patterns.forEach((pattern, index) => {
    const before = fixed;
    fixed = fixed.replace(pattern.search, pattern.replace);
    if (before !== fixed) {
      changes.push(`Applied pattern ${index + 1}: ${pattern.description}`);
    }
  });
  
  // Additional specific fixes for common cases
  
  // Fix: {formatPrice(price)}{" "} pattern - add space inside the formatPrice call
  const priceSpacePattern = /(\{formatPrice\([^}]+\))\{"\s*"\}/g;
  if (priceSpacePattern.test(fixed)) {
    fixed = fixed.replace(priceSpacePattern, (match, priceCall) => {
      changes.push('Fixed price formatting space');
      return priceCall;
    });
  }
  
  // Fix: {" "} inside Pressable/TouchableOpacity (remove entirely)
  const pressableSpacePattern = /<(Pressable|TouchableOpacity)[^>]*>\s*\{"\s*"\}\s*/g;
  if (pressableSpacePattern.test(fixed)) {
    fixed = fixed.replace(pressableSpacePattern, (match, component) => {
      changes.push(`Removed standalone space from ${component}`);
      return match.replace(/\{"\s*"\}\s*/, '');
    });
  }
  
  return { content: fixed, changes };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = fixTextSpaces(content, path.basename(filePath));
    
    if (result.changes.length > 0) {
      console.log(`\n📝 ${filePath}:`);
      result.changes.forEach(change => console.log(`  ✓ ${change}`));
      
      // Write the fixed content back to file
      fs.writeFileSync(filePath, result.content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let totalFixed = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        if (processFile(fullPath)) {
          totalFixed++;
        }
      }
    });
  }
  
  walkDir(dirPath);
  return totalFixed;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node fix-text-spaces.js <directory-path>');
    console.log('Example: node fix-text-spaces.js src/shared/components/common/Property');
    process.exit(1);
  }
  
  const targetPath = args[0];
  
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Path does not exist: ${targetPath}`);
    process.exit(1);
  }
  
  console.log(`🔍 Scanning for text space issues in: ${targetPath}`);
  
  const fixedCount = processDirectory(targetPath);
  
  if (fixedCount > 0) {
    console.log(`\n✅ Fixed text space issues in ${fixedCount} file(s)`);
    console.log('\n📋 Summary of changes:');
    console.log('  • Removed standalone {" "} before non-text components');
    console.log('  • Converted {" "} after text content to regular spaces');
    console.log('  • Cleaned up spaces before closing Text tags');
    console.log('  • Removed unnecessary spaces between Text elements');
  } else {
    console.log('\n✅ No text space issues found');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixTextSpaces, processFile, processDirectory };
