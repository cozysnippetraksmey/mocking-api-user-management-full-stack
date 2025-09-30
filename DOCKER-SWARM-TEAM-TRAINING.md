# 🎯 DOCKER SWARM SENIOR DEVELOPER FAST TRACK
## Complete Mastery Guide with Your Production Application

**Your Live Application:**
- Backend: `cozysnippet/simple-mocking-api:latest` (Spring Boot API)
- Frontend: `cozysnippet/simple-mocking-api-portal:latest` (Angular SSR)
- Status: ✅ Currently deployed and running in Docker Swarm

---

## 📚 COMPLETE LEARNING PATH (3-4 Hours Total)

### 🎯 PHASE 1: FUNDAMENTALS (30 minutes)
### 🎯 PHASE 2: SERVICE MANAGEMENT (45 minutes)  
### 🎯 PHASE 3: SCALING & LOAD BALANCING (30 minutes)
### 🎯 PHASE 4: HIGH AVAILABILITY (45 minutes)
### 🎯 PHASE 5: PRODUCTION OPERATIONS (60 minutes)

---

## 🚀 PHASE 1: DOCKER SWARM FUNDAMENTALS

### Key Concepts You Must Master:

**1. Swarm vs Single Container:**
- Single Container: `docker run` - runs on one machine
- Docker Swarm: `docker service create` - runs across cluster with HA

**2. Essential Components:**
- **Manager Nodes**: Make decisions, schedule tasks
- **Worker Nodes**: Execute containers  
- **Services**: Define desired state (replicas, networks, resources)
- **Tasks**: Individual container instances
- **Stacks**: Multi-service applications (like your frontend + backend)

### Core Commands Every Senior Dev Must Know:

```bash
# === CLUSTER STATUS ===
docker info | grep Swarm          # Check if swarm is active
docker node ls                    # List all cluster nodes
docker swarm join-token worker    # Get token to add workers

# === SERVICE BASICS ===
docker service ls                 # List all services
docker service ps SERVICE_NAME    # List tasks for specific service
docker service inspect SERVICE_NAME --pretty  # Detailed service info

# === STACK OPERATIONS ===
docker stack ls                   # List all application stacks
docker stack services STACK_NAME  # Services in specific stack
docker stack ps STACK_NAME        # All tasks in stack
```

**🎯 Practice Now:** Run these commands on your current deployment to see the output.

---

## 🏗️ PHASE 2: SERVICE MANAGEMENT MASTERY

### Lab 2A: Service Creation from Scratch

```bash
# Create a single service manually
docker service create \
  --name test-nginx \
  --replicas 3 \
  --publish 8888:80 \
  nginx:alpine

# Scale the service
docker service scale test-nginx=5

# Check service status
docker service ps test-nginx

# Remove the test service
docker service rm test-nginx
```

### Lab 2B: Your Application Service Management

```bash
# Check your current backend service details
docker service inspect mocking-api-stack_backend --pretty

# View live service logs
docker service logs --follow --tail 50 mocking-api-stack_backend

# Update service with new environment variable
docker service update \
  --env-add "DEPLOYMENT_MODE=swarm" \
  --env-add "CLUSTER_NODE={{.Node.Hostname}}" \
  mocking-api-stack_backend

# Monitor the rolling update
watch docker service ps mocking-api-stack_backend
```

### Lab 2C: Resource Management

```bash
# Update resource constraints
docker service update \
  --limit-memory 1G \
  --limit-cpu 1.0 \
  --reserve-memory 512M \
  --reserve-cpu 0.5 \
  mocking-api-stack_backend

# Check resource allocation
docker stats $(docker ps -q --filter name=mocking-api-stack)
```

**🎯 Success Criteria:** Services update without downtime, resource limits applied correctly.

---

## ⚖️ PHASE 3: SCALING & LOAD BALANCING

### Lab 3A: Dynamic Scaling

