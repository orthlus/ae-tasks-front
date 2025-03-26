FROM nginx:alpine
WORKDIR /usr/share/nginx/html
#COPY dist/ .
COPY mock/app.js .
COPY mock/index.html .
COPY nginx.conf /etc/nginx/conf.d/default.conf