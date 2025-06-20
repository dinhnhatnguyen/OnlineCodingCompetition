#!/bin/bash

# Script để quản lý RecommendationSystem container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to build and start the container
start_container() {
    print_status "Building and starting RecommendationSystem container..."
    
    # Stop existing container if running
    if docker ps -q -f name=recommendation_system > /dev/null; then
        print_warning "Stopping existing container..."
        docker-compose down
    fi
    
    # Build and start
    docker-compose up --build -d
    
    print_status "Container started successfully!"
    print_status "API is available at: http://localhost:3000"
    print_status "Health check endpoint: http://localhost:3000/"
}

# Function to stop the container
stop_container() {
    print_status "Stopping RecommendationSystem container..."
    docker-compose down
    print_status "Container stopped successfully!"
}

# Function to show container status
show_status() {
    print_status "Container status:"
    docker-compose ps
    
    if docker ps -q -f name=recommendation_system > /dev/null; then
        print_status "Container is running. Checking health..."
        sleep 2
        if curl -f http://localhost:3000/ > /dev/null 2>&1; then
            print_status "✅ API is healthy and responding"
        else
            print_warning "⚠️  Container is running but API is not responding"
        fi
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing container logs (press Ctrl+C to exit):"
    docker-compose logs -f
}

# Function to restart container
restart_container() {
    print_status "Restarting RecommendationSystem container..."
    docker-compose restart
    print_status "Container restarted successfully!"
}

# Main script logic
case "${1:-}" in
    "start")
        check_docker
        start_container
        ;;
    "stop")
        check_docker
        stop_container
        ;;
    "restart")
        check_docker
        restart_container
        ;;
    "status")
        check_docker
        show_status
        ;;
    "logs")
        check_docker
        show_logs
        ;;
    "rebuild")
        check_docker
        print_status "Rebuilding container from scratch..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        print_status "Container rebuilt and started successfully!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|rebuild}"
        echo ""
        echo "Commands:"
        echo "  start   - Build and start the container"
        echo "  stop    - Stop the container"
        echo "  restart - Restart the container"
        echo "  status  - Show container status and health"
        echo "  logs    - Show container logs"
        echo "  rebuild - Rebuild container from scratch"
        exit 1
        ;;
esac
