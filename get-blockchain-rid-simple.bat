@echo off
chcp 65001 >nul

echo 🔍 正在取得 Blockchain RID...

REM 等待區塊鏈服務啟動
echo ⏳ 等待區塊鏈服務啟動...
timeout /t 30 >nul

echo 🔄 嘗試取得 RID...

REM 取得 RID 並存到臨時檔案
docker logs gtn-blockchain-node 2>&1 | findstr "blockchain_rid:" > temp_rid.txt

REM 檢查是否有找到 RID
if not exist temp_rid.txt (
    echo ❌ 無法取得 Blockchain RID
    docker logs gtn-blockchain-node --tail 20
    pause
    exit /b 1
)

REM 從檔案讀取 RID
for /f "tokens=2" %%i in (temp_rid.txt) do set RID=%%i

REM 清理臨時檔案
del temp_rid.txt

if "%RID%"=="" (
    echo ❌ RID 為空，請檢查區塊鏈服務
    pause
    exit /b 1
)

echo ✅ 成功取得 Blockchain RID: %RID%

REM 更新 .env.dev 檔案
echo 📝 更新 .env.dev 檔案...

REM 建立新的 .env.dev 內容
(
echo SERVER_PORT=3000
echo SERVER_API_URL=http://localhost
echo.
echo BLOCLCHAIN_API_URL=http://localhost:7731
echo BLOCKCHAIN_RID=%RID%
echo.
echo SIGNER_TOKEN=a0fa9d45ef
echo SIGNER_PRIVKEY=5eb07b525c99c50e4d5ba60a5ee61ce9495709efbf59b129eef6b17ca5a831fc
echo SIGNER_PUBKEY=0244a3d7f307dc280535275141bb43f8e2628db0962feadaabc722cc5ad08e9075
echo.
echo.
) > api/.env.dev

echo ✅ 已更新 api/.env.dev
echo 📄 檔案內容：
type api/.env.dev

echo 🎉 Blockchain RID 設定完成！