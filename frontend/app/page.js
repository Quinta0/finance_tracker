"use client"
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Target, Plus, Trash2, Calculator, Activity, TrendingDown, PiggyBank, Filter } from 'lucide-react';

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
  const [yearlyData, setYearlyData] = useState([]);
  const [budgetData, setBudgetData] = useState({
    monthly_income: 5000,
    needs_budget: 2500,
    wants_budget: 1500,
    savings_goal: 1000
  });
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [budgetInput, setBudgetInput] = useState('5000');
  const [loading, setLoading] = useState(false);
  const [quarterFilter, setQuarterFilter] = useState('all');
  
  // Form refs to prevent re-renders
  const typeRef = useRef('expense');
  const categoryRef = useRef('food');
  const amountRef = useRef('');
  const descriptionRef = useRef('');
  const dateRef = useRef(new Date().toISOString().split('T')[0]);

  // Categories
  const expenseCategories = ['food', 'transportation', 'entertainment', 'shopping', 'bills', 'healthcare', 'rent', 'utilities', 'other'];
  const incomeCategories = ['salary', 'freelance', 'investment', 'bonus', 'other'];

  // Generate 12 months of data
  const generateYearlyData = (transactions) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    return months.map((month, index) => {
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === index && tDate.getFullYear() === currentYear;
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      return {
        month,
        monthIndex: index,
        income,
        expenses,
        net: income - expenses
      };
    });
  };

  // Get filtered months based on quarter
  const getFilteredMonths = () => {
    if (!yearlyData.length) return [];
    
    switch(quarterFilter) {
      case 'Q1': return yearlyData.filter(m => m.monthIndex >= 0 && m.monthIndex <= 2);
      case 'Q2': return yearlyData.filter(m => m.monthIndex >= 3 && m.monthIndex <= 5);
      case 'Q3': return yearlyData.filter(m => m.monthIndex >= 6 && m.monthIndex <= 8);
      case 'Q4': return yearlyData.filter(m => m.monthIndex >= 9 && m.monthIndex <= 11);
      default: return yearlyData;
    }
  };

  // Calculate actual income breakdown from transactions
  const getActualIncomeBreakdown = () => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const breakdown = {};
    
    incomeTransactions.forEach(t => {
      if (!breakdown[t.category]) {
        breakdown[t.category] = 0;
      }
      breakdown[t.category] += parseFloat(t.amount);
    });
    
    return Object.entries(breakdown).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount
    }));
  };

  // Calculate actual expense breakdown with all categories
  const getActualExpenseBreakdown = () => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const breakdown = {};
    
    expenseTransactions.forEach(t => {
      if (!breakdown[t.category]) {
        breakdown[t.category] = 0;
      }
      breakdown[t.category] += parseFloat(t.amount);
    });
    
    return Object.entries(breakdown).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount
    }));
  };

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
      // Fix the savings calculation
      const fixedData = data.map(month => ({
        ...month,
        savings: month.income - month.expenses // Correct calculation
      }));
      setSixMonthTrend(fixedData);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions/`);
      const data = await response.json();
      const transactionData = data.results || data;
      setTransactions(transactionData);
      setYearlyData(generateYearlyData(transactionData));
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

  // Add new transaction
  const addTransaction = async () => {
    const amount = amountRef.current;
    const description = descriptionRef.current;
    
    if (!amount || !description || parseFloat(amount) <= 0) {
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
          type: typeRef.current,
          category: categoryRef.current,
          amount: parseFloat(amount),
          description: description.trim(),
          date: dateRef.current
        }),
      });

      if (response.ok) {
        // Clear form using refs
        amountRef.current = '';
        descriptionRef.current = '';
        // Update the actual input elements
        document.getElementById('amount-input').value = '';
        document.getElementById('description-input').value = '';

        // Refresh data
        await Promise.all([
          fetchDashboardData(),
          fetchSixMonthTrend(),
          fetchTransactions(),
          fetchBudgetAnalysis()
        ]);
        
        alert('Transaction added successfully!');
      } else {
        alert(`Error adding transaction: ${response.status}`);
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

  // Update budget
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
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  // Dashboard Component
  const Dashboard = () => {
    const incomeBreakdown = getActualIncomeBreakdown();
    const expenseBreakdown = getActualExpenseBreakdown();
    const filteredMonths = getFilteredMonths();
    
    // Colors for charts
    const expenseColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const incomeColors = ['#10b981', '#06b6d4'];

    // Month indicator colors based on net value
    const getMonthColor = (net) => {
      if (net > 1000) return '#10b981'; // Green
      if (net > 0) return '#eab308'; // Yellow
      return '#ef4444'; // Red
    };

    return (
      <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', padding: '24px' }}>
        {/* Top Section with 3 Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          {/* 2025 Savings Chart */}
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', border: '1px solid #3a3a3a' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: '#9ca3af', marginRight: '8px' }} />
              <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '500' }}>2025 Savings</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sixMonthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Income Breakdown */}
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', border: '1px solid #3a3a3a' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <PiggyBank style={{ width: '20px', height: '20px', color: '#9ca3af', marginRight: '8px' }} />
              <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '500' }}>Income Breakdown</h3>
            </div>
            {incomeBreakdown.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <div style={{ position: 'relative' }}>
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={incomeBreakdown}
                          cx={90}
                          cy={90}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {incomeBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={incomeColors[index % incomeColors.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
                        ${(dashboardData.monthly_income/1000).toFixed(1)}K
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>Total Amount</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {incomeBreakdown.map((item, index) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '2px',
                        backgroundColor: incomeColors[index % incomeColors.length],
                        marginRight: '6px'
                      }}></div>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '250px',
                color: '#6b7280'
              }}>
                No income data available
              </div>
            )}
          </div>

          {/* Expenses Breakdown */}
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', border: '1px solid #3a3a3a' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <TrendingDown style={{ width: '20px', height: '20px', color: '#9ca3af', marginRight: '8px' }} />
              <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '500' }}>Expenses Breakdown</h3>
            </div>
            {expenseBreakdown.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <div style={{ position: 'relative' }}>
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx={90}
                          cy={90}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={expenseColors[index % expenseColors.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
                        ${(dashboardData.monthly_expenses/1000).toFixed(1)}K
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>Total Amount</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {expenseBreakdown.map((item, index) => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '2px',
                        backgroundColor: expenseColors[index % expenseColors.length],
                        marginRight: '6px'
                      }}></div>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '250px',
                color: '#6b7280'
              }}>
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Total Savings Section */}
        <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', border: '1px solid #3a3a3a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Activity style={{ width: '20px', height: '20px', color: '#9ca3af', marginRight: '8px' }} />
              <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '500' }}>Total Savings</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setQuarterFilter('all')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: quarterFilter === 'all' ? '#4b5563' : '#374151',
                  color: '#e5e7eb'
                }}>
                All Months
              </button>
              {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                <button 
                  key={q}
                  onClick={() => setQuarterFilter(q)}
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor: quarterFilter === q ? '#4b5563' : '#374151',
                    color: '#e5e7eb'
                  }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {filteredMonths.map((month) => (
              <div key={month.month} style={{ 
                backgroundColor: '#1a1a1a', 
                borderRadius: '8px', 
                padding: '16px',
                border: '1px solid #3a3a3a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%',
                    backgroundColor: getMonthColor(month.net),
                    marginRight: '8px'
                  }}></div>
                  <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '500' }}>{month.month}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                  Income: <span style={{ color: '#10b981' }}>${month.income.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                  Expenses: <span style={{ color: '#ef4444' }}>${month.expenses.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Net: <span style={{ color: month.net >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                    ${month.net.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Transactions Component
  const Transactions = () => (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', padding: '24px' }}>
      {/* Add Transaction Form */}
      <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #3a3a3a' }}>
        <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Add New Transaction</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <select
            defaultValue="expense"
            onChange={(e) => {
              typeRef.current = e.target.value;
              categoryRef.current = e.target.value === 'income' ? 'salary' : 'food';
              document.getElementById('category-select').value = categoryRef.current;
            }}
            style={{ 
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #3a3a3a',
              color: '#e5e7eb'
            }}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          
          <select
            id="category-select"
            defaultValue="food"
            onChange={(e) => categoryRef.current = e.target.value}
            style={{ 
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #3a3a3a',
              color: '#e5e7eb'
            }}>
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          
          <input
            id="amount-input"
            type="number"
            placeholder="Amount"
            onChange={(e) => amountRef.current = e.target.value}
            style={{ 
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #3a3a3a',
              color: '#e5e7eb'
            }}
            min="0"
            step="0.01"
          />
          
          <input
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            onChange={(e) => dateRef.current = e.target.value}
            style={{ 
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #3a3a3a',
              color: '#e5e7eb'
            }}
          />
          
          <button
            onClick={addTransaction}
            disabled={loading}
            style={{ 
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            {loading ? 'Adding...' : (
              <>
                <Plus style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                Add
              </>
            )}
          </button>
        </div>
        
        <input
          id="description-input"
          type="text"
          placeholder="Description (e.g., Grocery shopping, Salary payment)"
          onChange={(e) => descriptionRef.current = e.target.value}
          style={{ 
            width: '100%',
            padding: '10px',
            marginTop: '12px',
            borderRadius: '6px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #3a3a3a',
            color: '#e5e7eb'
          }}
        />
      </div>

      {/* Transactions List */}
      <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', border: '1px solid #3a3a3a' }}>
        <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Transactions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #3a3a3a' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9ca3af', fontSize: '14px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9ca3af', fontSize: '14px' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9ca3af', fontSize: '14px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#9ca3af', fontSize: '14px' }}>Description</th>
                <th style={{ textAlign: 'right', padding: '12px', color: '#9ca3af', fontSize: '14px' }}>Amount</th>
                <th style={{ textAlign: 'center', padding: '12px', color: '#9ca3af', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 20).map(transaction => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid #3a3a3a' }}>
                  <td style={{ padding: '12px', color: '#e5e7eb', fontSize: '14px' }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: transaction.type === 'income' ? '#10b981' : '#ef4444',
                      color: 'white'
                    }}>
                      {transaction.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#e5e7eb', fontSize: '14px', textTransform: 'capitalize' }}>
                    {transaction.category}
                  </td>
                  <td style={{ padding: '12px', color: '#e5e7eb', fontSize: '14px' }}>
                    {transaction.description}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right', 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: transaction.type === 'income' ? '#10b981' : '#ef4444'
                  }}>
                    ${parseFloat(transaction.amount).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      style={{ 
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}>
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
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
      <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', padding: '24px' }}>
        {/* Budget Setup */}
        <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #3a3a3a' }}>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            🎯 Simple Budget Setup
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '14px' }}>
            Follow the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings and investments.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
                Monthly Income
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  style={{ 
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #3a3a3a',
                    color: '#e5e7eb',
                    fontSize: '16px'
                  }}
                  placeholder="Enter monthly income"
                />
                <button
                  onClick={handleBudgetSubmit}
                  style={{ 
                    padding: '10px 20px',
                    borderRadius: '6px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                  Update
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Needs (50%)</span>
                <span style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '600' }}>
                  ${budgetData.needs_budget?.toLocaleString() || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Wants (30%)</span>
                <span style={{ color: '#10b981', fontSize: '18px', fontWeight: '600' }}>
                  ${budgetData.wants_budget?.toLocaleString() || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Savings (20%)</span>
                <span style={{ color: '#8b5cf6', fontSize: '18px', fontWeight: '600' }}>
                  ${budgetData.savings_goal?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget vs Actual */}
        {budgetAnalysis && (
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #3a3a3a' }}>
            <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              📊 Budget vs Actual Spending
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}K`} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
                <Bar dataKey="spent" fill="#10b981" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Financial Principles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '12px', border: '1px solid #3a3a3a' }}>
            <h4 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              💰 50/30/20 Rule
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              50% for needs (rent, food, utilities), 30% for wants (entertainment, dining out), 
              20% for savings and debt repayment.
            </p>
          </div>
          
          <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '12px', border: '1px solid #3a3a3a' }}>
            <h4 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              📈 The Boring Rule
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Invest in low-cost index funds. Don't try to time the market. 
              Boring investments often perform better over time.
            </p>
          </div>
          
          <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '12px', border: '1px solid #3a3a3a' }}>
            <h4 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              🧠 Conscious Spending
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Spend extravagantly on things you love, cut costs mercilessly on things you don't. 
              Make intentional choices.
            </p>
          </div>
        </div>

        {/* Budget Health Check */}
        {budgetAnalysis && (
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', border: '1px solid #3a3a3a' }}>
            <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              🏥 Budget Health Check
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {budgetComparison.map((item, index) => {
                const isOnTrack = item.category === 'Savings (20%)' ? 
                  item.actual >= item.budgeted : 
                  item.spent <= item.budgeted;
                
                return (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    border: '1px solid #3a3a3a'
                  }}>
                    <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '500' }}>
                      {item.category}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: isOnTrack ? '#10b981' : '#ef4444'
                      }}>
                        {isOnTrack ? '✅ On Track' : '⚠️ Over Budget'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {item.category === 'Savings (20%)' ? 
                          `Saving ${item.actual?.toLocaleString() || 0} / ${item.budgeted.toLocaleString()}` :
                          `Spent ${item.spent.toLocaleString()} / ${item.budgeted.toLocaleString()}`
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Calculator style={{ width: '28px', height: '28px', color: '#3b82f6', marginRight: '12px' }} />
              <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#e5e7eb' }}>
                Personal Finance Tracker
              </h1>
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Connected to Django API • {transactions.length} transactions
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <nav style={{ display: 'flex', gap: '32px' }}>
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Activity },
              { id: 'transactions', name: 'Transactions', icon: DollarSign },
              { id: 'budget', name: 'Smart Budget', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                <tab.icon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'budget' && <SmartBudgeting />}
      </div>
    </div>
  );
};

export default PersonalFinanceTracker;