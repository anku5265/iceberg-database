@echo off
title Publish IcebergDB to NPM
echo ===================================================
echo     Publishing icebergdb to NPM (Official)
echo ===================================================
echo.
cd /d d:\icebergdb\iceberg-sdk-js

echo [1/2] Building TypeScript distribution...
call npx tsc

echo.
echo [2/2] Publishing to npm registry...
call npm publish --access public

echo.
echo ===================================================
echo   Done! Test globally with: npm install icebergdb
echo ===================================================
pause
