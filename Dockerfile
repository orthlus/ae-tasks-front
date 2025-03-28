FROM nginx:alpine
WORKDIR /app
#COPY dist/ .
COPY v5/dist .
COPY config.js .
COPY .env.production .
COPY nginx.conf /etc/nginx/nginx.conf