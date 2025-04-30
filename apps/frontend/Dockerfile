# ==== BUILDER ====
FROM node:18-alpine AS builder
RUN apk add --no-cache python3 make g++

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared ./packages/shared/
COPY packages/webrtc-client ./packages/webrtc-client/
COPY packages/lib ./packages/lib/
COPY packages/tsconfig ./packages/tsconfig/
COPY apps/frontend ./apps/frontend/

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter shared build
RUN pnpm --filter webrtc-client build
RUN pnpm --filter frontend build

# ==== PRODUCTION ====
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

ENV NODE_ENV=production
EXPOSE 5173
CMD ["pnpm", "preview"] # or serve using node-based static server

# ==== DEVELOPMENT ====
FROM node:18-alpine AS dev
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

WORKDIR /app/apps/frontend
ENV NODE_ENV=development
EXPOSE 5173
CMD ["pnpm", "dev"]
