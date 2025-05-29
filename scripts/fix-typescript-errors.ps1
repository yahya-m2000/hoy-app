# Fix TypeScript Import Errors
# This script specifically targets import errors found after the utils reorganization
# Run this after enhanced-utils-imports.ps1 if you encounter TypeScript import errors

$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "          TYPESCRIPT IMPORT ERROR FIXER                " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check for TypeScript errors
function Get-TypeScriptErrors {
    try {
        # Run TypeScript check and capture output
        $output = & npx tsc --noEmit 2>&1
        
        # Filter for import errors
        $importErrors = $output | Where-Object { 
            $_ -match "Cannot find module '(.+?)'" -or 
            $_ -match "Module '(.+?)' has no exported member" 
        }
        
        return $importErrors
    }
    catch {
        Write-Host "Error running TypeScript check: $_" -ForegroundColor Red
        return @()
    }
}

Write-Host "Checking for TypeScript import errors..." -ForegroundColor Yellow
$importErrors = Get-TypeScriptErrors

if ($importErrors.Count -eq 0) {
    Write-Host "No import errors found!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($importErrors.Count) potential import errors" -ForegroundColor Yellow
Write-Host ""

# Parse error messages and extract file paths and import issues
$filesToFix = @()

foreach ($error in $importErrors) {
    if ($error -match "(.+?)\((\d+),(\d+)\): error TS\d+: (Cannot find module '(.+?)'|Module '(.+?)' has no exported member '(.+?)')") {
        $filePath = $Matches[1]
        $lineNumber = [int]$Matches[2]
        $columnNumber = [int]$Matches[3]
        $errorMessage = $Matches[4]
        
        $modulePath = ""
        $exportMember = ""
        
        if ($errorMessage -match "Cannot find module '(.+?)'") {
            $modulePath = $Matches[1]
            $errorType = "ModuleNotFound"
        }
        elseif ($errorMessage -match "Module '(.+?)' has no exported member '(.+?)'") {
            $modulePath = $Matches[1]
            $exportMember = $Matches[2]
            $errorType = "ExportNotFound"
        }
        
        $filesToFix += @{
            FilePath = $filePath
            LineNumber = $lineNumber
            ColumnNumber = $columnNumber
            ErrorMessage = $errorMessage
            ModulePath = $modulePath
            ExportMember = $exportMember
            ErrorType = $errorType
        }
    }
}

# Process each error and try to fix it
$fixedFiles = @()
$unfixedErrors = @()

foreach ($file in $filesToFix) {
    Write-Host "Analyzing error in $($file.FilePath) at line $($file.LineNumber)" -ForegroundColor Yellow
    
    try {
        # Read the file content
        $content = Get-Content -Path $file.FilePath -Raw
        $contentLines = Get-Content -Path $file.FilePath
        $originalContent = $content
        $fixed = $false
        
        # Get the line with the error
        $errorLine = $contentLines[$file.LineNumber - 1]
        
        # Check the error type and fix accordingly
        if ($file.ErrorType -eq "ModuleNotFound") {
            $modulePath = $file.ModulePath
            
            # If the module path includes utils and isn't in the new structure
            if ($modulePath -match "(\.\.\/)+src\/utils\/([^\/]+)") {
                $utilModule = $Matches[2]
                
                # Map old module path to likely new location based on our known mapping
                $categoryMapping = @{
                    "coordinateValidation" = "validation"
                    "dataIntegrityCheck" = "validation"
                    "mongoUtils" = "validation"
                    "dateUtils" = "formatting"
                    "formatters" = "formatting"
                    "cacheBuster" = "network"
                    "networkRetry" = "network"
                    "clearUserData" = "storage"
                    "purgeUserData" = "storage"
                    "assetHelpers" = "asset"
                    "networkLogger" = "log"
                    "safeLogger" = "log"
                    "logger" = "log"
                    "errorHandlers" = "error"
                    "errorHandling" = "error"
                    "tokenDebug" = "error"
                    "rateLimiting" = "api"
                    "apiUtils" = "api"
                    "apiErrorHandler" = "api"
                    "apiRequestUtils" = "api"
                    "apiThrottling" = "api"
                    "propertySearchUtils" = "api"
                }
                
                # Try to determine the category
                $category = $categoryMapping[$utilModule]
                
                if ($category) {
                    # Extract the relative path part
                    $relativePathMatch = $modulePath -match "((?:\.\.\/)+)src\/utils\/"
                    $relativePath = if ($relativePathMatch) { $Matches[1] } else { "../" }
                    
                    # Build the new module path
                    $newModulePath = "$($relativePath)src/utils/$category/$utilModule"
                    
                    # Replace in the error line
                    $newErrorLine = $errorLine -replace [regex]::Escape($modulePath), $newModulePath
                    
                    # Update the content
                    $content = $content.Replace($errorLine, $newErrorLine)
                    $fixed = $true
                    
                    Write-Host "  Fixed import path: $modulePath -> $newModulePath" -ForegroundColor Green
                }
            }
        }
        elseif ($file.ErrorType -eq "ExportNotFound") {
            # This is trickier to fix automatically - we need to know which module actually exports the member
            Write-Host "  Unable to automatically fix missing export '$($file.ExportMember)' from module '$($file.ModulePath)'" -ForegroundColor Yellow
            Write-Host "  You may need to:"
            Write-Host "    1. Check if the export name is correct" -ForegroundColor Yellow
            Write-Host "    2. Ensure the module is exporting the member" -ForegroundColor Yellow
            Write-Host "    3. Consider importing from the main utils/index.ts if possible" -ForegroundColor Yellow
            
            $unfixedErrors += $file
        }
        
        # Save the file if fixed
        if ($fixed -and $content -ne $originalContent) {
            Set-Content -Path $file.FilePath -Value $content
            $fixedFiles += $file.FilePath
        }
    }
    catch {
        Write-Host "  Error processing $($file.FilePath): $_" -ForegroundColor Red
        $unfixedErrors += $file
    }
}

# Report results
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "                  RESULTS SUMMARY                      " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

if ($fixedFiles.Count -gt 0) {
    Write-Host "Fixed import errors in $($fixedFiles.Count) files:" -ForegroundColor Green
    $fixedFiles | Select-Object -Unique | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Green
    }
}

if ($unfixedErrors.Count -gt 0) {
    Write-Host "Unable to automatically fix $($unfixedErrors.Count) errors:" -ForegroundColor Yellow
    $unfixedErrors | ForEach-Object {
        Write-Host "  - $($_.FilePath): $($_.ErrorMessage)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Suggestions for fixing remaining errors:" -ForegroundColor Cyan
    Write-Host "1. Run 'npx tsc --noEmit' to see the current TypeScript errors" -ForegroundColor Cyan
    Write-Host "2. Open each file with errors and manually fix the imports" -ForegroundColor Cyan
    Write-Host "3. Consider importing from the main utils/index.ts which re-exports all utilities" -ForegroundColor Cyan
    Write-Host "4. Check if any modules need additional exports added to their index.ts files" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "TypeScript import error fixing process completed!" -ForegroundColor Cyan
