#!/bin/bash

# Quick deployment script for Finance Tracker
# This script provides a simple way to deploy the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   Finance Tracker Deployment${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

# Check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_status "✅ All requirements met!"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        print_warning "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your production values:"
        echo "  - Set DOMAIN to your domain name"
        echo "  - Generate a new SECRET_KEY for Django"
        echo "  - Configure email settings (optional)"
        echo ""
        echo "Edit now? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        print_status "✅ Environment file exists"
    fi
}

# Deploy application
deploy() {
    local mode=${1:-"dev"}
    
    print_status "Deploying Finance Tracker in $mode mode..."
    
    if [ "$mode" = "prod" ]; then
        # Production deployment
        setup_environment
        ./manage.sh prod
        print_status "🚀 Production deployment complete!"
        print_status "Access your application at: http://localhost"
    else
        # Development deployment
        ./manage.sh dev
        print_status "🚀 Development deployment complete!"
        print_status "Frontend: http://localhost:3000"
        print_status "Backend: http://localhost:8000"
        print_status "API: http://localhost:8000/api"
    fi
}

# Show usage
show_usage() {
    print_header
    echo "Usage: $0 [dev|prod]"
    echo ""
    echo "Options:"
    echo "  dev     Deploy in development mode (default)"
    echo "  prod    Deploy in production mode"
    echo ""
    echo "Examples:"
    echo "  $0         # Deploy in development mode"
    echo "  $0 dev     # Deploy in development mode"
    echo "  $0 prod    # Deploy in production mode"
    echo ""
}

# Main function
main() {
    case "${1:-dev}" in
        "dev"|"development")
            print_header
            check_requirements
            deploy "dev"
            ;;
        "prod"|"production")
            print_header
            check_requirements
            deploy "prod"
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
