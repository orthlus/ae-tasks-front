FROM nginx:alpine
WORKDIR /app
#COPY dist/ .
COPY mock/app.js .
COPY mock/index.html .
COPY nginx.conf /etc/nginx/nginx.conf