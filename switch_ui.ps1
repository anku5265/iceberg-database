param(
    [Parameter(Mandatory=$false)]
    [string]$Version
)

if (-not $Version) {
    Write-Host "Usage: .\switch_ui.ps1 [1 | 2 | 3]" -ForegroundColor Yellow
    Write-Host "  1 = Main Original UI"
    Write-Host "  2 = Systems Console (Linear / Neon)"
    Write-Host "  3 = Modern Developer Studio UI"
    exit
}

switch ($Version) {
    "1" {
        Write-Host "Switching to UI 1 [Main Original UI]..." -ForegroundColor Cyan
        Copy-Item "d:\icebergdb\iceberg-landing\src\ui_versions\ui_1_original\HomePageNew.jsx" "d:\icebergdb\iceberg-landing\src\HomePageNew.jsx" -Force
        Write-Host "[SUCCESS] Switched to UI 1 (Main Original)." -ForegroundColor Green
    }
    "2" {
        Write-Host "Switching to UI 2 [Systems Console - Linear/Neon]..." -ForegroundColor Cyan
        Copy-Item "d:\icebergdb\iceberg-landing\src\ui_versions\ui_2_systems_console\HomePageNew.jsx" "d:\icebergdb\iceberg-landing\src\HomePageNew.jsx" -Force
        Write-Host "[SUCCESS] Switched to UI 2 (Systems Console)." -ForegroundColor Green
    }
    "3" {
        Write-Host "Switching to UI 3 [Modern Developer Studio]..." -ForegroundColor Cyan
        Copy-Item "d:\icebergdb\iceberg-landing\src\ui_versions\ui_3_developer_studio\HomePageNew.jsx" "d:\icebergdb\iceberg-landing\src\HomePageNew.jsx" -Force
        Write-Host "[SUCCESS] Switched to UI 3." -ForegroundColor Green
    }
    default {
        Write-Host "Invalid version: $Version. Please choose 1, 2, or 3." -ForegroundColor Red
    }
}
