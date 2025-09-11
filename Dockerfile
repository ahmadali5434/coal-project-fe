# -----------------
# Stage 1: Build Angular app
# -----------------
    FROM node:22-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build -- --configuration production --project=coal
    
    # -----------------
    # Stage 2: Nginx server
    # -----------------
    FROM nginx:stable-alpine
    
    # Copy custom nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy Angular build output from the correct location
    COPY --from=build /app/dist/coal/browser /usr/share/nginx/html
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]