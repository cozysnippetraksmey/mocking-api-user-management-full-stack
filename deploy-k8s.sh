#!/bin/bash

# Kubernetes Deployment Script for User Management System
NAMESPACE="user-management"
DOCKER_USERNAME="your-dockerhub-username"  # Replace with your Docker Hub username

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying User Management System to Kubernetes...${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

# Update the deployment file with your Docker Hub username
echo -e "${YELLOW}📝 Updating deployment configuration...${NC}"
if [[ "$DOCKER_USERNAME" == "your-dockerhub-username" ]]; then
    echo -e "${RED}❌ Please update DOCKER_USERNAME in this script with your actual Docker Hub username!${NC}"
    exit 1
fi

sed -i.bak "s/your-dockerhub-username/$DOCKER_USERNAME/g" k8s-deployment.yaml

# Apply the Kubernetes configuration
echo -e "${YELLOW}🎯 Applying Kubernetes configuration...${NC}"
kubectl apply -f k8s-deployment.yaml

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment configuration applied successfully${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# Wait for deployments to be ready
echo -e "${YELLOW}⏳ Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/user-management-backend -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s deployment/user-management-frontend -n $NAMESPACE

# Get service information
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Service Information:${NC}"
kubectl get services -n $NAMESPACE

echo ""
echo -e "${YELLOW}📱 Access your application:${NC}"
echo -e "${BLUE}To access the frontend, get the external IP:${NC}"
echo "kubectl get service user-management-frontend-service -n $NAMESPACE"
echo ""
echo -e "${BLUE}To check pod status:${NC}"
echo "kubectl get pods -n $NAMESPACE"
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo "kubectl logs -f deployment/user-management-backend -n $NAMESPACE"
echo "kubectl logs -f deployment/user-management-frontend -n $NAMESPACE"
echo ""
echo -e "${BLUE}To delete the deployment:${NC}"
echo "kubectl delete namespace $NAMESPACE"
