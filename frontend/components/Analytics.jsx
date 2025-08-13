'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  BarChart,
  LineChart,
  Download,
  Calendar,
  Target,
  Calculator,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart as RechartsLineChart,
  Line
} from 'recharts';
import { apiService } from '../lib/api';
import { toast } from 'sonner';
import pdfReportService from '../lib/pdfReports';

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [timeRange, setTimeRange] = useState('3months');
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadTransactions();
    loadBudgetData();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      console.log('Loading transactions...');
      const data = await apiService.getTransactions();
      console.log('Transactions loaded:', data);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const analyticsData = useMemo(() => {
    console.log('Computing analytics data, transactions:', transactions);
    if (!transactions.length) {
      console.log('No transactions, returning empty data');
      return {
        monthlyTrend: [],
        categoryBreakdown: [],
        insights: {
          totalIncome: 0,
          totalExpenses: 0,
          netWorthChange: 0,
          savingsRate: 0,
          avgMonthlySpending: 0,
          avgDailySpending: 0,
          largestCategory: null
        }
      };
    }

    const currentDate = new Date();
    const monthsToLookBack = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    const cutoffDate = new Date();
    cutoffDate.setMonth(currentDate.getMonth() - monthsToLookBack);

    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= cutoffDate
    );

    // Monthly trend
    const monthlyData = {};
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthName, income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += parseFloat(transaction.amount);
      } else {
        monthlyData[monthKey].expenses += parseFloat(transaction.amount);
      }
    });

    const monthlyTrend = Object.values(monthlyData).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    // Category breakdown (expenses only)
    const categoryData = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category_name || 'Uncategorized';
        categoryData[category] = (categoryData[category] || 0) + parseFloat(transaction.amount);
      });

    const categoryBreakdown = Object.entries(categoryData)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate insights
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netWorthChange = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netWorthChange / totalIncome) * 100) : 0;
    const avgMonthlySpending = totalExpenses / monthsToLookBack;
    const avgDailySpending = totalExpenses / (monthsToLookBack * 30);
    const largestCategory = categoryBreakdown[0] || null;

    const result = {
      monthlyTrend,
      categoryBreakdown,
      insights: {
        totalIncome,
        totalExpenses,
        netWorthChange,
        savingsRate,
        avgMonthlySpending,
        avgDailySpending,
        largestCategory: largestCategory ? {
          category: largestCategory.name,
          amount: largestCategory.amount
        } : null
      }
    };
    
    console.log('Analytics data computed:', result);
    return result;
  }, [transactions, timeRange]);

  const loadBudgetData = async () => {
    try {
      const budgetData = await apiService.getCurrentBudget();
      setBudget(budgetData);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const handlePDFExport = async () => {
    setGeneratingPDF(true);
    try {
      const monthsBack = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
      const reportData = await apiService.getReportData(monthsBack);
      
      const filename = `financial-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdfReportService.downloadReport(reportData, filename, timeRange);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Period,Income,Expenses,Net\n" +
      analyticsData.monthlyTrend.map(row => 
        `${row.month},${row.income},${row.expenses},${row.income - row.expenses}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Analytics exported successfully!');
  };

  if (loading) {
    return (
      <div style={{ 
        backgroundColor: '#0a0a0a', 
        minHeight: '100vh', 
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#e5e5e5', fontSize: '16px' }}>Loading analytics...</div>
      </div>
    );
  }

  const styles = {
    header: {
      backgroundColor: '#171717',
      border: '1px solid #262626',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
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
      padding: '20px',
      minHeight: '280px',
    },
    metricCard: {
      backgroundColor: '#171717',
      border: '1px solid #262626',
      borderRadius: '16px',
      padding: '20px',
      minHeight: '120px',
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
                    padding: '8px 16px',
                    backgroundColor: timeRange === period.id ? '#10b981' : 'transparent',
                    color: timeRange === period.id ? '#ffffff' : '#737373',
                    border: `1px solid ${timeRange === period.id ? '#10b981' : '#404040'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s ease',
                    marginRight: '8px',
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
              CSV
            </button>
            
            <button 
              onClick={handlePDFExport}
              disabled={generatingPDF}
              style={{
                padding: '8px 16px',
                backgroundColor: generatingPDF ? '#404040' : '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: generatingPDF ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download style={{ width: 14, height: 14 }} />
              {generatingPDF ? 'Generating...' : 'PDF Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Grid - 3x3 Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Row 1 - Key Metrics */}
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
            {analyticsData.insights.savingsRate >= 0 ? 'Great job saving!' : 'Consider reducing expenses'}
          </p>
        </div>

        <div style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ ...styles.iconBox, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
              <Calculator style={{ width: 20, height: 20, color: '#6366f1' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: '500' }}>
              ${analyticsData.insights.avgMonthlySpending.toLocaleString()}
            </span>
          </div>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '4px' }}>Avg Monthly Spending</p>
          <p style={{ fontSize: '20px', fontWeight: '300', color: '#f5f5f5' }}>
            ${analyticsData.insights.avgDailySpending.toFixed(2)}/day
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '4px' }}>
            Based on last {timeRange === '3months' ? '3' : timeRange === '6months' ? '6' : '12'} months
          </p>
        </div>

        <div style={styles.metricCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ ...styles.iconBox, backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
              <PieChart style={{ width: 20, height: 20, color: '#ec4899' }} />
            </div>
            <span style={{ fontSize: '12px', color: '#ec4899', fontWeight: '500' }}>
              {analyticsData.insights.largestCategory?.category || 'N/A'}
            </span>
          </div>
          <p style={{ color: '#737373', fontSize: '14px', marginBottom: '4px' }}>Top Spending Category</p>
          <p style={{ fontSize: '20px', fontWeight: '300', color: '#f5f5f5' }}>
            ${(analyticsData.insights.largestCategory?.amount || 0).toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '4px' }}>
            {((analyticsData.insights.largestCategory?.amount || 0) / Math.max(analyticsData.insights.totalExpenses, 1) * 100).toFixed(1)}% of total spending
          </p>
        </div>

        {/* Row 2 - Charts */}
        <div style={styles.card}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#e5e5e5', marginBottom: '16px' }}>
            Monthly Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsLineChart data={analyticsData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis 
                dataKey="month" 
                stroke="#737373" 
                fontSize={10}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis stroke="#737373" fontSize={10} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#e5e5e5',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  `$${value.toLocaleString()}`,
                  name === 'income' ? 'Income' : 'Expenses'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#e5e5e5', marginBottom: '16px' }}>
            Expense Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsPieChart>
              <Pie
                data={analyticsData.categoryBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="amount"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                labelLine={false}
                fontSize={9}
              >
                {analyticsData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#e5e5e5',
                  fontSize: '12px'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#e5e5e5', marginBottom: '16px' }}>
            Top Categories
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBarChart data={analyticsData.categoryBreakdown.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis 
                dataKey="name" 
                stroke="#737373" 
                fontSize={9}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis stroke="#737373" fontSize={9} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#e5e5e5',
                  fontSize: '12px'
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
              />
              <Bar 
                dataKey="amount" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {/* Row 3 - Financial Summary Cards */}
        <div style={{ 
          ...styles.card,
          padding: '16px', 
          backgroundColor: '#0a0a0a', 
          borderRadius: '8px',
          border: '1px solid #262626',
          minHeight: '140px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ArrowUpRight style={{ width: 16, height: 16, color: '#10b981' }} />
            <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>
              Total Income
            </span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '300', color: '#10b981' }}>
            ${analyticsData.insights.totalIncome.toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '4px' }}>
            For selected period
          </p>
        </div>
        
        <div style={{ 
          ...styles.card,
          padding: '16px', 
          backgroundColor: '#0a0a0a', 
          borderRadius: '8px',
          border: '1px solid #262626',
          minHeight: '140px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ArrowDownRight style={{ width: 16, height: 16, color: '#ef4444' }} />
            <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>
              Total Expenses
            </span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: '300', color: '#ef4444' }}>
            ${analyticsData.insights.totalExpenses.toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '4px' }}>
            For selected period
          </p>
        </div>
        
        <div style={{ 
          ...styles.card,
          padding: '16px', 
          backgroundColor: '#0a0a0a', 
          borderRadius: '8px',
          border: '1px solid #262626',
          minHeight: '140px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp style={{ width: 16, height: 16, color: '#6366f1' }} />
            <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>
              Net Worth Change
            </span>
          </div>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: '300', 
            color: analyticsData.insights.netWorthChange >= 0 ? '#10b981' : '#ef4444' 
          }}>
            {analyticsData.insights.netWorthChange >= 0 ? '+' : ''}${analyticsData.insights.netWorthChange.toLocaleString()}
          </p>
          <p style={{ fontSize: '11px', color: '#525252', marginTop: '4px' }}>
            Income minus expenses
          </p>
        </div>
      </div>
    </div>
  );
}
