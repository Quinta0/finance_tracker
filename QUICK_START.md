# 🚀 Quick Start Guide

This guide will get you up and running with Finance Tracker in under 5 minutes!

## Prerequisites

Make sure you have these installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git

## Option 1: Express Setup (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Quinta0/finance_tracker.git
cd finance_tracker

# 2. Start the application
./deploy.sh

# 3. Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8000/api
```

## Option 2: Manual Docker Setup

```bash
# 1. Clone the repository
git clone https://github.com/Quinta0/finance_tracker.git
cd finance_tracker

# 2. Start development environment
./manage.sh dev

# 3. View logs (optional)
./manage.sh logs

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
# Admin Panel: http://localhost:8000/admin
```

## Option 3: Production Deployment

```bash
# 1. Clone and configure
git clone https://github.com/Quinta0/finance_tracker.git
cd finance_tracker

# 2. Setup environment
cp .env.example .env
nano .env  # Edit with your settings

# 3. Deploy to production
./manage.sh prod

# 4. Access the application
# Application: http://localhost
# API: http://localhost/api
```

## First Steps

1. **Open the application** at http://localhost:3000
2. **Set your monthly income** in Budget Management
3. **Add some transactions** to see the dashboard in action
4. **Create financial goals** to track your savings
5. **Explore the analytics** for spending insights

## Common Commands

```bash
# View application status
./manage.sh status

# View logs
./manage.sh logs

# Stop the application
./manage.sh stop

# Backup your data
./manage.sh backup

# Clean up temporary files
./cleanup.sh

# Update the application
./manage.sh update
```

## Troubleshooting

### Docker Permission Issues
```bash
sudo usermod -aG docker $USER
# Log out and log back in
```

### Ports Already in Use
```bash
./manage.sh stop
```

### Reset Everything
```bash
./manage.sh reset
# This will delete all data!
```

## Getting Help

- 📖 **Full Documentation**: See [README.md](README.md)
- 🐳 **Docker Guide**: See [DOCKER.md](DOCKER.md)
- 🧪 **Testing Guide**: See [TESTING.md](TESTING.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Quinta0/finance_tracker/issues)

---

**🎉 You're all set! Start tracking your finances like a pro!**
