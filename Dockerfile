FROM nginx:alpine
WORKDIR /app
#COPY dist/ .
COPY api/app.js .
COPY api/index.html .
COPY config.js .
COPY nginx.conf /etc/nginx/nginx.conf