'use client';

import React, { useState, useEffect } from 'react';
import SimpleAddTransactionForm from '../components/SimpleAddTransactionForm';
import Dashboard from '../components/Dashboard';
import TransactionList from '../components/TransactionList';
import { Home, CreditCard, Settings, BarChart3, Target, Zap, Wallet } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import apiService from '../lib/api';

const ModernFinanceTracker = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [transactionsData, categoriesData] = await Promise.all([
          apiService.getTransactions(),
          apiService.getCategories()
        ]);
        
        setTransactions(transactionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle adding new transactions
  const handleTransactionAdded = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Handle updating transactions
  const handleTransactionUpdated = (updatedTransaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };

  // Handle deleting transactions
  const handleTransactionDeleted = async (id) => {
    try {
      await apiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Styles object - all styles are inline to avoid conflicts
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif',
    },
    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100%',
      width: '80px',
      backgroundColor: '#171717',
      borderRight: '1px solid #262626',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '32px',
      paddingBottom: '32px',
      zIndex: 50,
    },
    logo: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '48px',
    },
    navButton: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      marginBottom: '24px',
      border: 'none',
      position: 'relative',
    },
    navButtonActive: {
      backgroundColor: '#262626',
      color: '#10b981',
    },
    navButtonInactive: {
      backgroundColor: 'transparent',
      color: '#737373',
    },
    mainContent: {
      marginLeft: '80px',
      padding: '32px',
    },
    contentWrapper: {
      maxWidth: '1400px',
      margin: '0 auto',
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
    transactionRow: {
      padding: '24px',
      borderBottom: '1px solid #262626',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background-color 0.2s ease',
      cursor: 'pointer',
    },
  };

  const NavigationBar = () => (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <Wallet style={{ width: 24, height: 24, color: '#ffffff' }} />
      </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {[
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'transactions', icon: CreditCard, label: 'Transactions' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          { id: 'goals', icon: Target, label: 'Goals' },
          { id: 'features', icon: Zap, label: 'Features' },
        ].map((item) => (
          <div key={item.id} style={{ position: 'relative' }}>
            <button
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navButton,
                ...(activeTab === item.id ? styles.navButtonActive : styles.navButtonInactive),
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(38, 38, 38, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <item.icon style={{ width: 20, height: 20 }} />
            </button>
          </div>
        ))}
      </nav>
      
      <button style={{ ...styles.navButton, ...styles.navButtonInactive }}>
        <Settings style={{ width: 20, height: 20 }} />
      </button>
    </div>
  );

  const DashboardSection = () => (
    <Dashboard transactions={transactions} />
  );

  const TransactionsSection = () => (
    <TransactionList 
      transactions={transactions}
      categories={categories}
      onTransactionAdded={handleTransactionAdded}
      onTransactionUpdated={handleTransactionUpdated}
      onTransactionDeleted={handleTransactionDeleted}
    />
  );

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
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
          <p style={{ color: '#737373', fontSize: '14px' }}>Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <NavigationBar />
      
      <div style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          {activeTab === 'dashboard' && <DashboardSection />}
          {activeTab === 'transactions' && <TransactionsSection />}
          {activeTab === 'analytics' && (
            <div>
              <h1 style={styles.title}>Analytics</h1>
              <p style={styles.subtitle}>Deep insights into your financial patterns</p>
            </div>
          )}
          {activeTab === 'goals' && (
            <div>
              <h1 style={styles.title}>Financial Goals</h1>
              <p style={styles.subtitle}>Track your progress towards financial freedom</p>
            </div>
          )}
          {activeTab === 'features' && (
            <div>
              <div style={styles.header}>
                <h1 style={styles.title}>New Features</h1>
                <p style={styles.subtitle}>Explore all the latest improvements and enhancements</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster 
        position="top-right" 
        expand={true} 
        richColors 
        closeButton 
        theme="dark"
      />
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ModernFinanceTracker;