# Verification Script
# Checks for any remaining old import paths

Write-Host "Checking for remaining old imports..." -ForegroundColor Yellow

# Define the old paths to check for
$oldPaths = @(
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
$sourceFiles = Get-ChildItem -Path 'src', 'app' -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
               Where-Object { $_.FullName -notmatch "node_modules" }

$filesWithOldImports = @()

foreach ($file in $sourceFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    foreach ($oldPath in $oldPaths) {
        if ($content -match "from\s+[`"'].*$oldPath[`"']") {
            $filesWithOldImports += $file.FullName
            Write-Host "Found old import in $($file.FullName): $oldPath" -ForegroundColor Red
            break
        }
    }
}

if ($filesWithOldImports.Count -eq 0) {
    Write-Host "No old imports found! All paths have been updated." -ForegroundColor Green
} else {
    Write-Host "Found $($filesWithOldImports.Count) files with old imports." -ForegroundColor Red
}
