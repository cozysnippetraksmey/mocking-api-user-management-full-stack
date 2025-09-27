#!/bin/bash

# Docker Hub Build and Push Script for User Management System
# Make sure to replace 'your-dockerhub-username' with your actual Docker Hub username

# Set your Docker Hub username
DOCKER_USERNAME="your-dockerhub-username"  # Replace this with your Docker Hub username
APP_NAME="user-management"
VERSION="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Starting Docker build and push process...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Login to Docker Hub
echo -e "${YELLOW}🔐 Logging into Docker Hub...${NC}"
echo "Please enter your Docker Hub credentials:"
docker login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker Hub login failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Successfully logged into Docker Hub${NC}"

# Build Backend Image
echo -e "${YELLOW}🏗️  Building backend image...${NC}"
cd simple_mocking_api
docker build -t $DOCKER_USERNAME/$APP_NAME-backend:$VERSION .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend image built successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
fi

# Build Frontend Image
echo -e "${YELLOW}🏗️  Building frontend image...${NC}"
cd ../mocking-api-portal
docker build -t $DOCKER_USERNAME/$APP_NAME-frontend:$VERSION .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend image built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

cd ..

# Push Backend Image
echo -e "${YELLOW}🚀 Pushing backend image to Docker Hub...${NC}"
docker push $DOCKER_USERNAME/$APP_NAME-backend:$VERSION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend image pushed successfully${NC}"
else
    echo -e "${RED}❌ Backend push failed!${NC}"
    exit 1
fi

# Push Frontend Image
echo -e "${YELLOW}🚀 Pushing frontend image to Docker Hub...${NC}"
docker push $DOCKER_USERNAME/$APP_NAME-frontend:$VERSION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend image pushed successfully${NC}"
else
    echo -e "${RED}❌ Frontend push failed!${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All images built and pushed successfully!${NC}"
echo -e "${BLUE}📦 Your Docker images are now available at:${NC}"
echo -e "   🔗 Backend:  docker.io/$DOCKER_USERNAME/$APP_NAME-backend:$VERSION"
echo -e "   🔗 Frontend: docker.io/$DOCKER_USERNAME/$APP_NAME-frontend:$VERSION"
echo ""
echo -e "${YELLOW}📋 To run your application:${NC}"
echo -e "   docker-compose up -d"
echo ""
echo -e "${YELLOW}📋 To pull and run from Docker Hub:${NC}"
echo -e "   docker run -d -p 8080:8080 --name backend $DOCKER_USERNAME/$APP_NAME-backend:$VERSION"
echo -e "   docker run -d -p 80:80 --name frontend $DOCKER_USERNAME/$APP_NAME-frontend:$VERSION"
