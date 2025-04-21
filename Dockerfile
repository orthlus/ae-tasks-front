FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g html-minifier terser clean-css-cli

COPY v6 .

RUN html-minifier index.html --collapse-whitespace --remove-comments -o index.html
RUN terser app.js --compress --mangle -o app.js
RUN terser templates.js --compress --mangle -o templates.js
#RUN cleancss styles.css -O2 -o styles.css

FROM nginx:alpine
WORKDIR /app

COPY --from=builder /app /app
COPY config.js .

COPY nginx.conf /etc/nginx/nginx.conf