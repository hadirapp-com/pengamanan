FROM oven/bun:1-slim AS production

# Create app user for security
RUN groupadd -r -g 1001 appgroup && \
    useradd -r -u 1001 -g appgroup -s /bin/bash -m appuser

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Drizzle migrations
RUN bun run db:generate

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run health-check || exit 1

# Start the application
CMD ["bun", "run", "src/index.ts"] 