"use client"
import React, { useState } from 'react';
import { Edit, Trash2, ArrowUpRight, ArrowDownRight, Filter, CreditCard, Plus } from 'lucide-react';
import EditTransactionForm from './EditTransactionForm';
import SimpleAddTransactionForm from './SimpleAddTransactionForm';
import { toast } from 'sonner';

const TransactionList = ({ 
  transactions, 
  onTransactionAdded,
  onTransactionUpdated, 
  onTransactionDeleted,
  categories 
}) => {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all');

  const styles = {
    card: {
      backgroundColor: '#171717',
      border: '1px solid #262626',
      borderRadius: '16px',
      padding: '24px',
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

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    if (transactionFilter === 'income') return transaction.type === 'income';
    if (transactionFilter === 'expense') return transaction.type === 'expense';
    return true;
  });

  // Handle transaction edit
  const handleTransactionEdit = (transaction) => {
    setEditingTransaction(transaction);
    setEditFormOpen(true);
  };

  // Handle transaction delete
  const handleTransactionDelete = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction && window.confirm(`Are you sure you want to delete "${transaction.description}"?`)) {
      onTransactionDeleted(transactionId);
      toast.success('Transaction deleted successfully', {
        description: `"${transaction.description}" has been removed from your records`,
        duration: 3000,
      });
    }
  };

  // Handle edit form close
  const handleEditFormClose = () => {
    setEditFormOpen(false);
    setEditingTransaction(null);
  };

  // Handle transaction update
  const handleTransactionUpdate = (updatedTransaction) => {
    onTransactionUpdated(updatedTransaction);
    handleEditFormClose();
  };

  return (
    <>
      {/* Header with Add Transaction Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={styles.title}>Transactions</h1>
          <p style={styles.subtitle}>Manage your income and expenses</p>
        </div>
        <SimpleAddTransactionForm 
          onTransactionAdded={onTransactionAdded}
          categories={categories}
          trigger={
            <button style={styles.button}>
              <Plus style={{ width: 16, height: 16 }} />
              Add Transaction
            </button>
          }
        />
      </div>

      {/* Transactions Card */}
      <div style={styles.card}>
        <div style={{ padding: '24px', borderBottom: '1px solid #262626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#e5e5e5' }}>Recent Transactions</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                style={{ 
                  ...styles.filterButton, 
                  ...(transactionFilter === 'all' ? styles.filterButtonActive : {})
                }}
                onClick={() => setTransactionFilter('all')}
              >
                All
              </button>
              <button 
                style={{ 
                  ...styles.filterButton, 
                  ...(transactionFilter === 'income' ? styles.filterButtonActive : {})
                }}
                onClick={() => setTransactionFilter('income')}
              >
                Income
              </button>
              <button 
                style={{ 
                  ...styles.filterButton, 
                  ...(transactionFilter === 'expense' ? styles.filterButtonActive : {})
                }}
                onClick={() => setTransactionFilter('expense')}
              >
                Expenses
              </button>
            </div>
          </div>
        </div>
        
        <div>
          {filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              style={styles.transactionRow}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(38, 38, 38, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px',
                  backgroundColor: transaction.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {transaction.type === 'income' ? (
                    <ArrowDownRight style={{ width: 20, height: 20, color: '#10b981' }} />
                  ) : (
                    <ArrowUpRight style={{ width: 20, height: 20, color: '#ef4444' }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#e5e5e5', marginBottom: '4px' }}>
                    {transaction.description}
                  </p>
                  <p style={{ fontSize: '12px', color: '#737373' }}>
                    {transaction.category_name || transaction.category} • {transaction.date}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: '300',
                  color: transaction.type === 'income' ? '#10b981' : '#ef4444'
                }}>
                  {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </span>
                <button 
                  style={{ 
                    padding: '8px', 
                    backgroundColor: 'transparent', 
                    border: 'none',
                    color: '#737373',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTransactionEdit(transaction);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(115, 115, 115, 0.2)';
                    e.currentTarget.style.color = '#e5e5e5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#737373';
                  }}
                >
                  <Edit style={{ width: 16, height: 16 }} />
                </button>
                <button 
                  style={{ 
                    padding: '8px', 
                    backgroundColor: 'transparent', 
                    border: 'none',
                    color: '#737373',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTransactionDelete(transaction.id);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#737373';
                  }}
                >
                  <Trash2 style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          ))}
          
          {filteredTransactions.length === 0 && transactions.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '48px 24px',
              color: '#737373'
            }}>
              <Filter style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#e5e5e5', marginBottom: '8px' }}>
                No {transactionFilter} transactions found
              </h3>
              <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px' }}>
                Try selecting a different filter or add some {transactionFilter} transactions.
              </p>
            </div>
          )}
          
          {transactions.length === 0 && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '48px 24px',
              color: '#737373'
            }}>
              <CreditCard style={{ width: 48, height: 48, marginBottom: 16, opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#e5e5e5', marginBottom: '8px' }}>
                No transactions yet
              </h3>
              <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px' }}>
                Start tracking your finances by adding your first transaction using the button above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionForm
        transaction={editingTransaction}
        open={editFormOpen}
        onClose={handleEditFormClose}
        onTransactionUpdated={handleTransactionUpdate}
        categories={categories}
      />
    </>
  );
};

export default TransactionList;
