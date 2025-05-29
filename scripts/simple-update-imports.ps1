# Update Utils Import Paths - Simple Version
# This script updates all imports for the reorganized utils directory structure
# Run this from the root of the mobile_app directory

# Set error action preference 
$ErrorActionPreference = "Stop"

# Display header
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         UTILS IMPORT PATH UPDATER - SIMPLE          " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Mapping of old file paths to their new paths in the utils structure
$fileMapping = @{
    # Validation
    "utils/coordinateValidation" = "utils/validation/coordinateValidation"
    "utils/dataIntegrityCheck" = "utils/validation/dataIntegrityCheck"
    "utils/mongoUtils" = "utils/validation/mongoUtils"
    
    # Formatting
    "utils/dateUtils" = "utils/formatting/dateUtils"
    "utils/formatters" = "utils/formatting/formatters"
    
    # Network
    "utils/cacheBuster" = "utils/network/cacheBuster"
    "utils/networkRetry" = "utils/network/networkRetry"
    
    # Storage
    "utils/clearUserData" = "utils/storage/clearUserData"
    "utils/purgeUserData" = "utils/storage/purgeUserData"
    
    # Asset
    "utils/assetHelpers" = "utils/asset/assetHelpers"
    
    # Logging
    "utils/networkLogger" = "utils/log/networkLogger"
    "utils/safeLogger" = "utils/log/safeLogger"
    "utils/logger" = "utils/log/logger"
    
    # Error handling
    "utils/errorHandlers" = "utils/error/errorHandlers"
    "utils/errorHandling" = "utils/error/errorHandling"
    "utils/tokenDebug" = "utils/error/tokenDebug"
    
    # API
    "utils/rateLimiting" = "utils/api/rateLimiting"
    "utils/apiUtils" = "utils/api/apiUtils"
    "utils/apiErrorHandler" = "utils/api/apiErrorHandler"
    "utils/apiRequestUtils" = "utils/api/apiRequestUtils"
    "utils/apiThrottling" = "utils/api/apiThrottling"
    "utils/propertySearchUtils" = "utils/api/propertySearchUtils"
}

Write-Host "Scanning for TypeScript and JavaScript files..." -ForegroundColor Yellow
# Get all TypeScript and JavaScript files in src and app directories
$sourceFiles = Get-ChildItem -Path 'src', 'app' -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
               Where-Object { $_.FullName -notmatch "node_modules" }

Write-Host "Found $($sourceFiles.Count) source files" -ForegroundColor Yellow
Write-Host ""

# Initialize counters
$updatedFiles = 0
$totalImportUpdates = 0

foreach ($file in $sourceFiles) {
    Write-Host "Processing $($file.Name)..." -NoNewline
    
    try {
        $content = Get-Content -Path $file.FullName -Raw
        $originalContent = $content
        $modified = $false
        $fileImportUpdates = 0
        
        foreach ($oldPath in $fileMapping.Keys) {
            $newPath = $fileMapping[$oldPath]
            
            # Common import patterns to match
            $patterns = @(
                "from\s+[`"']\.\.\/src\/$oldPath[`"']",                       # ../src/utils/file
                "from\s+[`"']\.\.\/\.\.\/src\/$oldPath[`"']",                  # ../../src/utils/file
                "from\s+[`"']\.\.\/\.\.\/\.\.\/src\/$oldPath[`"']",            # ../../../src/utils/file
                "from\s+[`"']\.\.\/utils\/$($oldPath -replace 'utils\/', '')[`"']", # ../utils/file
                "from\s+[`"']\.\.\/\.\.\/utils\/$($oldPath -replace 'utils\/', '')[`"']" # ../../utils/file
            )
            
            foreach ($pattern in $patterns) {
                if ($content -match $pattern) {
                    # Found a match, now construct the replacement
                    $match = $Matches[0]
                    
                    # Parse the match to determine the correct replacement path
                    if ($match -match "from\s+[`"'](\.\.\/)+src\/utils\/") {
                        # For patterns like "../src/utils/file"
                        $prefix = $match -replace "\/utils\/.*?[`"']", ""
                        $newMatch = "$prefix/$newPath`""
                        $content = $content -replace [regex]::Escape($match), $newMatch
                        $modified = $true
                        $fileImportUpdates++
                        $totalImportUpdates++
                    }
                    elseif ($match -match "from\s+[`"'](\.\.\/)+utils\/") {
                        # For patterns like "../utils/file"
                        $prefix = $match -replace "\/utils\/.*?[`"']", ""
                        $fileName = ($newPath -split "/")[-1]
                        $category = ($newPath -split "/")[-2]
                        $newMatch = "$prefix/utils/$category/$fileName`""
                        $content = $content -replace [regex]::Escape($match), $newMatch
                        $modified = $true
                        $fileImportUpdates++
                        $totalImportUpdates++
                    }
                }
            }
        }
        
        # Update the file if it was modified
        if ($modified) {
            Set-Content -Path $file.FullName -Value $content
            Write-Host " Updated $fileImportUpdates imports." -ForegroundColor Green
            $updatedFiles++
        }
        else {
            Write-Host " No changes needed." -ForegroundColor Gray
        }
    }
    catch {
        Write-Host " Error: $_" -ForegroundColor Red
    }
}

# Print summary
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "                   SUMMARY                             " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files processed: $($sourceFiles.Count)" -ForegroundColor White
Write-Host "Files updated: $updatedFiles" -ForegroundColor Green
Write-Host "Total import paths updated: $totalImportUpdates" -ForegroundColor Cyan

# Create a verification script
$verificationContent = @"
# Verification Script
# Checks for any remaining old import paths

Write-Host "Checking for remaining old imports..." -ForegroundColor Yellow

# Define the old paths to check for
`$oldPaths = @(
    "utils/coordinateValidation",
    "utils/dateUtils",
    "utils/formatters",
    "utils/cacheBuster",
    "utils/clearUserData",
    "utils/purgeUserData",
    "utils/assetHelpers",
    "utils/networkLogger",
    "utils/safeLogger",
    "utils/dataIntegrityCheck",
    "utils/errorHandlers",
    "utils/networkRetry",
    "utils/errorHandling",
    "utils/rateLimiting",
    "utils/logger",
    "utils/mongoUtils",
    "utils/tokenDebug",
    "utils/apiUtils",
    "utils/apiErrorHandler",
    "utils/apiRequestUtils",
    "utils/apiThrottling",
    "utils/propertySearchUtils"
)

# Get all source files
`$sourceFiles = Get-ChildItem -Path 'src', 'app' -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
               Where-Object { `$_.FullName -notmatch "node_modules" }

`$filesWithOldImports = @()

foreach (`$file in `$sourceFiles) {
    `$content = Get-Content -Path `$file.FullName -Raw
    
    foreach (`$oldPath in `$oldPaths) {
        if (`$content -match "from\s+[`"'].*`$oldPath[`"']") {
            `$filesWithOldImports += `$file.FullName
            Write-Host "Found old import in `$(`$file.FullName): `$oldPath" -ForegroundColor Red
            break
        }
    }
}

if (`$filesWithOldImports.Count -eq 0) {
    Write-Host "No old imports found! All paths have been updated." -ForegroundColor Green
} else {
    Write-Host "Found `$(`$filesWithOldImports.Count) files with old imports." -ForegroundColor Red
}
"@

Set-Content -Path "verify-imports.ps1" -Value $verificationContent
Write-Host "Created verification script: verify-imports.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Import path update process completed!" -ForegroundColor Green
