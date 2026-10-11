@echo off
echo ============================================================
echo Restoring Original Main Iceberg Website UI...
echo ============================================================

copy /Y "d:\icebergdb\iceberg-landing\src\original_main_ui_backup\HomePageNew.original.jsx" "d:\icebergdb\iceberg-landing\src\HomePageNew.jsx"
copy /Y "d:\icebergdb\iceberg-landing\src\original_main_ui_backup\App.original.jsx" "d:\icebergdb\iceberg-landing\src\App.jsx"
copy /Y "d:\icebergdb\iceberg-landing\src\original_main_ui_backup\index.original.css" "d:\icebergdb\iceberg-landing\src\index.css"

echo.
echo [SUCCESS] Original Main UI has been completely restored!
echo Vite HMR will update your browser immediately.
pause
