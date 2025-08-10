# Personal Finance Tracker

A full-stack personal finance application built with Next.js frontend and Django backend, featuring smart budgeting with the 50/30/20 rule.

## 🏗️ Project Structure

```
FINANCE_TRACKER/
├── frontend/                 # Next.js React app
│   ├── app/
│   │   └── page.js          # Main application component
│   ├── package.json
│   └── ...
├── backend/                  # Django REST API
│   ├── finance_tracker/     # Django project
│   ├── finance/             # Django app
│   ├── manage.py
│   └── db.sqlite3           # SQLite database
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup (Django)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install Django djangorestframework django-cors-headers
   ```

4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start Django server:**
   ```bash
   python manage.py runserver
   ```
   Backend will be available at: `http://localhost:8000`

### Frontend Setup (Next.js)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install required packages:**
   ```bash
   npm install recharts lucide-react
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will be available at: `http://localhost:3000`

## 🎯 Features

- ✅ **Dashboard** - Financial overview with charts and trends
- ✅ **Transaction Management** - Add, view, and delete income/expenses
- ✅ **Smart Budgeting** - 50/30/20 rule implementation
- ✅ **6-Month Trends** - Historical savings data
- ✅ **Budget Analysis** - Real-time spending vs budget comparison
- ✅ **SQLite Database** - Persistent data storage

## 📊 API Endpoints

- `GET /api/transactions/` - List all transactions
- `POST /api/transactions/` - Create new transaction
- `DELETE /api/transactions/{id}/` - Delete transaction
- `GET /api/transactions/monthly_summary/` - Current month summary
- `GET /api/transactions/six_month_trend/` - 6-month trend data
- `GET /api/budget/current_budget/` - Get current budget
- `POST /api/budget/update_income/` - Update monthly income
- `GET /api/budget/budget_analysis/` - Budget vs actual analysis

## 🐛 Known Issues (TODO)

### Critical Bugs
- [ ] **Cursor jumping in input fields** - Form inputs lose focus/cursor position while typing
- [ ] **Transaction form validation** - Better client-side validation needed
- [ ] **Error handling** - Improve user feedback for API failures
- [ ] **Loading states** - Add loading indicators for all API calls

### UI/UX Improvements
- [ ] **Responsive design** - Better mobile/tablet layout
- [ ] **Form validation** - Real-time validation with error messages
- [ ] **Confirmation dialogs** - Better delete confirmations
- [ ] **Toast notifications** - Replace alerts with modern notifications
- [ ] **Empty states** - Better messaging when no data exists
- [ ] **Date picker** - Improve date selection UX

### Features to Add
- [ ] **Multiple budgets** - Support for different budget periods
- [ ] **Categories management** - Custom expense/income categories
- [ ] **Data export** - Export transactions to CSV/PDF
- [ ] **Recurring transactions** - Monthly bills, salary automation
- [ ] **Goals tracking** - Savings goals and progress
- [ ] **Reports** - Detailed financial reports
- [ ] **Search & filters** - Transaction search and filtering
- [ ] **Data visualization** - More chart types and insights

### Technical Improvements
- [ ] **Error boundaries** - React error boundaries for better error handling
- [ ] **API caching** - Implement caching for better performance
- [ ] **Database optimization** - Add indexes and optimize queries
- [ ] **Docker setup** - Containerization for easy deployment
- [ ] **Environment variables** - Proper config management
- [ ] **Pagination** - Handle large transaction lists


## 🛠️ Development

### Quick Start
```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Adding New Features
1. Create Django models in `backend/finance/models.py`
2. Create API views in `backend/finance/views.py`
3. Add frontend components in `frontend/app/`
4. Update API calls in the main component

### Database Reset
```bash
cd backend
rm db.sqlite3
python manage.py migrate
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.