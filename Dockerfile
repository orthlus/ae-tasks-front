FROM nginx:alpine
WORKDIR /app
#COPY dist/ .
COPY v2/app.js .
COPY v2/index.html .
COPY config.js .
COPY nginx.conf /etc/nginx/nginx.conf