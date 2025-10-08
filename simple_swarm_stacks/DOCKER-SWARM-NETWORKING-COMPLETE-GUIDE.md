# Docker Swarm Networking Complete Guide
*A comprehensive guide to Docker Swarm networking modes, routing mesh, and best practices*

## Table of Contents
1. [Docker Swarm Networking Overview](#docker-swarm-networking-overview)
2. [Port Publishing Modes Explained](#port-publishing-modes-explained)
3. [Routing Mesh Deep Dive](#routing-mesh-deep-dive)
4. [Network Drivers Comparison](#network-drivers-comparison)
5. [Single Node vs Multi-Node Configuration](#single-node-vs-multi-node-configuration)
6. [Best Practices & Industry Standards](#best-practices--industry-standards)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Real-World Examples](#real-world-examples)

## Docker Swarm Networking Overview

Docker Swarm provides several networking mechanisms to handle traffic routing and load balancing across services. Understanding these is crucial for production deployments.

### Key Concepts
- **Service**: A definition of tasks to execute on manager or worker nodes
- **Task**: A running container that's part of a service
- **Routing Mesh**: Docker Swarm's built-in load balancer
- **Overlay Network**: Multi-host networking for containers
- **Ingress Network**: Special overlay network for incoming traffic

## Port Publishing Modes Explained

### 1. Ingress Mode (Default & Recommended)
```yaml
ports:
  - target: 8080
    published: 9090
    protocol: tcp
    mode: ingress  # This is the default
```

**How it works:**
- Uses Docker Swarm's routing mesh
- Traffic hits ANY node in the swarm on port 9090
- Gets automatically routed to healthy containers
- Built-in load balancing across all replicas
- Works even if the node receiving traffic doesn't have a replica

**Advantages:**
✅ Load balancing across all replicas  
✅ High availability - any node can handle requests  
✅ Automatic failover  
✅ Works with multiple replicas per node  
✅ Industry standard for production  

**Disadvantages:**
❌ Slight network overhead due to routing  
❌ Can be complex to debug network issues  

**When to use:**
- Production environments (99% of cases)
- When you need load balancing
- When you have multiple replicas
- When you want high availability

### 2. Host Mode
```yaml
ports:
  - target: 8080
    published: 9090
    protocol: tcp
    mode: host
```

**How it works:**
- Binds directly to the host's network interface
- Only ONE container per port per node
- No load balancing
- Direct connection (bypass Docker networking)

**Advantages:**
✅ Fastest network performance  
✅ Direct host networking  
✅ Simpler debugging  
✅ No routing overhead  

**Disadvantages:**
❌ Only one replica per port per node  
❌ No automatic load balancing  
❌ Port conflicts on single node  
❌ Less flexible scaling  

**When to use:**
- High-performance applications requiring minimal latency
- Single replica per node scenarios
- When you have multiple nodes and want to control placement
- Legacy applications that need host networking

### 3. Bridge Mode (Docker Compose Style)
```yaml
ports:
  - "9090:8080"  # This uses bridge mode in regular Docker
```

**Note:** In Docker Swarm, this automatically becomes `ingress` mode.

## Routing Mesh Deep Dive

### What is Routing Mesh?
The routing mesh is Docker Swarm's built-in load balancer that:
- Routes incoming requests to healthy service replicas
- Provides service discovery
- Handles load balancing automatically
- Works across multiple nodes

### How Routing Mesh Works

```
Internet Request → Any Swarm Node → Routing Mesh → Healthy Container
```

**Step-by-step process:**
1. Client sends request to `any-node:9090`
2. Docker Swarm routing mesh receives the request
3. Routing mesh checks which containers are healthy
4. Routes request to one of the healthy containers
5. Response comes back through the same path

### Routing Mesh Components

#### 1. Ingress Network
- Special overlay network created automatically
- Handles all incoming traffic
- Load balances across services

#### 2. Load Balancing Algorithm
- Round-robin by default
- Session affinity not supported
- Distributes load evenly across healthy replicas

#### 3. Service Discovery
- Services can communicate using service names
- Built-in DNS resolution
- Automatic updates when containers start/stop

## Network Drivers Comparison

### 1. Bridge Driver
```yaml
networks:
  backend-network:
    driver: bridge
```

**Characteristics:**
- Single host networking
- Used in Docker Compose
- Cannot span multiple nodes
- Fast and simple

**Use cases:**
- Development environments
- Single-node deployments
- Docker Compose setups

### 2. Overlay Driver
```yaml
networks:
  app-network:
    driver: overlay
    attachable: true
```

**Characteristics:**
- Multi-host networking
- Required for Docker Swarm
- Encrypted by default
- Can span multiple nodes

**Use cases:**
- Production Docker Swarm
- Multi-node deployments
- Microservices architectures

### 3. Host Driver
```yaml
networks:
  host-network:
    driver: host
```

**Characteristics:**
- Uses host's network directly
- No network isolation
- Highest performance
- Limited use cases

## Single Node vs Multi-Node Configuration

### Single Node Setup (Your Current Situation)

```yaml
# Current working configuration
services:
  backend:
    image: cozysnippet/simple-mocking-api:latest
    ports:
      - target: 8080
        published: 9090
        mode: ingress  # Works with multiple replicas
    deploy:
      replicas: 3      # All on same node
    networks:
      - app-network

networks:
  app-network:
    driver: overlay    # Still needed for Swarm
```

**Single Node Characteristics:**
- All replicas run on the same machine
- Routing mesh still provides load balancing
- Good for development and small applications
- Resource limits are important

### Multi-Node Setup

#### Manager Node (Primary)
```bash
# Initialize swarm on manager node
docker swarm init --advertise-addr <MANAGER-IP>

# Get join tokens
docker swarm join-token worker
docker swarm join-token manager
```

#### Worker Nodes
```bash
# Join worker nodes
docker swarm join \
    --token <WORKER-TOKEN> \
    <MANAGER-IP>:2377
```

#### Multi-Node Service Configuration
```yaml
services:
  backend:
    image: cozysnippet/simple-mocking-api:latest
    ports:
      - target: 8080
        published: 9090
        mode: ingress
    deploy:
      replicas: 6
      placement:
        constraints:
          - node.role == worker  # Only on worker nodes
        preferences:
          - spread: node.id      # Spread across nodes
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
        reservations:
          memory: 256M
          cpus: "0.5"
    networks:
      - app-network

networks:
  app-network:
    driver: overlay
    driver_opts:
      encrypted: "true"    # Encrypt inter-node traffic
```

### Node Placement Strategies

#### 1. Global Mode
```yaml
deploy:
  mode: global  # One replica per node
```

#### 2. Replicated Mode with Constraints
```yaml
deploy:
  mode: replicated
  replicas: 6
  placement:
    constraints:
      - node.role == worker
      - node.labels.env == production
    preferences:
      - spread: node.id
```

#### 3. Resource Constraints
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: "2.0"
    reservations:
      memory: 512M
      cpus: "1.0"
```

## Best Practices & Industry Standards

### 1. Production-Ready Configuration

```yaml
services:
  backend:
    image: cozysnippet/simple-mocking-api:latest
    ports:
      - target: 8080
        published: 9090
        mode: ingress          # ✅ Always use ingress in production
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - JAVA_OPTS=-Xmx512m -Xms256m
    networks:
      - app-network
    healthcheck:             # ✅ Always include health checks
      test: ["CMD-SHELL", "curl -sf http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      mode: replicated
      replicas: 3            # ✅ Odd numbers for consensus
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
      update_config:         # ✅ Rolling updates
        parallelism: 1
        delay: 10s
        failure_action: rollback
        monitor: 60s
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 5s
        monitor: 30s
      resources:             # ✅ Always set resource limits
        limits:
          memory: 768M
          cpus: "2.0"
        reservations:
          memory: 384M
          cpus: "1.0"
      placement:
        preferences:
          - spread: node.id  # ✅ Spread across nodes
    logging:                 # ✅ Configure logging
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  app-network:
    driver: overlay
    driver_opts:
      encrypted: "true"      # ✅ Encrypt in production
    attachable: true
```

### 2. Load Balancer Integration

For production, many companies use external load balancers like NGINX or HAProxy in front of their Docker Swarm services. This provides better control, SSL termination, caching, and advanced routing capabilities.

#### NGINX Load Balancer Example

```yaml
# Complete stack with NGINX load balancer
version: '3.8'

services:
  # NGINX Load Balancer (Frontend)
  nginx:
    image: nginx:alpine
    ports:
      - target: 80
        published: 80
        mode: ingress
      - target: 443
        published: 443
        mode: ingress
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - frontend
      - backend
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.role == manager
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API Services (No external ports exposed)
  backend:
    image: cozysnippet/simple-mocking-api:latest
    # Note: NO external ports - only accessible via NGINX
    expose:
      - "8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - CORS_ALLOWED_ORIGINS=http://nginx,https://nginx
    networks:
      - backend
    deploy:
      replicas: 6
      placement:
        preferences:
          - spread: node.id
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
        reservations:
          memory: 256M
          cpus: "0.5"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  frontend:
    driver: overlay
    attachable: true
  backend:
    driver: overlay
    # Backend network is internal only
```

#### NGINX Configuration Files

**1. Main NGINX Configuration (`nginx/nginx.conf`)**
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/xml+rss application/json;

    # Include additional configuration files
    include /etc/nginx/conf.d/*.conf;
}
```

**2. Backend Service Configuration (`nginx/conf.d/backend.conf`)**
```nginx
# Upstream backend services
upstream backend_api {
    # Docker Swarm service discovery
    # 'backend' is the service name in docker-compose
    # Docker's internal DNS resolves this to all healthy replicas
    server backend:8080 max_fails=3 fail_timeout=30s;
    
    # Load balancing method
    least_conn;  # or ip_hash, or round_robin (default)
    
    # Health check (requires nginx-plus or custom module)
    # For basic nginx, Docker handles health checks
    keepalive 32;
}

# Main API server block
server {
    listen 80;
    server_name api.yourcompany.com localhost;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Health check endpoint for NGINX itself
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Proxy all API requests to backend
    location /api/ {
        proxy_pass http://backend_api/;
        
        # Important headers for proper forwarding
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        
        # Connection reuse
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # Health check endpoint proxy
    location /actuator/health {
        proxy_pass http://backend_api/actuator/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static content (if any)
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Default location
    location / {
        return 404;
    }
}

# HTTPS server block (optional)
server {
    listen 443 ssl http2;
    server_name api.yourcompany.com;

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Same proxy configuration as HTTP
    location /api/ {
        proxy_pass http://backend_api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

#### How NGINX Communicates with Backend Services

**The Magic: Docker Swarm Service Discovery**

1. **Service Name Resolution**: 
   ```nginx
   upstream backend_api {
       server backend:8080;  # 'backend' = Docker service name
   }
   ```

2. **Docker's Internal DNS**:
   - Docker Swarm creates internal DNS entries for services
   - `backend` resolves to ALL healthy container IPs
   - NGINX sees this as multiple backend servers

3. **Network Communication**:
   ```yaml
   # NGINX connects to backend through shared network
   networks:
     - frontend  # For external traffic
     - backend   # For internal communication with backend service
   ```

4. **Load Balancing Flow**:
   ```
   Browser → NGINX (port 80) → backend service (port 8080) → Container
                ↓
         Docker Swarm automatically 
         routes to healthy replicas
   ```

#### Advanced NGINX Configuration

**Rate Limiting**
```nginx
# Add to http block in nginx.conf
http {
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=checkout:10m rate=2r/s;

    # In server block
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend_api/;
        # ...other config...
    }
}
```

**Caching**
```nginx
# Add to http block
http {
    proxy_cache_path /var/cache/nginx/api 
                     levels=1:2 
                     keys_zone=api_cache:10m 
                     max_size=1g 
                     inactive=60m;
    
    # In location block
    location /api/data/ {
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        proxy_pass http://backend_api/api/data/;
    }
}
```

#### Alternative: HAProxy Configuration

```yaml
# HAProxy instead of NGINX
services:
  haproxy:
    image: haproxy:latest
    ports:
      - "80:80"
      - "443:443"
      - "8404:8404"  # Stats page
    volumes:
      - ./haproxy/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro
    networks:
      - frontend
      - backend
```

**HAProxy Configuration (`haproxy/haproxy.cfg`)**
```
global
    daemon
    maxconn 4096

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

# Stats page
frontend stats
    bind *:8404
    stats enable
    stats uri /stats
    stats admin if TRUE

# Frontend
frontend api_frontend
    bind *:80
    default_backend api_backend

# Backend with service discovery
backend api_backend
    balance roundrobin
    option httpchk GET /actuator/health
    # Docker service discovery
    server-template backend 6 backend:8080 check resolvers docker
    
resolvers docker
    nameserver dns 127.0.0.11:53
```

### Example 1: E-commerce Platform with Complete NGINX Integration

This example shows a production-ready e-commerce platform with NGINX load balancer, multiple backend services, and proper network segmentation.

```yaml
# Complete E-commerce Platform Stack
version: '3.8'

services:
  # NGINX Load Balancer & Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - target: 80
        published: 80
        mode: ingress
      - target: 443
        published: 443
        mode: ingress
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./static:/var/www/static:ro
    networks:
      - frontend
      - api_network
      - web_network
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.labels.tier == web
      resources:
        limits:
          memory: 256M
          cpus: "0.5"
        reservations:
          memory: 128M
          cpus: "0.25"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Web Application
  frontend:
    image: company/ecommerce-frontend:latest
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - API_BASE_URL=http://nginx/api
    networks:
      - web_network
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.labels.tier == web
        preferences:
          - spread: node.id
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
        reservations:
          memory: 256M
          cpus: "0.5"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # API Gateway
  api_gateway:
    image: company/api-gateway:latest
    expose:
      - "8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - USER_SERVICE_URL=http://user_service:8081
      - PRODUCT_SERVICE_URL=http://product_service:8082
      - ORDER_SERVICE_URL=http://order_service:8083
    networks:
      - api_network
      - services_network
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.labels.tier == api
        preferences:
          - spread: node.id
      resources:
        limits:
          memory: 768M
          cpus: "1.5"
        reservations:
          memory: 384M
          cpus: "0.75"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8080/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # User Service
  user_service:
    image: company/user-service:latest
    expose:
      - "8081"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://user_db:5432/users
    networks:
      - services_network
      - database_network
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.labels.tier == app
        preferences:
          - spread: node.id
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
        reservations:
          memory: 256M
          cpus: "0.5"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8081/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Product Service
  product_service:
    image: company/product-service:latest
    expose:
      - "8082"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://product_db:5432/products
      - REDIS_URL=redis://redis:6379
    networks:
      - services_network
      - database_network
      - cache_network
    deploy:
      replicas: 5  # More replicas for high-traffic service
      placement:
        constraints:
          - node.labels.tier == app
        preferences:
          - spread: node.id
      resources:
        limits:
          memory: 768M
          cpus: "1.5"
        reservations:
          memory: 384M
          cpus: "0.75"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8082/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Order Service
  order_service:
    image: company/order-service:latest
    expose:
      - "8083"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://order_db:5432/orders
      - PAYMENT_SERVICE_URL=http://payment_service:8084
    networks:
      - services_network
      - database_network
    deploy:
      replicas: 4
      placement:
        constraints:
          - node.labels.tier == app
        preferences:
          - spread: node.id
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
        reservations:
          memory: 256M
          cpus: "0.5"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8083/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Payment Service (Separate network for security)
  payment_service:
    image: company/payment-service:latest
    expose:
      - "8084"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=jdbc:postgresql://payment_db:5432/payments
      - ENCRYPTION_KEY_FILE=/run/secrets/payment_encryption_key
    networks:
      - services_network
      - payment_network
    secrets:
      - payment_encryption_key
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.labels.tier == secure
          - node.labels.pci_compliant == true
        preferences:
          - spread: node.id
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
        reservations:
          memory: 256M
          cpus: "0.5"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8084/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:alpine
    expose:
      - "6379"
    volumes:
      - redis_data:/data
    networks:
      - cache_network
    deploy:
      mode: global
      placement:
        constraints:
          - node.labels.tier == cache
      resources:
        limits:
          memory: 256M
          cpus: "0.5"
        reservations:
          memory: 128M
          cpus: "0.25"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Database Services
  user_db:
    image: postgres:13
    environment:
      - POSTGRES_DB=users
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - user_db_data:/var/lib/postgresql/data
    networks:
      - database_network
    secrets:
      - db_password
    deploy:
      placement:
        constraints:
          - node.labels.tier == data
      resources:
        limits:
          memory: 1G
          cpus: "2.0"
        reservations:
          memory: 512M
          cpus: "1.0"

  product_db:
    image: postgres:13
    environment:
      - POSTGRES_DB=products
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - product_db_data:/var/lib/postgresql/data
    networks:
      - database_network
    secrets:
      - db_password
    deploy:
      placement:
        constraints:
          - node.labels.tier == data
      resources:
        limits:
          memory: 1G
          cpus: "2.0"
        reservations:
          memory: 512M
          cpus: "1.0"

  order_db:
    image: postgres:13
    environment:
      - POSTGRES_DB=orders
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - order_db_data:/var/lib/postgresql/data
    networks:
      - database_network
    secrets:
      - db_password
    deploy:
      placement:
        constraints:
          - node.labels.tier == data
      resources:
        limits:
          memory: 1G
          cpus: "2.0"
        reservations:
          memory: 512M
          cpus: "1.0"

  payment_db:
    image: postgres:13
    environment:
      - POSTGRES_DB=payments
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - payment_db_data:/var/lib/postgresql/data
    networks:
      - payment_network
    secrets:
      - db_password
    deploy:
      placement:
        constraints:
          - node.labels.tier == secure
          - node.labels.pci_compliant == true
      resources:
        limits:
          memory: 1G
          cpus: "2.0"
        reservations:
          memory: 512M
          cpus: "1.0"

# Network Segmentation for Security
networks:
  frontend:
    driver: overlay
    driver_opts:
      encrypted: "true"
    attachable: true
  
  web_network:
    driver: overlay
    driver_opts:
      encrypted: "true"
    # Internal network for web tier
    
  api_network:
    driver: overlay
    driver_opts:
      encrypted: "true"
    # Internal network for API gateway
    
  services_network:
    driver: overlay
    driver_opts:
      encrypted: "true"
    # Internal network for microservices
    
  database_network:
    driver: overlay
    driver_opts:
      encrypted: "true"
    # Secure database network
    
  cache_network:
    driver: overlay
    driver_opts:
      encrypted: "true"
    # Network for cache services
    
  payment_network:
    driver: overlay
    driver_opts:
      encrypted: "true"
    # Highly secure payment network

# Persistent Storage
volumes:
  user_db_data:
  product_db_data:
  order_db_data:
  payment_db_data:
  redis_data:

# Secrets Management
secrets:
  db_password:
    external: true
  payment_encryption_key:
    external: true
```

#### E-commerce NGINX Configuration

**NGINX Main Configuration for E-commerce (`nginx/nginx.conf`)**
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Enhanced logging for e-commerce
    log_format ecommerce '$remote_addr - $remote_user [$time_local] "$request" '
                        '$status $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" "$http_x_forwarded_for" '
                        'rt=$request_time uct="$upstream_connect_time" '
                        'uht="$upstream_header_time" urt="$upstream_response_time" '
                        'cs=$upstream_cache_status';

    access_log /var/log/nginx/access.log ecommerce;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript text/json
               application/javascript application/xml+rss application/json
               application/atom+xml image/svg+xml;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=checkout:10m rate=2r/s;

    # Cache settings
    proxy_cache_path /var/cache/nginx/api levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;
    proxy_cache_path /var/cache/nginx/static levels=1:2 keys_zone=static_cache:10m max_size=2g inactive=24h;

    include /etc/nginx/conf.d/*.conf;
}
```

**E-commerce Service Configuration (`nginx/conf.d/ecommerce.conf`)**
```nginx
# Upstream definitions
upstream frontend_app {
    server frontend:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream api_gateway {
    server api_gateway:8080 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Main e-commerce server
server {
    listen 80;
    server_name ecommerce.company.com www.ecommerce.company.com;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Static assets with aggressive caching
    location /static/ {
        alias /var/www/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://api_gateway/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # API response caching for GET requests
        proxy_cache api_cache;
        proxy_cache_methods GET HEAD;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Authentication endpoints with stricter rate limiting
    location /api/auth/ {
        limit_req zone=auth burst=10 nodelay;
        
        proxy_pass http://api_gateway/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # No caching for auth endpoints
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }

    # Checkout endpoints with very strict rate limiting
    location /api/checkout/ {
        limit_req zone=checkout burst=5 nodelay;
        
        proxy_pass http://api_gateway/checkout/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Enhanced security for payment processing
        proxy_hide_header X-Powered-By;
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }

    # Frontend application (SPA)
    location / {
        proxy_pass http://frontend_app/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SPA routing support
        try_files $uri $uri/ /index.html;
        
        # Cache static content
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            proxy_cache static_cache;
            proxy_cache_valid 200 1h;
            expires 1h;
            add_header Cache-Control "public";
        }
    }

    # WebSocket support for real-time features
    location /ws/ {
        proxy_pass http://api_gateway/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name ecommerce.company.com www.ecommerce.company.com;

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/ecommerce.crt;
    ssl_certificate_key /etc/nginx/ssl/ecommerce.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Same configuration as HTTP but with HTTPS headers
    # ... (repeat all location blocks with https proxy_set_header)
}
```

#### Communication Flow in E-commerce Platform

```
1. Browser Request:
   Browser → NGINX (port 80/443)

2. NGINX Routes Based on Path:
   /api/* → API Gateway (port 8080)
   /static/* → Static files
   /* → Frontend App (port 3000)

3. API Gateway Routes to Microservices:
   /api/users/* → User Service (port 8081)
   /api/products/* → Product Service (port 8082)
   /api/orders/* → Order Service (port 8083)
   /api/payments/* → Payment Service (port 8084)

4. Services Connect to Databases:
   User Service → User DB (port 5432)
   Product Service → Product DB + Redis Cache
   Order Service → Order DB
   Payment Service → Payment DB (secure network)

5. Network Segmentation:
   - Frontend: NGINX ↔ Frontend App
   - API: NGINX ↔ API Gateway
   - Services: API Gateway ↔ Microservices
   - Database: Services ↔ Databases
   - Cache: Product Service ↔ Redis
   - Payment: Isolated secure network
```

This architecture provides:
- **Load balancing** at multiple levels
- **Network segmentation** for security
- **Service isolation** with dedicated networks
- **Scalability** with independent service scaling
- **Security** with encrypted networks and secrets
- **Performance** with caching and rate limiting
