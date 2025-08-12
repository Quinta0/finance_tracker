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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

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

const PersonalFinanceTracker = () => {
  // API Base URL
  const API_BASE = 'http://localhost:8001/api';
  
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

  // Update loading state helper
  const setLoading = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // Chart colors
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

  // Form setups
  const transactionForm = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: new Date(),
    },
  });

  const budgetForm = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      monthly_income: budgetData.monthly_income || '',
    },
  });

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

  // Initialize categories and data
  const initializeCategories = async () => {
    try {
      // Test API connection first
      const testResponse = await fetch(`${API_BASE}/transactions/`);
      console.log('API Connection Test:', testResponse.ok ? 'Connected to Django API' : `Error: ${testResponse.status}`);
      
      await fetch(`${API_BASE}/categories/create_defaults/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await fetch(`${API_BASE}/categories/by_type/`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        console.log('Categories loaded:', data);
      }
    } catch (error) {
      console.error('Error initializing categories:', error);
      toast.error('Backend connection failed. Please ensure Django server is running on port 8000.');
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
      console.log('Dashboard data:', data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading('dashboard', false);
    }
  };

  const fetchSixMonthTrend = async () => {
    try {
      const response = await fetch(`${API_BASE}/transactions/six_month_trend/`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      const fixedData = data.map(month => ({
        ...month,
        savings: month.income - month.expenses
      }));
      setSixMonthTrend(fixedData);
    } catch (error) {
      console.error('Error fetching trend data:', error);
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
      console.log('Transactions loaded:', transactionData.length);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
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
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals/`);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setGoals(data.results || data);
      console.log('Goals loaded:', data.results?.length || data.length);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    }
  };

  // Generate yearly data for charts
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

  // Calculate breakdown data
  const getActualIncomeBreakdown = () => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const breakdown = {};
    
    incomeTransactions.forEach(t => {
      const categoryName = t.category_name || 'Other';
      if (!breakdown[categoryName]) {
        breakdown[categoryName] = 0;
      }
      breakdown[categoryName] += parseFloat(t.amount);
    });
    
    return Object.entries(breakdown).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount
    }));
  };

  const getActualExpenseBreakdown = () => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const breakdown = {};
    
    expenseTransactions.forEach(t => {
      const categoryName = t.category_name || 'Other';
      if (!breakdown[categoryName]) {
        breakdown[categoryName] = 0;
      }
      breakdown[categoryName] += parseFloat(t.amount);
    });
    
    return Object.entries(breakdown).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount
    }));
  };

  // Transaction form handlers
  const onSubmitTransaction = async (values) => {
    setLoading('addTransaction', true);
    try {
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      const transactionData = {
        ...values,
        date: formattedDate,
      };

      let response;
      let method = 'POST';
      let url = `${API_BASE}/transactions/`;

      if (editingTransaction) {
        method = 'PUT';
        url = `${API_BASE}/transactions/${editingTransaction.id}/`;
        setLoading('editTransaction', true);
      }

      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      toast.success(
        editingTransaction ? 'Transaction updated successfully!' : 'Transaction added successfully!'
      );
      
      // Refresh data
      await Promise.all([
        fetchTransactions(),
        fetchDashboardData(),
        fetchSixMonthTrend(),
        fetchBudgetAnalysis()
      ]);
      
      // Reset form and editing state
      transactionForm.reset({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date(),
      });
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction. Please check your input.');
    } finally {
      setLoading('addTransaction', false);
      setLoading('editTransaction', false);
    }
  };

  const deleteTransaction = async (id) => {
    setLoading('deleteTransaction', { ...loadingStates.deleteTransaction, [id]: true });
    try {
      const response = await fetch(`${API_BASE}/transactions/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      toast.success('Transaction deleted successfully!');
      
      // Refresh data
      await Promise.all([
        fetchTransactions(),
        fetchDashboardData(),
        fetchSixMonthTrend(),
        fetchBudgetAnalysis()
      ]);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setLoading('deleteTransaction', { ...loadingStates.deleteTransaction, [id]: false });
    }
  };

  const editTransaction = (transaction) => {
    setEditingTransaction(transaction);
    transactionForm.reset({
      type: transaction.type,
      category: transaction.category_id,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date),
    });
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    transactionForm.reset({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: new Date(),
    });
  };

  // Budget form handlers
  const updateBudget = async (values) => {
    setLoading('updateBudget', true);
    try {
      const response = await fetch(`${API_BASE}/budget/update_budget/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      toast.success('Budget updated successfully!');
      await Promise.all([fetchBudgetData(), fetchBudgetAnalysis()]);
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    } finally {
      setLoading('updateBudget', false);
    }
  };

  // Goal form handlers
  const onSubmitGoal = async (values) => {
    setLoading('addGoal', true);
    try {
      const formattedDate = format(values.target_date, 'yyyy-MM-dd');
      const goalData = {
        ...values,
        target_date: formattedDate,
        current_amount: values.current_amount || 0,
      };

      const response = await fetch(`${API_BASE}/goals/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      toast.success('Goal added successfully!');
      await fetchGoals();
      
      goalForm.reset({
        name: '',
        target_amount: '',
        current_amount: 0,
        target_date: new Date(),
        description: '',
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
    } finally {
      setLoading('addGoal', false);
    }
  };

  const deleteGoal = async (id) => {
    setLoading('deleteGoal', true);
    try {
      const response = await fetch(`${API_BASE}/goals/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      toast.success('Goal deleted successfully!');
      await fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    } finally {
      setLoading('deleteGoal', false);
    }
  };

  const updateGoalProgress = async (goalId, currentAmount) => {
    setLoading('updateGoal', true);
    try {
      const response = await fetch(`${API_BASE}/goals/${goalId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ current_amount: currentAmount }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      toast.success('Goal progress updated!');
      await fetchGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast.error('Failed to update goal progress');
    } finally {
      setLoading('updateGoal', false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading('initialLoad', true);
      await Promise.all([
        initializeCategories(),
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

  // Component renders
  const Dashboard = () => (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Monthly Income</p>
                <p className="text-2xl font-bold text-green-400">
                  ${dashboardData.monthly_income?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-red-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-400">
                  ${dashboardData.monthly_expenses?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Net Savings</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${(dashboardData.monthly_income - dashboardData.monthly_expenses)?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <PiggyBank className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - Matching the original layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Trend Chart */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-semibold text-gray-200">
              <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
              2025 Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sixMonthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value/1000}K`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#e5e7eb'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Savings']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#1e40af' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Income Breakdown */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-semibold text-gray-200">
              <Activity className="h-5 w-5 text-green-400 mr-2" />
              Income Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getActualIncomeBreakdown()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {getActualIncomeBreakdown().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#e5e7eb'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {getActualIncomeBreakdown().slice(0, 3).map((entry, index) => (
                <div key={entry.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-gray-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expenses Breakdown */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg font-semibold text-gray-200">
              <BarChart3 className="h-5 w-5 text-red-400 mr-2" />
              Expenses Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getActualExpenseBreakdown()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {getActualExpenseBreakdown().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#e5e7eb'
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {getActualExpenseBreakdown().slice(0, 4).map((entry, index) => (
                <div key={entry.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-gray-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Savings Monthly View - Matching the image */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg font-semibold text-gray-200">
              <Zap className="h-5 w-5 text-blue-400 mr-2" />
              Total Savings
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={quarterFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuarterFilter('all')}
                className="h-8 px-3 text-xs"
              >
                All Months
              </Button>
              {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                <Button
                  key={quarter}
                  variant={quarterFilter === quarter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuarterFilter(quarter)}
                  className="h-8 px-3 text-xs"
                >
                  {quarter}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Monthly Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {getFilteredMonths().map((monthData) => {
              const hasData = monthData.income > 0 || monthData.expenses > 0;
              const isCurrentMonth = monthData.monthIndex === new Date().getMonth();
              
              return (
                <Card 
                  key={monthData.month} 
                  className={`transition-all duration-200 ${
                    hasData 
                      ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' 
                      : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50'
                  } ${isCurrentMonth ? 'ring-2 ring-blue-500/50' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-3 h-3 rounded-full ${hasData ? 'bg-green-400' : 'bg-red-400'}`} />
                      <h4 className="text-sm font-medium text-gray-300">{monthData.month}</h4>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Income:</span>
                        <span className="text-green-400">${monthData.income.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expenses:</span>
                        <span className="text-red-400">${monthData.expenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-600 pt-1">
                        <span className="text-gray-400">Net:</span>
                        <span className={monthData.net >= 0 ? 'text-green-400' : 'text-red-400'}>
                          ${monthData.net.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const Transactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-200">Transactions</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-gray-800 border-gray-700" align="end">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-200">
                  {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                </h3>
                <p className="text-sm text-gray-400">
                  {editingTransaction ? 'Update transaction details' : 'Enter transaction details below'}
                </p>
              </div>
              <Form {...transactionForm}>
                <form onSubmit={transactionForm.handleSubmit(onSubmitTransaction)} className="space-y-4">
                  <FormField
                    control={transactionForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={transactionForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            {(transactionForm.watch('type') === 'income' ? categories.income : categories.expense).map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
                            placeholder="Amount" 
                            type="number" 
                            step="0.01"
                            className="bg-gray-700 border-gray-600" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transactionForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Description" 
                            className="bg-gray-700 border-gray-600" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transactionForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-gray-700 border-gray-600",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-2">
                    {editingTransaction && (
                      <Button type="button" variant="outline" onClick={cancelEdit} className="flex-1">
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={loadingStates.addTransaction || loadingStates.editTransaction}
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                    >
                      {loadingStates.addTransaction || loadingStates.editTransaction ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {editingTransaction ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Transactions List */}
      {loadingStates.transactions ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : transactions.length > 0 ? (
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card 
                  key={transaction.id}
                  className="bg-gray-700/50 border-gray-600/50 hover:bg-gray-700/70 transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-200">{transaction.description}</p>
                          <p className="text-sm text-gray-400">
                            {transaction.category_name || transaction.category} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`text-lg font-semibold ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editTransaction(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-red-600 text-red-400 hover:bg-red-600/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-800 border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-gray-200">Delete Transaction</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Are you sure you want to delete this transaction? This action cannot be undone.
                                </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-200">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTransaction(transaction.id)}
                            disabled={loadingStates.deleteTransaction[transaction.id]}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {loadingStates.deleteTransaction[transaction.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                    </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
      ) : (
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-400">No transactions yet</p>
          <p className="text-gray-500 mt-2">Start by adding your first transaction</p>
        </div>
      )}
    </div>
  );

  const Analytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-200">Analytics</h2>
      
      {/* Yearly Overview Chart */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-200">Yearly Overview</h3>
          <div className="flex gap-2">
            {['all', 'Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
              <Button
                key={quarter}
                variant={quarterFilter === quarter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuarterFilter(quarter)}
                className="h-8 px-3 text-xs"
              >
                {quarter === 'all' ? 'All' : quarter}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getFilteredMonths()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12}
                tickFormatter={(value) => `$${value/1000}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#e5e7eb'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income vs Expenses Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Income Sources</h3>
          <div className="space-y-3">
            {getActualIncomeBreakdown().map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="text-green-400 font-medium">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Expense Categories</h3>
          <div className="space-y-3">
            {getActualExpenseBreakdown().map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="text-red-400 font-medium">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Goals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-200">Financial Goals</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Target className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-200">Add New Goal</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set a financial goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <Form {...goalForm}>
              <form onSubmit={goalForm.handleSubmit(onSubmitGoal)} className="space-y-4">
                <FormField
                  control={goalForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Goal name (e.g., Emergency Fund)" 
                          className="bg-gray-700 border-gray-600" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
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
                          placeholder="Target amount" 
                          type="number" 
                          step="0.01"
                          className="bg-gray-700 border-gray-600" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
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
                          placeholder="Current amount (optional)" 
                          type="number" 
                          step="0.01"
                          className="bg-gray-700 border-gray-600" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={goalForm.control}
                  name="target_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-gray-700 border-gray-600",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick target date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={goalForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Description (optional)" 
                          className="bg-gray-700 border-gray-600" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={loadingStates.addGoal}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loadingStates.addGoal ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Target className="h-4 w-4 mr-2" />
                    )}
                    Add Goal
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const isCompleted = progress >= 100;
            
            return (
              <Card 
                key={goal.id}
                className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:border-green-500/30 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200">{goal.name}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-red-600 text-red-400 hover:bg-red-600/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-200">Delete Goal</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete this goal? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-200">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteGoal(goal.id)}
                            disabled={loadingStates.deleteGoal}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {loadingStates.deleteGoal ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className={isCompleted ? "text-green-400" : "text-gray-300"}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                    </span>
                    <span className="text-gray-400">
                      Due: {format(new Date(goal.target_date), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {!isCompleted && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          Update Progress
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-gray-200">Update Goal Progress</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Update the current amount for {goal.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter current amount"
                            defaultValue={goal.current_amount}
                            className="bg-gray-700 border-gray-600"
                            id={`goal-${goal.id}`}
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              onClick={() => {
                                const input = document.getElementById(`goal-${goal.id}`);
                                const newAmount = parseFloat(input.value);
                                if (!isNaN(newAmount)) {
                                  updateGoalProgress(goal.id, newAmount);
                                }
                              }}
                              disabled={loadingStates.updateGoal}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {loadingStates.updateGoal ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Update
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {isCompleted && (
                    <div className="flex items-center justify-center py-2">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      <span className="text-green-400 font-medium">Goal Completed!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-400">No goals set yet</p>
          <p className="text-gray-500 mt-2">Set your first financial goal to start tracking progress</p>
        </div>
      )}
    </div>
  );

  const SmartBudgeting = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-200">Smart Budgeting</h2>
      
      {/* Budget Setup */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Monthly Budget Setup</h3>
        <Form {...budgetForm}>
          <form onSubmit={budgetForm.handleSubmit(updateBudget)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={budgetForm.control}
                name="monthly_income"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Monthly Income" 
                        type="number" 
                        step="0.01"
                        className="bg-gray-700 border-gray-600" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={loadingStates.updateBudget}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loadingStates.updateBudget ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Calculator className="h-4 w-4 mr-2" />
                )}
                Update Budget
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Budget Analysis */}
      {budgetAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Needs (50%)</h4>
            <p className="text-2xl font-bold text-blue-400">${budgetAnalysis.needs_budget?.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Essential expenses</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Wants (30%)</h4>
            <p className="text-2xl font-bold text-purple-400">${budgetAnalysis.wants_budget?.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Discretionary spending</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Savings (20%)</h4>
            <p className="text-2xl font-bold text-green-400">${budgetAnalysis.savings_goal?.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Emergency fund & investments</p>
          </div>
        </div>
      )}
    </div>
  );

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
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            <p className="mt-5 text-gray-400 text-lg">
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
            {activeTab === 'categories' && (
              <CategoryManager 
                categories={categories}
                setCategories={setCategories}
                apiBase={API_BASE}
                addToast={(message, type) => toast[type || 'info'](message)}
              />
            )}
            {activeTab === 'budget-periods' && (
              <BudgetPeriodManager 
                budgetPeriods={budgetPeriods}
                setBudgetPeriods={setBudgetPeriods}
                apiBase={API_BASE}
                addToast={(message, type) => toast[type || 'info'](message)}
              />
            )}
            {activeTab === 'recurring' && (
              <RecurringTransactionManager 
                recurringTransactions={recurringTransactions}
                setRecurringTransactions={setRecurringTransactions}
                categories={categories}
                apiBase={API_BASE}
                addToast={(message, type) => toast[type || 'info'](message)}
              />
            )}
          </>
        )}
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1f2937',
            border: '1px solid #374151',
            color: '#e5e7eb',
          },
        }}
      />
    </div>
  );
};

export default PersonalFinanceTracker;
