# ---- Etapa 1: compilar React con Vite ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Etapa 2: servir los archivos estáticos con Nginx ----
FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/proxy-comun.inc /etc/nginx/conf.d/proxy-comun.inc
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
