Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Restoring Original Main Iceberg Website UI..." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

Copy-Item "d:\icebergdb\iceberg-landing\src\original_main_ui_backup\HomePageNew.original.jsx" "d:\icebergdb\iceberg-landing\src\HomePageNew.jsx" -Force
Copy-Item "d:\icebergdb\iceberg-landing\src\original_main_ui_backup\App.original.jsx" "d:\icebergdb\iceberg-landing\src\App.jsx" -Force
Copy-Item "d:\icebergdb\iceberg-landing\src\original_main_ui_backup\index.original.css" "d:\icebergdb\iceberg-landing\src\index.css" -Force

Write-Host "`n[SUCCESS] Original Main UI has been completely restored!" -ForegroundColor Green
Write-Host "Vite HMR will update your browser immediately." -ForegroundColor Green
