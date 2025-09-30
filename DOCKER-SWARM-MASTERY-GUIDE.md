# 🚀 DOCKER SWARM COMPLETE MASTERY GUIDE
## Senior Developer Fast Track with Real Production Examples

**Your Application Stack**: MockingAPI with Angular Frontend + Spring Boot Backend
**Images**: `cozysnippet/simple-mocking-api:latest` & `cozysnippet/simple-mocking-api-portal:latest`

---

## 📋 QUICK REFERENCE COMMANDS

### Essential Swarm Commands You MUST Know:

```bash
# === SWARM CLUSTER MANAGEMENT ===
docker swarm init                           # Initialize swarm
docker swarm join-token worker              # Get worker join token
docker swarm join-token manager             # Get manager join token
docker swarm leave --force                  # Leave swarm (use --force on manager)

# === NODE MANAGEMENT ===
docker node ls                              # List all nodes
docker node inspect NODE_ID                # Inspect node details
docker node update --availability drain NODE_ID    # Drain node (stop scheduling)
docker node update --availability active NODE_ID   # Activate node
docker node promote NODE_ID                # Promote worker to manager
docker node demote NODE_ID                 # Demote manager to worker

# === SERVICE MANAGEMENT ===
docker service ls                           # List all services
docker service ps SERVICE_NAME             # List tasks for service
docker service inspect SERVICE_NAME        # Inspect service details
docker service logs SERVICE_NAME           # View service logs
docker service scale SERVICE_NAME=5        # Scale service to 5 replicas

# === STACK MANAGEMENT ===
docker stack ls                             # List all stacks
docker stack services STACK_NAME           # List services in stack
docker stack ps STACK_NAME                 # List tasks in stack
docker stack rm STACK_NAME                 # Remove entire stack

# === NETWORK MANAGEMENT ===
docker network ls                           # List networks
docker network inspect NETWORK_NAME        # Inspect network details
docker network create --driver overlay NET_NAME  # Create overlay network
```

---

## 🎯 HANDS-ON LAB 1: Basic Service Operations

### Lab 1.1: Check Your Current Deployment

```bash
# Check stack status
docker stack ps mocking-api-stack

# Check individual service details
docker service ps mocking-api-stack_backend
docker service ps mocking-api-stack_frontend

# View service logs
docker service logs mocking-api-stack_backend
docker service logs mocking-api-stack_frontend
```

### Lab 1.2: Scaling Services

```bash
# Scale backend to 3 replicas
docker service scale mocking-api-stack_backend=3

# Scale frontend to 3 replicas  
docker service scale mocking-api-stack_frontend=3

# Check the scaling progress
watch docker service ls
```

### Lab 1.3: Resource Monitoring

```bash
# Check resource usage
docker stats

# Check node resource allocation
docker node ls
docker system df
```

---

## 🎯 HANDS-ON LAB 2: Rolling Updates & Deployments

### Lab 2.1: Perform Rolling Update

```bash
# Update backend service with new environment variable
docker service update \
  --env-add "NEW_FEATURE=enabled" \
  mocking-api-stack_backend

# Update frontend with new resource limits
docker service update \
  --limit-memory 512M \
  --limit-cpu 0.5 \
  mocking-api-stack_frontend

# Watch the rolling update in action
watch docker service ps mocking-api-stack_backend
```

### Lab 2.2: Rollback to Previous Version

```bash
# Rollback backend service
docker service rollback mocking-api-stack_backend

# Check rollback status
docker service ps mocking-api-stack_backend
```

---

## 🎯 HANDS-ON LAB 3: High Availability Testing

### Lab 3.1: Simulate Node Failure

```bash
# Drain the current node (simulate failure)
docker node update --availability drain $(docker node ls -q)

# Watch services migrate (in single node, they'll stay but be marked as drained)
docker service ps mocking-api-stack_backend

# Reactivate the node
docker node update --availability active $(docker node ls -q)
```

### Lab 3.2: Service Health Checks

```bash
# Add health check to backend service
docker service update \
  --health-cmd "curl -f http://localhost:8080/actuator/health || exit 1" \
  --health-interval 30s \
  --health-retries 3 \
  --health-timeout 5s \
  mocking-api-stack_backend

# Monitor health status
docker service ps mocking-api-stack_backend
```

---

## 🎯 HANDS-ON LAB 4: Advanced Networking

### Lab 4.1: Network Inspection

```bash
# List overlay networks
docker network ls --filter driver=overlay

# Inspect your application network
docker network inspect mocking-api-stack_app-network

# Check network connectivity between services
docker exec $(docker ps -q --filter name=mocking-api-stack_backend) \
  ping -c 3 mocking-api-stack_frontend
```

### Lab 4.2: External Load Balancer

```bash
# Deploy NGINX as external load balancer
docker service create \
  --name nginx-lb \
  --publish 80:80 \
  --mount type=bind,source=/path/to/nginx.conf,destination=/etc/nginx/nginx.conf \
  nginx:alpine
```

---

## 🎯 HANDS-ON LAB 5: Secrets Management

### Lab 5.1: Create and Use Secrets

```bash
# Create database password secret
echo "mysecretpassword" | docker secret create db_password -

# Create API key secret
echo "your-api-key-here" | docker secret create api_key -

# List secrets
docker secret ls

# Update service to use secrets
docker service update \
  --secret-add db_password \
  --secret-add api_key \
  mocking-api-stack_backend
```

### Lab 5.2: Configuration Management

