"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Target, Plus, Trash2, Calculator, Activity, TrendingDown, PiggyBank, Filter, X, CheckCircle, AlertCircle, Info, Loader2, Calendar as CalendarIcon, Edit, BarChart3, Download, Upload, FileText, Archive, Lightbulb, Award, Zap } from 'lucide-react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const transactionSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['expense', 'income']),
  category: z.string(),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  description: z.string().min(3, { message: "Description must be at least 3 characters" }),
  date: z.date({
    required_error: "A date is required.",
  }),
});

const budgetSchema = z.object({
  monthly_income: z.coerce.number().positive({ message: "Please enter a valid monthly income" }),
});

const goalSchema = z.object({
  name: z.string().min(3, { message: "Goal name must be at least 3 characters" }),
  target_amount: z.coerce.number().positive({ message: "Target amount must be greater than 0" }),
  current_amount: z.coerce.number().min(0, { message: "Current amount cannot be negative" }).optional(),
  target_date: z.date({
    required_error: "A target date is required.",
  }),
  description: z.string().optional(),
});


// Toast Notification Component
const Toast = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  }[type];

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#2a2a2a',
      border: `1px solid ${bgColor}`,
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '300px',
      maxWidth: '500px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.3s ease',
      zIndex: 1000
    }}>
      <Icon style={{ width: '20px', height: '20px', color: bgColor, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ color: '#e5e7eb', fontSize: '14px', margin: 0 }}>{message}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ size = 20 }) => (
  <Loader2 
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      animation: 'spin 1s linear infinite' 
    }} 
  />
);

