@echo off
REM Start Spring Boot backend in a new window
start "Backend" cmd /k "cd spring-boot-backend && mvn spring-boot:run"
REM Start Next.js frontend in a new window
start "Frontend" cmd /k "pnpm dev"
echo Both backend and frontend are starting...
pause
