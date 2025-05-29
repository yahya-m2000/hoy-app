# Fix specific import paths for screens
# This script targets specific problematic files like results.tsx

# Define the files and their import corrections
$importCorrections = @(
    @{
        FilePath = "app\(screens)\results.tsx"
        OldImport = "import { formatCoordinateParams } from `"../../src/utils/coordinateValidation`";"
        NewImport = "import { formatCoordinateParams } from `"../../src/utils/validation/coordinateValidation`";"
    },
    @{
        FilePath = "app\(modals)\ReservationModal.tsx"
        OldImport = "import { formatCurrency } from `"../../src/utils/formatters`";"
        NewImport = "import { formatCurrency } from `"../../src/utils/formatting/formatters`";"
    },
    @{
        FilePath = "app\(screens)\FixAccountDataScreen.tsx"
        OldImport = "import { resetAllAppData } from `"../../src/utils/cacheBuster`";"
        NewImport = "import { resetAllAppData } from `"../../src/utils/network/cacheBuster`";"
    },
    @{
        FilePath = "app\traveler\account.tsx"
        OldImport = "import { showCleanSlateAlert } from `"../../src/utils/cacheBuster`";"
        NewImport = "import { showCleanSlateAlert } from `"../../src/utils/network/cacheBuster`";"
    },
    @{
        FilePath = "app\host\settings.tsx"
        OldImport = "import { showCleanSlateAlert } from `"../../src/utils/cacheBuster`";"
        NewImport = "import { showCleanSlateAlert } from `"../../src/utils/network/cacheBuster`";"
    }
)

foreach ($correction in $importCorrections) {
    $fullPath = Join-Path -Path $pwd -ChildPath $correction.FilePath
    
    if (Test-Path -Path $fullPath) {
        $content = Get-Content -Path $fullPath -Raw
        
        if ($content -match [regex]::Escape($correction.OldImport)) {
            $content = $content -replace [regex]::Escape($correction.OldImport), $correction.NewImport
            Set-Content -Path $fullPath -Value $content
            Write-Host "Updated import in $($correction.FilePath)" -ForegroundColor Green
        } else {
            Write-Host "Import not found in $($correction.FilePath)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "File not found: $($correction.FilePath)" -ForegroundColor Red
    }
}

# Now let's specifically fix imports for the results.tsx file
$resultsFilePath = Join-Path -Path $pwd -ChildPath "app\(screens)\results.tsx"

if (Test-Path -Path $resultsFilePath) {
    Write-Host "Found results.tsx file, checking for imports..." -ForegroundColor Cyan
    
    $content = Get-Content -Path $resultsFilePath -Raw
    $originalContent = $content
    
    # Update the coordinate validation import
    $oldImport = "import { formatCoordinateParams } from `"../../src/utils/coordinateValidation`";"
    $newImport = "import { formatCoordinateParams } from `"../../src/utils/validation/coordinateValidation`";"
    
    $content = $content -replace [regex]::Escape($oldImport), $newImport
    
    if ($content -ne $originalContent) {
        Set-Content -Path $resultsFilePath -Value $content
        Write-Host "Successfully updated results.tsx imports" -ForegroundColor Green
    } else {
        Write-Host "No changes needed for results.tsx" -ForegroundColor Yellow
    }
} else {
    Write-Host "results.tsx file not found" -ForegroundColor Red
}

Write-Host "Import path fixing completed." -ForegroundColor Cyan
