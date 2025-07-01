# Используем официальный образ Node.js
FROM node:18-alpine

# Создаем директорию приложения
WORKDIR /usr/src/app

# Копируем файлы зависимостей
COPY package*.json .

# Устанавливаем зависимости
RUN npm install --production

# Копируем исходный код
COPY . .

# Открываем порт прокси
EXPOSE 8080

# Переменные окружения по умолчанию
ENV PORT=8080
ENV TARGET=http://example.com

# Запускаем приложение
CMD ["npm", "start"]