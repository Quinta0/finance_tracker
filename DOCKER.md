# Docker Setup Guide

## Prerequisites

1. **Install Docker**: 
   - Visit https://docs.docker.com/get-docker/
   - Follow installation instructions for your OS

2. **Install Docker Compose**:
   - Usually included with Docker Desktop
   - For Linux: `sudo apt install docker-compose-plugin`

## Quick Start

### Option 1: Simple Setup (No Nginx)
```bash
# Build and start services
docker-compose -f docker-compose.simple.yml up -d --build

# View logs
docker-compose -f docker-compose.simple.yml logs -f

# Stop services
docker-compose -f docker-compose.simple.yml down
```

### Option 2: Full Setup (With Nginx)
```bash
# Start development environment
./manage.sh dev

# Start production environment
./manage.sh prod
```

## Docker Commands Reference

### Build and Start
```bash
# Development (simple)
docker-compose -f docker-compose.simple.yml up -d --build

# Development (with nginx)
docker-compose up -d --build

# Production
docker-compose -f docker-compose.prod.yml up -d --build
```

### Management
```bash
# View logs
docker-compose logs -f [service_name]

# Stop services
docker-compose down

# Restart a service
docker-compose restart [service_name]

# Execute commands in container
docker-compose exec backend python manage.py migrate
docker-compose exec frontend npm install
```

### Troubleshooting
```bash
# Remove all containers and rebuild
docker-compose down -v
docker-compose up -d --build

# Check container status
docker ps

# View container logs
docker logs finance_tracker_backend
docker logs finance_tracker_frontend

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

## Docker Permission Issues (Linux)

If you get permission denied errors:

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart and re-login
newgrp docker

# Test docker access
docker run hello-world
```

## Environment Variables

Create `.env` file in project root:
```env
SECRET_KEY=your-secret-key-here
DEBUG=0
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
DOMAIN=yourdomain.com
```

## URLs After Setup

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api  
- **Django Admin**: http://localhost:8000/admin

## Data Persistence

The SQLite database is mounted as a volume, so your data persists across container restarts.

## Backup and Restore

```bash
# Backup database
docker cp finance_tracker_backend:/app/backend/db.sqlite3 ./backup.sqlite3

# Restore database
docker cp ./backup.sqlite3 finance_tracker_backend:/app/backend/db.sqlite3
docker-compose restart backend
```