```bash
# Create configuration file
echo "spring.datasource.url=jdbc:postgresql://postgres:5432/mockingdb" | \
  docker config create app_config -

# Add config to service
docker service update \
  --config-add app_config \
  mocking-api-stack_backend
```

---

## 🎯 HANDS-ON LAB 6: Production Monitoring

### Lab 6.1: Service Monitoring

```bash
# Monitor service performance
docker service logs --follow mocking-api-stack_backend

# Check service resource usage
docker stats $(docker ps -q --filter name=mocking-api-stack)

# Monitor service health
while true; do
  docker service ps mocking-api-stack_backend
  sleep 5
done
```

### Lab 6.2: Stack Monitoring

```bash
# Monitor entire stack
docker stack ps mocking-api-stack

# Check stack services
docker stack services mocking-api-stack

# Detailed stack inspection
docker stack ps mocking-api-stack --format "table {{.ID}}\t{{.NAME}}\t{{.NODE}}\t{{.DESIRED STATE}}\t{{.CURRENT STATE}}"
```

---

## 🏆 PRODUCTION BEST PRACTICES

### 1. Multi-Node Setup (for Production)

```bash
# On Manager Node:
docker swarm init --advertise-addr MANAGER_IP

# On Worker Nodes:
docker swarm join --token WORKER_TOKEN MANAGER_IP:2377

# Best Practice: 3 or 5 manager nodes for HA
docker node promote worker-node-1
docker node promote worker-node-2
```

### 2. Resource Management

```bash
# Set resource constraints properly
docker service update \
  --limit-memory 1G \
  --limit-cpu 1.0 \
  --reserve-memory 512M \
  --reserve-cpu 0.5 \
  SERVICE_NAME
```

### 3. Placement Constraints

```bash
# Deploy to specific node types
docker service update \
  --constraint-add "node.role==worker" \
  --constraint-add "node.labels.environment==production" \
  SERVICE_NAME
```

### 4. Update Strategies

```bash
# Configure rolling update strategy
docker service update \
  --update-parallelism 1 \
  --update-delay 30s \
  --update-failure-action rollback \
  --update-monitor 60s \
  SERVICE_NAME
```

---

## 🔥 ADVANCED SCENARIOS FOR SENIOR DEVELOPERS

### Scenario 1: Blue-Green Deployment

```yaml
version: '3.8'
services:
  backend-blue:
    image: cozysnippet/simple-mocking-api:latest
    environment:
      - VERSION=blue
    deploy:
      replicas: 2
      labels:
        - "traefik.http.routers.api-blue.rule=Host(\`api.example.com\`) && PathPrefix(\`/api\`)"

  backend-green:
    image: cozysnippet/simple-mocking-api:v2
    environment:
      - VERSION=green
    deploy:
      replicas: 0  # Start with 0, scale up when ready
      labels:
        - "traefik.http.routers.api-green.rule=Host(\`api.example.com\`) && PathPrefix(\`/api\`)"
```

### Scenario 2: Auto-Scaling with Constraints

```yaml
version: '3.8'
services:
  backend:
    image: cozysnippet/simple-mocking-api:latest
    deploy:
      replicas: 2
      placement:
        constraints:
          - "node.labels.type==compute"
          - "node.role==worker"
        max_replicas_per_node: 1
      resources:
        limits:
          memory: 1G
          cpus: "1.0"
        reservations:
          memory: 512M
          cpus: "0.5"
```

### Scenario 3: Multi-Environment Stack

```yaml
version: '3.8'
services:
  backend:
    image: cozysnippet/simple-mocking-api:latest
    environment:
      - SPRING_PROFILES_ACTIVE={{.Task.Slot}}  # Use task slot as environment
    deploy:
      replicas: 3
      placement:
        preferences:
          - spread: node.labels.zone  # Spread across availability zones
```

---

## 🛠️ TROUBLESHOOTING GUIDE

### Common Issues & Solutions:

**1. Service Won't Start:**
```bash
# Check service events
docker service ps SERVICE_NAME --no-trunc

# Check node resources
docker node inspect NODE_ID

# Check service logs
docker service logs SERVICE_NAME
```

**2. Network Issues:**
```bash
# Test service connectivity
docker exec CONTAINER_ID ping SERVICE_NAME

# Inspect overlay network
docker network inspect NETWORK_NAME

# Check ingress routing
docker service inspect SERVICE_NAME --format '{{.Spec.EndpointSpec.Ports}}'
```

**3. Performance Issues:**
```bash
# Check resource usage
docker stats

# Monitor service performance
docker service logs --follow --tail 100 SERVICE_NAME

# Check service placement
docker service ps SERVICE_NAME
```

---

## 🎯 DAILY OPERATIONS CHEAT SHEET

### Morning Checklist:
```bash
docker node ls                    # Check cluster health
docker service ls                 # Check service status
docker stack ls                   # Check stack deployments
docker system df                  # Check disk usage
```

### Scaling Operations:
```bash
docker service scale SERVICE=N   # Scale specific service
docker service update --replicas N SERVICE  # Alternative scaling
```

### Emergency Operations:
```bash
docker service rollback SERVICE  # Emergency rollback
docker service update --force SERVICE  # Force service restart
docker node update --availability drain NODE  # Emergency node maintenance
```

---

## 🏅 FINAL CHALLENGE: Complete Stack Management

Your mission is to:
1. Scale your backend to 3 replicas
2. Update frontend with new environment variable
3. Perform a rolling update
4. Monitor the entire process
5. Test failover by draining your node

Are you ready to execute these operations on your production-ready Docker Swarm cluster?
