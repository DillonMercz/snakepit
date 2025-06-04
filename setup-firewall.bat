@echo off
echo Setting up Windows Firewall rules for SnakePit multiplayer...
echo.

REM Add firewall rules for Node.js server (port 3001)
echo Adding firewall rule for Node.js server (port 3001)...
netsh advfirewall firewall add rule name="SnakePit Server - Port 3001" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="SnakePit Server - Port 3001 OUT" dir=out action=allow protocol=TCP localport=3001

REM Add firewall rules for React dev server (port 3000)
echo Adding firewall rule for React dev server (port 3000)...
netsh advfirewall firewall add rule name="SnakePit Client - Port 3000" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="SnakePit Client - Port 3000 OUT" dir=out action=allow protocol=TCP localport=3000

REM Allow Node.js executable
echo Adding firewall rule for Node.js executable...
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="%ProgramFiles%\nodejs\node.exe"
netsh advfirewall firewall add rule name="Node.js (x86)" dir=in action=allow program="%ProgramFiles(x86)%\nodejs\node.exe"

echo.
echo Firewall rules added successfully!
echo.
echo You can now access the game from other devices on your network:
echo   Game Client: http://192.168.1.81:3000
echo   Server API:  http://192.168.1.81:3001
echo.
pause
