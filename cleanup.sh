#!/bin/bash

# Finance Tracker Cleanup Script
# Removes temporary files, caches, and build artifacts

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[CLEAN]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   Finance Tracker Cleanup${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

# Clean Python files
clean_python() {
    print_status "Cleaning Python cache files..."
    
    # Remove __pycache__ directories
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove .pyc files
    find . -name "*.pyc" -delete 2>/dev/null || true
    
    # Remove .pyo files
    find . -name "*.pyo" -delete 2>/dev/null || true
    
    # Remove Python egg info
    find . -name "*.egg-info" -type d -exec rm -rf {} + 2>/dev/null || true
    
    print_status "✅ Python cleanup complete"
}

# Clean Node.js files
clean_nodejs() {
    print_status "Cleaning Node.js files..."
    
    # Remove node_modules (will be reinstalled by Docker)
    if [ -d "frontend/node_modules" ]; then
        print_warning "Removing frontend/node_modules (will be reinstalled)"
        rm -rf frontend/node_modules
    fi
    
    # Remove .next build directory
    if [ -d "frontend/.next" ]; then
        print_status "Removing frontend/.next build directory"
        rm -rf frontend/.next
    fi
    
    # Remove npm cache files
    find . -name ".npm" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "npm-debug.log*" -delete 2>/dev/null || true
    find . -name "yarn-debug.log*" -delete 2>/dev/null || true
    find . -name "yarn-error.log*" -delete 2>/dev/null || true
    
    print_status "✅ Node.js cleanup complete"
}

# Clean Docker files
clean_docker() {
    print_status "Cleaning Docker artifacts..."
    
    # Remove dangling images
    docker image prune -f 2>/dev/null || print_warning "Could not clean Docker images (permission denied)"
    
    # Remove unused containers
    docker container prune -f 2>/dev/null || print_warning "Could not clean Docker containers (permission denied)"
    
    # Remove unused networks
    docker network prune -f 2>/dev/null || print_warning "Could not clean Docker networks (permission denied)"
    
    print_status "✅ Docker cleanup complete"
}

# Clean log files
clean_logs() {
    print_status "Cleaning log files..."
    
    # Remove Django log files
    find . -name "*.log" -delete 2>/dev/null || true
    
    # Remove debug files
    find . -name "debug.log" -delete 2>/dev/null || true
    
    print_status "✅ Log cleanup complete"
}

# Clean temporary files
clean_temp() {
    print_status "Cleaning temporary files..."
    
    # Remove editor temporary files
    find . -name "*.swp" -delete 2>/dev/null || true
    find . -name "*.swo" -delete 2>/dev/null || true
    find . -name "*~" -delete 2>/dev/null || true
    find . -name ".#*" -delete 2>/dev/null || true
    
    # Remove OS temporary files
    find . -name ".DS_Store" -delete 2>/dev/null || true
    find . -name "Thumbs.db" -delete 2>/dev/null || true
    
    # Remove backup files
    find . -name "*.bak" -delete 2>/dev/null || true
    find . -name "*.backup" -delete 2>/dev/null || true
    find . -name "*.old" -delete 2>/dev/null || true
    
    print_status "✅ Temporary file cleanup complete"
}

# Clean everything
clean_all() {
    print_header
    clean_python
    clean_nodejs
    clean_logs
    clean_temp
    
    print_status "🎉 All cleanup complete!"
    echo
    print_status "You may also want to run:"
    echo "  ./manage.sh stop    # Stop Docker containers"
    echo "  docker system prune # Clean Docker system (requires permissions)"
}

# Clean with Docker
clean_with_docker() {
    print_header
    clean_python
    clean_nodejs
    clean_docker
    clean_logs
    clean_temp
    
    print_status "🎉 Full cleanup with Docker complete!"
}

# Show help
show_help() {
    print_header
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --all       Clean all files (default)"
    echo "  --docker    Clean all files including Docker artifacts"
    echo "  --python    Clean only Python cache files"
    echo "  --nodejs    Clean only Node.js files"
    echo "  --logs      Clean only log files"
    echo "  --temp      Clean only temporary files"
    echo "  --help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0              # Clean all files"
    echo "  $0 --docker     # Clean all files including Docker"
    echo "  $0 --python     # Clean only Python files"
    echo
}

# Main function
main() {
    case "${1:-all}" in
        "--all"|"all"|"")
            clean_all
            ;;
        "--docker"|"docker")
            clean_with_docker
            ;;
        "--python"|"python")
            print_header
            clean_python
            ;;
        "--nodejs"|"nodejs")
            print_header
            clean_nodejs
            ;;
        "--logs"|"logs")
            print_header
            clean_logs
            ;;
        "--temp"|"temp")
            print_header
            clean_temp
            ;;
        "--help"|"help"|"-h")
            show_help
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
