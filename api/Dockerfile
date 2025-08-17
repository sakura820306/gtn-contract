FROM node:18-alpine

WORKDIR /app

# 複製 package 檔案
COPY package*.json ./
COPY yarn.lock ./

# 安裝依賴
RUN yarn install

# 複製原始碼
COPY . .

# 建置應用
RUN yarn build

# 暴露 API 端口
EXPOSE 3000

# 啟動應用
CMD ["yarn", "start:prod"]