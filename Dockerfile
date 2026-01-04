# -----------------------------
# Stage 1: Build Angular app
# -----------------------------
  FROM node:20-alpine AS builder

  WORKDIR /app
  
  # 🔹 Build-time environment (production by default)
  ARG BUILD_ENV=production
  
  # Copy only package.json + lockfile first (better cache)
  COPY package*.json ./
  RUN npm ci
  
  # Copy source
  COPY . .
  
  # 🔹 Build using selected Angular configuration
  RUN npm run build -- --configuration=$BUILD_ENV --base-href=/
  
  # -----------------------------
  # Stage 2: Serve with nginx
  # -----------------------------
  FROM nginx:stable-alpine
  
  # Copy built Angular files into nginx html folder
  COPY --from=builder /app/dist/coal/browser /usr/share/nginx/html
  
  # Use nginx template (good for future runtime env if needed)
  COPY default.conf.template /etc/nginx/templates/default.conf.template
  
  EXPOSE 80
  
  CMD ["nginx", "-g", "daemon off;"]
  