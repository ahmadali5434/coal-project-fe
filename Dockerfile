# Build Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Serve with nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist/coal/browser /usr/share/nginx/html

# Optional: custom nginx config for Angular routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
