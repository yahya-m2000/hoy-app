# Check for safeLogger import issues
# This script specifically checks for incorrect safeLogger imports

Write-Host "Checking for safeLogger import issues..." -ForegroundColor Yellow

# Pattern to match incorrect safeLogger imports
$patterns = @(
    "from\s+[`"'].*utils\/safeLogger[`"']",
    "from\s+[`"'].*utils\/api\/safeLogger[`"']"
)

# Get all source files
$sourceFiles = Get-ChildItem -Path 'src' -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | 
               Where-Object { $_.FullName -notmatch "node_modules" }

$filesWithIssues = @()

foreach ($file in $sourceFiles) {
    $content = Get-Content -Path $file.FullName -ErrorAction SilentlyContinue
    
    if ($null -eq $content) {
        continue
    }

    $contentAsString = $content -join "`n"
    $hasIssue = $false
    
    foreach ($pattern in $patterns) {
        if ($contentAsString -match $pattern) {
            $hasIssue = $true
            $issue = $Matches[0]
            Write-Host "Found issue in $($file.FullName): $issue" -ForegroundColor Red
            break
        }
    }
    
    if ($hasIssue) {
        $filesWithIssues += $file.FullName
    }
}

if ($filesWithIssues.Count -eq 0) {
    Write-Host "No safeLogger import issues found!" -ForegroundColor Green
} else {
    Write-Host "Found $($filesWithIssues.Count) files with safeLogger import issues." -ForegroundColor Red
    Write-Host "To fix these issues, update the imports to use '../utils/log/safeLogger'" -ForegroundColor Yellow
}
