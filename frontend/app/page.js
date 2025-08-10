"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, Area } from 'recharts';
import { DollarSign, TrendingUp, Target, Plus, Edit2, Trash2, Calendar, Calculator, Activity } from 'lucide-react';

const PersonalFinanceTracker = () => {
  // API Base URL
  const API_BASE = 'http://localhost:8000/api';
  
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    monthly_income: 0,
    monthly_expenses: 0,
    monthly_savings: 0,
    expense_breakdown: {},
    transaction_count: 0
  });
  const [sixMonthTrend, setSixMonthTrend] = useState([]);
  const [budgetData, setBudgetData] = useState({
    monthly_income: 5000,
    needs_budget: 2500,
    wants_budget: 1500,
    savings_goal: 1000
  });
  // State for budget input (separate from API data)
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [budgetInput, setBudgetInput] = useState('5000');
  const [loading, setLoading] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: 'food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Categories
  const expenseCategories = ['food', 'transportation', 'entertainment', 'shopping', 'bills', 'healthcare', 'other'];
  const incomeCategories = ['salary', 'freelance', 'investment', 'bonus', 'other'];

  // API Functions
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions/monthly_summary/`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchSixMonthTrend = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions/six_month_trend/`);
      const data = await response.json();
      setSixMonthTrend(data);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions/`);
      const data = await response.json();
      setTransactions(data.results || data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBudgetData = async () => {
    try {
      const response = await fetch(`${API_BASE}/budget/current_budget/`);
      const data = await response.json();
      setBudgetData(data);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    }
  };

  const fetchBudgetAnalysis = async () => {
    try {
      const response = await fetch(`${API_BASE}/budget/budget_analysis/`);
      const data = await response.json();
      setBudgetAnalysis(data);
    } catch (error) {
      console.error('Error fetching budget analysis:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchSixMonthTrend();
    fetchTransactions();
    fetchBudgetData();
    fetchBudgetAnalysis();
  }, []);

  // Update budget input when budget data is loaded
  useEffect(() => {
    if (budgetData.monthly_income) {
      setBudgetInput(budgetData.monthly_income.toString());
    }
  }, [budgetData.monthly_income]);

  // Add new transaction with better error handling
  const addTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description || parseFloat(newTransaction.amount) <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newTransaction.type,
          category: newTransaction.category,
          amount: parseFloat(newTransaction.amount),
          description: newTransaction.description.trim(),
          date: newTransaction.date
        }),
      });

      if (response.ok) {
        // Reset form
        setNewTransaction({
          type: 'expense',
          category: 'food',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });

        // Refresh data
        await Promise.all([
          fetchDashboardData(),
          fetchSixMonthTrend(),
          fetchTransactions(),
          fetchBudgetAnalysis()
        ]);
        
        alert('Transaction added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert(`Error adding transaction: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Could not connect to server. Make sure Django backend is running on http://localhost:8000');
    }
    setLoading(false);
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/transactions/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh data
        await Promise.all([
          fetchDashboardData(),
          fetchSixMonthTrend(),
          fetchTransactions(),
          fetchBudgetAnalysis()
        ]);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Update budget - only call when form is submitted
  const handleBudgetSubmit = async () => {
    const income = parseFloat(budgetInput);
    if (!income || income <= 0) {
      alert('Please enter a valid monthly income');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/budget/update_income/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthly_income: income
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBudgetData(data);
        fetchBudgetAnalysis();
        alert('Budget updated successfully!');
      } else {
        alert(`Error updating budget: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Could not connect to server. Make sure Django backend is running on http://localhost:8000');
    }
  };

  // Dashboard Component
  const Dashboard = () => {
    // Prepare expense breakdown for chart
    const expenseBreakdownArray = Object.entries(dashboardData.expense_breakdown).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));

    // Prepare income breakdown (dummy data for now since API doesn't provide income breakdown)
    const incomeBreakdownArray = [
      { name: 'Salary', value: dashboardData.monthly_income * 0.8 },
      { name: 'Freelance', value: dashboardData.monthly_income * 0.2 }
    ].filter(item => item.value > 0);

    return (
      <div className="space-y-8 bg-gray-50 min-h-screen p-6">
        {/* Top Section with 3 Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2025 Savings Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-gray-700 font-medium">2025 Savings</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sixMonthTrend}>
                <defs>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#3B82F6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#savingsGradient)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Income Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 rounded-full bg-gray-400 mr-2"></div>
              <h3 className="text-gray-700 font-medium">Income Breakdown</h3>
            </div>
            <div className="flex items-center justify-center h-48">
              <div className="relative">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={incomeBreakdownArray}
                      cx={80}
                      cy={80}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {incomeBreakdownArray.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10B981', '#6B7280'][index % 2]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-2xl font-bold text-gray-900">${(dashboardData.monthly_income/1000).toFixed(1)}K</div>
                  <div className="text-xs text-gray-500">Total Amount</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Salary</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Freelance</span>
              </div>
            </div>
          </div>

          {/* Expenses Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 rounded-full bg-gray-400 mr-2"></div>
              <h3 className="text-gray-700 font-medium">Expenses Breakdown</h3>
            </div>
            <div className="flex items-center justify-center h-48">
              <div className="relative">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdownArray}
                      cx={80}
                      cy={80}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseBreakdownArray.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'][index % 4]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-2xl font-bold text-gray-900">${(dashboardData.monthly_expenses/1000).toFixed(1)}K</div>
                  <div className="text-xs text-gray-500">Total Amount</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-3 mt-4 flex-wrap">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Food</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Bills</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Entertainment</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-cyan-500 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Shopping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Monthly Overview */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Filter Tabs */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-gray-700 font-medium">Total Savings</span>
              </div>
              <div className="flex space-x-4 ml-auto">
                <button className="px-3 py-1 bg-gray-900 text-white text-xs rounded">All Months</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded">Q1</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded">Q2</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded">Q3</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded">Q4</button>
              </div>
            </div>
          </div>

          {/* Monthly Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {sixMonthTrend.map((month, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center mb-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      Income: <span className="font-medium">${month.income.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Expenses: <span className="font-medium">${month.expenses.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Transactions Component
  const Transactions = () => (
    <div className="space-y-6">
      {/* Add Transaction Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({
              ...newTransaction, 
              type: e.target.value, 
              category: e.target.value === 'income' ? 'salary' : 'food'
            })}
            className="border rounded-lg p-2"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          
          <select
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
            className="border rounded-lg p-2"
          >
            {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Amount"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
            className="border rounded-lg p-2"
            min="0"
            step="0.01"
          />
          
          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
            className="border rounded-lg p-2"
          />
          
          <button
            onClick={addTransaction}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Description (e.g., Grocery shopping, Salary payment)"
          value={newTransaction.description}
          onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
          className="border rounded-lg p-2 w-full mt-4"
        />
      </div>

      {/* Transactions List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Description</th>
                <th className="text-right p-2">Amount</th>
                <th className="text-center p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 20).map(transaction => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{new Date(transaction.date).toLocaleDateString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="p-2 capitalize">{transaction.category}</td>
                  <td className="p-2">{transaction.description}</td>
                  <td className={`p-2 text-right font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${parseFloat(transaction.amount).toLocaleString()}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Add your first transaction above!
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Smart Budgeting Component
  const SmartBudgeting = () => {
    const budgetComparison = budgetAnalysis ? [
      {
        category: 'Needs (50%)',
        budgeted: budgetAnalysis.budget.needs_budget,
        spent: budgetAnalysis.actual_spending.needs,
        remaining: budgetAnalysis.budget.needs_budget - budgetAnalysis.actual_spending.needs
      },
      {
        category: 'Wants (30%)',
        budgeted: budgetAnalysis.budget.wants_budget,
        spent: budgetAnalysis.actual_spending.wants,
        remaining: budgetAnalysis.budget.wants_budget - budgetAnalysis.actual_spending.wants
      },
      {
        category: 'Savings (20%)',
        budgeted: budgetAnalysis.budget.savings_goal,
        actual: budgetAnalysis.actual_spending.savings,
        remaining: budgetAnalysis.actual_spending.savings - budgetAnalysis.budget.savings_goal
      }
    ] : [];

    return (
      <div className="space-y-6">
        {/* Budget Setup */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">🎯 Simple Budget Setup</h3>
          <p className="text-gray-600 mb-4">
            Follow the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings and investments.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Income</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="flex-1 border rounded-lg p-3 text-lg"
                  placeholder="Enter your monthly income"
                />
                <button
                  onClick={handleBudgetSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Update
                </button>
              </div>
            </div>
            
            <div className="space-y-3 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Needs (50%)</span>
                <span className="text-lg font-bold text-blue-600">
                  ${budgetData.needs_budget?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Wants (30%)</span>
                <span className="text-lg font-bold text-green-600">
                  ${budgetData.wants_budget?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Savings (20%)</span>
                <span className="text-lg font-bold text-purple-600">
                  ${budgetData.savings_goal?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget vs Actual */}
        {budgetAnalysis && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">📊 Budget vs Actual Spending</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="budgeted" fill="#8884d8" name="Budgeted" />
                <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Financial Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">💰 50/30/20 Rule</h4>
            <p className="text-blue-700 text-sm">
              50% for needs (rent, food, utilities), 30% for wants (entertainment, dining out), 
              20% for savings and debt repayment. Simple and effective!
            </p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">📈 The Boring Rule</h4>
            <p className="text-green-700 text-sm">
              Invest in low-cost index funds. Don't try to time the market. 
              Boring investments often perform better than exciting ones over time.
            </p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-3">🧠 Conscious Spending</h4>
            <p className="text-purple-700 text-sm">
              Spend extravagantly on things you love, cut costs mercilessly on things you don't. 
              Know where every dollar goes and make intentional choices.
            </p>
          </div>
        </div>

        {/* Budget Health Check */}
        {budgetAnalysis && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">🏥 Budget Health Check</h3>
            <div className="space-y-4">
              {budgetComparison.map((item, index) => {
                const isOnTrack = item.category === 'Savings (20%)' ? 
                  item.actual >= item.budgeted : 
                  item.spent <= item.budgeted;
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">{item.category}</span>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isOnTrack ? 'text-green-600' : 'text-red-600'}`}>
                        {isOnTrack ? '✅ On Track' : '⚠️ Over Budget'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.category === 'Savings (20%)' ? 
                          `Saving $${item.actual?.toLocaleString() || 0} / $${item.budgeted.toLocaleString()}` :
                          `Spent $${item.spent.toLocaleString()} / $${item.budgeted.toLocaleString()}`
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calculator className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Personal Finance Tracker</h1>
            </div>
            <div className="text-sm text-gray-500">
              Connected to Django API • {transactions.length} transactions
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Activity },
              { id: 'transactions', name: 'Transactions', icon: DollarSign },
              { id: 'budget', name: 'Smart Budget', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'budget' && <SmartBudgeting />}
      </div>
    </div>
  );
};

export default PersonalFinanceTracker;