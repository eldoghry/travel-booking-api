# =====================
# Base
# =====================
FROM node:20-alpine AS base
WORKDIR /app


# =====================
# Development
# =====================
FROM base AS development
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
EXPOSE 4000
CMD ["npm", "run", "start:dev"]


# =====================
# Builder
# =====================
FROM base AS builder
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build


# =====================
# Production
# =====================
FROM base AS production
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps \
  && npm install -g pm2 \
  && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY ecosystem.config.js ./

EXPOSE 4000
CMD ["pm2-runtime", "ecosystem.config.js"]
