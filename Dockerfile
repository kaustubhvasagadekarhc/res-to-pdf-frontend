# -------- Base --------
    FROM node:20-alpine AS base
    WORKDIR /app
    
    # -------- Dependencies --------
    FROM base AS deps
    RUN apk add --no-cache libc6-compat
    COPY package.json package-lock.json ./
    RUN npm ci
    
    # -------- Build --------
    FROM base AS builder
    WORKDIR /app
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    ARG NEXT_PUBLIC_API_URL
    ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
    
    RUN npm run build
    
    # -------- Runtime --------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV PORT=3000
    ENV HOSTNAME=0.0.0.0
    
    # Create non-root user
    RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -D nextjs
    
    # Copy standalone output
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    USER nextjs
    
    EXPOSE 3000
    
    CMD ["node", "server.js"]
    