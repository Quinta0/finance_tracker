"use client"
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, PiggyBank, Activity, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = ({ transactions = [] }) => {
  // Calculate metrics from transactions
  const metrics = useMemo(() => {
    if (!transactions.length) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        monthlyData: [],
        savingsData: [],
        incomeBreakdown: [],
        expenseBreakdown: []
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalExpenses = Math.abs(currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0));

    const totalSavings = totalIncome - totalExpenses;

    // Group transactions by category for expense breakdown
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryName = t.category?.name || t.category || 'Other';
        acc[categoryName] = (acc[categoryName] || 0) + Math.abs(parseFloat(t.amount || 0));
        return acc;
      }, {});

    const expenseBreakdown = Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Group transactions by category for income breakdown
    const incomesByCategory = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        const categoryName = t.category?.name || t.category || 'Other';
        acc[categoryName] = (acc[categoryName] || 0) + parseFloat(t.amount || 0);
        return acc;
      }, {});

    const incomeBreakdown = Object.entries(incomesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    // Create monthly savings data based on actual transactions
    const savingsData = Array.from({ length: 12 }, (_, i) => {
      const monthName = new Date(currentYear, i).toLocaleString('default', { month: 'long' });
      
      // Get transactions for this specific month
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === i && transactionDate.getFullYear() === currentYear;
      });
      
      // Calculate actual income and expenses for this month
      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      const monthExpenses = Math.abs(monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0));
      
      return {
        name: monthName,
        value: monthIncome - monthExpenses
      };
    });

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      expenseBreakdown,
      incomeBreakdown,
      savingsData
    };
  }, [transactions]);
  const styles = {
    grid: {
      display: 'grid',
      gap: '16px',
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
      padding: '24px',
      minHeight: '140px',
    },
    iconBox: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterButton: {
      padding: '6px 12px',
      backgroundColor: 'transparent',
      color: '#737373',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s ease',
    },
    filterButtonActive: {
      backgroundColor: '#262626',
      color: '#e5e5e5',
    },
    filterButton: {
      padding: '6px 12px',
      backgroundColor: 'transparent',
      color: '#737373',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s ease',
    },
    filterButtonActive: {
      backgroundColor: '#262626',
      color: '#e5e5e5',
    },
    monthCard: {
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #262626',
      backgroundColor: '#0a0a0a',
    },
    monthCardActive: {
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
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
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Personal Finance Tracker</h1>
        <p style={styles.subtitle}>Track your financial journey with precision</p>
      </div>

      {/* Key Metrics */}
      <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '24px' }}>
        <div style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ ...styles.iconBox, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <TrendingUp style={{ width: 20, height: 20, color: '#10b981' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              +12% <ArrowUpRight style={{ width: 12, height: 12 }} />
            </span>
          </div>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '4px' }}>Total Income</p>
          <p style={{ fontSize: '24px', fontWeight: '300', color: '#f5f5f5' }}>
            ${metrics.totalIncome.toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px' }}>This Month</p>
        </div>

        <div style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ ...styles.iconBox, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <TrendingDown style={{ width: 20, height: 20, color: '#ef4444' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
              -5% <ArrowDownRight style={{ width: 12, height: 12 }} />
            </span>
          </div>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '4px' }}>Total Expenses</p>
          <p style={{ fontSize: '24px', fontWeight: '300', color: '#f5f5f5' }}>
            ${metrics.totalExpenses.toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px' }}>This Month</p>
        </div>

        <div style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ ...styles.iconBox, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <PiggyBank style={{ width: 20, height: 20, color: '#3b82f6' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              +8% <ArrowUpRight style={{ width: 12, height: 12 }} />
            </span>
          </div>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '4px' }}>Net Savings</p>
          <p style={{ fontSize: '24px', fontWeight: '300', color: '#f5f5f5' }}>
            ${metrics.totalSavings.toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#525252', marginTop: '4px' }}>This Month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', marginBottom: '24px' }}>
        {/* Savings Trend */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#e5e5e5' }}>2025 Savings</h3>
            <BarChart3 style={{ width: 16, height: 16, color: '#525252' }} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.savingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis 
                dataKey="name" 
                stroke="#525252"
                tick={{ fill: '#525252', fontSize: 11 }}
                axisLine={{ stroke: '#262626' }}
              />
              <YAxis 
                stroke="#525252"
                tick={{ fill: '#525252', fontSize: 11 }}
                axisLine={{ stroke: '#262626' }}
                tickFormatter={(value) => `$${value/1000}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  border: '1px solid #262626',
                  borderRadius: '8px',
                  color: '#e5e5e5'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income Breakdown */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#e5e5e5' }}>Income Breakdown</h3>
            <Activity style={{ width: 16, height: 16, color: '#525252' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={metrics.incomeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {metrics.incomeBreakdown.map((entry, index) => (
                    <Cell key={`income-cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#0ea5e9'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#171717', 
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    color: '#e5e5e5'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {metrics.incomeBreakdown.map((item, index) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%',
                    backgroundColor: index % 2 === 0 ? '#10b981' : '#0ea5e9'
                  }} />
                  <span style={{ fontSize: '12px', color: '#a3a3a3' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#e5e5e5' }}>
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#e5e5e5' }}>Expenses Breakdown</h3>
            <TrendingDown style={{ width: 16, height: 16, color: '#525252' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={metrics.expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {metrics.expenseBreakdown.map((entry, index) => {
                    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6'];
                    return <Cell key={`expense-cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#171717', 
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    color: '#e5e5e5'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {metrics.expenseBreakdown.slice(0, 4).map((item, index) => {
              const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16'];
              return (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%',
                      backgroundColor: colors[index]
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#a3a3a3' }}>{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
        </div>

        {/* Monthly Savings Overview */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#e5e5e5' }}>Total Savings</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All Months', 'Q1', 'Q2', 'Q3', 'Q4'].map((filter) => (
                <button
                  key={filter}
                  style={{
                    ...styles.filterButton,
                    ...(filter === 'All Months' ? styles.filterButtonActive : {})
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {Array.from({ length: 12 }, (_, index) => {
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                'July', 'August', 'September', 'October', 'November', 'December'];
              const monthName = monthNames[index];
              const currentMonth = new Date().getMonth();
              const currentYear = new Date().getFullYear();
              const hasData = index <= currentMonth;
              
              // Calculate actual monthly data from transactions
              const monthlyTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === index && transactionDate.getFullYear() === currentYear;
              });
              
              const income = monthlyTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
              
              const expenses = monthlyTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
              
              const net = income - expenses;
              
              return (
                <div 
                  key={monthName}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #262626',
                    backgroundColor: (income > 0 || expenses > 0) ? 'rgba(16, 185, 129, 0.05)' : '#0a0a0a',
                    borderColor: (income > 0 || expenses > 0) ? 'rgba(16, 185, 129, 0.3)' : '#262626',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%',
                      backgroundColor: (income > 0 || expenses > 0) ? '#10b981' : '#ef4444'
                    }} />
                    <span style={{ fontSize: '12px', color: '#a3a3a3' }}>{monthName}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#525252' }}>Income:</span>
                      <span style={{ color: '#10b981' }}>${income.toFixed(0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#525252' }}>Expenses:</span>
                      <span style={{ color: '#ef4444' }}>${expenses.toFixed(0)}</span>
                    </div>
                    <div style={{ paddingTop: '4px', borderTop: '1px solid #262626' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#525252' }}>Net:</span>
                        <span style={{ color: net >= 0 ? '#10b981' : '#ef4444' }}>
                          ${net.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  export default Dashboard;