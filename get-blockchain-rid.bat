@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🔍 正在取得 Blockchain RID...

REM 等待區塊鏈服務啟動
echo ⏳ 等待區塊鏈服務啟動...
timeout /t 30 >nul

REM 從 docker logs 中取得 RID
set "RID="
for /L %%i in (1,1,10) do (
    echo 🔄 嘗試第 %%i 次取得 RID...
    
    REM 檢查 blockchain-node 容器日誌
    for /f "tokens=2 delims= " %%a in ('docker logs gtn-blockchain-node 2^>^&1 ^| findstr "blockchain_rid:"') do (
        set "RID=%%a"
        goto :found
    )
    
    REM 如果沒找到，等待 10 秒再試
    echo ⏳ 等待 10 秒後重試...
    timeout /t 10 >nul
)

:found
if "!RID!"=="" (
    echo ❌ 無法取得 Blockchain RID，請檢查區塊鏈服務狀態
    echo 📋 顯示 blockchain-node 日誌：
    docker logs gtn-blockchain-node --tail 50
    pause
    exit /b 1
)

echo ✅ 成功取得 Blockchain RID: !RID!

REM 更新 .env.dev 檔案
set "ENV_FILE=./api/.env.dev"
if exist "%ENV_FILE%" (
    REM 建立臨時檔案
    set "TEMP_FILE=%TEMP%\env_temp.txt"
    
    REM 讀取並更新檔案
    (
        for /f "usebackq delims=" %%a in ("%ENV_FILE%") do (
            set "line=%%a"
            if "!line:~0,14!"=="BLOCKCHAIN_RID" (
                echo BLOCKCHAIN_RID=!RID!
            ) else (
                echo !line!
            )
        )
    ) > "!TEMP_FILE!"
    
    REM 檢查是否已經有 BLOCKCHAIN_RID 行
    findstr /c:"BLOCKCHAIN_RID=" "%ENV_FILE%" >nul
    if errorlevel 1 (
        echo BLOCKCHAIN_RID=!RID! >> "!TEMP_FILE!"
    )
    
    REM 覆蓋原檔案
    move "!TEMP_FILE!" "%ENV_FILE%" >nul
    
    echo ✅ 已更新 %ENV_FILE% 中的 BLOCKCHAIN_RID
    echo 📄 更新後的 .env.dev 內容：
    type "%ENV_FILE%"
) else (
    echo ❌ 找不到 %ENV_FILE% 檔案
    pause
    exit /b 1
)

echo 🎉 Blockchain RID 設定完成！