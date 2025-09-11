# -----------------
# Stage 1: Build Angular app
# -----------------
    FROM node:22-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build --prod
    
    # -----------------
    # Stage 2: Serve with Nginx
    # -----------------
    FROM nginx:stable-alpine
    
    # Remove default nginx website
    RUN rm -rf /usr/share/nginx/html/*
    
    # Copy Angular build output to nginx html folder
    COPY --from=build /app/dist/coal /usr/share/nginx/html
    
    # Copy custom nginx config (optional, for SPA routing)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    