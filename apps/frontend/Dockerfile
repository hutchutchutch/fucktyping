# ==== BUILDER ====
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copy shared packages
COPY packages/shared ./packages/shared/
COPY packages/webrtc-client ./packages/webrtc-client/
COPY packages/tsconfig ./packages/tsconfig/

# Copy frontend app
COPY apps/frontend ./apps/frontend/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build shared packages first
RUN pnpm --filter shared build
RUN pnpm --filter webrtc-client build
RUN pnpm --filter frontend build

# ==== PRODUCTION ====
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Copy the built frontend app
COPY --from=builder /app/apps/frontend/dist .

# Copy custom nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Set environment variables for frontend
ENV NODE_ENV=production
ENV BACKEND_URL=/api

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]