FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g html-minifier terser

COPY v6 .

RUN find . -type f -name "*.html" \
    -exec html-minifier {} \
    --collapse-whitespace \
    --remove-comments \
    -o {} \;
RUN find . -type f -name "*.js" \
    -not -name "*.min.js" \
    -exec terser {} \
    --compress \
    --mangle \
    -o {} \;

FROM nginx:alpine
WORKDIR /app

COPY --from=builder /app /app
COPY config.js .

COPY nginx.conf /etc/nginx/nginx.conf