# cache-bust-20250910

# Build Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Serve with nginx
FROM nginx:stable-alpine

# Remove default nginx configs (prevents "Welcome to nginx" page)
RUN rm -rf /etc/nginx/conf.d/*

# Copy Angular build
COPY --from=build /app/dist/coal/browser /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
