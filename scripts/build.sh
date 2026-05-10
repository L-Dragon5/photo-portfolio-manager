composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

npm ci --audit false
npm run build
