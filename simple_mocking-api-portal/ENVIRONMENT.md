# Environment Variables Configuration

This document explains how to configure the Mocking API Portal using environment variables for different deployment scenarios.

## Available Environment Variables

### Core Configuration
- `API_URL`: Base URL for the backend API (default: `http://localhost:8080`)
- `API_VERSION`: API version to use (default: `v1`)

### Feature Flags
- `ENABLE_TOAST`: Enable/disable toast notifications (default: `true`)
- `ENABLE_PAGINATION`: Enable/disable pagination features (default: `true`)
- `DEFAULT_PAGE_SIZE`: Default number of items per page (default: `10`)

## Configuration Methods

### 1. Development Environment
For local development, modify `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  apiVersion: 'v1',
  features: {
    enableToast: true,
    enablePagination: true,
    defaultPageSize: 10
  }
};
```

### 2. Production Build
For production builds, modify `src/environments/environment.prod.ts` and build with:
```bash
ng build --configuration=production
```

### 3. Docker Deployment
For Docker deployments, use environment variables:

```bash
# Basic Docker run
docker run -p 4200:80 \
  -e API_URL=http://your-api-server:8080 \
  -e ENABLE_TOAST=true \
  -e ENABLE_PAGINATION=true \
  -e DEFAULT_PAGE_SIZE=20 \
  mocking-api-portal

# Docker Compose
services:
  frontend:
    build: .
    ports:
      - "4200:80"
    environment:
      - API_URL=http://backend:8080
      - ENABLE_TOAST=true
      - ENABLE_PAGINATION=true
      - DEFAULT_PAGE_SIZE=15
```

### 4. Kubernetes Deployment
For Kubernetes, use ConfigMaps or environment variables:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mocking-api-portal
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: mocking-api-portal:latest
        env:
        - name: API_URL
          value: "http://simple-mocking-api-service:8080"
        - name: ENABLE_TOAST
          value: "true"
        - name: ENABLE_PAGINATION
          value: "true"
        - name: DEFAULT_PAGE_SIZE
          value: "10"
```

## Build Configurations

### Available Build Configurations
1. **development**: Local development with dev server
2. **production**: Optimized production build
3. **docker**: Production build optimized for containerized deployment

### Building for Different Environments
```bash
# Development
ng serve

# Production
ng build --configuration=production

# Docker
ng build --configuration=docker

# Custom environment
ng build --configuration=production --file-replacements src/environments/environment.ts=src/environments/environment.custom.ts
```

## Best Practices

1. **Never commit sensitive data** to environment files
2. **Use different configurations** for different environments
3. **Validate environment variables** before deployment
4. **Use feature flags** to enable/disable features without code changes
5. **Document all environment variables** and their default values

## Troubleshooting

### Common Issues
1. **API URL not updating**: Check that environment variables are being set correctly and the Docker container is restarting
2. **Features not working**: Verify feature flags are set to `true` (case-sensitive)
3. **Build errors**: Ensure all environment files exist and have valid TypeScript syntax

### Debugging
Check the browser console for configuration values:
```javascript
// In browser console
console.log(window.env); // Shows runtime environment variables
```
