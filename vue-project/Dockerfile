# Etapa 1: Build de la aplicación frontend con Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Aprovechar caché de capas de Docker para las dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código fuente y compilar
COPY . .
RUN npm run build-only

# Etapa 2: Servidor Nginx de producción y reverse proxy
FROM nginx:alpine

# Configuración personalizada de Nginx para SPA y reverse proxy al backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos generados por el build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
