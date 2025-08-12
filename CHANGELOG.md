# Changelog

All notable changes to the Finance Tracker project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive README with both manual and Docker deployment instructions
- Management script (`manage.sh`) for easy Docker operations
- Simple deployment script (`deploy.sh`) for quick setup
- Production-ready Docker Compose configuration
- Environment variable template (`.env.example`)

### Changed
- Removed obsolete `version` attribute from Docker Compose files
- Improved Docker build process for frontend (install dev dependencies for build)
- Enhanced project documentation and structure

### Fixed
- Docker permission issues by adding user to docker group
- Frontend build issues with Tailwind CSS dependencies

## [2.0.0] - 2025-08-12

### Added
- 📊 **Expense Analytics & Insights**
  - Smart spending pattern analysis
  - Automated insights and recommendations 
  - Warning alerts for unusual spending
  - Detailed charts and visualizations

- 🎯 **Financial Goals Tracker**
  - Create and track financial goals
  - Progress visualization with progress bars
  - Target date tracking with countdown
  - Goal completion badges

- 📁 **Data Management**
  - Export transactions to CSV format
  - Import transactions from CSV files
  - Data backup and restore functionality

- 🎨 **UI/UX Enhancements**
  - Enhanced navigation with smooth transitions
  - Modern button styling with hover effects
  - Improved form layouts and validation
  - Toast notification system
  - Loading states for all operations
  - Better responsive design
  - Enhanced color scheme and typography

### Technical Improvements
- Added comprehensive form validation with Zod
- Implemented proper error handling
- Enhanced API endpoints for goals management
- Better state management and loading indicators
- Improved database models with Goal tracking
- React error boundaries for better error handling

### Fixed
- Cursor jumping in input fields during typing
- Transaction form validation issues
- Error handling and user feedback
- Loading states for all API calls

## [1.0.0] - 2025-08-01

### Added
- 💳 **Transaction Management**
  - Add, view, edit, and delete income/expenses
  - Transaction categorization
  - Monthly transaction summaries

- 📊 **Dashboard & Analytics**
  - Financial overview with charts and trends
  - 6-month savings trends
  - Real-time budget vs spending analysis

- 🎯 **Smart Budgeting**
  - 50/30/20 rule implementation
  - Custom budget allocation
  - Budget period management

- 🏗️ **Technical Foundation**
  - Django REST Framework backend
  - Next.js React frontend
  - SQLite database for data persistence
  - RESTful API design
  - Modern React components

- 🎨 **User Interface**
  - Responsive design for all devices
  - Dark theme support
  - Modern component library (shadcn/ui)
  - Interactive charts (Recharts)

### Infrastructure
- Docker support for easy deployment
- Docker Compose for development environment
- Nginx reverse proxy configuration
- Environment-based configuration

## [0.1.0] - 2025-07-15

### Added
- Initial project setup
- Basic Django backend structure
- Basic Next.js frontend structure
- Core transaction model
- Simple API endpoints
- Basic UI components
