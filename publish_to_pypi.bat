@echo off
title Publish IcebergDB to PyPI
echo ===================================================
echo     Publishing icebergdb to PyPI (Official)
echo ===================================================
echo.
cd /d d:\icebergdb\iceberg-sdk-python

echo [1/3] Ensuring twine is installed...
pip install --upgrade twine build

echo [2/3] Building fresh wheel and source dist...
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
python setup.py sdist bdist_wheel

echo.
echo [3/3] Uploading to official PyPI...
echo (When prompted for Username: enter __token__)
echo (When prompted for Password: enter your PyPI API token pypi-...)
echo.
twine upload dist/*

echo.
echo ===================================================
echo   Done! Test globally with: pip install icebergdb
echo ===================================================
pause
