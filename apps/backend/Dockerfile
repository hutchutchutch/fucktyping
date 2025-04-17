# ==== BUILDER ====
FROM node:18-alpine AS builder
RUN apk add --no-cache python3 make g++

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared ./packages/shared/
COPY packages/database ./packages/database/
COPY packages/tsconfig ./packages/tsconfig/
COPY apps/backend ./apps/backend/

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter shared build
RUN pnpm --filter database build
RUN pnpm --filter backend build

# ==== PRODUCTION ====
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Add AWS-specific environment variables
ENV NODE_ENV=production
ENV PORT=3000

# These will be overridden by ECS task definition
ENV RDS_HOSTNAME=localhost
ENV RDS_PORT=5432
ENV RDS_DB_NAME=fucktyping
ENV RDS_USERNAME=postgres
ENV RDS_PASSWORD=postgres

EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]

# ==== DEVELOPMENT ====
FROM node:18-alpine AS dev
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

WORKDIR /app/apps/backend
ENV NODE_ENV=development
EXPOSE 3000
CMD ["pnpm", "dev"]
