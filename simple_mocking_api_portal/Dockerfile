# Multi-stage build for Angular SSR
# Stage 1: Build the Angular application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application for production
RUN npm run build -- --configuration=traefix

# Stage 2: Production - Node.js server for SSR
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package.json for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the built application from build stage
COPY --from=build /app/dist/mocking-api-portal ./dist/mocking-api-portal

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S angular -u 1001

# Change ownership of app directory
RUN chown -R angular:nodejs /app

# Switch to non-root user
USER angular

# Expose port 4000 for the Angular SSR server
EXPOSE 4000

# NO HEALTHCHECK in Dockerfile - let Docker Compose/Stack handle it

# Start the SSR server directly
CMD ["node", "dist/mocking-api-portal/server/server.mjs"]
