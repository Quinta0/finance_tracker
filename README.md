# 💰 Personal Finance Tracker

A comprehensive personal finance management application built with Django REST Framework (backend) and Next.js (frontend). Track your expenses, manage budgets with the 50/30/20 rule, set financial goals, and gain insights into your spending patterns.

## 🌟 About This Project

This Finance Tracker was created as my summer 2025 project to gain hands-on experience with full-stack web development while building something genuinely useful for personal finance management. It combines my passion for learning modern web technologies (Django REST Framework, Next.js, Docker) with the practical need for a comprehensive finance tracking solution.

The project has been an exciting journey of exploring full-stack development, from designing RESTful APIs and database models to creating responsive React components and implementing containerized deployment. While built primarily as a learning experience, it's designed to be a fully functional application that anyone can use to take control of their finances.

**Key Learning Goals Achieved:**
- 🖥️ **Backend Development**: RESTful API design with Django REST Framework
- 🎨 **Frontend Development**: Modern React with Next.js and component libraries
- 🐳 **DevOps**: Docker containerization and deployment automation
- 📊 **Data Visualization**: Interactive charts and financial analytics
- 🎯 **Product Design**: User-centered design for financial management

## ✨ Features

- **📊 Dashboard**: Real-time overview of your financial status with interactive charts
- **💳 Transaction Management**: Track income and expenses with smart categorization  
- **🎯 Smart Budgeting**: 50/30/20 rule implementation with custom allocation
- **📈 Analytics & Insights**: Comprehensive spending analysis with personalized recommendations
- **🏆 Financial Goals**: Set, track, and achieve your savings objectives
- **📁 Data Management**: CSV export/import functionality for easy data migration
- **🌙 Modern UI**: Responsive design with dark theme support
- **🐳 Docker Ready**: Easy deployment with Docker and Docker Compose

## 🚀 Quick Start (Recommended)

### Using Docker (Self-Hosting)

The easiest way to get started is using Docker. This method handles all dependencies and configuration automatically.

#### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- Git

#### 1. Clone the Repository
```bash
git clone https://github.com/Quinta0/finance_tracker.git
cd finance_tracker
```

#### 2. Start Development Environment
```bash
# Start the development environment
./manage.sh dev

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000/api
# - Admin Panel: http://localhost:8000/admin
```

#### 3. Production Deployment
```bash
# Copy environment template and configure
cp .env.example .env
nano .env  # Edit with your production values

# Start production environment
./manage.sh prod

# Application will be available at:
# - Frontend: http://localhost
# - API: http://localhost/api
```

### Management Script Commands

The `manage.sh` script provides convenient commands for managing your Finance Tracker:

```bash
./manage.sh dev         # Start development environment
./manage.sh prod        # Start production environment  
./manage.sh stop        # Stop all services
./manage.sh logs        # View all logs
./manage.sh logs backend # View specific service logs
./manage.sh status      # Show container status
./manage.sh backup      # Backup database
./manage.sh restore     # Restore database from backup
./manage.sh update      # Update and restart services
./manage.sh reset       # Reset everything (destructive)
```

## 🛠️ Manual Installation (Development)

For developers who want to run the application manually or contribute to the project.

### Prerequisites
- Python 3.9+ 
- Node.js 18+
- npm or yarn
- Git

### Backend Setup (Django)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   
   # On Linux/macOS:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up database:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server:**
   ```bash
   python manage.py runserver
   ```
   
   Backend API will be available at: `http://localhost:8000/api`

### Frontend Setup (Next.js)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at: `http://localhost:3000`

### Running Both Services

You can run both services simultaneously using two terminal windows, or use the provided development scripts.

## 🏗️ Project Structure

```
finance_tracker/
├── 🐳 Docker & Deployment
│   ├── docker-compose.yml          # Development environment
│   ├── docker-compose.prod.yml     # Production environment
│   ├── manage.sh                   # Management script
│   ├── .env.example               # Environment template
│   └── nginx/                     # Nginx configuration
│
├── 🖥️ Backend (Django REST API)
│   ├── finance_tracker/           # Django project settings
│   ├── finance/                   # Main app
│   │   ├── models.py              # Database models
│   │   ├── views.py               # API endpoints
│   │   ├── serializers.py         # Data serialization
│   │   └── urls.py                # URL routing
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile                 # Backend container
│   └── manage.py                  # Django management
│
├── 🎨 Frontend (Next.js React)
│   ├── app/                       # Next.js app directory
│   │   ├── page.js                # Main page component
│   │   ├── layout.js              # App layout
│   │   └── globals.css            # Global styles
│   ├── components/                # React components
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── AddTransactionForm.jsx # Transaction forms
│   │   ├── Analytics.jsx          # Charts and insights
│   │   ├── BudgetManagement.jsx   # Budget controls
│   │   ├── FinancialGoals.jsx     # Goals tracker
│   │   └── ui/                    # UI components (shadcn/ui)
│   ├── lib/                       # Utilities
│   │   ├── api.js                 # API client
│   │   └── utils.js               # Helper functions
│   ├── package.json               # Node.js dependencies
│   └── Dockerfile                 # Frontend container
│
└── 📚 Documentation
    ├── README.md                  # This file
    ├── DOCKER.md                  # Docker guide
    └── TESTING.md                 # Testing guide
```

## 📊 API Reference

