# Script to fix import paths after utils directory reorganization
# Run this in the mobile_app directory

$utilsDir = "src/utils"
$projectRootDir = Get-Location

# Files that stay in the root utils directory
$rootFiles = @("eventEmitter.ts", "mockData.ts", "index.ts")

# Create a mapping of file locations
$fileLocations = @{}
Get-ChildItem -Path "$utilsDir" -Recurse -Filter "*.ts" | ForEach-Object {
    $relativePath = $_.FullName.Replace($projectRootDir.ToString() + "\", "")
    $fileName = $_.Name
    $fileLocations[$fileName] = $relativePath
}

# Fix imports within the utils subdirectories - specifically for eventEmitter
$utilsFiles = Get-ChildItem -Path "$utilsDir/*" -Directory | ForEach-Object {
    Get-ChildItem -Path $_.FullName -Filter "*.ts"
}

foreach ($file in $utilsFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace imports for eventEmitter
    if ($content -match "import.*from\s+[`"']\.\.?\/.*eventEmitter[`"']") {
        $newContent = $content -replace "import\s+(.*)\s+from\s+[`"']\.\.?\/.*eventEmitter[`"']", "import `$1 from `"../../eventEmitter`""
        if ($content -ne $newContent) {
            Write-Host "Updating eventEmitter import in: $($file.FullName)"
            Set-Content -Path $file.FullName -Value $newContent
        }
    }
    
    # Replace imports for other known moved files
    if ($content -match "import.*from\s+[`"']\.\.?\/.*purgeUserData[`"']") {
        $newContent = $content -replace "import\s+(.*)\s+from\s+[`"']\.\.?\/.*purgeUserData[`"']", "import `$1 from `"../storage/purgeUserData`""
        if ($content -ne $newContent) {
            Write-Host "Updating purgeUserData import in: $($file.FullName)"
            Set-Content -Path $file.FullName -Value $newContent
        }
    }
}

Write-Host "Import path fixing completed."
