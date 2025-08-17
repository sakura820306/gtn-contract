@echo off
chcp 65001 >nul

echo 🛑 正在停止 GTN 區塊鏈猜數字遊戲系統...

REM 停止所有服務
echo 🔄 停止所有容器...
docker-compose down

REM 選擇性清理
set /p "cleanup=是否要清理 Docker 資源？(y/N): "

if /i "%cleanup%"=="y" (
    echo 🧹 清理 Docker 資源...
    
    REM 移除相關容器
    echo 📦 移除容器...
    docker-compose down --remove-orphans
    
    REM 移除相關映像檔（可選）
    set /p "remove_images=是否要移除相關映像檔？(y/N): "
    if /i "%remove_images%"=="y" (
        echo 🗑️ 移除映像檔...
        docker-compose down --rmi all
    )
    
    REM 移除未使用的網路
    echo 🌐 清理未使用的網路...
    docker network prune -f
    
    REM 移除未使用的卷
    set /p "remove_volumes=是否要移除未使用的卷（會清除資料庫資料）？(y/N): "
    if /i "%remove_volumes%"=="y" (
        echo 💾 移除未使用的卷...
        docker volume prune -f
        echo ⚠️ 資料庫資料已被清除
    )
    
    echo ✅ 清理完成
) else (
    echo ℹ️ 僅停止服務，未清理資源
)

echo.
echo ✅ GTN 系統已停止
echo.
echo 🔄 要重新啟動系統，請執行：
echo    start.bat

pause