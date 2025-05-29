# Fix Case Mismatch Issue
# This script fixes the case mismatch issue in the index.ts file

Write-Host "Fixing case mismatch issue..." -ForegroundColor Yellow

$indexPath = Join-Path -Path $pwd -ChildPath "index.ts"

if (Test-Path -Path $indexPath) {
    try {
        $content = Get-Content -Path $indexPath -Raw -ErrorAction Stop
        
        # Update the import to use lowercase 'app' instead of 'App'
        if ($content -match "import App from `"./App`";") {
            $newContent = $content -replace "import App from `"./App`";", "import App from `"./app`";"
            Set-Content -Path $indexPath -Value $newContent -ErrorAction Stop
            Write-Host "Fixed App import in index.ts" -ForegroundColor Green
        } else {
            Write-Host "App import not found in index.ts" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Error updating index.ts: $_" -ForegroundColor Red
    }
} else {
    Write-Host "index.ts file not found" -ForegroundColor Red
}

Write-Host "Case mismatch fixing completed." -ForegroundColor Cyan
