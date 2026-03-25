# ------------------------------------ Stage 1: build ------------------------------------
# Use Node 20 Alpine to compile the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first — Docker caches this layer. - Dependencies only reinstall when package.json changes.
COPY package*.json ./

# --ignore-scripts is intentionally omitted:
# Rollup and esbuild require postinstall scripts to download platform-specific
# native binaries. Omitting this flag would cause the build to fail on Linux.
# The base image (node:20-alpine) is trusted and dependencies are pinned in package.
RUN npm install 

# Copy source and build
COPY index.html ./
COPY vite.config.js ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

# ------------------------------------ Stage 2: serve ------------------------------------
# Copy only the dist output — no Node, no source code.
FROM nginx:stable-alpine AS runtime

# Run Nginx as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /var/cache/nginx \
    && chown -R appuser:appgroup /var/log/nginx \
    && chown -R appuser:appgroup /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown appuser:appgroup /var/run/nginx.pid

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R appuser:appgroup /usr/share/nginx/html

USER appuser

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]