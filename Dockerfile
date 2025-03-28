FROM nginx:alpine
WORKDIR /app
#COPY dist/ .
COPY v5/dist .
COPY config.js .
COPY .env.production .

# v5
COPY package.json .
COPY vite.config.ts .
COPY yarn.lock .

COPY nginx.conf /etc/nginx/nginx.conf