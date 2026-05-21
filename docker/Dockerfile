FROM php:8.3-fpm-alpine AS base

# Instalar extensiones PHP necesarias
RUN apk add --no-cache \
    nginx \
    supervisor \
    zip \
    libzip-dev \
    sqlite-dev \
    icu-dev \
    libpq-dev \
    && docker-php-ext-install zip pdo pdo_sqlite pdo_pgsql pgsql opcache intl \
    && rm -rf /var/cache/apk/*

# Crear usuario www-data (no existe en Alpine por defecto)
RUN addgroup -g 82 -S www-data 2>/dev/null; \
    adduser -u 82 -D -S -G www-data www-data 2>/dev/null; \
    true

# Crear directorio para el PID de nginx
RUN mkdir -p /run/nginx

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configurar Nginx
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Configurar Supervisor (corre nginx + php-fpm juntos)
COPY docker/supervisord.conf /etc/supervisord.conf

# Deshabilitar OpCache (desarrollo local)
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache-local.ini

# Copiar proyecto
WORKDIR /var/www/html
COPY . .

# Crear .env PRIMERO
RUN cp .env.example .env

# Instalar dependencias
RUN composer install --optimize-autoloader --no-interaction

# Compilar assets con Vite
RUN apk add --no-cache nodejs npm
RUN npm install
RUN npm run build
RUN apk del nodejs npm

# Permisos
RUN chown -R www-data:www-data storage bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# SQLite
RUN touch database/database.sqlite
RUN chown -R www-data:www-data database
RUN chmod -R 775 database

# Cache de Laravel
RUN php artisan key:generate --force

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
