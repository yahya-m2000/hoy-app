# Layout Analysis and Cleanup Script
# This script helps identify and fix common issues in Expo Router layouts

# Function to find all layout files in the app directory
function Find-LayoutFiles {
    param (
        [string]$rootDir = "app"
    )
    
    Write-Host "Finding layout files in $rootDir..." -ForegroundColor Cyan
    $layoutFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "_layout.tsx" 
    Write-Host "Found $($layoutFiles.Count) layout files." -ForegroundColor Green
    
    return $layoutFiles
}

# Function to analyze layout file for common issues
function Analyze-LayoutFile {
    param (
        [string]$filePath
    )
    
    Write-Host "Analyzing layout file: $filePath" -ForegroundColor Yellow
    $content = Get-Content $filePath -Raw
    
    $issues = @()
    
    # Check for default export
    if (-not ($content -match "export default")) {
        $issues += "Missing default export"
    }
    
    # Check for Stack.Screen elements inside Stack component
    if ($content -match "<Stack" -and -not ($content -match "<Stack\.Screen")) {
        $issues += "Stack component without Stack.Screen children"
    }
    
    # Check for direct Text elements without proper Text component
    if ($content -match '"\s*\{' -and -not ($content -match '<Text')) {
        $issues += "Possible text outside of Text component"
    }
    
    # Return results
    if ($issues.Count -gt 0) {
        Write-Host "  Issues found:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "    - $issue" -ForegroundColor Red
        }
    } else {
        Write-Host "  No issues found." -ForegroundColor Green
    }
    
    return @{
        FilePath = $filePath
        Issues = $issues
    }
}

# Main execution
$layoutFiles = Find-LayoutFiles
$results = @()

foreach ($file in $layoutFiles) {
    $results += Analyze-LayoutFile -filePath $file.FullName
}

# Summary
Write-Host "`nSummary:" -ForegroundColor Cyan
$filesWithIssues = $results | Where-Object { $_.Issues.Count -gt 0 }
Write-Host "$($filesWithIssues.Count) files with issues out of $($results.Count) total layout files." -ForegroundColor $(if ($filesWithIssues.Count -gt 0) { "Yellow" } else { "Green" })

if ($filesWithIssues.Count -gt 0) {
    Write-Host "`nFiles needing attention:" -ForegroundColor Yellow
    foreach ($result in $filesWithIssues) {
        Write-Host "  $($result.FilePath)" -ForegroundColor Yellow
    }
}

Write-Host "`nTo fix layout issues:"
Write-Host "1. Make sure all layout files export a default component"
Write-Host "2. For each Stack component, include appropriate Stack.Screen children"
Write-Host "3. Make sure all text strings are wrapped in <Text> components"
Write-Host "4. Refer to Expo Router documentation for proper layout structure"
