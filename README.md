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
- ✅ **Transaction Management** - Add, view, edit, and delete income/expenses
- ✅ **Smart Budgeting** - 50/30/20 rule implementation
- ✅ **Expense Analytics & Insights** - Smart spending analysis with recommendations
- ✅ **Financial Goals Tracker** - Set and track savings goals with progress visualization
- ✅ **Data Export/Import** - Export transactions to CSV and import data
- ✅ **6-Month Trends** - Historical savings data
- ✅ **Budget Analysis** - Real-time spending vs budget comparison
- ✅ **Enhanced UI/UX** - Modern design with smooth animations and transitions
- ✅ **SQLite Database** - Persistent data storage

## 📊 API Endpoints

### Transactions
- `GET /api/transactions/` - List all transactions
- `POST /api/transactions/` - Create new transaction
- `PUT /api/transactions/{id}/` - Update transaction
- `DELETE /api/transactions/{id}/` - Delete transaction
- `GET /api/transactions/monthly_summary/` - Current month summary
- `GET /api/transactions/six_month_trend/` - 6-month trend data

### Budget
- `GET /api/budget/current_budget/` - Get current budget
- `POST /api/budget/update_income/` - Update monthly income
- `GET /api/budget/budget_analysis/` - Budget vs actual analysis

### Goals
- `GET /api/goals/` - List all financial goals
- `POST /api/goals/` - Create new goal
- `PUT /api/goals/{id}/` - Update goal
- `DELETE /api/goals/{id}/` - Delete goal
- `GET /api/goals/active_goals/` - Get active goals only
- `GET /api/goals/completed_goals/` - Get completed goals only
- `POST /api/goals/{id}/update_progress/` - Update goal progress

## 🐛 Known Issues (TODO)

### Critical Bugs
- ✅ **Cursor jumping in input fields** - Form inputs lose focus/cursor position while typing
- ✅ **Transaction form validation** - Better client-side validation needed
- ✅ **Error handling** - Improve user feedback for API failures
- ✅ **Loading states** - Add loading indicators for all API calls

### UI/UX Improvements
- ✅ **Responsive design** - Better mobile/tablet layout
- ✅ **Form validation** - Real-time validation with error messages
- ✅ **Confirmation dialogs** - Better delete confirmations
- ✅ **Toast notifications** - Replace alerts with modern notifications
- ✅ **Empty states** - Better messaging when no data exists
- ✅ **Date picker** - Improve date selection UX
- ✅ **Enhanced navigation** - Modern navigation with smooth transitions and active states
- ✅ **Visual improvements** - Added hover effects, animations, and better styling
- [ ] **Improve the navigation bar** - Use the Navigation menu components from shadcn
- [ ] **Style refator** - Use a monochromatic color palette and rework the style to be more modern
- [ ] **Components refactoring** - Implement standard components via schadcn ui library

### Features to Add
- [ ] **Multiple budgets** - Support for different budget periods
- [ ] **Categories management** - Custom expense/income categories
- ✅ **Edit transactions** - Edit feature inside the transactions page for editing a transaction
- ✅ **Data export** - Export transactions to CSV/PDF
- [ ] **Recurring transactions** - Monthly bills, salary automation
- ✅ **Goals tracking** - Savings goals and progress
- ✅ **Smart insights** - Automated spending analysis and recommendations
- [ ] **Reports** - Detailed financial reports
- [ ] **Search & filters** - Transaction search and filtering
- ✅ **Data visualization** - More chart types and insights

### Technical Improvements
- ✅ **Error boundaries** - React error boundaries for better error handling
- [ ] **API caching** - Implement caching for better performance
- [ ] **Database optimization** - Add indexes and optimize queries
- [ ] **Docker setup** - Containerization for easy deployment
- [ ] **Environment variables** - Proper config management
- [ ] **Pagination** - Handle large transaction lists

## ✨ Recent Updates (v2.0)

### 🚀 Major Features Added:
1. **📊 Expense Analytics & Insights**
   - Smart spending pattern analysis
   - Automated insights and recommendations 
   - Warning alerts for unusual spending
   - Detailed charts and visualizations

2. **🎯 Financial Goals Tracker**
   - Create and track financial goals
   - Progress visualization with progress bars
   - Target date tracking with countdown
   - Goal completion badges

3. **📁 Data Management**
   - Export transactions to CSV format
   - Import transactions from CSV files
   - Data backup and restore functionality

### 🎨 UI/UX Enhancements:
- ✅ Enhanced navigation with smooth transitions
- ✅ Modern button styling with hover effects
- ✅ Improved form layouts and validation
- ✅ Toast notification system
- ✅ Loading states for all operations
- ✅ Better responsive design
- ✅ Enhanced color scheme and typography

### 🔧 Technical Improvements:
- ✅ Added comprehensive form validation with Zod
- ✅ Implemented proper error handling
- ✅ Enhanced API endpoints for goals management
- ✅ Better state management and loading indicators
- ✅ Improved database models with Goal tracking


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