@echo off
echo ========================================================
echo   Updating Full Chat History Archive from Gemini Logs...
echo ========================================================
python export_chat_history.py
echo.
echo Complete conversation history updated in:
echo   d:\icebergdb\FULL_CONVERSATION_CHAT_HISTORY.md
echo.
pause
