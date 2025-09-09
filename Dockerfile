# frontend/Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:stable-alpine
COPY --from=build /app/dist/coal /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]