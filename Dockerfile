# -----------------------------
# Stage 1: Build Angular app
# -----------------------------
  FROM node:20-alpine AS builder
  # You can switch to node:22-alpine if you want latest LTS,
  # but Node 20 is currently the safest Angular LTS baseline.
  WORKDIR /app
  
  # Copy only package.json + lockfile first (better cache for npm ci)
  COPY package*.json ./
  
  # Install dependencies
  RUN npm ci
  
  # Copy the rest of the source code
  COPY . .
  
  # Build Angular app for production (output -> dist/coal)
  RUN npm run build -- --configuration production --base-href /
  
  # -----------------------------
  # Stage 2: Serve with nginx
  # -----------------------------
  FROM nginx:stable-alpine
  # Copy built Angular files into nginx html folder
  COPY --from=builder /app/dist/coal /usr/share/nginx/html
  
  # Replace nginx default site config with our Angular SPA config
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  
  # Expose port 80 to Railway/Docker
  EXPOSE 80
  
  # Start nginx in foreground
  CMD ["nginx", "-g", "daemon off;"]
  