```bash
# Scale backend for high load
docker service scale mocking-api-stack_backend=4

# Scale frontend for more concurrent users  
docker service scale mocking-api-stack_frontend=3

# Monitor scaling progress
watch docker service ls

# Test load distribution
for i in {1..20}; do
  curl -s "http://localhost:8080/api/users" > /dev/null
  echo "Request $i sent"
done

# Check which containers handled requests
docker service logs mocking-api-stack_backend | tail -20
```

### Lab 3B: Load Balancing Verification

```bash
# Create a simple load test script
cat > load_test.sh << 'EOF'
#!/bin/bash
for i in {1..100}; do
  RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/api/users)
  echo "Request $i: Status $RESPONSE"
  sleep 0.1
done
EOF

chmod +x load_test.sh
./load_test.sh

# Monitor during load test
docker stats $(docker ps -q --filter name=mocking-api-stack)
```

### Lab 3C: Auto-Scaling Configuration

```bash
# Configure service with optimal scaling parameters
docker service update \
  --replicas 2 \
  --update-parallelism 1 \
  --update-delay 10s \
  --update-failure-action rollback \
  --rollback-parallelism 1 \
  --rollback-delay 5s \
  mocking-api-stack_backend
```

**🎯 Success Criteria:** Load evenly distributed, auto-scaling works correctly.

---

## 🔥 PHASE 4: HIGH AVAILABILITY & FAILOVER

### Lab 4A: Container Failure Recovery

```bash
# Simulate container crashes
BACKEND_CONTAINER=$(docker ps -q --filter name=mocking-api-stack_backend | head -1)
docker kill $BACKEND_CONTAINER

# Watch automatic recovery
watch docker service ps mocking-api-stack_backend

# Test service availability during recovery
while true; do
  curl -s http://localhost:8080/api/users > /dev/null && echo "✅ API Available" || echo "❌ API Down"
  sleep 2
done
```

### Lab 4B: Node Maintenance Simulation

```bash
# Put node in maintenance mode
docker node update --availability drain kali

# Check service redistribution (on single node, services will show as "drained")
docker service ps mocking-api-stack_backend

# Bring node back online
docker node update --availability active kali

# Verify services are running normally
docker service ps mocking-api-stack_backend
```

### Lab 4C: Network Partition Testing

```bash
# Test internal service communication
docker exec $(docker ps -q --filter name=mocking-api-stack_frontend | head -1) \
  nc -zv mocking-api-stack_backend 8080

# Test overlay network functionality
docker network inspect mocking-api-stack_app-network
```

**🎯 Success Criteria:** Zero downtime during failures, automatic recovery works.

---

## 🏭 PHASE 5: PRODUCTION OPERATIONS

### Lab 5A: Secrets Management (Production Security)

```bash
# Create production secrets
echo "prod-db-password-$(date +%s)" | docker secret create prod_db_password -
echo "jwt-secret-key-$(openssl rand -hex 32)" | docker secret create jwt_secret -

# Deploy with secrets
docker service update \
  --secret-add source=prod_db_password,target=/run/secrets/db_password \
  --secret-add source=jwt_secret,target=/run/secrets/jwt_secret \
  mocking-api-stack_backend

# Verify secrets are mounted
docker exec $(docker ps -q --filter name=mocking-api-stack_backend | head -1) \
  ls -la /run/secrets/
```

### Lab 5B: Configuration as Code

```bash
# Create application configuration
cat > production.properties << EOF
spring.profiles.active=production
spring.datasource.url=jdbc:postgresql://postgres:5432/prod_db
logging.level.com.cozysnippet=WARN
management.endpoints.web.exposure.include=health,metrics,info
EOF

# Create Docker config
docker config create prod_config production.properties

# Apply configuration
docker service update \
  --config-add source=prod_config,target=/app/config/application-production.properties \
  mocking-api-stack_backend
```

### Lab 5C: Monitoring & Alerting Setup

