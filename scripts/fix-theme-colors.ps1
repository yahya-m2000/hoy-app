# PowerShell script to fix theme color patterns in the mobile app
Write-Host "Starting theme color fixes..." -ForegroundColor Green

# Define the root directory for the mobile app
$rootPath = "C:\Users\Yahya\OneDrive\Documents\code_repo\hoy\mobile_app"

# Define exclusion patterns
$excludePatterns = @(
    "*\node_modules\*",
    "*\android\*",
    "*\ios\*",
    "*\.git\*",
    "*\build\*",
    "*\dist\*",
    "*\.expo\*",
    "*\scripts\*",
    "*.d.ts"
)

# Get all TypeScript and JavaScript files, excluding certain directories
$files = Get-ChildItem -Path $rootPath -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Where-Object {
    $file = $_
    $exclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($file.FullName -like $pattern) {
            $exclude = $true
            break
        }
    }
    return -not $exclude
}

Write-Host "Found $($files.Count) files to process" -ForegroundColor Yellow

$fixedFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    $replacements = 0
    
    # Fix theme.colors.primary[xxx] patterns (except [200] which goes to primaryPalette)
    $content = $content -replace 'theme\.colors\.primary\[([0-9]+)\]', {
        param($match)
        $number = $match.Groups[1].Value
        if ($number -eq "200") {
            $replacements++
            return "theme.colors.primaryPalette[200]"
        } else {
            $replacements++
            return "theme.colors.primary"
        }
    }
    
    # Fix theme.colors.secondary[xxx] patterns
    $content = $content -replace 'theme\.colors\.secondary\[([0-9]+)\]', {
        param($match)
        $number = $match.Groups[1].Value
        if ($number -eq "200") {
            $replacements++
            return "theme.colors.secondaryPalette[200]"
        } else {
            $replacements++
            return "theme.colors.secondary"
        }
    }
    
    # Fix theme.colors.accent[xxx] patterns
    $content = $content -replace 'theme\.colors\.accent\[([0-9]+)\]', {
        param($match)
        $number = $match.Groups[1].Value
        if ($number -eq "200") {
            $replacements++
            return "theme.colors.accentPalette[200]"
        } else {
            $replacements++
            return "theme.colors.accent"
        }
    }
    
    # Fix theme.colors.gray[xxx] patterns (these are correct, but let's handle edge cases)
    $content = $content -replace 'theme\.colors\.gray\[([0-9]+)\]', 'theme.colors.gray[$1]'
    
    # Fix theme.colors.red[xxx] patterns
    $content = $content -replace 'theme\.colors\.red\[([0-9]+)\]', 'theme.colors.red[$1]'
    
    # Fix theme.colors.green[xxx] patterns
    $content = $content -replace 'theme\.colors\.green\[([0-9]+)\]', 'theme.colors.green[$1]'
    
    # Fix theme.colors.blue[xxx] patterns
    $content = $content -replace 'theme\.colors\.blue\[([0-9]+)\]', 'theme.colors.blue[$1]'
    
    # Fix theme.colors.yellow[xxx] patterns
    $content = $content -replace 'theme\.colors\.yellow\[([0-9]+)\]', 'theme.colors.yellow[$1]'
    
    if ($content -ne $originalContent) {
        try {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $fixedFiles++
            $totalReplacements += $replacements
            $relativePath = $file.FullName.Replace($rootPath, "").TrimStart('\')
            Write-Host "Fixed $replacements pattern(s) in: $relativePath" -ForegroundColor Green
        }
        catch {
            Write-Host "Error writing to file: $($file.FullName)" -ForegroundColor Red
        }
    }
}

Write-Host "`nTheme color fix completed!" -ForegroundColor Green
Write-Host "Files processed: $($files.Count)" -ForegroundColor Yellow
Write-Host "Files modified: $fixedFiles" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Yellow

if ($fixedFiles -gt 0) {
    Write-Host "`nRunning TypeScript check to verify fixes..." -ForegroundColor Blue
    Set-Location $rootPath
    $tscResult = & npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "TypeScript check passed! All fixes are valid." -ForegroundColor Green
    } else {
        Write-Host "TypeScript check found issues. Please review:" -ForegroundColor Red
        Write-Host $tscResult
    }
}
