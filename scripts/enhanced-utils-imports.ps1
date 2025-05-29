# Update Utils Import Paths - Enhanced Version
# This script updates all imports for the reorganized utils directory structure
# It handles multiple import patterns and provides detailed reporting
# Run this from the root of the mobile_app directory

# Set error action preference 
$ErrorActionPreference = "Stop"

# Display header
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         UTILS IMPORT PATH UPDATER - ENHANCED          " -ForegroundColor Cyan
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

# Function to get the directory depth between two file paths
function Get-RelativePath {
    param(
        [string]$sourcePath,
        [string]$targetPath
    )
    
    # Normalize paths and convert to array of directories
    $sourceDir = $sourcePath | Split-Path -Parent
    $sourceParts = $sourceDir -split '[\\/]' | Where-Object { $_ }
    $targetParts = $targetPath -split '[\\/]' | Where-Object { $_ }
    
    # Calculate common part
    $commonIndex = 0
    $minLength = [Math]::Min($sourceParts.Length, $targetParts.Length)
    
    for ($i = 0; $i -lt $minLength; $i++) {
        if ($sourceParts[$i] -ne $targetParts[$i]) { break }
        $commonIndex++
    }
    
    # Calculate the path
    $upCount = $sourceParts.Length - $commonIndex
    $relativePath = "../" * $upCount
    
    # Add the down path if any
    if ($targetParts.Length -gt $commonIndex) {
        $relativePath += [string]::Join("/", $targetParts[$commonIndex..($targetParts.Length-1)])
    }
    
    return $relativePath
}

Write-Host "Scanning for TypeScript and JavaScript files..." -ForegroundColor Yellow
# Get all TypeScript and JavaScript files in src and app directories
$sourceFiles = Get-ChildItem -Path 'src', 'app' -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
               Where-Object { $_.FullName -notmatch "node_modules" }

Write-Host "Found $($sourceFiles.Count) source files" -ForegroundColor Yellow
Write-Host ""

# Initialize counters and reporting arrays
$updatedFiles = @()
$skippedFiles = @()
$errorFiles = @()
$totalImportUpdates = 0
$filesWithoutUtilsImports = 0
$fileCount = 0
$progressActivity = "Updating imports in files"

