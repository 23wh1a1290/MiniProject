@echo off
REM Start Spring Boot backend
start cmd /k "cd spring-boot-backend && mvn spring-boot:run"
REM Start frontend
start cmd /k "pnpm dev"
echo Both backend and frontend are starting...
pause