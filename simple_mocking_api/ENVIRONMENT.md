# Spring Boot Environment Variables Configuration

This document explains how to configure the Simple Mocking API using environment variables for different deployment scenarios.

## Available Environment Variables

### Server Configuration
- `SERVER_PORT`: Port for the Spring Boot application (default: `8080`)
- `CONTEXT_PATH`: Application context path (default: `/`)

### CORS Configuration
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins (default: `http://localhost:4200,http://localhost:80`)
- `CORS_ALLOWED_METHODS`: Comma-separated list of allowed HTTP methods (default: `GET,POST,PUT,DELETE,OPTIONS`)
- `CORS_ALLOWED_HEADERS`: Comma-separated list of allowed headers (default: `*`)
- `CORS_ALLOW_CREDENTIALS`: Allow credentials in CORS requests (default: `true`)

### Application Features
- `MAX_USER_GENERATION`: Maximum number of users that can be generated at once (default: `100`)
- `DEFAULT_USER_GENERATION`: Default number of users to generate (default: `10`)
- `INITIAL_USERS_COUNT`: Number of initial mock users to create on startup (default: `5`)
- `ENABLE_INITIAL_DATA`: Whether to create initial mock data on startup (default: `true`)

### Logging Configuration
- `LOG_LEVEL`: Log level for application packages (default: `INFO`)
- `WEB_LOG_LEVEL`: Log level for Spring Web components (default: `WARN`)
- `CONSOLE_LOG_PATTERN`: Console logging pattern (default: `%d{yyyy-MM-dd HH:mm:ss} - %msg%n`)

### Management and Health
- `MANAGEMENT_ENDPOINTS`: Comma-separated list of exposed actuator endpoints (default: `health,info`)
- `HEALTH_SHOW_DETAILS`: When to show health check details (default: `when-authorized`)

## Configuration Examples

### Docker Deployment
```bash
docker run -p 8080:8080 \
  -e SERVER_PORT=8080 \
  -e CORS_ALLOWED_ORIGINS=http://localhost:4200,http://frontend:80 \
  -e MAX_USER_GENERATION=50 \
  -e DEFAULT_USER_GENERATION=5 \
  -e INITIAL_USERS_COUNT=10 \
  -e LOG_LEVEL=DEBUG \
  simple-mocking-api
```

### Docker Compose
```yaml
services:
  backend:
    image: simple-mocking-api
    environment:
      - SERVER_PORT=8080
      - CORS_ALLOWED_ORIGINS=http://frontend:80
      - MAX_USER_GENERATION=100
      - DEFAULT_USER_GENERATION=10
      - INITIAL_USERS_COUNT=5
      - ENABLE_INITIAL_DATA=true
      - LOG_LEVEL=INFO
```

### Kubernetes Deployment
```yaml
env:
- name: SERVER_PORT
  value: "8080"
- name: CORS_ALLOWED_ORIGINS
  value: "http://frontend-service:80"
- name: MAX_USER_GENERATION
  value: "100"
- name: LOG_LEVEL
  value: "INFO"
```

## API Endpoints

### Configuration Endpoint
- `GET /api/users/config` - Returns current configuration settings

Example response:
```json
{
  "defaultGenerationCount": 10,
  "maxGenerationCount": 100
}
```

## Best Practices

1. **Use environment-specific configurations** for different deployment targets
2. **Set appropriate CORS origins** based on your frontend deployment
3. **Adjust logging levels** based on environment (DEBUG for dev, INFO for prod)
4. **Configure resource limits** (user generation limits) based on your infrastructure
5. **Enable health checks** for container orchestration platforms
