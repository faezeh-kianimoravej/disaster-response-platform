##### Stage 1: Build the Vite React app (or copy pre-built from CI)
FROM node:20-alpine AS builder
WORKDIR /app

# Accept VERSION as build arg
ARG VERSION=1.0.0-dev
ENV VITE_APP_VERSION=$VERSION

# Copy dependency manifests first for better layer caching
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

# Sync VERSION into package.json
RUN npm version $VERSION --no-git-tag-version --allow-same-version

# Copy the remaining source code
COPY . .

# Build for production (outDir configured as 'build' in vite.config.ts)
# Or if build/ exists (from CI), skip rebuild
RUN if [ -d build ]; then echo "Using pre-built artifacts from CI"; else npm run build; fi

##### Stage 2: Nginx to serve static files
FROM nginx:1.27-alpine AS runtime

# Remove default site content
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Inject an Nginx config enabling SPA routing
RUN printf '%s\n' \
  'server {' \
  '  listen       80;' \
  '  server_name  _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  location / {' \
  '    try_files $uri /index.html;' \
  '  }' \
  '  location ~* \.(?:css|js|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp)$ {' \
  '    add_header Cache-Control "public, max-age=31536000, immutable";' \
  '    try_files $uri /index.html;' \
  '  }' \
  '}' \
  > /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
