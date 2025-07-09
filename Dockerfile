# Build stage
FROM node:lts-alpine AS build

# Set config
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

# Create and change to the app directory
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . ./

# Build the app
RUN pnpm build

# Production stage
FROM caddy:alpine

# Create and change to the app directory
WORKDIR /app

# Copy Caddyfile
COPY Caddyfile ./

# Format Caddyfile
RUN caddy fmt Caddyfile --overwrite

# Copy built files from build stage (using default build/client directory)
COPY --from=build /app/build/client ./dist

# Use Caddy to serve the app
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"] 