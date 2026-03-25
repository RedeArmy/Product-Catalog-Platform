# ------------------------------------ Stage 1: build ------------------------------------
# Use Node 20 Alpine to compile the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first — Docker caches this layer. - Dependencies only reinstall when package.json changes.
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ------------------------------------ Stage 2: serve ------------------------------------
# Copy only the dist output — no Node, no source code.
FROM nginx:stable-alpine AS runtime

# Nginx config for React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]