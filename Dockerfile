FROM nginx:alpine
WORKDIR /app

#COPY dist/ .
COPY dist .

COPY package.json .
COPY vite.config.ts .
COPY yarn.lock .

COPY config.js .
COPY .env.production .

COPY nginx.conf /etc/nginx/nginx.conf