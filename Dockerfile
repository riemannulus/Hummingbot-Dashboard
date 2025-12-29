# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build Tailwind CSS
RUN bun run tailwind

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy built assets and source files
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.ts ./
COPY --from=builder /app/index.html ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/bunfig.toml ./

# Environment variables
ENV NODE_ENV=production
ENV API_BASE=http://localhost:8000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Run the application
CMD ["bun", "run", "index.ts"]

