# Fix specific remaining imports
# This script targets the files that still have old import paths

Write-Host "Fixing specific remaining imports..." -ForegroundColor Yellow

# Define the specific files and their import corrections
$importCorrections = @(
    @{
        FilePath = "src\services\chatService.ts"
        OldImport = "import { logger } from `"../utils/networkLogger`";"
        NewImport = "import { logger } from `"../utils/log/networkLogger`";"
    },
    @{
        FilePath = "src\services\chatService.ts"
        OldImport = "import * as safeLogger from `"../utils/safeLogger`";"
        NewImport = "import * as safeLogger from `"../utils/log/safeLogger`";"
    },
    @{
        FilePath = "src\services\chatService.ts"
        OldImport = "} from `"../utils/rateLimiting`";"
        NewImport = "} from `"../utils/api/rateLimiting`";"
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
    },
    @{
        FilePath = "app\(screens)\Results.tsx"
        OldImport = "import { formatCoordinateParams } from `"../../src/utils/coordinateValidation`";"
        NewImport = "import { formatCoordinateParams } from `"../../src/utils/validation/coordinateValidation`";"
    }
)

foreach ($correction in $importCorrections) {
    $fullPath = Join-Path -Path $pwd -ChildPath $correction.FilePath
    
    if (Test-Path -Path $fullPath) {
        Write-Host "Processing $($correction.FilePath)..." -NoNewline
        
        try {
            $content = Get-Content -Path $fullPath -Raw -ErrorAction Stop
            
            if ($content -match [regex]::Escape($correction.OldImport)) {
                $content = $content -replace [regex]::Escape($correction.OldImport), $correction.NewImport
                Set-Content -Path $fullPath -Value $content -ErrorAction Stop
                Write-Host " Updated!" -ForegroundColor Green
            } else {
                Write-Host " Import not found." -ForegroundColor Yellow
            }
        } catch {
            Write-Host " Error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "File not found: $($correction.FilePath)" -ForegroundColor Red
    }
}

Write-Host "Specific import fixing completed." -ForegroundColor Cyan
