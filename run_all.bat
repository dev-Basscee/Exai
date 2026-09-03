@echo off
echo ====================================================================
echo        ExamPredict AI - Launching Backend and Frontend
echo ====================================================================
echo.
start "ExamPredict AI - Backend (FastAPI)" cmd /c "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
start "ExamPredict AI - Frontend (Vite PWA)" cmd /c "cd /d %~dp0frontend && npm.cmd run dev"

echo Backend starting on http://127.0.0.1:8000 (API docs at http://127.0.0.1:8000/docs)
echo Frontend starting on http://localhost:5173
echo.
echo Both servers have been launched in separate terminal windows.
pause
