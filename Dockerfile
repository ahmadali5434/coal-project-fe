# -----------------
# Stage 1: Build Angular app
# -----------------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Angular app
RUN npm run build

# -----------------
# Stage 2: Serve with Nginx
# -----------------
FROM nginx:stable-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build output (handle both dist/coal and dist/coal/browser cases)
# If dist/coal/browser exists, it will be copied; otherwise dist/coal will be used
COPY --from=build /app/dist/coal/browser /usr/share/nginx/html
COPY --from=build /app/dist/coal /usr/share/nginx/html

# Copy custom nginx config (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
