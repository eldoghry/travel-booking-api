# =====================
# Base
# =====================
FROM node:20-alpine AS base
WORKDIR /app

# =====================
# Development
# =====================
FROM base AS development
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
EXPOSE 4000
CMD ["npm", "run", "start:dev"]

# =====================
# Dependencies
# =====================
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# =====================
# Builder
# =====================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# =====================
# Production
# =====================
FROM base AS production
# create linux group & new linux user (for low-privilege user called nestjs, belonging to the nodejs group.) 
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps \
   && npm install -g pm2 \
   && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY ecosystem.config.js ./

# CREATE LOGS DIR + FIX PERMISSIONS
RUN mkdir -p /app/logs \
    && chown -R nestjs:nodejs /app

USER nestjs
EXPOSE 4000
CMD ["pm2-runtime", "ecosystem.config.js"]
