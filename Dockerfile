FROM php:5.6-apache
RUN apt-get update && \
    apt-get install -y \
        libxml2 \
        libxml2-dev && \
    docker-php-ext-install soap
COPY . /var/www/html