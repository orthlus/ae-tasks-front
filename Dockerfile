FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g html-minifier terser clean-css-cli

COPY v6 .

RUN html-minifier index.html --collapse-whitespace --remove-comments -o index.html
RUN terser app.js --compress --mangle -o app.js
RUN terser templates.js --compress --mangle -o templates.js
RUN cleancss base.css -O2 -o base.css
RUN cleancss mobile.css -O2 -o mobile.css
RUN cleancss desktop.css -O2 -o desktop.css

FROM nginx:alpine
WORKDIR /app

COPY --from=builder /app /app
COPY config.js .

COPY nginx.conf /etc/nginx/nginx.conf