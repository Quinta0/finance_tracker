// API Configuration
// Try to detect the correct API URL at runtime
const getApiBaseUrl = () => {
  // If we have a build-time environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // For client-side, detect from current location
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // Use the same host but port 8810 for API
    return `${protocol}//${hostname}:8810/api`;
  }
  
  // Fallback for server-side
  return 'http://localhost:8810/api';
};

const API_BASE_URL = getApiBaseUrl();

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // ==================== TRANSACTIONS ====================

  // Get all transactions
  async getTransactions() {
    return this.get('/transactions/');
  }

  // Create a new transaction
  async createTransaction(transactionData) {
    return this.post('/transactions/', transactionData);
  }

  // Update a transaction
  async updateTransaction(id, transactionData) {
    return this.put(`/transactions/${id}/`, transactionData);
  }

  // Delete a transaction
  async deleteTransaction(id) {
    return this.delete(`/transactions/${id}/`);
  }

  // Get monthly summary
  async getMonthlySummary() {
    return this.get('/transactions/monthly_summary/');
  }

  // Get six month trend
  async getSixMonthTrend() {
    return this.get('/transactions/six_month_trend/');
  }

  // ==================== CATEGORIES ====================

  // Get all categories
  async getCategories() {
    return this.get('/categories/');
  }

  // Get categories grouped by type
  async getCategoriesByType() {
    return this.get('/categories/by_type/');
  }

  // Create a new category
  async createCategory(categoryData) {
    return this.post('/categories/', categoryData);
  }

  // Update a category
  async updateCategory(id, categoryData) {
    return this.put(`/categories/${id}/`, categoryData);
  }

  // Delete a category
  async deleteCategory(id) {
    return this.delete(`/categories/${id}/`);
  }

  // Create default categories
  async createDefaultCategories() {
    return this.post('/categories/create_defaults/');
  }

  // ==================== BUDGETS ====================

  // Get all budgets
  async getBudgets() {
    return this.get('/budget/');
  }

  // Get current budget
  async getCurrentBudget() {
    return this.get('/budget/current_budget/');
  }

  // Update monthly income
  async updateMonthlyIncome(income, periodId = null) {
    return this.post('/budget/update_income/', {
      monthly_income: income,
      period_id: periodId,
    });
  }

  // Get budget analysis
  async getBudgetAnalysis(periodId = null) {
    const params = periodId ? `?period_id=${periodId}` : '';
    return this.get(`/budget/budget_analysis/${params}`);
  }

  // ==================== BUDGET PERIODS ====================

  // Get all budget periods
  async getBudgetPeriods() {
    return this.get('/budget-periods/');
  }

  // Get current budget period
  async getCurrentBudgetPeriod() {
    return this.get('/budget-periods/current/');
  }

  // Create a new budget period
  async createBudgetPeriod(periodData) {
    return this.post('/budget-periods/', periodData);
  }

  // ==================== GOALS ====================

  // Get all goals
  async getGoals() {
    return this.get('/goals/');
  }

  // Get active goals
  async getActiveGoals() {
    return this.get('/goals/active_goals/');
  }

  // Get completed goals
  async getCompletedGoals() {
    return this.get('/goals/completed_goals/');
  }

  // Create a new goal
  async createGoal(goalData) {
    return this.post('/goals/', goalData);
  }

  // Update a goal
  async updateGoal(id, goalData) {
    return this.put(`/goals/${id}/`, goalData);
  }

  // Update goal progress
  async updateGoalProgress(id, amount) {
    return this.post(`/goals/${id}/update_progress/`, {
      amount: amount,
    });
  }

  // Delete a goal
  async deleteGoal(id) {
    return this.delete(`/goals/${id}/`);
  }

  // ==================== RECURRING TRANSACTIONS ====================

  // Get all recurring transactions
  async getRecurringTransactions() {
    return this.get('/recurring-transactions/');
  }

  // Get due recurring transactions
  async getDueRecurringTransactions() {
    return this.get('/recurring-transactions/due_transactions/');
  }

  // Create a new recurring transaction
  async createRecurringTransaction(transactionData) {
    return this.post('/recurring-transactions/', transactionData);
  }

  // Update a recurring transaction
  async updateRecurringTransaction(id, transactionData) {
    return this.put(`/recurring-transactions/${id}/`, transactionData);
  }

  // Process a recurring transaction occurrence
  async processRecurringTransaction(id) {
    return this.post(`/recurring-transactions/${id}/process_occurrence/`);
  }

  // Delete a recurring transaction
  async deleteRecurringTransaction(id) {
    return this.delete(`/recurring-transactions/${id}/`);
  }
}

// Create a singleton instance
const apiService = new ApiService();

// Export individual methods for convenience
export const {
  // Transactions
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getSixMonthTrend,
  
  // Categories
  getCategories,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
  createDefaultCategories,
  
  // Budgets
  getBudgets,
  getCurrentBudget,
  updateMonthlyIncome,
  getBudgetAnalysis,
  
  // Budget Periods
  getBudgetPeriods,
  getCurrentBudgetPeriod,
  createBudgetPeriod,
  
  // Goals
  getGoals,
  getActiveGoals,
  getCompletedGoals,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  
  // Recurring Transactions
  getRecurringTransactions,
  getDueRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  processRecurringTransaction,
  deleteRecurringTransaction,
} = apiService;

// Export the apiService instance as both default and named export
export default apiService;
export { apiService };
