FROM nginx:alpine
WORKDIR /app
#COPY dist/ .
COPY v5/dist .
COPY config.js .

COPY .env.production .
COPY v5/package.json .
COPY v5/vite.config.ts .
COPY v5/yarn.lock .

COPY nginx.conf /etc/nginx/nginx.conf