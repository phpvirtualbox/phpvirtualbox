FROM php:8.4-apache
RUN apt-get update && \
    apt-get install -y \
        libxml2 \
        libxml2-dev
RUN docker-php-ext-install soap pdo_mysql