### Authentication
Currently using session-based authentication. Token-based auth coming soon.

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions/` | List all transactions |
| `POST` | `/api/transactions/` | Create new transaction |
| `PUT` | `/api/transactions/{id}/` | Update transaction |
| `DELETE` | `/api/transactions/{id}/` | Delete transaction |
| `GET` | `/api/transactions/monthly_summary/` | Current month summary |
| `GET` | `/api/transactions/six_month_trend/` | 6-month trend data |

### Budget Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/budget/current_budget/` | Get current budget |
| `POST` | `/api/budget/update_income/` | Update monthly income |
| `GET` | `/api/budget/budget_analysis/` | Budget vs actual analysis |

### Financial Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/goals/` | List all goals |
| `POST` | `/api/goals/` | Create new goal |
| `PUT` | `/api/goals/{id}/` | Update goal |
| `DELETE` | `/api/goals/{id}/` | Delete goal |
| `GET` | `/api/goals/active_goals/` | Get active goals |
| `POST` | `/api/goals/{id}/update_progress/` | Update progress |

## 🔧 Configuration

### Environment Variables

Create a `.env` file from the template for production:

```bash
# Copy template
cp .env.example .env
```

Key variables:
- `DOMAIN`: Your domain name (for production)
- `SECRET_KEY`: Django secret key (generate new for production)
- `DEBUG`: Set to 0 for production
- Email settings (optional, for notifications)

### Database Configuration

**Development**: Uses SQLite by default (simple, no setup required)

**Production**: Can use PostgreSQL by setting environment variables:
```bash
DB_ENGINE=django.db.backends.postgresql
DB_NAME=finance_tracker
DB_USER=finance_user
DB_PASSWORD=your_secure_password
DB_HOST=db
DB_PORT=5432
```

## 📱 Usage Guide

### Getting Started
1. **Set Monthly Income**: Go to Budget Management and set your monthly income
2. **Add Transactions**: Start adding your income and expenses
3. **Review Dashboard**: Check your financial overview and insights
4. **Set Goals**: Create savings goals and track progress
5. **Analyze Spending**: Use analytics to understand your spending patterns

### Best Practices
- **Categorize Transactions**: Use consistent categories for better insights
- **Regular Updates**: Add transactions regularly for accurate tracking
- **Review Goals**: Check and update your financial goals monthly
- **Export Data**: Regularly backup your data using CSV export

## 🚀 Deployment

### Docker Production Setup

1. **Server Requirements**:
   - Linux server with Docker installed
   - Domain name (optional, can use IP)
   - 1GB+ RAM, 10GB+ storage

2. **Deploy**:
   ```bash
   git clone https://github.com/Quinta0/finance_tracker.git
   cd finance_tracker
   cp .env.example .env
   # Edit .env with your values
   ./manage.sh prod
   ```

3. **SSL Setup** (optional):
   - Add SSL certificates to `nginx/ssl/`
   - Update nginx configuration

### Cloud Deployment

The application can be deployed on:
- **DigitalOcean**: Using Docker Droplet
- **AWS**: ECS or EC2 with Docker
- **Heroku**: Using container registry
- **VPS**: Any provider supporting Docker

## 🛠️ Development

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Workflow

```bash
# Start development environment
./manage.sh dev

# View logs
./manage.sh logs

# Reset database (development only)
cd backend
rm db.sqlite3
python manage.py migrate

# Run tests
python manage.py test  # Backend tests
npm test              # Frontend tests (if available)
```

### Adding Features

1. **Backend**: Add models in `models.py`, views in `views.py`
2. **Frontend**: Create components in `components/`
3. **API**: Update `serializers.py` and `urls.py`
4. **Testing**: Add tests for new functionality

## 🐛 Troubleshooting

### Common Issues

**Docker permission denied**:
```bash
sudo usermod -aG docker $USER
# Log out and log back in
```

**Port already in use**:
```bash
./manage.sh stop
# Or kill specific processes
sudo lsof -i :3000
sudo lsof -i :8000
```

**Database issues**:
```bash
# Reset database (development)
./manage.sh stop
rm backend/db.sqlite3
./manage.sh dev
```

**Build failures**:
```bash
# Clean rebuild
./manage.sh stop
docker system prune -f
./manage.sh dev
```

### Getting Help

- 📋 **Issues**: [GitHub Issues](https://github.com/Quinta0/finance_tracker/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Quinta0/finance_tracker/discussions)
- 📖 **Documentation**: Check `DOCKER.md` and `TESTING.md`

## 📋 Roadmap

### Current Features ✅
- Transaction management with categories
- 50/30/20 budget rule implementation
- Financial goals tracking
- Spending analytics and insights
- Data export/import (CSV)
- Modern responsive UI
- Docker deployment

### Upcoming Features 🚧
- [ ] **Recurring Transactions**: Automatic monthly bills and income
- [ ] **Advanced Reports**: PDF reports and detailed analytics
- [ ] **Categories Management**: Custom expense/income categories
- [ ] **Budget Templates**: Pre-defined budget templates

### Long-term Vision 🎯
- Investment tracking
- Multi-currency support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Django REST Framework**: Powerful API development
- **Next.js**: Modern React framework
- **shadcn/ui**: Beautiful UI components
- **Recharts**: Excellent charting library
- **Tailwind CSS**: Utility-first CSS framework

---

<div align="center">

**⭐ If you find this project helpful, please consider giving it a star!**

[Report Bug](https://github.com/Quinta0/finance_tracker/issues) · [Request Feature](https://github.com/Quinta0/finance_tracker/issues) · [Contribute](https://github.com/Quinta0/finance_tracker/pulls)

</div>
