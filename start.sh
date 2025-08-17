#!/bin/bash

echo "🚀 開始啟動 GTN 區塊鏈猜數字遊戲系統..."

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未運行！請先啟動 Docker"
    exit 1
fi

# 建立必要的網路
echo "🌐 建立 Docker 網路..."
if ! docker network ls | grep -q postchain-mainnet; then
    docker network create --driver=bridge --subnet=172.31.0.0/24 postchain-mainnet
    echo "✅ 建立 postchain-mainnet 網路"
else
    echo "ℹ️ postchain-mainnet 網路已存在"
fi

# 停止並清理現有容器
echo "🛑 清理現有容器..."
docker-compose down --remove-orphans

# 強制移除可能的衝突容器
echo "🧹 強制清理衝突容器..."
docker rm -f gtn-api gtn-blockchain-node gtn-node0-db gtn-node1-db gtn-node2-db gtn-node3-db gtn-frontend gtn-nginx 2>/dev/null || true

# 清理可能的衝突網路
echo "🌐 清理衝突網路..."
docker network rm api_gtn-network frontend_gtn-network gtn-contract_gtn-network 2>/dev/null || true

# 建置並啟動所有服務
echo "🔨 建置並啟動所有服務..."
docker-compose up -d --build

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 20

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
docker-compose ps

echo ""
echo "🎉 系統啟動完成！"
echo ""
echo "📱 前端應用: http://localhost"
echo "🔗 API 服務: http://localhost:3000"
echo "📊 API 文檔: http://localhost:3000/apidoc"
echo "⛓️ 區塊鏈節點: http://localhost:7731"
echo ""
echo "📝 使用以下指令查看日誌:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🛑 使用以下指令停止系統:"
echo "   ./stop.sh 或 docker-compose down"