# Dockerfile
# Debian-based build stage to avoid Alpine apk IO/DNS issues on Windows Docker Desktop
############################
# Stage 1: build (named "build")
############################
FROM node:20-bullseye-slim AS build

# Install build tools on Debian-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     python3 \
     build-essential \
     make \
     g++ \
     ca-certificates \
     curl \
     bash \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests first for better cache
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source and build
COPY . .
# Build (uses "build" script from package.json)
RUN npm run build

############################
# Stage 2: runtime (nginx)
############################
FROM nginx:1.25-alpine AS runtime

# Small utilities for debugging (optional)
RUN apk add --no-cache bash curl

# Remove default html
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from build stage.
# (Your build produces dist/coal/browser/index.html)
COPY --from=build /app/dist/coal /usr/share/nginx/html

# Copy nginx config (ensure nginx.conf is next to Dockerfile)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck for orchestration (uses nginx at /)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
