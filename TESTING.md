# Testing the Finance Tracker Docker Setup

## Step 1: Fix Docker Permissions

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply the group membership (choose one):
newgrp docker  # or logout and login again

# Test Docker access
docker run hello-world
```

You should see a "Hello from Docker!" message.

## Step 2: Test the Simple Setup

```bash
cd /home/quinta/Documents/finance_tracker

# Build and start containers
docker-compose -f docker-compose.simple.yml up -d --build

# Check if containers are running
docker-compose -f docker-compose.simple.yml ps
```

You should see both containers running:
- `finance_tracker_backend`
- `finance_tracker_frontend`

## Step 3: Test the Services

### Backend Test:
```bash
# Test API endpoint
curl http://localhost:8000/api/transactions/

# Should return: [] (empty array)
```

### Frontend Test:
```bash
# Test frontend
curl http://localhost:3000

# Should return HTML content
```

## Step 4: Open in Browser

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:8000/api/transactions/
3. **Django Admin**: http://localhost:8000/admin

## Step 5: View Logs (if issues)

```bash
# View all logs
docker-compose -f docker-compose.simple.yml logs

# View specific service logs
docker-compose -f docker-compose.simple.yml logs backend
docker-compose -f docker-compose.simple.yml logs frontend

# Follow logs in real-time
docker-compose -f docker-compose.simple.yml logs -f
```

## Step 6: Stop the Services

```bash
docker-compose -f docker-compose.simple.yml down
```

## Automated Test Script

Run the automated test:
```bash
./test-docker.sh
```

## Troubleshooting

### Container Won't Start
```bash
# Check container status
docker ps -a

# Inspect specific container
docker inspect finance_tracker_backend

# Check logs
docker logs finance_tracker_backend
```

### Port Conflicts
If ports 3000 or 8000 are in use:
```bash
# Check what's using the ports
sudo lsof -i :3000
sudo lsof -i :8000

# Kill existing processes
sudo kill -9 <process_id>
```

### Database Issues
```bash
# Access backend container
docker-compose -f docker-compose.simple.yml exec backend bash

# Run migrations manually
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Complete Reset
```bash
# Stop and remove everything
docker-compose -f docker-compose.simple.yml down -v --rmi all

# Clean Docker system
docker system prune -a

# Rebuild from scratch
docker-compose -f docker-compose.simple.yml up -d --build
```

## Success Indicators

✅ `docker run hello-world` works  
✅ Both containers show as "Up" in `docker ps`  
✅ `curl http://localhost:8000/api/transactions/` returns `[]`  
✅ `curl http://localhost:3000` returns HTML  
✅ Browser shows the Finance Tracker dashboard at http://localhost:3000  
✅ Can create transactions through the web interface  

## Next Steps

Once the simple setup works:

1. **Try the full setup**: `./manage.sh dev`
2. **Test production setup**: `./manage.sh prod`
3. **Set up SSL**: Configure certificates in `nginx/ssl/`
4. **Deploy**: Use on any server with Docker support
