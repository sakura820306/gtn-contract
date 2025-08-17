FROM python:3.10-slim

WORKDIR /app

# 複製 requirements 檔案
COPY requirements.txt .

# 安裝依賴
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用程式檔案
COPY . .

# 暴露 Streamlit 預設端口
EXPOSE 8501

# 啟動 Streamlit 應用
CMD ["streamlit", "run", "guess_game_frontend.py", "--server.port=8501", "--server.address=0.0.0.0", "--server.headless=true"]