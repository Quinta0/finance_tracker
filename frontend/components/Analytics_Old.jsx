"use client"
import React, { useMemo, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Analytics = ({ transactions = [] }) => {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Export functionality
  const handleExport = () => {
    const data = {
      timeRange,
      generatedAt: new Date().toISOString(),
      insights: analyticsData.insights,
      monthlyTrends: analyticsData.monthlyTrends,
      categorySpending: analyticsData.categorySpending,
      spendingByWeekday: analyticsData.spendingByWeekday
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!transactions.length) {
      return {
        monthlyTrends: [],
        categorySpending: [],
        incomeVsExpenses: [],
        spendingByWeekday: [],
        topCategories: [],
        insights: {}
      };
    }

    const now = new Date();
    const filterMonths = timeRange === '6months' ? 6 : timeRange === '12months' ? 12 : 3;
    const startDate = new Date(now.getFullYear(), now.getMonth() - filterMonths, 1);

    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate;
    });

    // Monthly trends
    const monthlyData = {};
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('default', { month: 'short', year: 'numeric' }),
          income: 0,
          expenses: 0,
          net: 0
        };
      }
      
      const amount = parseFloat(t.amount);
      if (t.type === 'income') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(amount);
      }
    });

    Object.values(monthlyData).forEach(month => {
      month.net = month.income - month.expenses;
    });

    const monthlyTrends = Object.values(monthlyData).sort((a, b) => 
      new Date(a.month) - new Date(b.month)
    );

    // Category spending analysis
    const categoryData = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category_name || t.category || 'Other';
        categoryData[category] = (categoryData[category] || 0) + Math.abs(parseFloat(t.amount));
      });

    const categorySpending = Object.entries(categoryData)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Income vs Expenses comparison
    const incomeVsExpenses = monthlyTrends.map(month => ({
      month: month.month,
      income: month.income,
      expenses: month.expenses
    }));

    // Spending by weekday
    const weekdayData = Array.from({ length: 7 }, (_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      amount: 0,
      count: 0
    }));

    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const dayOfWeek = new Date(t.date).getDay();
        weekdayData[dayOfWeek].amount += Math.abs(parseFloat(t.amount));
        weekdayData[dayOfWeek].count += 1;
      });

    // Calculate insights
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const avgMonthlySpending = totalExpenses / filterMonths;
    const topCategory = categorySpending[0]?.name || 'N/A';
    const topCategoryAmount = categorySpending[0]?.amount || 0;

    return {
      monthlyTrends,
      categorySpending: categorySpending.slice(0, 8),
      incomeVsExpenses,
      spendingByWeekday: weekdayData,
      topCategories: categorySpending.slice(0, 5),
      insights: {
        totalIncome,
        totalExpenses,
        savingsRate,
        avgMonthlySpending,
        topCategory,
        topCategoryAmount,
        transactionCount: filteredTransactions.length
      }
    };
  }, [transactions, timeRange]);

  const styles = {
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '300',
      color: '#f5f5f5',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#737373',
    },
    card: {
      backgroundColor: '#171717',
      border: '1px solid #262626',
      borderRadius: '16px',
      padding: '24px',
    },
    metricCard: {
      backgroundColor: '#171717',
      border: '1px solid #262626',
      borderRadius: '16px',
      padding: '20px',
      minHeight: '120px',
    },
    filterButton: {
      padding: '8px 16px',
      backgroundColor: 'transparent',
      color: '#737373',
      border: '1px solid #404040',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s ease',
      marginRight: '8px',
    },
    filterButtonActive: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      borderColor: '#10b981',
    },
    iconBox: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <div>
            <h1 style={styles.title}>Analytics</h1>
            <p style={styles.subtitle}>Deep insights into your financial patterns</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: '3months', label: '3M' },
                { id: '6months', label: '6M' },
                { id: '12months', label: '12M' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setTimeRange(period.id)}
                  style={{
                    ...styles.filterButton,
                    ...(timeRange === period.id ? styles.filterButtonActive : {})
                  }}
                >
                  {period.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                backgroundColor: '#262626',
                color: '#e5e5e5',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download style={{ width: 14, height: 14 }} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <div style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ ...styles.iconBox, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <TrendingUp style={{ width: 20, height: 20, color: '#10b981' }} />
            </div>
            <span style={{ 
              fontSize: '12px', 
              color: analyticsData.insights.savingsRate >= 0 ? '#10b981' : '#ef4444',
              fontWeight: '500'
            }}>
              {analyticsData.insights.savingsRate >= 0 ? '+' : ''}{analyticsData.insights.savingsRate.toFixed(1)}%
            </span>
          </div>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '4px' }}>Savings Rate</p>
          <p style={{ fontSize: '20px', fontWeight: '300', color: '#f5f5f5' }}>
            {analyticsData.insights.savingsRate >= 0 ? 'Positive' : 'Negative'}
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '4px' }}>
            Last {timeRange === '3months' ? '3' : timeRange === '6months' ? '6' : '12'} months
          </p>
        </div>

        <div style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ ...styles.iconBox, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <BarChart3 style={{ width: 20, height: 20, color: '#ef4444' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '500' }}>
              Avg Monthly
            </span>
          </div>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '4px' }}>Spending</p>
          <p style={{ fontSize: '20px', fontWeight: '300', color: '#f5f5f5' }}>
            ${analyticsData.insights.avgMonthlySpending.toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '4px' }}>
            Top: {analyticsData.insights.topCategory}
          </p>
        </div>

        <div style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ ...styles.iconBox, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Activity style={{ width: 20, height: 20, color: '#3b82f6' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>
              Total
            </span>
          </div>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '4px' }}>Transactions</p>
          <p style={{ fontSize: '20px', fontWeight: '300', color: '#f5f5f5' }}>
            {analyticsData.insights.transactionCount}
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '4px' }}>
            Period selected
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Monthly Trends */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#e5e5e5' }}>Monthly Trends</h3>
            <TrendingUp style={{ width: 16, height: 16, color: '#525252' }} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analyticsData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis 
                dataKey="month" 
                stroke="#525252"
                tick={{ fill: '#525252', fontSize: 11 }}
                axisLine={{ stroke: '#262626' }}
              />
              <YAxis 
                stroke="#525252"
                tick={{ fill: '#525252', fontSize: 11 }}
                axisLine={{ stroke: '#262626' }}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  border: '1px solid #262626',
                  borderRadius: '8px',
                  color: '#e5e5e5',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
                labelStyle={{ color: '#f5f5f5' }}
                formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
              />
              <Area 
                type="monotone" 
                dataKey="net" 
                stroke="#10b981" 
                fill="rgba(16, 185, 129, 0.1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Expenses */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#e5e5e5' }}>Income vs Expenses</h3>
            <BarChart3 style={{ width: 16, height: 16, color: '#525252' }} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.incomeVsExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis 
                dataKey="month" 
                stroke="#525252"
                tick={{ fill: '#525252', fontSize: 11 }}
                axisLine={{ stroke: '#262626' }}
              />
              <YAxis 
                stroke="#525252"
                tick={{ fill: '#525252', fontSize: 11 }}
                axisLine={{ stroke: '#262626' }}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  border: '1px solid #262626',
                  borderRadius: '8px',
                  color: '#e5e5e5',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
                labelStyle={{ color: '#f5f5f5' }}
                formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#e5e5e5' }}>Spending by Category</h3>
            <PieChartIcon style={{ width: 16, height: 16, color: '#525252' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={analyticsData.categorySpending.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {analyticsData.categorySpending.slice(0, 6).map((entry, index) => (
                    <Cell key={`category-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#171717', 
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    color: '#e5e5e5',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                  labelStyle={{ color: '#f5f5f5' }}
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {analyticsData.categorySpending.slice(0, 6).map((item, index) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%',
                  backgroundColor: COLORS[index % COLORS.length]
                }} />
                <span style={{ fontSize: '11px', color: '#a3a3a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spending by Weekday */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#e5e5e5' }}>Spending by Day</h3>
            <Calendar style={{ width: 16, height: 16, color: '#525252' }} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analyticsData.spendingByWeekday}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis 
                dataKey="day" 
                stroke="#525252"
                tick={{ fill: '#525252', fontSize: 11 }}
                axisLine={{ stroke: '#262626' }}
              />
              <YAxis 
                stroke="#525252"
                tick={{ fill: '#525252', fontSize: 11 }}
                axisLine={{ stroke: '#262626' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  border: '1px solid #262626',
                  borderRadius: '8px',
                  color: '#e5e5e5',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
                labelStyle={{ color: '#f5f5f5' }}
                formatter={(value, name) => [`$${value.toLocaleString()}`, 'Total Spending']}
              />
              <Bar 
                dataKey="amount" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Summary */}
      <div style={styles.card}>
        <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#e5e5e5', marginBottom: '20px' }}>
          Financial Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#0a0a0a', 
            borderRadius: '8px',
            border: '1px solid #262626'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ArrowUpRight style={{ width: 16, height: 16, color: '#10b981' }} />
              <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>
                Total Income
              </span>
            </div>
            <p style={{ fontSize: '20px', fontWeight: '300', color: '#10b981' }}>
              ${analyticsData.insights.totalIncome.toLocaleString()}
            </p>
          </div>
          
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#0a0a0a', 
            borderRadius: '8px',
            border: '1px solid #262626'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ArrowDownRight style={{ width: 16, height: 16, color: '#ef4444' }} />
              <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>
                Total Expenses
              </span>
            </div>
            <p style={{ fontSize: '20px', fontWeight: '300', color: '#ef4444' }}>
              ${analyticsData.insights.totalExpenses.toLocaleString()}
            </p>
          </div>
          
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#0a0a0a', 
            borderRadius: '8px',
            border: '1px solid #262626'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <PieChartIcon style={{ width: 16, height: 16, color: '#f59e0b' }} />
              <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>
                Top Category
              </span>
            </div>
            <p style={{ fontSize: '20px', fontWeight: '300', color: '#f59e0b' }}>
              {analyticsData.insights.topCategory}
            </p>
            <p style={{ fontSize: '12px', color: '#737373' }}>
              ${analyticsData.insights.topCategoryAmount.toLocaleString()} spent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
