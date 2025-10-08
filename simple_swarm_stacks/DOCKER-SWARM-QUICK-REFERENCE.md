# Docker Swarm Networking Quick Reference

## Port Modes Cheat Sheet

### ✅ INGRESS MODE (Recommended 99% of cases)
```yaml
ports:
  - target: 8080
    published: 9090
    mode: ingress
```
- **Multiple replicas per node** ✅
- **Load balancing** ✅
- **High availability** ✅
- **Industry standard** ✅

### ⚠️ HOST MODE (Special cases only)
```yaml
ports:
  - target: 8080
    published: 9090
    mode: host
```
- **Only 1 replica per port per node** ❌
- **Fastest performance** ✅
- **No load balancing** ❌
- **Use only for high-performance apps**

## Quick Troubleshooting Commands

```bash
# Check service status
docker service ls
docker service ps <service-name> --no-trunc

# See why replicas are failing
docker service ps backend-ha_backend --no-trunc

# Test connectivity
curl -s http://localhost:9090/actuator/health

# Check logs
docker service logs <service-name>
```

## Your Working Configuration
```yaml
# This is your current CORRECT setup
services:
  backend:
    ports:
      - target: 8080
        published: 9090
        mode: ingress  # ✅ Correct choice
    deploy:
      replicas: 3      # ✅ All 3 will work
    networks:
      - app-network
    
networks:
  app-network:
    driver: overlay    # ✅ Required for Swarm
```

## Remember This:
- **mode: ingress** = Multiple replicas + Load balancing (99% of cases)
- **mode: host** = One replica per node + Direct networking (1% of cases)
- **Routing mesh** = Docker's built-in load balancer (automatic with ingress)
- **Always use ingress mode unless you have a specific performance requirement**
