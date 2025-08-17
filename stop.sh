#!/bin/bash

echo "🛑 正在停止 GTN 區塊鏈猜數字遊戲系統..."

# 停止所有服務
echo "🔄 停止所有容器..."
docker-compose down

# 選擇性清理
read -p "是否要清理 Docker 資源？(y/N): " cleanup

if [[ $cleanup =~ ^[Yy]$ ]]; then
    echo "🧹 清理 Docker 資源..."
    
    # 移除相關容器
    echo "📦 移除容器..."
    docker-compose down --remove-orphans
    
    # 移除相關映像檔（可選）
    read -p "是否要移除相關映像檔？(y/N): " remove_images
    if [[ $remove_images =~ ^[Yy]$ ]]; then
        echo "🗑️ 移除映像檔..."
        docker-compose down --rmi all
    fi
    
    # 移除未使用的網路
    echo "🌐 清理未使用的網路..."
    docker network prune -f
    
    # 移除未使用的卷
    read -p "是否要移除未使用的卷（會清除資料庫資料）？(y/N): " remove_volumes
    if [[ $remove_volumes =~ ^[Yy]$ ]]; then
        echo "💾 移除未使用的卷..."
        docker volume prune -f
        echo "⚠️ 資料庫資料已被清除"
    fi
    
    echo "✅ 清理完成"
else
    echo "ℹ️ 僅停止服務，未清理資源"
fi

echo ""
echo "✅ GTN 系統已停止"
echo ""
echo "🔄 要重新啟動系統，請執行："
echo "   ./start.sh"