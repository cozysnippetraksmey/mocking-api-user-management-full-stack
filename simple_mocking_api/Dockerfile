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

# Set working directory
WORKDIR /app

# Add a non-root user
RUN adduser -D -h /app appuser
USER appuser

# Copy the built application from the build stage
COPY --from=build /app/build/libs/simple_mocking_api-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
