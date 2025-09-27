# 🐳 Docker & Kubernetes Deployment Guide

This guide will help you containerize your User Management System and deploy it to Docker Hub and Kubernetes for learning and production use.

## 📋 Prerequisites

### Required Tools
- **Docker** (v20.0+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Hub Account** - [Create Account](https://hub.docker.com/)
- **kubectl** (for Kubernetes) - [Install kubectl](https://kubernetes.io/docs/tasks/tools/)
- **Kubernetes cluster** (Minikube, Docker Desktop, or cloud provider)

### Verify Installation
```bash
docker --version
docker-compose --version
kubectl version --client
```

## 🏗️ Project Structure

```
kubernetes-with-teach-bruno/
├── simple_mocking_api/          # Spring Boot Backend
│   ├── Dockerfile               # Backend container config
│   └── .dockerignore           # Files to exclude from build
├── mocking-api-portal/          # Angular Frontend
│   ├── Dockerfile               # Frontend container config
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore           # Files to exclude from build
├── docker-compose.yml          # Local development orchestration
├── k8s-deployment.yaml         # Kubernetes deployment config
├── build-and-push.sh          # Docker Hub build & push script
├── deploy-k8s.sh              # Kubernetes deployment script
└── DOCKER-DEPLOYMENT.md       # This guide
```

## 🚀 Quick Start

### Step 1: Prepare for Docker Hub

1. **Update your Docker Hub username** in the scripts:
   ```bash
   # Edit build-and-push.sh
   DOCKER_USERNAME="your-actual-dockerhub-username"  # Replace this!
   
   # Edit deploy-k8s.sh
   DOCKER_USERNAME="your-actual-dockerhub-username"  # Replace this!
   ```

2. **Login to Docker Hub**:
   ```bash
   docker login
   ```

### Step 2: Build and Push to Docker Hub

Run the automated build script:
```bash
./build-and-push.sh
```

This script will:
- ✅ Build both frontend and backend Docker images
- ✅ Push them to your Docker Hub repository
- ✅ Provide you with the image URLs

### Step 3: Local Testing with Docker Compose

Test your containers locally:
```bash
# Start both services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access your application:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080/api/users

## ☸️ Kubernetes Deployment

### Step 1: Deploy to Kubernetes

Run the Kubernetes deployment script:
```bash
./deploy-k8s.sh
```

This will:
- ✅ Create a `user-management` namespace
- ✅ Deploy backend with 2 replicas
- ✅ Deploy frontend with 2 replicas
- ✅ Set up services and networking
- ✅ Configure health checks and resource limits

### Step 2: Access Your Application

Get the external IP:
```bash
kubectl get services -n user-management
```

For **LoadBalancer** service, use the EXTERNAL-IP.
For **NodePort** or **ClusterIP**, use port forwarding:
```bash
kubectl port-forward service/user-management-frontend-service 8080:80 -n user-management
```

## 🔧 Manual Docker Commands

### Build Images Manually
```bash
# Build backend
cd simple_mocking_api
docker build -t your-username/user-management-backend:latest .

# Build frontend
cd ../mocking-api-portal
docker build -t your-username/user-management-frontend:latest .
```

### Push to Docker Hub
```bash
docker push your-username/user-management-backend:latest
docker push your-username/user-management-frontend:latest
```

### Run Containers Manually
```bash
# Run backend
docker run -d \
  --name user-backend \
  -p 8080:8080 \
  your-username/user-management-backend:latest

# Run frontend
docker run -d \
  --name user-frontend \
  -p 80:80 \
  your-username/user-management-frontend:latest
```

## 📊 Kubernetes Management Commands

### Monitoring and Debugging
```bash
# Check pod status
kubectl get pods -n user-management

# View detailed pod info
kubectl describe pod <pod-name> -n user-management

# Check logs
kubectl logs -f deployment/user-management-backend -n user-management
kubectl logs -f deployment/user-management-frontend -n user-management

# Get service details
kubectl get services -n user-management -o wide

# Check deployments
kubectl get deployments -n user-management
```

### Scaling Applications
```bash
# Scale backend to 3 replicas
kubectl scale deployment user-management-backend --replicas=3 -n user-management

# Scale frontend to 3 replicas
kubectl scale deployment user-management-frontend --replicas=3 -n user-management
```

### Updating Deployments
```bash
# Update backend image
kubectl set image deployment/user-management-backend backend=your-username/user-management-backend:v2 -n user-management

# Update frontend image
kubectl set image deployment/user-management-frontend frontend=your-username/user-management-frontend:v2 -n user-management
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Docker Build Failures
```bash
# Check Docker daemon
docker info

# Clean up build cache
docker system prune -a

# Check Dockerfile syntax
docker build --no-cache -t test-image .
```

#### 2. Angular Build Issues
```bash
# Increase Node.js memory (if needed)
export NODE_OPTIONS="--max-old-space-size=4096"

# Clear Angular cache
rm -rf .angular/cache
rm -rf node_modules
npm install
```

#### 3. Kubernetes Pod Issues
```bash
# Check pod events
kubectl describe pod <pod-name> -n user-management

# Check resource usage
kubectl top pods -n user-management

# Check network connectivity
kubectl exec -it <pod-name> -n user-management -- curl http://user-management-backend-service:8080/api/users
```

#### 4. Service Connectivity Issues
```bash
# Test service DNS resolution
kubectl exec -it <frontend-pod> -n user-management -- nslookup user-management-backend-service

# Check service endpoints
kubectl get endpoints -n user-management
```

## 🌍 Cloud Provider Specific Instructions

### AWS EKS
```bash
# Create EKS cluster
eksctl create cluster --name user-management-cluster --region us-west-2

# Update kubeconfig
aws eks update-kubeconfig --region us-west-2 --name user-management-cluster
```

### Google GKE
```bash
# Create GKE cluster
gcloud container clusters create user-management-cluster --zone us-central1-a

# Get credentials
gcloud container clusters get-credentials user-management-cluster --zone us-central1-a
```

### Azure AKS
```bash
# Create AKS cluster
az aks create --resource-group myResourceGroup --name user-management-cluster --node-count 2

# Get credentials
az aks get-credentials --resource-group myResourceGroup --name user-management-cluster
```

## 📈 Production Considerations

### Security
- Use multi-stage Docker builds ✅ (Already implemented)
- Run containers as non-root user
- Use secrets for sensitive data
- Implement network policies

### Performance
- Configure resource requests and limits ✅ (Already implemented)
- Set up horizontal pod autoscaling
- Use persistent volumes for data
- Implement caching strategies

### Monitoring
- Add Prometheus metrics
- Set up logging with ELK stack
- Configure alerting
- Use health checks ✅ (Already implemented)

## 🎯 Next Steps for Learning

1. **Docker Fundamentals**
   - Understand image layers and caching
   - Learn multi-stage builds
   - Practice with different base images

2. **Kubernetes Concepts**
   - Pods, Services, Deployments
   - ConfigMaps and Secrets
   - Ingress and networking
   - Persistent Volumes

3. **Advanced Topics**
   - Helm charts for package management
   - CI/CD pipelines with GitHub Actions
   - Service mesh (Istio)
   - Monitoring and observability

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Docker and Kubernetes logs
3. Consult official documentation
4. Create GitHub issues for project-specific problems

---

🎉 **Your User Management System is now ready for containerized deployment!** 

The Docker images can be easily shared, deployed on any platform, and scaled with Kubernetes. This setup provides an excellent foundation for learning DevOps, container orchestration, and cloud-native development practices.
