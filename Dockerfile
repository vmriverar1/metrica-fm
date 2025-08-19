# FASE 6: Production Docker Configuration
# Multi-stage Dockerfile optimized for Next.js production deployment

# =====================================
# Dependencies Stage
# =====================================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --frozen-lockfile --only=production; \
  else echo "Lockfile not found." && exit 1; \
  fi

# =====================================
# Builder Stage
# =====================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_ENV=production

# Build application
RUN npm run build

# =====================================
# Runner Stage
# =====================================
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application with proper permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create directories for logs and uploads
RUN mkdir -p /app/logs /app/uploads
RUN chown -R nextjs:nodejs /app/logs /app/uploads

# Copy additional configuration files
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node healthcheck.js || exit 1

# Create simple health check script
RUN echo 'const http = require("http"); \
const options = { hostname: "localhost", port: 3000, path: "/api/health", timeout: 2000 }; \
const request = http.request(options, (res) => { \
  console.log(`Health check status: ${res.statusCode}`); \
  process.exit(res.statusCode === 200 ? 0 : 1); \
}); \
request.on("error", () => process.exit(1)); \
request.on("timeout", () => process.exit(1)); \
request.end();' > healthcheck.js

# Start the application
CMD ["node", "server.js"]

# =====================================
# Labels for metadata
# =====================================
LABEL maintainer="Métrica DIP <noreply@metrica-dip.com>"
LABEL description="Métrica DIP - Dirección Integral de Proyectos"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/metrica-dip/website"