foreach ($file in $sourceFiles) {
    $fileCount++
    Write-Progress -Activity $progressActivity -Status "Processing $($file.Name)" -PercentComplete (($fileCount / $sourceFiles.Count) * 100)
    
    try {
        $content = Get-Content -Path $file.FullName -Raw
        $originalContent = $content
        $modified = $false
        $importUpdatesInFile = 0
        
        foreach ($oldPath in $fileMapping.Keys) {
            $newPath = $fileMapping[$oldPath]
            
            # Create regex patterns to match various import statement formats
            $patterns = @(
                "from\s+[`"']\.\.\/src\/$oldPath[`"']",                           # from "../src/utils/someFile"
                "from\s+[`"']\.\.\/\.\.\/src\/$oldPath[`"']",                      # from "../../src/utils/someFile"
                "from\s+[`"']\.\.\/\.\.\/\.\.\/src\/$oldPath[`"']",                # from "../../../src/utils/someFile"
                "from\s+[`"']\.\.\/\.\.\/\.\.\/\.\.\/src\/$oldPath[`"']",          # from "../../../../src/utils/someFile"
                "from\s+[`"']\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/src\/$oldPath[`"']",    # from "../../../../../src/utils/someFile"
                "from\s+[`"']@\/src\/$oldPath[`"']",                              # from "@/src/utils/someFile" (if using path aliases)
                "from\s+[`"']\.\.\/utils\/$($oldPath -replace 'utils\/', '')[`"']", # from "../utils/someFile"
                "from\s+[`"']\.\.\/\.\.\/utils\/$($oldPath -replace 'utils\/', '')[`"']", # from "../../utils/someFile"
                "from\s+[`"']\.\.\/\.\.\/\.\.\/utils\/$($oldPath -replace 'utils\/', '')[`"']", # from "../../../utils/someFile"
                "from\s+[`"']\.\.\/\.\.\/\.\.\/\.\.\/utils\/$($oldPath -replace 'utils\/', '')[`"']", # from "../../../../utils/someFile"
                "from\s+[`"']\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/utils\/$($oldPath -replace 'utils\/', '')[`"']", # from "../../../../../utils/someFile"
                "require\([`"']\.\.\/src\/$oldPath[`"']\)",                         # require("../src/utils/someFile")
                "require\([`"']\.\.\/\.\.\/src\/$oldPath[`"']\)",                   # require("../../src/utils/someFile")
                "import\([`"']\.\.\/src\/$oldPath[`"']\)",                          # dynamic import("../src/utils/someFile")
                "import\([`"']\.\.\/\.\.\/src\/$oldPath[`"']\)"                     # dynamic import("../../src/utils/someFile")
            )
            
            foreach ($pattern in $patterns) {
                if ($content -match $pattern) {
                    # Extract the full match for debugging
                    $fullMatch = $Matches[0]
                    
                    # Determine if it's an ESM import, require, or dynamic import
                    $isRequire = $fullMatch -match "require\("
                    $isDynamicImport = $fullMatch -match "import\("
                    $isESMImport = -not ($isRequire -or $isDynamicImport)
                    
                    # Extract the quote type (single or double)
                    $quoteType = "'"
                    if ($fullMatch -match "`"") {
                        $quoteType = "`""
                    }
                    
                    # Begin building the replacement path
                    $replacementPath = ""
                    
                    # Handle different types of imports
                    if ($isESMImport) {
                        # ESM import: from "path"
                        if ($fullMatch -match "from\s+[`"'](.+?)[`"']") {
                            $importPath = $Matches[1]
                            
                            # Extract the relative path prefix (e.g., "../", "../../", etc.)
                            if ($importPath -match "((?:\.\.\/)+|@\/)") {
                                $relativePrefix = $Matches[1]
                                
                                # Handle path aliases like @/src/utils/file
                                if ($relativePrefix -eq "@/") {
                                    $replacementPath = "from ${quoteType}@/src/$newPath${quoteType}"
                                }
                                # Handle relative paths like ../src/utils/file
                                elseif ($importPath -match "((?:\.\.\/)+)src\/utils\/") {
                                    $relativePrefix = $Matches[1]
                                    $replacementPath = "from ${quoteType}${relativePrefix}src/$newPath${quoteType}"
                                }
                                # Handle paths like ../utils/file without src/
                                elseif ($importPath -match "((?:\.\.\/)+)utils\/") {
                                    $relativePrefix = $Matches[1]
                                    $fileNameWithoutExt = $oldPath -replace "utils\/", ""
                                    $newFileNameWithoutExt = $newPath -replace "utils\/", ""
                                    $replacementPath = "from ${quoteType}${relativePrefix}$newPath${quoteType}"
                                }
                            }
                        }
                    } 
                    elseif ($isRequire) {
                        # require("path")
                        if ($fullMatch -match "require\([`"'](.+?)[`"']\)") {
                            $importPath = $Matches[1]
                            
                            if ($importPath -match "((?:\.\.\/)+)src\/utils\/") {
                                $relativePrefix = $Matches[1]
                                $replacementPath = "require(${quoteType}${relativePrefix}src/$newPath${quoteType})"
                            }
                            elseif ($importPath -match "((?:\.\.\/)+)utils\/") {
                                $relativePrefix = $Matches[1]
                                $replacementPath = "require(${quoteType}${relativePrefix}$newPath${quoteType})"
                            }
                        }
                    }
                    elseif ($isDynamicImport) {
                        # import("path")
                        if ($fullMatch -match "import\([`"'](.+?)[`"']\)") {
                            $importPath = $Matches[1]
                            
                            if ($importPath -match "((?:\.\.\/)+)src\/utils\/") {
                                $relativePrefix = $Matches[1]
                                $replacementPath = "import(${quoteType}${relativePrefix}src/$newPath${quoteType})"
                            }
                            elseif ($importPath -match "((?:\.\.\/)+)utils\/") {
                                $relativePrefix = $Matches[1]
                                $replacementPath = "import(${quoteType}${relativePrefix}$newPath${quoteType})"
                            }
                        }
                    }
                    
                    # If we've built a valid replacement path, update the content
                    if ($replacementPath -ne "") {
                        $content = $content -replace [regex]::Escape($fullMatch), $replacementPath
                        $modified = $true
                        $importUpdatesInFile++
                        $totalImportUpdates++
                    }
                }
            }
        }
        
        # Update the file if changes were made
        if ($modified) {
            Set-Content -Path $file.FullName -Value $content
            $updatedFiles += $file.FullName
            Write-Host "✓ Updated $importUpdatesInFile imports in: $($file.FullName)" -ForegroundColor Green
        } else {
            $skippedFiles += $file.FullName
            $filesWithoutUtilsImports++
        }
    }
    catch {
        $errorFiles += @{
            File = $file.FullName
            Error = $_.Exception.Message
        }
        Write-Host "✗ Error processing $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Progress -Activity $progressActivity -Completed

# Print summary report
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "                   SUMMARY REPORT                      " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files processed: $($sourceFiles.Count)" -ForegroundColor White
Write-Host "Files updated: $($updatedFiles.Count)" -ForegroundColor Green
Write-Host "Files without utils imports: $filesWithoutUtilsImports" -ForegroundColor Yellow
Write-Host "Files with errors: $($errorFiles.Count)" -ForegroundColor $(if ($errorFiles.Count -gt 0) { "Red" } else { "Green" })
Write-Host "Total import paths updated: $totalImportUpdates" -ForegroundColor Cyan
Write-Host ""

# List error details if any
if ($errorFiles.Count -gt 0) {
    Write-Host "Error Details:" -ForegroundColor Red
    foreach ($errFile in $errorFiles) {
        Write-Host "  File: $($errFile.File)" -ForegroundColor Red
        Write-Host "  Error: $($errFile.Error)" -ForegroundColor Red
        Write-Host ""
    }
}

# Create a verification script to check if there are any remaining old import paths
$verificationScript = @"
# Verification Script for Utils Import Paths
# This script checks if there are any remaining old import paths after the main update

Write-Host "Verifying import paths..." -ForegroundColor Yellow

# Get all TypeScript and JavaScript files in src and app directories
`$sourceFiles = Get-ChildItem -Path 'src', 'app' -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
               Where-Object { `$_.FullName -notmatch "node_modules" }

