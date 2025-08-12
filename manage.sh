#!/bin/bash

# Finance Tracker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
    echo -e "${BLUE}   Finance Tracker Manager${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose up -d
    print_status "Development environment started!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:8000"
    print_status "API: http://localhost:8000/api"
}

# Production environment
start_prod() {
    print_status "Starting production environment..."
    
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your production values before continuing."
        return 1
    fi
    
    docker-compose -f docker-compose.prod.yml up -d
    print_status "Production environment started!"
    print_status "Application: http://localhost"
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_status "Services stopped!"
}

# View logs
view_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing all logs..."
        docker-compose logs -f
    else
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    fi
}

# Backup database
backup_db() {
    local backup_name="backup_$(date +%Y%m%d_%H%M%S).sqlite3"
    print_status "Creating database backup: $backup_name"
    
    # Create data directory if it doesn't exist
    mkdir -p ./data
    
    # Copy database from container
    docker-compose exec backend cp /app/backend/db.sqlite3 "/app/backend/data/$backup_name" 2>/dev/null || \
    docker cp finance_tracker_backend:/app/backend/db.sqlite3 "./data/$backup_name"
    
    print_status "Backup created: ./data/$backup_name"
}

# Restore database
restore_db() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file to restore"
        echo "Usage: $0 restore <backup_file>"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_warning "This will replace the current database. Are you sure? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled."
        return 0
    fi
    
    print_status "Restoring database from: $backup_file"
    docker cp "$backup_file" finance_tracker_backend:/app/backend/db.sqlite3
    print_status "Database restored successfully!"
}

# Update and restart
update() {
    print_status "Updating Finance Tracker..."
    
    # Pull latest changes
    git pull origin main || print_warning "Could not pull latest changes"
    
    # Rebuild and restart
    docker-compose down
    docker-compose up -d --build
    
    print_status "Update completed!"
}

# Reset everything
reset() {
    print_warning "This will delete all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Reset cancelled."
        return 0
    fi
    
    print_status "Resetting everything..."
    docker-compose down -v --rmi all
    docker system prune -f
    print_status "Reset completed!"
}

# Show status
status() {
    print_status "Docker containers status:"
    docker-compose ps
    echo
    print_status "System resource usage:"
    docker stats --no-stream
}

# Show help
show_help() {
    print_header
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  prod        Start production environment"
    echo "  stop        Stop all services"
    echo "  logs [svc]  View logs (optional: specify service)"
    echo "  status      Show container status"
    echo "  backup      Backup database"
    echo "  restore     Restore database from backup"
    echo "  update      Update and restart services"
    echo "  reset       Reset everything (destructive)"
    echo "  help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0 dev                    # Start development environment"
    echo "  $0 logs backend           # View backend logs"
    echo "  $0 restore ./data/backup.sqlite3  # Restore database"
    echo
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        "dev"|"development")
            start_dev
            ;;
        "prod"|"production")
            start_prod
            ;;
        "stop")
            stop_services
            ;;
        "logs")
            view_logs "$2"
            ;;
        "status")
            status
            ;;
        "backup")
            backup_db
            ;;
        "restore")
            restore_db "$2"
            ;;
        "update")
            update
            ;;
        "reset")
            reset
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
