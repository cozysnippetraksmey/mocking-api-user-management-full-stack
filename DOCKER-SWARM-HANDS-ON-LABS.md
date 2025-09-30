# 🎯 DOCKER SWARM HANDS-ON LAB EXERCISES
## Real Production Training with Your Mocking API Application

**Current Stack Status:**
- ✅ Backend: 2/2 replicas running (cozysnippet/simple-mocking-api:latest)
- 🔄 Frontend: Memory optimized (cozysnippet/simple-mocking-api-portal:latest)
- 🌐 Network: Overlay network with load balancing

---

## 🏋️ LAB 1: BASIC SWARM OPERATIONS (5 minutes)

### Exercise 1.1: Monitor Your Running Stack
```bash
# Check overall stack health
docker stack ps mocking-api-stack

# Monitor services in real-time
watch docker service ls

# Check detailed service status
docker service ps mocking-api-stack_backend
docker service ps mocking-api-stack_frontend
```

### Exercise 1.2: Scale Your Services
```bash
# Scale backend to 3 replicas (production load)
docker service scale mocking-api-stack_backend=3

# Scale frontend to 3 replicas
docker service scale mocking-api-stack_frontend=3

# Watch scaling in action
watch docker service ls
```

**🎯 Expected Result:** You should see replicas increase from 2/2 to 3/3

---

## 🏋️ LAB 2: SERVICE MANAGEMENT (10 minutes)

### Exercise 2.1: Service Inspection
```bash
# Get detailed service configuration
docker service inspect mocking-api-stack_backend --pretty

# Check service resource usage
docker stats $(docker ps -q --filter name=mocking-api-stack)

# View service logs
docker service logs --follow --tail 50 mocking-api-stack_backend
```

### Exercise 2.2: Service Updates (Rolling Updates)
```bash
# Add new environment variable to backend
docker service update \
  --env-add "FEATURE_FLAG=swarm-deployment" \
  mocking-api-stack_backend

# Update frontend with new memory settings
docker service update \
  --limit-memory 800M \
  --reserve-memory 400M \
  mocking-api-stack_frontend

# Monitor rolling update progress
watch docker service ps mocking-api-stack_backend
```

**🎯 Expected Result:** Services update one by one without downtime

---

## 🏋️ LAB 3: NETWORK & LOAD BALANCING (10 minutes)

### Exercise 3.1: Network Inspection
```bash
# List overlay networks
docker network ls --filter driver=overlay

# Inspect your application network
docker network inspect mocking-api-stack_app-network

# Test internal service communication
docker exec $(docker ps -q --filter name=mocking-api-stack_backend | head -1) \
  curl -s http://mocking-api-stack_frontend:4000
```

### Exercise 3.2: Load Balancing Test
```bash
# Test load balancing across backend replicas
for i in {1..10}; do
  curl -s http://localhost:8080/api/users | jq .
  echo "Request $i completed"
  sleep 1
done

# Check which containers handled requests
docker service logs mocking-api-stack_backend | grep "GET /api/users"
```

**🎯 Expected Result:** Requests distributed across multiple backend replicas

---

## 🏋️ LAB 4: HIGH AVAILABILITY TESTING (15 minutes)

### Exercise 4.1: Container Failure Simulation
```bash
# Kill one backend container (simulate failure)
CONTAINER_ID=$(docker ps -q --filter name=mocking-api-stack_backend | head -1)
docker kill $CONTAINER_ID

# Watch Docker Swarm automatically recreate it
watch docker service ps mocking-api-stack_backend

# Test that your API is still accessible
curl http://localhost:8080/api/users
```

### Exercise 4.2: Node Maintenance Mode
```bash
# Put node in maintenance mode (drain)
docker node update --availability drain kali

# Watch services get rescheduled
docker service ps mocking-api-stack_backend

# Reactivate node
docker node update --availability active kali
```

**🎯 Expected Result:** Zero downtime during maintenance

---

## 🏋️ LAB 5: SECRETS & CONFIGURATION (10 minutes)

### Exercise 5.1: Create Application Secrets
```bash
# Create database password secret
echo "production-db-password-2024" | docker secret create db_password -

# Create API key secret
echo "api-key-12345-production" | docker secret create api_key -

# List all secrets
docker secret ls

# Add secrets to backend service
docker service update \
  --secret-add db_password \
  --secret-add api_key \
  mocking-api-stack_backend
```

### Exercise 5.2: Configuration Management
```bash
# Create application configuration
cat <<EOF | docker config create app_properties -
spring.datasource.url=jdbc:postgresql://postgres:5432/production_db
spring.profiles.active=swarm-production
logging.level.com.cozysnippet=INFO
EOF

# Add configuration to service
docker service update \
  --config-add source=app_properties,target=/app/config/app.properties \
  mocking-api-stack_backend
```

**🎯 Expected Result:** Secure configuration without hardcoded values

---

## 🏋️ LAB 6: PRODUCTION MONITORING (15 minutes)

### Exercise 6.1: Health Monitoring
```bash
# Add health checks to services
docker service update \
  --health-cmd "curl -f http://localhost:8080/actuator/health || exit 1" \
  --health-interval 30s \
  --health-retries 3 \
  --health-timeout 5s \
  mocking-api-stack_backend

# Monitor health status
watch docker service ps mocking-api-stack_backend
```