# Define the old paths to look for
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

`$filesWithOldImports = @()

foreach (`$file in `$sourceFiles) {
    try {
        `$content = Get-Content -Path `$file.FullName -Raw
        `$hasOldImport = `$false
        
        foreach (`$oldPath in `$oldPaths) {
            if (`$content -match "from\s+[`"'].*`$oldPath[`"']" -or 
                `$content -match "require\([`"'].*`$oldPath[`"']\)" -or 
                `$content -match "import\([`"'].*`$oldPath[`"']\)") {
                `$hasOldImport = `$true
                `$filesWithOldImports += @{
                    File = `$file.FullName
                    OldPath = `$oldPath
                }
            }
        }
    }
    catch {
        Write-Host "Error scanning `$(`$file.FullName): `$(`$_.Exception.Message)" -ForegroundColor Red
    }
}

if (`$filesWithOldImports.Count -gt 0) {
    Write-Host "Found `$(`$filesWithOldImports.Count) files with old import paths:" -ForegroundColor Red
    
    `$groupedFiles = `$filesWithOldImports | Group-Object -Property File
    
    foreach (`$group in `$groupedFiles) {
        Write-Host "`n`$(`$group.Name):" -ForegroundColor Red
        foreach (`$item in `$group.Group) {
            Write-Host "  - `$(`$item.OldPath)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No old import paths found. All imports have been successfully updated!" -ForegroundColor Green
}
"@

Set-Content -Path "verify-utils-imports.ps1" -Value $verificationScript

Write-Host "Generated verification script: verify-utils-imports.ps1" -ForegroundColor Cyan
Write-Host "Run this script after the update to verify all imports have been updated correctly." -ForegroundColor Cyan
Write-Host ""
Write-Host "Import path update process completed!" -ForegroundColor Green
