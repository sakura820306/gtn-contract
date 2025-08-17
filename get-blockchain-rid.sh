#!/bin/bash

echo "🔍 正在取得 Blockchain RID..."

# 等待區塊鏈服務啟動
echo "⏳ 等待區塊鏈服務啟動..."
sleep 30

# 從 docker logs 中取得 RID
RID=""
for i in {1..10}; do
    echo "🔄 嘗試第 $i 次取得 RID..."
    
    # 檢查 blockchain-node 容器日誌
    RID=$(docker logs gtn-blockchain-node 2>&1 | grep -oE "blockchain_rid: [A-F0-9]{64}" | head -1 | cut -d' ' -f2)
    
    if [ ! -z "$RID" ]; then
        echo "✅ 成功取得 Blockchain RID: $RID"
        break
    fi
    
    # 如果沒找到，等待 10 秒再試
    echo "⏳ 等待 10 秒後重試..."
    sleep 10
done

if [ -z "$RID" ]; then
    echo "❌ 無法取得 Blockchain RID，請檢查區塊鏈服務狀態"
    echo "📋 顯示 blockchain-node 日誌："
    docker logs gtn-blockchain-node --tail 50
    exit 1
fi

# 更新 .env.dev 檔案
ENV_FILE="./api/.env.dev"
if [ -f "$ENV_FILE" ]; then
    # 使用 sed 更新 BLOCKCHAIN_RID
    if grep -q "BLOCKCHAIN_RID=" "$ENV_FILE"; then
        sed -i "s/BLOCKCHAIN_RID=.*/BLOCKCHAIN_RID=$RID/" "$ENV_FILE"
        echo "✅ 已更新 $ENV_FILE 中的 BLOCKCHAIN_RID"
    else
        echo "BLOCKCHAIN_RID=$RID" >> "$ENV_FILE"
        echo "✅ 已新增 BLOCKCHAIN_RID 到 $ENV_FILE"
    fi
    
    echo "📄 更新後的 .env.dev 內容："
    cat "$ENV_FILE"
else
    echo "❌ 找不到 $ENV_FILE 檔案"
    exit 1
fi

echo "🎉 Blockchain RID 設定完成！"