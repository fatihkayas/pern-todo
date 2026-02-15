FROM node:18-alpine
WORKDIR /app

# Sadece client package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Client kodunu kopyala
COPY . .

# Tarayıcı otomatik açılmasını devre dışı bırak
ENV BROWSER=none
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000
CMD ["npm", "start"]
