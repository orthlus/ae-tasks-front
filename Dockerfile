FROM nginx:alpine
WORKDIR /app
#COPY dist/ .
COPY v3 .
COPY config.js .
COPY nginx.conf /etc/nginx/nginx.conf