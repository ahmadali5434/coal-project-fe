# -----------------
# Stage 1: Build Angular app
# -----------------
    FROM node:22-alpine AS build

    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm ci
    
    # Copy source
    COPY . .
    
    # Build Angular app (disable font inlining issue)
    RUN npx ng build coal --configuration production
    
    # -----------------
    # Stage 2: Nginx to serve app
    # -----------------
    FROM nginx:stable-alpine AS runtime
    
    # Clean default nginx html
    RUN rm -rf /usr/share/nginx/html/*
    
    # Copy Angular dist build
    COPY --from=build /app/dist/coal /usr/share/nginx/html
    
    # Copy custom nginx config (optional)
    # COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    