// Add CSS for spinner animation
const spinnerStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Enhanced UI styles */
  .nav-button {
    transition: all 0.2s ease-in-out;
    position: relative;
    overflow: hidden;
  }
  
  .nav-button:hover {
    transform: translateY(-1px);
  }
  
  .nav-button.active::before {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #06b6d4);
  }
  
  .stat-card {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  }
  
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
  }
  
  .ripple-button {
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  
  .ripple-button:hover {
    transform: scale(1.02);
  }
  
  .ripple-button:active {
    transform: scale(0.98);
  }
  
  .chart-container {
    transition: all 0.3s ease;
  }
  
  .chart-container:hover {
    transform: translateY(-1px);
  }
`;

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
  const [quarterFilter, setQuarterFilter] = useState('all');
  const [goals, setGoals] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // Loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    dashboard: false,
    transactions: false,
    budget: false,
    addTransaction: false,
    deleteTransaction: {},
    updateBudget: false,
    editTransaction: false,
    initialLoad: true,
    addGoal: false,
    updateGoal: false,
    deleteGoal: false,
  });

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Categories
  const expenseCategories = ['food', 'transportation', 'entertainment', 'shopping', 'bills', 'healthcare', 'rent', 'utilities', 'other'];
  const incomeCategories = ['salary', 'freelance', 'investment', 'bonus', 'other'];

  // Add spinner styles to document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = spinnerStyle;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  // Toast notification helper
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Update loading state helper
  const setLoading = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // Chart colors
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

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

  // API Functions with error handling
  const fetchDashboardData = async () => {
    setLoading('dashboard', true);
    try {
      const response = await fetch(`${API_BASE}/transactions/monthly_summary/`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      addToast('Failed to load dashboard data. Please check your connection.', 'error');
    } finally {
      setLoading('dashboard', false);
    }
  };

  const fetchSixMonthTrend = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions/six_month_trend/`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      // Fix the savings calculation
      const fixedData = data.map(month => ({
        ...month,
        savings: month.income - month.expenses
      }));
      setSixMonthTrend(fixedData);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      addToast('Failed to load trend data.', 'error');
    }
  };

  const fetchTransactions = async () => {
    setLoading('transactions', true);
    try {
      const response = await fetch(`${API_BASE}/transactions/`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      const transactionData = data.results || data;
      setTransactions(transactionData);
      setYearlyData(generateYearlyData(transactionData));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      addToast('Failed to load transactions. Please check if the backend is running.', 'error');
    } finally {
      setLoading('transactions', false);
    }
  };

  const fetchBudgetData = async () => {
    setLoading('budget', true);
    try {
      const response = await fetch(`${API_BASE}/budget/current_budget/`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setBudgetData(data);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      addToast('Failed to load budget data.', 'error');
    } finally {
      setLoading('budget', false);
    }
  };

  const fetchBudgetAnalysis = async () => {
    try {
      const response = await fetch(`${API_BASE}/budget/budget_analysis/`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setBudgetAnalysis(data);
    } catch (error) {
      console.error('Error fetching budget analysis:', error);
      addToast('Failed to load budget analysis.', 'error');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading('initialLoad', true);
      await Promise.all([
        fetchDashboardData(),
        fetchSixMonthTrend(),
        fetchTransactions(),
        fetchBudgetData(),
        fetchBudgetAnalysis(),
        fetchGoals()
      ]);
      setLoading('initialLoad', false);
    };
    
    loadAllData();
  }, []);

  // Add new transaction with validation
  const addTransaction = async (data) => {
    setLoading('addTransaction', true);
    try {
      const response = await fetch(`${API_BASE}/transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          description: data.description.trim(),
          date: format(data.date, 'yyyy-MM-dd'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Refresh data
      await Promise.all([
        fetchDashboardData(),
        fetchSixMonthTrend(),
        fetchTransactions(),
        fetchBudgetAnalysis()
      ]);
      
      addToast('Transaction added successfully!', 'success');
      return true; // Indicate success
    } catch (error) {
      console.error('Error adding transaction:', error);
      addToast('Failed to add transaction. Please check your connection and try again.', 'error');
      return false; // Indicate failure
    } finally {
      setLoading('addTransaction', false);
    }
  };

  const editTransaction = async (data) => {
    setLoading('editTransaction', true);
    try {
      const response = await fetch(`${API_BASE}/transactions/${data.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          description: data.description.trim(),
          date: format(data.date, 'yyyy-MM-dd'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Refresh data
      await Promise.all([
        fetchDashboardData(),
        fetchSixMonthTrend(),
        fetchTransactions(),
        fetchBudgetAnalysis()
      ]);
      
      addToast('Transaction updated successfully!', 'success');
      return true; // Indicate success
    } catch (error) {
      console.error('Error updating transaction:', error);
      addToast('Failed to update transaction. Please check your connection and try again.', 'error');
      return false; // Indicate failure
    } finally {
      setLoading('editTransaction', false);
    }
  };

  // Delete transaction with confirmation
  const deleteTransaction = async (id) => {
    setLoadingStates(prev => ({
      ...prev,
      deleteTransaction: { ...prev.deleteTransaction, [id]: true }
    }));
    
    try {
      const response = await fetch(`${API_BASE}/transactions/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Server error: ${response.status}`);
      }

      await Promise.all([
        fetchDashboardData(),
        fetchSixMonthTrend(),
        fetchTransactions(),
        fetchBudgetAnalysis()
      ]);
      
      addToast('Transaction deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      addToast('Failed to delete transaction. Please try again.', 'error');
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        deleteTransaction: { ...prev.deleteTransaction, [id]: false }
      }));
    }
  };

  // Update budget with validation
  const handleBudgetSubmit = async (data) => {
    const income = parseFloat(data.monthly_income);
    if (!income || income <= 0) {
      addToast('Please enter a valid monthly income greater than 0', 'warning');
      return;
    }

    setLoading('updateBudget', true);
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

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const newBudgetData = await response.json();
      setBudgetData(newBudgetData);
      await fetchBudgetAnalysis();
      addToast('Budget updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating budget:', error);
      addToast('Failed to update budget. Please try again.', 'error');
    } finally {
      setLoading('updateBudget', false);
    }
  };

  // Goals Management Functions
  const addGoal = async (data) => {
    setLoading('addGoal', true);
    try {
      const response = await fetch(`${API_BASE}/goals/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          target_amount: parseFloat(data.target_amount),
          current_amount: parseFloat(data.current_amount) || 0,
          target_date: format(data.target_date, 'yyyy-MM-dd'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      await fetchGoals();
      addToast('Goal added successfully!', 'success');
      return true;
    } catch (error) {
      console.error('Error adding goal:', error);
      addToast('Failed to add goal. Please try again.', 'error');
      return false;
    } finally {
      setLoading('addGoal', false);
    }
  };

  const updateGoal = async (id, data) => {
    setLoading('updateGoal', true);
    try {
      const response = await fetch(`${API_BASE}/goals/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          target_amount: parseFloat(data.target_amount),
          current_amount: parseFloat(data.current_amount) || 0,
          target_date: format(data.target_date, 'yyyy-MM-dd'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      await fetchGoals();
      addToast('Goal updated successfully!', 'success');
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      addToast('Failed to update goal. Please try again.', 'error');
      return false;
    } finally {
      setLoading('updateGoal', false);
    }
  };

  const deleteGoal = async (id) => {
    setLoading('deleteGoal', true);
    try {
      const response = await fetch(`${API_BASE}/goals/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Server error: ${response.status}`);
      }

      await fetchGoals();
      addToast('Goal deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting goal:', error);
      addToast('Failed to delete goal. Please try again.', 'error');
    } finally {
      setLoading('deleteGoal', false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals/`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  // Export/Import Functions
  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(t => [
          t.date,
          t.type,
          t.category,
          t.amount,
          `"${t.description.replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      addToast('Transactions exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      addToast('Failed to export data. Please try again.', 'error');
    }
  };

  const importFromCSV = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const transaction = {
              date: new Date(values[0]),
              type: values[1],
              category: values[2],
              amount: parseFloat(values[3]),
              description: values[4].replace(/"/g, '').trim()
            };
            
            if (transaction.date && transaction.type && transaction.category && 
                transaction.amount > 0 && transaction.description) {
              await addTransaction(transaction);
            }
          }
        }
        
        addToast('Transactions imported successfully!', 'success');
      } catch (error) {
        console.error('Error importing data:', error);
        addToast('Failed to import data. Please check file format.', 'error');
      }
    };
    reader.readAsText(file);
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

    if (loadingStates.dashboard) {
      return (
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          minHeight: '100vh', 
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            <LoadingSpinner size={40} />
            <p style={{ marginTop: '16px' }}>Loading dashboard data...</p>
          </div>
        </div>
      );
    }

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
                  <div style={{ position: 'relative', width: 180, height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeBreakdown}
                          cx="50%"
                          cy="50%"
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
                  <div style={{ position: 'relative', width: 180, height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
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
              <Button 
                variant={quarterFilter === 'all' ? 'secondary' : 'ghost'}
                onClick={() => setQuarterFilter('all')}
              >
                All Months
              </Button>
              {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                <Button 
                  key={q}
                  variant={quarterFilter === q ? 'secondary' : 'ghost'}
                  onClick={() => setQuarterFilter(q)}
                >
                  {q}
                </Button>
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
  const Transactions = () => {
    const transactionForm = useForm({
      resolver: zodResolver(transactionSchema),
      defaultValues: {
        type: 'expense',
        category: 'food',
        amount: '',
        description: '',
        date: new Date(),
      },
    });

    const onSubmit = async (data) => {
      const success = await addTransaction(data);
      if (success) {
        transactionForm.reset({
          type: 'expense',
          category: 'food',
          amount: '',
          description: '',
          date: new Date(),
        });
      }
    };

    const transactionType = transactionForm.watch('type');
    const currentCategories = transactionType === 'income' ? incomeCategories : expenseCategories;

    useEffect(() => {
      transactionForm.setValue('category', currentCategories[0]);
    }, [transactionType, currentCategories, transactionForm]);

    return (
      <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', padding: '24px' }}>
        {/* Add Transaction Form */}
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '24px', 
          border: '1px solid #3a3a3a'
        }}>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <Plus style={{ width: '20px', height: '20px', color: '#3b82f6', marginRight: '8px' }} />
            Add New Transaction
          </h3>
          <Form {...transactionForm}>
            <form onSubmit={transactionForm.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'start' }}>
                <FormField
                  control={transactionForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger style={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#3a3a3a', 
                            color: '#e5e7eb',
                            height: '38px' 
                          }}>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger style={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#3a3a3a', 
                            color: '#e5e7eb',
                            height: '38px'
                          }}>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                          {currentCategories.map(cat => (
                            <SelectItem key={cat} value={cat} style={{ textTransform: 'capitalize' }}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Amount" 
                          style={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#3a3a3a', 
                            color: '#e5e7eb',
                            height: '38px'
                          }} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              style={{
                                backgroundColor: '#1a1a1a', 
                                borderColor: '#3a3a3a', 
                                color: field.value ? '#e5e7eb' : '#6b7280',
                                width: '100%',
                                height: '38px',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                textAlign: 'left'
                              }}
                            >
                              <CalendarIcon style={{ width: '16px', height: '16px', marginRight: '8px', color: '#3b82f6' }} />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent style={{ 
                          width: 'auto', 
                          padding: 0, 
                          backgroundColor: '#2a2a2a', 
                          borderColor: '#3a3a3a' 
                        }} align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={loadingStates.addTransaction} 
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0 16px',
                    height: '38px',
                    borderRadius: '6px',
                    cursor: loadingStates.addTransaction ? 'not-allowed' : 'pointer',
                    opacity: loadingStates.addTransaction ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%'
                  }}
                >
                  {loadingStates.addTransaction ? (
                    <>
                      <LoadingSpinner size={16} />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus style={{ width: '16px', height: '16px' }} />
                      Add
                    </>
                  )}
                </Button>
              </div>
              <FormField
                control={transactionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Description (e.g., Grocery shopping, Salary payment)" 
                        style={{ 
                          backgroundColor: '#1a1a1a', 
                          borderColor: '#3a3a3a', 
                          color: '#e5e7eb',
                          height: '38px'
                        }} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Transactions List */}
        <div className="bg-[#2a2a2a] rounded-xl p-6 border border-[#3a3a3a]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-200 text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-400" />
              Recent Transactions
            </h3>
            <div className="text-sm text-gray-400">
              {transactions.length > 0 ? `Showing ${Math.min(20, transactions.length)} of ${transactions.length} transactions` : 'No transactions'}
            </div>
          </div>
          {loadingStates.transactions ? (
            <div className="text-center py-12 text-gray-400">
              <LoadingSpinner size={30} />
              <p className="mt-4">Loading transactions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md">
              <table className="w-full border-collapse">
                <thead className="bg-[#1a1a1a]">
                  <tr className="border-b border-[#3a3a3a]">
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Description</th>
                    <th className="text-right py-3 px-4 text-gray-400 text-sm font-medium">Amount</th>
                    <th className="text-center py-3 px-4 text-gray-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 20).map(transaction => (
                    <tr key={transaction.id} className="border-b border-[#3a3a3a] hover:bg-[#222]">
                      <td className="py-3 px-4 text-gray-200 text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === 'income' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-200 text-sm capitalize">
                        {transaction.category}
                      </td>
                      <td className="py-3 px-4 text-gray-200 text-sm">
                        {transaction.description}
                      </td>
                      <td className={`py-3 px-4 text-right text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${parseFloat(transaction.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <EditTransactionDialog transaction={transaction} />
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this transaction: ${transaction.description}? This action cannot be undone.`)) {
                                deleteTransaction(transaction.id);
                              }
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: loadingStates.deleteTransaction[transaction.id] ? 'not-allowed' : 'pointer',
                              padding: '6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            disabled={loadingStates.deleteTransaction[transaction.id]}
                            onMouseOver={(e) => !loadingStates.deleteTransaction[transaction.id] && (e.currentTarget.style.backgroundColor = '#333')}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {loadingStates.deleteTransaction[transaction.id] ? (
                              <LoadingSpinner size={16} />
                            ) : (
                              <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm bg-[#1a1a1a] rounded-md mt-4">
                  <div className="flex flex-col items-center">
                    <DollarSign className="h-12 w-12 text-gray-600 mb-3 opacity-50" />
                    <p>No transactions yet. Add your first transaction above!</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const EditTransactionDialog = ({ transaction }) => {
    const [open, setOpen] = useState(false);
    const transactionForm = useForm({
      resolver: zodResolver(transactionSchema),
      defaultValues: {
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: new Date(transaction.date),
      },
    });

    const onSubmit = async (data) => {
      console.log("Submitting edited transaction:", { ...data, id: transaction.id });
      const success = await editTransaction({ ...data, id: transaction.id });
      if (success) {
        setOpen(false);
      }
    };

    const transactionType = transactionForm.watch('type');
    const currentCategories = transactionType === 'income' ? incomeCategories : expenseCategories;

    // Reset form when dialog opens
    useEffect(() => {
      if (open) {
        console.log("Dialog opened, resetting form with data:", transaction);
        transactionForm.reset({
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount.toString(),
          description: transaction.description,
          date: new Date(transaction.date),
        });
      }
    }, [open, transaction, transactionForm]);
    
    // Update category when type changes
    useEffect(() => {
      const currentCategory = transactionForm.getValues("category");
      if (!currentCategories.includes(currentCategory)) {
        transactionForm.setValue('category', currentCategories[0]);
      }
    }, [transactionType, currentCategories, transactionForm]);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button 
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} 
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Edit style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
          </button>
        </DialogTrigger>
        <DialogContent style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #3a3a3a', 
          color: 'white',
          padding: '24px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '95vw',
          margin: '0 auto'
        }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'white', fontSize: '18px' }}>Edit Transaction</DialogTitle>
            <DialogDescription style={{ color: '#9ca3af' }}>
              Update the details of your transaction.
            </DialogDescription>
          </DialogHeader>
          <div style={{ margin: '20px 0' }}>
            <Form {...transactionForm}>
              <form onSubmit={transactionForm.handleSubmit(onSubmit)} className="space-y-4">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <FormField
                    control={transactionForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                            {currentCategories.map(cat => (
                              <SelectItem key={cat} value={cat} style={{ textTransform: 'capitalize' }}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Amount" 
                            style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                style={{ 
                                  backgroundColor: '#1a1a1a', 
                                  borderColor: '#3a3a3a', 
                                  color: field.value ? '#e5e7eb' : '#6b7280',
                                  width: '100%',
                                  display: 'flex',
                                  justifyContent: 'flex-start',
                                  textAlign: 'left'
                                }}
                              >
                                <CalendarIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent style={{ 
                            width: 'auto', 
                            padding: 0, 
                            backgroundColor: '#2a2a2a', 
                            borderColor: '#3a3a3a' 
                          }} align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              style={{ backgroundColor: '#2a2a2a' }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={transactionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Description" 
                          style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                    </FormItem>
                  )}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <Button 
                    type="button" 
                    onClick={() => setOpen(false)}
                    style={{
                      backgroundColor: '#3a3a3a',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loadingStates.editTransaction}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: loadingStates.editTransaction ? 'not-allowed' : 'pointer',
                      opacity: loadingStates.editTransaction ? 0.7 : 1
                    }}
                  >
                    {loadingStates.editTransaction ? (
                      <>
                        <LoadingSpinner size={16} />
                        <span style={{ marginLeft: '8px' }}>Saving...</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Smart Budgeting Component  
  // Analytics Component with Smart Insights
  const Analytics = () => {
    const getSpendingInsights = () => {
      const insights = [];
      const currentMonth = new Date().getMonth();
      const currentMonthData = yearlyData[currentMonth];
      const lastMonthData = yearlyData[currentMonth - 1] || yearlyData[11];
      
      if (currentMonthData && lastMonthData) {
        const expenseChange = ((currentMonthData.expenses - lastMonthData.expenses) / lastMonthData.expenses) * 100;
        if (expenseChange > 20) {
          insights.push({
            type: 'warning',
            title: 'High Spending Alert',
            message: `Your expenses increased by ${expenseChange.toFixed(1)}% compared to last month.`,
            icon: AlertCircle
          });
        } else if (expenseChange < -10) {
          insights.push({
            type: 'success',
            title: 'Great Savings!',
            message: `You reduced expenses by ${Math.abs(expenseChange).toFixed(1)}% this month.`,
            icon: CheckCircle
          });
        }
      }

      // Category-based insights
      const categoryTotals = transactions.reduce((acc, t) => {
        if (t.type === 'expense') {
          acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        }
        return acc;
      }, {});

      const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];
      if (topCategory && topCategory[1] > 1000) {
        insights.push({
          type: 'info',
          title: 'Top Spending Category',
          message: `You spent $${topCategory[1].toLocaleString()} on ${topCategory[0]} this period.`,
          icon: Info
        });
      }

      return insights;
    };

    const insights = getSpendingInsights();

    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Export/Import Section */}
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '24px', 
          border: '1px solid #3a3a3a'
        }}>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <Archive style={{ width: '20px', height: '20px', color: '#3b82f6', marginRight: '8px' }} />
            Data Management
          </h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Button 
              onClick={exportToCSV}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Export to CSV
            </Button>
            <label style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <Upload style={{ width: '16px', height: '16px' }} />
              Import CSV
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => e.target.files[0] && importFromCSV(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Smart Insights */}
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '24px', 
          border: '1px solid #3a3a3a'
        }}>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <Lightbulb style={{ width: '20px', height: '20px', color: '#f59e0b', marginRight: '8px' }} />
            Smart Insights
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {insights.length > 0 ? insights.map((insight, index) => (
              <div key={index} style={{
                backgroundColor: '#1a1a1a',
                border: `1px solid ${insight.type === 'warning' ? '#ef4444' : insight.type === 'success' ? '#10b981' : '#3b82f6'}`,
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <insight.icon style={{ 
                  width: '20px', 
                  height: '20px', 
                  color: insight.type === 'warning' ? '#ef4444' : insight.type === 'success' ? '#10b981' : '#3b82f6',
                  marginTop: '2px'
                }} />
                <div>
                  <h4 style={{ 
                    color: '#e5e7eb', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '4px' 
                  }}>
                    {insight.title}
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                    {insight.message}
                  </p>
                </div>
              </div>
            )) : (
              <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <Info style={{ width: '24px', height: '24px', margin: '0 auto 8px', opacity: 0.5 }} />
                <p>Add more transactions to see personalized insights</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Monthly Trend */}
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            borderRadius: '12px', 
            padding: '20px', 
            border: '1px solid #3a3a3a'
          }}>
            <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Monthly Trend Analysis
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px',
                    color: '#e5e7eb'
                  }} 
                />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div style={{ 
            backgroundColor: '#2a2a2a', 
            borderRadius: '12px', 
            padding: '20px', 
            border: '1px solid #3a3a3a'
          }}>
            <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Expense Categories
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(dashboardData.expense_breakdown).map(([key, value]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {Object.entries(dashboardData.expense_breakdown).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px',
                    color: '#e5e7eb'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Goals Component
  const Goals = () => {
    const goalForm = useForm({
      resolver: zodResolver(goalSchema),
      defaultValues: {
        name: '',
        target_amount: '',
        current_amount: 0,
        target_date: new Date(),
        description: '',
      },
    });

    const onSubmitGoal = async (data) => {
      const success = await addGoal(data);
      if (success) {
        goalForm.reset({
          name: '',
          target_amount: '',
          current_amount: 0,
          target_date: new Date(),
          description: '',
        });
      }
    };

    const calculateProgress = (current, target) => {
      return Math.min((current / target) * 100, 100);
    };

    const getDaysRemaining = (targetDate) => {
      const today = new Date();
      const target = new Date(targetDate);
      const diffTime = target - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Add Goal Form */}
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '24px', 
          border: '1px solid #3a3a3a'
        }}>
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <Target style={{ width: '20px', height: '20px', color: '#3b82f6', marginRight: '8px' }} />
            Add New Goal
          </h3>
          <Form {...goalForm}>
            <form onSubmit={goalForm.handleSubmit(onSubmitGoal)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <FormField
                  control={goalForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Goal name (e.g., Vacation Fund)" 
                          style={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#3a3a3a', 
                            color: '#e5e7eb',
                            height: '38px'
                          }} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={goalForm.control}
                  name="target_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Target amount" 
                          style={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#3a3a3a', 
                            color: '#e5e7eb',
                            height: '38px'
                          }} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={goalForm.control}
                  name="current_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Current amount" 
                          style={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#3a3a3a', 
                            color: '#e5e7eb',
                            height: '38px'
                          }} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={goalForm.control}
                  name="target_date"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              style={{
                                backgroundColor: '#1a1a1a', 
                                borderColor: '#3a3a3a', 
                                color: field.value ? '#e5e7eb' : '#6b7280',
                                width: '100%',
                                height: '38px',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                textAlign: 'left'
                              }}
                            >
                              <CalendarIcon style={{ width: '16px', height: '16px', marginRight: '8px', color: '#3b82f6' }} />
                              {field.value ? format(field.value, "PPP") : <span>Target date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent style={{ 
                          width: 'auto', 
                          padding: 0, 
                          backgroundColor: '#2a2a2a', 
                          borderColor: '#3a3a3a' 
                        }} align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={goalForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Description (optional)" 
                        style={{ 
                          backgroundColor: '#1a1a1a', 
                          borderColor: '#3a3a3a', 
                          color: '#e5e7eb',
                          height: '38px'
                        }} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }} />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={loadingStates.addGoal} 
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0 16px',
                  height: '38px',
                  borderRadius: '6px',
                  cursor: loadingStates.addGoal ? 'not-allowed' : 'pointer',
                  opacity: loadingStates.addGoal ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: 'fit-content'
                }}
              >
                {loadingStates.addGoal ? (
                  <>
                    <LoadingSpinner size={16} />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus style={{ width: '16px', height: '16px' }} />
                    Add Goal
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Goals List */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {goals.length > 0 ? goals.map((goal) => {
            const progress = calculateProgress(goal.current_amount, goal.target_amount);
            const daysRemaining = getDaysRemaining(goal.target_date);
            const isCompleted = progress >= 100;
            
            return (
              <div key={goal.id} style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${isCompleted ? '#10b981' : '#3a3a3a'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                      {isCompleted && <Award style={{ width: '20px', height: '20px', color: '#10b981', marginRight: '8px' }} />}
                      {goal.name}
                    </h4>
                    {goal.description && (
                      <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>{goal.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this goal?')) {
                        deleteGoal(goal.id);
                      }
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </Button>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#e5e7eb', fontSize: '14px', fontWeight: '500' }}>
                      ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                    </span>
                    <span style={{ color: isCompleted ? '#10b981' : '#3b82f6', fontSize: '14px', fontWeight: '600' }}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      backgroundColor: isCompleted ? '#10b981' : '#3b82f6',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : 
                     daysRemaining === 0 ? 'Due today' : 
                     `${Math.abs(daysRemaining)} days overdue`}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                    Target: {format(new Date(goal.target_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            );
          }) : (
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid #3a3a3a'
            }}>
              <Target style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px', opacity: 0.5 }} />
              <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                No Goals Yet
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                Set your first financial goal to start tracking your progress
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SmartBudgeting = () => {
    const budgetForm = useForm({
      resolver: zodResolver(budgetSchema),
      defaultValues: {
        monthly_income: budgetData.monthly_income || '',
      },
    });

    useEffect(() => {
      if (budgetData.monthly_income) {
        budgetForm.reset({ monthly_income: budgetData.monthly_income });
      }
    }, [budgetData.monthly_income, budgetForm]);

    const onSubmit = (data) => {
      handleBudgetSubmit(data);
    };

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
          
          <Form {...budgetForm}>
            <form onSubmit={budgetForm.handleSubmit(onSubmit)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'start', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
                    Monthly Income
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                    <FormField
                      control={budgetForm.control}
                      name="monthly_income"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input type="number" placeholder="Enter monthly income" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={loadingStates.updateBudget}>
                      {loadingStates.updateBudget ? (
                        <>
                          <LoadingSpinner size={16} />
                          Updating...
                        </>
                      ) : (
                        'Update'
                      )}
                    </Button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '30px' }}>
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
            </form>
          </Form>
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
              {loadingStates.initialLoad ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LoadingSpinner size={16} />
                  Connecting to Django API...
                </span>
              ) : (
                `Connected to Django API • ${transactions.length} transactions`
              )}
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
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'goals', name: 'Goals', icon: Target },
              { id: 'budget', name: 'Smart Budget', icon: PiggyBank }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 nav-button ${activeTab === tab.id ? 'active' : ''}`}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  color: activeTab === tab.id ? '#e5e7eb' : '#9ca3af',
                  backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
                }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {loadingStates.initialLoad ? (
          <div style={{ 
            minHeight: '60vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexDirection: 'column'
          }}>
            <LoadingSpinner size={50} />
            <p style={{ marginTop: '20px', color: '#9ca3af', fontSize: '16px' }}>
              Loading your financial data...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'transactions' && <Transactions />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'goals' && <Goals />}
            {activeTab === 'budget' && <SmartBudgeting />}
          </>
        )}
      </div>

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default PersonalFinanceTracker;