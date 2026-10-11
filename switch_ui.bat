@echo off
set VERSION=%1

if "%VERSION%"=="" (
    echo Usage: switch_ui.bat [1 ^| 2 ^| 3 ^| 4]
    echo   1 = Main Original UI
    echo   2 = Systems Console (Linear / Neon)
    echo   3 = Developer Cloud Studio
    echo   4 = Enterprise Professional Startup (Stripe / Vercel style)
    exit /b
)

if "%VERSION%"=="1" (
    echo Switching to UI 1 [Main Original UI]...
    copy /Y "d:\icebergdb\iceberg-landing\src\ui_versions\ui_1_original\HomePageNew.jsx" "d:\icebergdb\iceberg-landing\src\HomePageNew.jsx"
    echo [SUCCESS] Switched to UI 1 (Main Original).
    exit /b
)

if "%VERSION%"=="2" (
    echo Switching to UI 2 [Systems Console - Linear/Neon]...
    copy /Y "d:\icebergdb\iceberg-landing\src\ui_versions\ui_2_systems_console\HomePageNew.jsx" "d:\icebergdb\iceberg-landing\src\HomePageNew.jsx"
    echo [SUCCESS] Switched to UI 2 (Systems Console).
    exit /b
)

if "%VERSION%"=="3" (
    echo Switching to UI 3 [Developer Cloud Studio]...
    copy /Y "d:\icebergdb\iceberg-landing\src\ui_versions\ui_3_developer_studio\HomePageNew.jsx" "d:\icebergdb\iceberg-landing\src\HomePageNew.jsx"
    echo [SUCCESS] Switched to UI 3 (Developer Studio).
    exit /b
)

if "%VERSION%"=="4" (
    echo Switching to UI 4 [Enterprise Professional Startup]...
    copy /Y "d:\icebergdb\iceberg-landing\src\ui_versions\ui_4_enterprise_professional\HomePageNew.jsx" "d:\icebergdb\iceberg-landing\src\HomePageNew.jsx"
    echo [SUCCESS] Switched to UI 4 (Enterprise Professional).
    exit /b
)

echo Invalid version number: %VERSION%. Use 1, 2, 3, or 4.
