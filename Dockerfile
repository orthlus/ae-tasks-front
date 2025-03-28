FROM nginx:alpine
WORKDIR /app

COPY dist .
#COPY config.js .

COPY nginx.conf /etc/nginx/nginx.conf