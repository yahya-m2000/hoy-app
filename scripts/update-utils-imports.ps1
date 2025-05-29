# Update Utils Import Paths
# This script will update all imports across the codebase to use the new utils structure
# Run this from the root of the mobile_app directory

# Mapping of old file paths to their new paths in the utils structure
$fileMapping = @{
    "utils/coordinateValidation.ts" = "utils/validation/coordinateValidation.ts"
    "utils/dateUtils.ts" = "utils/formatting/dateUtils.ts"
    "utils/formatters.ts" = "utils/formatting/formatters.ts"
    "utils/cacheBuster.ts" = "utils/network/cacheBuster.ts"
    "utils/clearUserData.ts" = "utils/storage/clearUserData.ts"
    "utils/purgeUserData.ts" = "utils/storage/purgeUserData.ts"
    "utils/assetHelpers.ts" = "utils/asset/assetHelpers.ts"
    "utils/networkLogger.ts" = "utils/log/networkLogger.ts"
    "utils/safeLogger.ts" = "utils/log/safeLogger.ts"
    "utils/dataIntegrityCheck.ts" = "utils/validation/dataIntegrityCheck.ts"
    "utils/errorHandlers.ts" = "utils/error/errorHandlers.ts"
    "utils/networkRetry.ts" = "utils/network/networkRetry.ts"
    "utils/errorHandling.ts" = "utils/error/errorHandling.ts"
    "utils/rateLimiting.ts" = "utils/api/rateLimiting.ts"
    "utils/logger.ts" = "utils/log/logger.ts"
    "utils/mongoUtils.ts" = "utils/validation/mongoUtils.ts"
}

# Get all TypeScript files in src and app directories
$tsFiles = Get-ChildItem -Path 'src', 'app' -Recurse -Include "*.ts", "*.tsx"

$updatedFiles = 0
$totalUpdates = 0

foreach ($file in $tsFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    $modified = $false

    foreach ($oldPath in $fileMapping.Keys) {
        $newPath = $fileMapping[$oldPath]
        
        # Create regex patterns to match import statements
        $patterns = @(
            "from\s+[`"']\.\.\/src\/$oldPath[`"']",           # from "../src/utils/someFile"
            "from\s+[`"']\.\.\/\.\.\/src\/$oldPath[`"']",      # from "../../src/utils/someFile"
            "from\s+[`"']\.\.\/\.\.\/\.\.\/src\/$oldPath[`"']", # from "../../../src/utils/someFile"
            "from\s+[`"']\.\.\/\.\.\/\.\.\/\.\.\/src\/$oldPath[`"']", # from "../../../../src/utils/someFile"
            "from\s+[`"']\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/src\/$oldPath[`"']", # from "../../../../../src/utils/someFile"
            "from\s+[`"']\.\.\/utils\/$($oldPath -replace 'utils\/', '')[`"']", # from "../utils/someFile"
            "from\s+[`"']\.\.\/\.\.\/utils\/$($oldPath -replace 'utils\/', '')[`"']" # from "../../utils/someFile"
        )
        
        foreach ($pattern in $patterns) {
            if ($content -match $pattern) {
                Write-Host "Found match in $($file.FullName) for pattern: $pattern"
                
                # Calculate the appropriate replacement paths
                $relativePrefix = $Matches[0] -replace "from\s+[`"'](\.\.\/)+", ""
                $relativePrefix = $relativePrefix -replace "src\/utils\/.*?[`"']", ""
                $relativePrefix = $relativePrefix -replace "utils\/.*?[`"']", ""
                $relativePrefix = $Matches[0] -replace $relativePrefix, ""
                $relativePrefix = $relativePrefix -replace "from\s+[`"']", ""
                
                # Adjust the new path based on the relative path
                $newPathReplacement = $newPath -replace "utils/", ""
                $replacementPath = "$($relativePrefix)src/$newPath"
                
                # Handle the case of just "../utils/file" to "../utils/category/file"
                if ($pattern -match "\.\.\/utils\/") {
                    $categoryDir = ($newPath -split "/")[1]  # e.g., "validation" from "utils/validation/coordinateValidation.ts"
                    $fileName = ($newPath -split "/")[2]     # e.g., "coordinateValidation.ts"
                    $replacementPath = $Matches[0] -replace "\/[^\/`"']+[`"']", "/$categoryDir/$fileName`""
                }
                
                # Handle the case of "../../utils/file" to "../../utils/category/file"
                if ($pattern -match "\.\.\/\.\.\/utils\/") {
                    $categoryDir = ($newPath -split "/")[1]  # e.g., "validation" from "utils/validation/coordinateValidation.ts"
                    $fileName = ($newPath -split "/")[2]     # e.g., "coordinateValidation.ts"
                    $replacementPath = $Matches[0] -replace "\/[^\/`"']+[`"']", "/$categoryDir/$fileName`""
                }
                
                # Update the content with the new path
                $oldImport = $Matches[0]
                $content = $content -replace [regex]::Escape($oldImport), $replacementPath
                $modified = $true
                
                Write-Host "  Updated to: $replacementPath"
                $totalUpdates++
            }
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated file: $($file.FullName)" -ForegroundColor Green
        $updatedFiles++
    }
}

Write-Host "Successfully updated $updatedFiles files with $totalUpdates total import path updates." -ForegroundColor Cyan
