# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Копируем nginx конфиг с поддержкой HTTP и HTTPS
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем 80 и 443 порты
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