### Exercise 6.2: Resource Monitoring
```bash
# Monitor resource usage across the swarm
docker stats $(docker ps -q --filter name=mocking-api-stack)

# Check node capacity
docker node inspect kali --format '{{.Status.State}}: {{.Description.Resources}}'

# Monitor service performance
docker service logs --follow mocking-api-stack_backend | grep -E "(ERROR|WARN|INFO)"
```

### Exercise 6.3: Performance Testing
```bash
# Install Apache Bench for load testing
sudo apt-get update && sudo apt-get install -y apache2-utils

# Load test your backend API
ab -n 1000 -c 10 http://localhost:8080/api/users

# Monitor during load test
docker stats $(docker ps -q --filter name=mocking-api-stack)
```

**🎯 Expected Result:** Services handle load with automatic distribution

---

## 🏋️ LAB 7: ADVANCED DEPLOYMENT STRATEGIES (20 minutes)

### Exercise 7.1: Rolling Updates
```bash
# Update to latest image version (simulate new release)
docker service update \
  --image cozysnippet/simple-mocking-api:latest \
  --update-parallelism 1 \
  --update-delay 30s \
  mocking-api-stack_backend

# Watch rolling update progress
watch docker service ps mocking-api-stack_backend
```

### Exercise 7.2: Rollback Strategy
```bash
# Simulate failed deployment
docker service update \
  --image nginx:broken-tag \
  mocking-api-stack_frontend

# Perform rollback
docker service rollback mocking-api-stack_frontend

# Monitor rollback progress
watch docker service ps mocking-api-stack_frontend
```

### Exercise 7.3: Blue-Green Deployment Simulation
```bash
# Create "green" version of backend
docker service create \
  --name backend-green \
  --replicas 2 \
  --network mocking-api-stack_app-network \
  cozysnippet/simple-mocking-api:latest

# Test green version
docker exec $(docker ps -q --filter name=backend-green | head -1) \
  curl -s http://localhost:8080/actuator/health

# Switch traffic (remove old, rename new)
docker service rm mocking-api-stack_backend
docker service update --name mocking-api-stack_backend backend-green
```

**🎯 Expected Result:** Zero-downtime deployments

---

## 🎖️ SENIOR DEVELOPER CHALLENGES

### Challenge 1: Multi-Stack Environment
```bash
# Deploy staging environment
docker stack deploy -c swarm-stack.yml staging-stack

# Deploy production environment with different configs
docker stack deploy -c swarm-stack.yml production-stack

# Manage multiple environments
docker stack ls
```

### Challenge 2: Custom Overlay Network
```bash
# Create custom overlay network
docker network create \
  --driver overlay \
  --subnet 10.0.1.0/24 \
  production-network

# Deploy services to custom network
docker service update \
  --network-add production-network \
  mocking-api-stack_backend
```

### Challenge 3: Service Constraints & Placement
```bash
# Add node labels
docker node update --label-add environment=production kali
docker node update --label-add type=api-server kali

# Deploy with placement constraints
docker service update \
  --constraint-add "node.labels.environment==production" \
  --constraint-add "node.labels.type==api-server" \
  mocking-api-stack_backend
```

---

## 🚨 PRODUCTION EMERGENCY PROCEDURES

### Emergency Scaling:
```bash
# Immediate scale up during traffic spike
docker service scale mocking-api-stack_backend=10
docker service scale mocking-api-stack_frontend=5

# Scale down after spike
docker service scale mocking-api-stack_backend=3
docker service scale mocking-api-stack_frontend=2
```

### Emergency Rollback:
```bash
# Emergency rollback all services
docker service rollback mocking-api-stack_backend
docker service rollback mocking-api-stack_frontend

# Force restart if needed
docker service update --force mocking-api-stack_backend
```

### Complete Stack Recovery:
```bash
# Remove failed stack
docker stack rm mocking-api-stack

# Wait for cleanup
sleep 30

# Redeploy from backup
docker stack deploy -c swarm-stack.yml mocking-api-stack
```

---

## 📊 DAILY MONITORING COMMANDS FOR SENIOR DEVS

```bash
# Morning health check routine
docker node ls                              # Cluster health
docker service ls                           # Service overview
docker stack ps mocking-api-stack          # Application health
docker system df                            # Resource usage
docker system events --since 24h           # Recent events

# Performance monitoring
docker stats --no-stream                   # Current resource usage
docker service logs --since 1h mocking-api-stack_backend | grep ERROR
```

---

## 🎯 SUCCESS METRICS FOR YOUR TEAM

By the end of this training, you should be able to:

✅ **Deploy**: Multi-service applications with zero downtime  
✅ **Scale**: Services up/down based on load  
✅ **Monitor**: Service health and resource usage  
✅ **Update**: Rolling updates without service interruption  
✅ **Troubleshoot**: Failed deployments and performance issues  
✅ **Secure**: Applications using secrets and configurations  
✅ **Recover**: From failures using rollback strategies  

**Your application is now running in production-grade Docker Swarm!**
- Frontend: http://localhost:4000 (Load balanced across 2-3 replicas)
- Backend: http://localhost:8080 (Load balanced across 2-3 replicas)
- Automatic failover and self-healing enabled

---

## 🚀 NEXT STEPS FOR YOUR TEAM

1. **Practice these labs** with your actual application
2. **Set up monitoring** (Prometheus + Grafana)
3. **Implement CI/CD** pipelines for automated deployments
4. **Multi-node setup** for true high availability
5. **Security hardening** with secrets and network policies