```bash
# Deploy Prometheus for monitoring
docker service create \
  --name prometheus \
  --publish 9090:9090 \
  --mount type=bind,source=/etc/prometheus,target=/etc/prometheus \
  prom/prometheus

# Deploy Grafana for visualization
docker service create \
  --name grafana \
  --publish 3000:3000 \
  --env GF_SECURITY_ADMIN_PASSWORD=admin \
  grafana/grafana

# Add monitoring to your services
docker service update \
  --label-add "prometheus.scrape=true" \
  --label-add "prometheus.port=8080" \
  mocking-api-stack_backend
```

### Lab 5D: Backup & Recovery

```bash
# Backup your stack configuration
docker config ls > stack-configs-backup.txt
docker secret ls > stack-secrets-backup.txt
docker service ls --format "table {{.Name}}\t{{.Image}}\t{{.Replicas}}" > services-backup.txt

# Create stack backup script
cat > backup-stack.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups/$DATE

# Export stack configuration
docker stack config mocking-api-stack > backups/$DATE/stack-config.yml

# Export service configurations
docker service inspect mocking-api-stack_backend > backups/$DATE/backend-config.json
docker service inspect mocking-api-stack_frontend > backups/$DATE/frontend-config.json

echo "Backup completed: backups/$DATE/"
EOF

chmod +x backup-stack.sh
./backup-stack.sh
```

**🎯 Success Criteria:** Production-ready monitoring, backup/recovery procedures working.

---

## 🎖️ FINAL MASTERY TEST

### The Ultimate Senior Developer Challenge:

**Your mission:** Deploy a complete production environment with the following requirements:

1. **Multi-environment setup**: staging + production stacks
2. **High availability**: 3 backend replicas, 2 frontend replicas
3. **Security**: All sensitive data in secrets
4. **Monitoring**: Health checks and resource monitoring
5. **CI/CD ready**: Rolling updates with rollback capability
6. **Network isolation**: Custom overlay networks
7. **Load testing**: Handle 1000 concurrent requests

```bash
# Execute this complete production deployment:

# 1. Create production secrets
echo "super-secure-prod-password" | docker secret create prod_db_secret -
echo "production-jwt-key-$(openssl rand -hex 32)" | docker secret create prod_jwt_secret -

# 2. Deploy production stack with full configuration
docker stack deploy -c production-swarm-stack.yml production

# 3. Scale for production load
docker service scale production_backend=3
docker service scale production_frontend=2

# 4. Configure monitoring
docker service update --health-cmd "curl -f http://localhost:8080/actuator/health" production_backend

# 5. Perform load test
ab -n 1000 -c 50 http://localhost:8080/api/users

# 6. Monitor performance during test
watch docker stats $(docker ps -q --filter name=production)
```

---

## 📋 TEAM TRAINING CHECKLIST

**For each team member, ensure they can:**

- [ ] Initialize and manage Docker Swarm clusters
- [ ] Deploy multi-service applications using stacks
- [ ] Scale services up/down based on demand
- [ ] Perform rolling updates without downtime
- [ ] Handle emergency rollbacks
- [ ] Manage secrets and configurations securely
- [ ] Monitor service health and performance
- [ ] Troubleshoot common deployment issues
- [ ] Implement high availability strategies
- [ ] Perform disaster recovery procedures

---

## 🚀 CONGRATULATIONS!

You now have a **production-grade Docker Swarm** running your MockingAPI application with:

✅ **High Availability**: Multiple replicas with automatic failover  
✅ **Load Balancing**: Traffic distributed across replicas  
✅ **Rolling Updates**: Zero-downtime deployments  
✅ **Resource Management**: CPU and memory limits  
✅ **Network Isolation**: Secure overlay networking  
✅ **Service Discovery**: Automatic DNS resolution between services  

**Your application is accessible at:**
- Frontend: http://localhost:4000 (Angular SSR with load balancing)
- Backend: http://localhost:8080 (Spring Boot API with load balancing)

This is **enterprise-grade container orchestration** that can handle production workloads and scale to support your team's applications!
