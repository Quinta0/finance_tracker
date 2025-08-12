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

// Import our new components
import EnhancedNavigation from "@/components/EnhancedNavigation";
import CategoryManager from "@/components/CategoryManager";
import BudgetPeriodManager from "@/components/BudgetPeriodManager";
import RecurringTransactionManager from "@/components/RecurringTransactionManager";

const transactionSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['expense', 'income']),
  category: z.number().positive({ message: "Please select a category" }),
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

// Enhanced UI styles
const spinnerStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [budgetPeriods, setBudgetPeriods] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
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
  
  // Loading states
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

  // Initialize categories and other data
  const initializeCategories = async () => {
    try {
      await fetch(`${API_BASE}/categories/create_defaults/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await fetch(`${API_BASE}/categories/by_type/`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error initializing categories:', error);
    }
  };

  // API Functions
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

  const fetchTransactions = async () => {
    setLoading('transactions', true);
    try {
      const response = await fetch(`${API_BASE}/transactions/`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setTransactions(data.results || data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      addToast('Failed to load transactions.', 'error');
    } finally {
      setLoading('transactions', false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals/`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setGoals(data.results || data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      addToast('Failed to load goals.', 'error');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading('initialLoad', true);
      await Promise.all([
        initializeCategories(),
        fetchDashboardData(),
        fetchTransactions(),
        fetchGoals()
      ]);
      setLoading('initialLoad', false);
    };
    
    loadAllData();
  }, []);

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Enhanced Navigation */}
      <EnhancedNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loadingStates.initialLoad ? (
          <div className="min-h-[60vh] flex justify-center items-center flex-col">
            <LoadingSpinner size={50} />
            <p className="mt-5 text-gray-400 text-lg">
              Loading your financial data...
            </p>
          </div>
        ) : (
          <>
            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="text-center py-12">
                  <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Welcome to Your Finance Tracker
                  </h1>
                  <p className="text-xl text-gray-300">
                    Take control of your financial future with comprehensive tracking and insights
                  </p>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="stat-card bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Monthly Income</p>
                        <p className="text-2xl font-bold text-green-400">
                          ${dashboardData.monthly_income?.toLocaleString() || 0}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-400" />
                    </div>
                  </div>

                  <div className="stat-card bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Monthly Expenses</p>
                        <p className="text-2xl font-bold text-red-400">
                          ${dashboardData.monthly_expenses?.toLocaleString() || 0}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-400" />
                    </div>
                  </div>

                  <div className="stat-card bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Monthly Savings</p>
                        <p className="text-2xl font-bold text-blue-400">
                          ${dashboardData.monthly_savings?.toLocaleString() || 0}
                        </p>
                      </div>
                      <PiggyBank className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab('transactions')}
                    className="h-16 bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-3"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Transaction</span>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab('goals')}
                    className="h-16 bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-3"
                  >
                    <Target className="h-5 w-5" />
                    <span>Set Goals</span>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab('analytics')}
                    className="h-16 bg-purple-600 hover:bg-purple-700 flex items-center justify-center space-x-3"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>View Analytics</span>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab('categories')}
                    className="h-16 bg-orange-600 hover:bg-orange-700 flex items-center justify-center space-x-3"
                  >
                    <Archive className="h-5 w-5" />
                    <span>Manage Categories</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Categories Management */}
            {activeTab === 'categories' && (
              <CategoryManager 
                categories={categories}
                setCategories={setCategories}
                apiBase={API_BASE}
                addToast={addToast}
              />
            )}

            {/* Budget Periods Management */}
            {activeTab === 'budget-periods' && (
              <BudgetPeriodManager 
                budgetPeriods={budgetPeriods}
                setBudgetPeriods={setBudgetPeriods}
                apiBase={API_BASE}
                addToast={addToast}
              />
            )}

            {/* Recurring Transactions Management */}
            {activeTab === 'recurring' && (
              <RecurringTransactionManager 
                recurringTransactions={recurringTransactions}
                setRecurringTransactions={setRecurringTransactions}
                categories={categories}
                apiBase={API_BASE}
                addToast={addToast}
              />
            )}

            {/* Basic Transaction List for other tabs */}
            {(activeTab === 'transactions' || activeTab === 'analytics' || activeTab === 'goals') && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">
                  {activeTab === 'transactions' && 'Transactions'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'goals' && 'Goals'}
                </h2>
                
                {transactions.length > 0 ? (
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="space-y-4">
                      {transactions.slice(0, 10).map((transaction, index) => (
                        <div 
                          key={transaction.id || index}
                          className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${
                              transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-400">
                                {transaction.category_name || transaction.category} • {transaction.date}
                              </p>
                            </div>
                          </div>
                          <div className={`text-lg font-semibold ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-400">No transactions yet</p>
                    <p className="text-gray-500 mt-2">Start by adding your first transaction</p>
                  </div>
                )}
              </div>
            )}
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
