# Multi-stage build: Stage 1 - Build the application
FROM eclipse-temurin:17-jdk-alpine AS build

# Set working directory
WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Copy source code
COPY src src

# Make Gradle wrapper executable
RUN chmod +x ./gradlew

# Build the application with Gradle, skipping tests
RUN ./gradlew build -x test

# Multi-stage build: Stage 2 - Create runtime image
FROM eclipse-temurin:17-jre-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Add a non-root user with specific UID/GID for consistency
RUN addgroup -g 1001 -S spring && \
    adduser -S spring -u 1001 -G spring

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chown -R spring:spring /app

# Copy the built application from the build stage
COPY --from=build /app/build/libs/simple_mocking_api-0.0.1-SNAPSHOT.jar app.jar

# Change ownership of the app
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring

# Expose port 8080
EXPOSE 8080

# Set JVM options for containerized environment
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Run the application with optimized JVM settings
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
