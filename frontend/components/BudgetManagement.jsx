"use client"
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  PiggyBank, 
  ShoppingCart, 
  Home, 
  Edit, 
  Save, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Calculator,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../lib/api';
import BudgetTemplateSelectorFixed from './BudgetTemplateSelectorFixed';

const BudgetManagement = ({ transactions = [] }) => {
  const [budget, setBudget] = useState(null);
  const [budgetPeriods, setBudgetPeriods] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState(false);
  const [customPercentages, setCustomPercentages] = useState(false);
  
  // Budget allocation percentages
  const [allocations, setAllocations] = useState({
    needs: 50,
    wants: 30,
    savings: 20
  });
  
  // Monthly income input
  const [monthlyIncome, setMonthlyIncome] = useState('');

  // Load data on mount
  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const [budgetData, periodsData, currentPeriodData] = await Promise.all([
        apiService.getCurrentBudget().catch(() => null),
        apiService.getBudgetPeriods().catch(() => []),
        apiService.getCurrentBudgetPeriod().catch(() => null)
      ]);
      
      setBudget(budgetData);
      setBudgetPeriods(periodsData);
      setCurrentPeriod(currentPeriodData);
      
      if (budgetData) {
        setMonthlyIncome(budgetData.monthly_income?.toString() || '');
        // Calculate current percentages if we have data
        if (budgetData.monthly_income > 0) {
          const needsPercent = Math.round((budgetData.needs_budget / budgetData.monthly_income) * 100);
          const wantsPercent = Math.round((budgetData.wants_budget / budgetData.monthly_income) * 100);
          const savingsPercent = Math.round((budgetData.savings_goal / budgetData.monthly_income) * 100);
          
          setAllocations({
            needs: needsPercent,
            wants: wantsPercent,
            savings: savingsPercent
          });
        }
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate actual spending from transactions
  const calculateActualSpending = () => {
    if (!transactions.length || !currentPeriod) {
      return { needs: 0, wants: 0, totalSpent: 0 };
    }

    const periodStart = new Date(currentPeriod.start_date);
    const periodEnd = new Date(currentPeriod.end_date);
    
    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= periodStart && 
             transactionDate <= periodEnd && 
             t.type === 'expense';
    });

    // Categorize spending (this is simplified - you might want more sophisticated categorization)
    const needsCategories = ['Groceries', 'Utilities', 'Rent', 'Healthcare', 'Transportation'];
    const wantsCategories = ['Entertainment', 'Dining Out', 'Shopping', 'Hobbies'];
    
    let needsSpent = 0;
    let wantsSpent = 0;
    
    periodTransactions.forEach(t => {
      const categoryName = t.category_name || t.category || '';
      const amount = Math.abs(parseFloat(t.amount));
      
      if (needsCategories.some(cat => categoryName.toLowerCase().includes(cat.toLowerCase()))) {
        needsSpent += amount;
      } else if (wantsCategories.some(cat => categoryName.toLowerCase().includes(cat.toLowerCase()))) {
        wantsSpent += amount;
      } else {
        // Default to needs if unclear
        needsSpent += amount;
      }
    });

    return {
      needs: needsSpent,
      wants: wantsSpent,
      totalSpent: needsSpent + wantsSpent
    };
  };

  const actualSpending = calculateActualSpending();

  // Handle budget update
  const handleUpdateBudget = async () => {
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      toast.error('Please enter a valid monthly income');
      return;
    }

    try {
      const income = parseFloat(monthlyIncome);
      await apiService.updateMonthlyIncome(income, currentPeriod?.id);
      toast.success('Budget updated successfully!');
      await loadBudgetData();
      setEditingBudget(false);
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  // Handle percentage changes
  const handlePercentageChange = (category, value) => {
    const newValue = Math.max(0, Math.min(100, value));
    const newAllocations = { ...allocations, [category]: newValue };
    
    // Ensure total doesn't exceed 100%
    const total = Object.values(newAllocations).reduce((sum, val) => sum + val, 0);
    if (total <= 100) {
      setAllocations(newAllocations);
    }
  };

  // Reset to 50/30/20 rule
  const resetToDefault = () => {
    setAllocations({ needs: 50, wants: 30, savings: 20 });
    setCustomPercentages(false);
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setAllocations(template.allocations);
    setCustomPercentages(true);
    toast.success(`Applied ${template.name} template!`);
  };

  // Calculate budget amounts
  const income = parseFloat(monthlyIncome) || 0;
  const calculatedBudget = {
    needs: (income * allocations.needs) / 100,
    wants: (income * allocations.wants) / 100,
    savings: (income * allocations.savings) / 100
  };

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
      minHeight: '140px',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s ease',
    },
    input: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#262626',
      border: '1px solid #404040',
      borderRadius: '8px',
      color: '#f5f5f5',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#262626',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '8px'
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
    percentageInput: {
      width: '60px',
      padding: '4px 8px',
      backgroundColor: '#262626',
      border: '1px solid #404040',
      borderRadius: '4px',
      color: '#f5f5f5',
      fontSize: '12px',
      textAlign: 'center'
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #262626',
          borderTop: '3px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#737373', fontSize: '14px' }}>Loading budget data...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <div>
            <h1 style={styles.title}>Budget Management</h1>
            <p style={styles.subtitle}>Follow the 50/30/20 rule or customize your own allocation</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={resetToDefault}
              style={{
                ...styles.button,
                backgroundColor: '#3b82f6'
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              50/30/20 Rule
            </button>
            
            <BudgetTemplateSelectorFixed 
              onTemplateSelect={handleTemplateSelect}
              currentAllocations={allocations}
              monthlyIncome={income}
            />
            
            <button 
              onClick={() => setEditingBudget(!editingBudget)}
              style={styles.button}
            >
              <Edit style={{ width: 16, height: 16 }} />
              {editingBudget ? 'Cancel' : 'Edit Budget'}
            </button>
          </div>
        </div>
      </div>

      {/* Income Setting */}
      <div style={{ ...styles.card, marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#e5e5e5', marginBottom: '16px' }}>
          Monthly Income
        </h3>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              color: '#e5e5e5',
              fontWeight: '500'
            }}>
              Enter your monthly income
            </label>
            <div style={{ position: 'relative' }}>
              <DollarSign style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: 16, 
                height: 16, 
                color: '#737373' 
              }} />
              <input
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                disabled={!editingBudget}
                style={{
                  ...styles.input,
                  paddingLeft: '40px',
                  opacity: editingBudget ? 1 : 0.6
                }}
              />
            </div>
          </div>
          
          {editingBudget && (
            <button onClick={handleUpdateBudget} style={styles.button}>
              <Save style={{ width: 16, height: 16 }} />
              Save Income
            </button>
          )}
        </div>
      </div>

      {/* Budget Allocation */}
      {income > 0 && (
        <>
          {/* Allocation Controls */}
          <div style={{ ...styles.card, marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#e5e5e5' }}>
                Budget Allocation
              </h3>
              <button 
                onClick={() => setCustomPercentages(!customPercentages)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: customPercentages ? '#10b981' : '#262626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Custom %
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Needs */}
              <div style={{
                padding: '16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '8px',
                border: '1px solid #262626'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Home style={{ width: 16, height: 16, color: '#ef4444' }} />
                    <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>Needs</span>
                  </div>
                  {customPercentages ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={allocations.needs}
                        onChange={(e) => handlePercentageChange('needs', parseInt(e.target.value) || 0)}
                        style={styles.percentageInput}
                      />
                      <span style={{ fontSize: '12px', color: '#737373' }}>%</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '500' }}>
                      {allocations.needs}%
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '20px', fontWeight: '300', color: '#f5f5f5', marginBottom: '4px' }}>
                  ${calculatedBudget.needs.toLocaleString()}
                </p>
                <p style={{ fontSize: '11px', color: '#737373' }}>
                  Rent, groceries, utilities, healthcare
                </p>
              </div>

              {/* Wants */}
              <div style={{
                padding: '16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '8px',
                border: '1px solid #262626'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingCart style={{ width: 16, height: 16, color: '#f59e0b' }} />
                    <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>Wants</span>
                  </div>
                  {customPercentages ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={allocations.wants}
                        onChange={(e) => handlePercentageChange('wants', parseInt(e.target.value) || 0)}
                        style={styles.percentageInput}
                      />
                      <span style={{ fontSize: '12px', color: '#737373' }}>%</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '500' }}>
                      {allocations.wants}%
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '20px', fontWeight: '300', color: '#f5f5f5', marginBottom: '4px' }}>
                  ${calculatedBudget.wants.toLocaleString()}
                </p>
                <p style={{ fontSize: '11px', color: '#737373' }}>
                  Entertainment, dining out, hobbies
                </p>
              </div>

              {/* Savings */}
              <div style={{
                padding: '16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '8px',
                border: '1px solid #262626'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PiggyBank style={{ width: 16, height: 16, color: '#10b981' }} />
                    <span style={{ fontSize: '14px', color: '#e5e5e5', fontWeight: '500' }}>Savings</span>
                  </div>
                  {customPercentages ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={allocations.savings}
                        onChange={(e) => handlePercentageChange('savings', parseInt(e.target.value) || 0)}
                        style={styles.percentageInput}
                      />
                      <span style={{ fontSize: '12px', color: '#737373' }}>%</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '500' }}>
                      {allocations.savings}%
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '20px', fontWeight: '300', color: '#f5f5f5', marginBottom: '4px' }}>
                  ${calculatedBudget.savings.toLocaleString()}
                </p>
                <p style={{ fontSize: '11px', color: '#737373' }}>
                  Emergency fund, investments, goals
                </p>
              </div>
            </div>

            {/* Total Check */}
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: Object.values(allocations).reduce((sum, val) => sum + val, 0) === 100 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: `1px solid ${Object.values(allocations).reduce((sum, val) => sum + val, 0) === 100 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#e5e5e5' }}>Total Allocation</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '500',
                    color: Object.values(allocations).reduce((sum, val) => sum + val, 0) === 100 ? '#10b981' : '#ef4444'
                  }}>
                    {Object.values(allocations).reduce((sum, val) => sum + val, 0)}%
                  </span>
                  {Object.values(allocations).reduce((sum, val) => sum + val, 0) === 100 ? (
                    <CheckCircle2 style={{ width: 16, height: 16, color: '#10b981' }} />
                  ) : (
                    <AlertTriangle style={{ width: 16, height: 16, color: '#ef4444' }} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Spending vs Budget Comparison */}
          <div style={styles.card}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#e5e5e5', marginBottom: '20px' }}>
              Current Period Performance
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* Needs Spending */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#e5e5e5' }}>Needs Spending</span>
                  <span style={{ fontSize: '14px', color: '#e5e5e5' }}>
                    ${actualSpending.needs.toLocaleString()} / ${calculatedBudget.needs.toLocaleString()}
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min((actualSpending.needs / calculatedBudget.needs) * 100, 100)}%`,
                      backgroundColor: actualSpending.needs > calculatedBudget.needs ? '#ef4444' : '#10b981'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#737373' }}>
                    {((actualSpending.needs / calculatedBudget.needs) * 100).toFixed(1)}% used
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: actualSpending.needs > calculatedBudget.needs ? '#ef4444' : '#10b981',
                    fontWeight: '500'
                  }}>
                    {actualSpending.needs > calculatedBudget.needs ? 'Over Budget' : 'On Track'}
                  </span>
                </div>
              </div>

              {/* Wants Spending */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#e5e5e5' }}>Wants Spending</span>
                  <span style={{ fontSize: '14px', color: '#e5e5e5' }}>
                    ${actualSpending.wants.toLocaleString()} / ${calculatedBudget.wants.toLocaleString()}
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min((actualSpending.wants / calculatedBudget.wants) * 100, 100)}%`,
                      backgroundColor: actualSpending.wants > calculatedBudget.wants ? '#ef4444' : '#f59e0b'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#737373' }}>
                    {((actualSpending.wants / calculatedBudget.wants) * 100).toFixed(1)}% used
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: actualSpending.wants > calculatedBudget.wants ? '#ef4444' : '#f59e0b',
                    fontWeight: '500'
                  }}>
                    {actualSpending.wants > calculatedBudget.wants ? 'Over Budget' : 'On Track'}
                  </span>
                </div>
              </div>

              {/* Savings Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#e5e5e5' }}>Savings Target</span>
                  <span style={{ fontSize: '14px', color: '#e5e5e5' }}>
                    ${(income - actualSpending.totalSpent).toLocaleString()} / ${calculatedBudget.savings.toLocaleString()}
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min(((income - actualSpending.totalSpent) / calculatedBudget.savings) * 100, 100)}%`,
                      backgroundColor: '#10b981'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#737373' }}>
                    {(((income - actualSpending.totalSpent) / calculatedBudget.savings) * 100).toFixed(1)}% achieved
                  </span>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
                    Projected Savings
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {income === 0 && (
        <div style={styles.card}>
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 24px',
            color: '#737373'
          }}>
            <Calculator style={{ width: 64, height: 64, margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#e5e5e5', marginBottom: '8px' }}>
              Set Your Monthly Income
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>
              Enter your monthly income above to start budgeting with the 50/30/20 rule or create your custom allocation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;
