"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Repeat, Play, Pause, Trash2, Calendar, DollarSign, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const RecurringTransactionManager = ({ categories, onRecurringTransactionChange }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [processingTransaction, setProcessingTransaction] = useState(null);
  const [newRecurring, setNewRecurring] = useState({
    name: '',
    type: 'expense',
    category: null,
    amount: '',
    description: '',
    frequency: 'monthly',
    start_date: new Date(),
    end_date: null,
    is_active: true
  });

  const API_BASE = 'http://localhost:8000/api';

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  const fetchRecurringTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/recurring-transactions/`);
      if (response.ok) {
        const data = await response.json();
        setRecurringTransactions(data.results || data);
        if (onRecurringTransactionChange) {
          onRecurringTransactionChange(data.results || data);
        }
      }
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRecurringTransaction = async () => {
    if (!newRecurring.name.trim() || !newRecurring.category || !newRecurring.amount) return;

    try {
      const response = await fetch(`${API_BASE}/recurring-transactions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRecurring,
          amount: parseFloat(newRecurring.amount),
          start_date: format(newRecurring.start_date, 'yyyy-MM-dd'),
          end_date: newRecurring.end_date ? format(newRecurring.end_date, 'yyyy-MM-dd') : null,
        }),
      });

      if (response.ok) {
        await fetchRecurringTransactions();
        setNewRecurring({
          name: '',
          type: 'expense',
          category: null,
          amount: '',
          description: '',
          frequency: 'monthly',
          start_date: new Date(),
          end_date: null,
          is_active: true
        });
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
    }
  };

  const processRecurringTransaction = async (id) => {
    setProcessingTransaction(id);
    try {
      const response = await fetch(`${API_BASE}/recurring-transactions/${id}/process_occurrence/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        await fetchRecurringTransactions();
        alert(`Transaction processed successfully! Next occurrence: ${result.next_occurrence}`);
      }
    } catch (error) {
      console.error('Error processing recurring transaction:', error);
    } finally {
      setProcessingTransaction(null);
    }
  };

  const toggleRecurringTransaction = async (id, isActive) => {
    try {
      const recurring = recurringTransactions.find(r => r.id === id);
      const response = await fetch(`${API_BASE}/recurring-transactions/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recurring, is_active: !isActive }),
      });

      if (response.ok) {
        await fetchRecurringTransactions();
      }
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
    }
  };

  const deleteRecurringTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;

    try {
      const response = await fetch(`${API_BASE}/recurring-transactions/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRecurringTransactions();
      }
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  };

  const getAvailableCategories = (type) => {
    if (!categories || !categories[type]) return [];
    return categories[type];
  };

  const isDue = (nextOccurrence) => {
    const today = new Date();
    const dueDate = new Date(nextOccurrence);
    return dueDate <= today;
  };

  const formatNextOccurrence = (nextOccurrence) => {
    const today = new Date();
    const dueDate = new Date(nextOccurrence);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `Due in ${diffDays} day(s)`;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#e5e7eb', fontSize: '24px', fontWeight: '600' }}>
          Recurring Transactions
        </h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#3b82f6', display: 'flex', gap: '8px' }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Add Recurring Transaction
            </Button>
          </DialogTrigger>
          <DialogContent style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', maxWidth: '600px' }}>
            <DialogHeader>
              <DialogTitle style={{ color: '#e5e7eb' }}>Create Recurring Transaction</DialogTitle>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <Input
                placeholder="Transaction name (e.g., Monthly Salary, Netflix Subscription)"
                value={newRecurring.name}
                onChange={(e) => setNewRecurring({ ...newRecurring, name: e.target.value })}
                style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Select 
                  value={newRecurring.type} 
                  onValueChange={(value) => setNewRecurring({ ...newRecurring, type: value, category: null })}
                >
                  <SelectTrigger style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={newRecurring.category?.toString() || ''} 
                  onValueChange={(value) => setNewRecurring({ ...newRecurring, category: parseInt(value) })}
                >
                  <SelectTrigger style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                    {getAvailableCategories(newRecurring.type).map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newRecurring.amount}
                  onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}
                />

                <Select 
                  value={newRecurring.frequency} 
                  onValueChange={(value) => setNewRecurring({ ...newRecurring, frequency: value })}
                >
                  <SelectTrigger style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                    {frequencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Description"
                value={newRecurring.description}
                onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
                style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderColor: '#3a3a3a',
                        color: '#e5e7eb',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <Calendar style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      {format(newRecurring.start_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                    <CalendarComponent
                      mode="single"
                      selected={newRecurring.start_date}
                      onSelect={(date) => setNewRecurring({ ...newRecurring, start_date: date })}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderColor: '#3a3a3a',
                        color: '#e5e7eb',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <Calendar style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                      {newRecurring.end_date ? format(newRecurring.end_date, "PPP") : "No end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                    <div style={{ padding: '16px' }}>
                      <CalendarComponent
                        mode="single"
                        selected={newRecurring.end_date}
                        onSelect={(date) => setNewRecurring({ ...newRecurring, end_date: date })}
                      />
                      <Button
                        variant="outline"
                        onClick={() => setNewRecurring({ ...newRecurring, end_date: null })}
                        style={{ marginTop: '8px', width: '100%' }}
                      >
                        Clear End Date
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowAddDialog(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={createRecurringTransaction} style={{ backgroundColor: '#3b82f6' }}>
                Create Recurring Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recurring Transactions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
        {recurringTransactions.map(recurring => (
          <div 
            key={recurring.id}
            style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${isDue(recurring.next_occurrence) ? '#f59e0b' : '#3a3a3a'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  {recurring.name}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <Badge 
                    style={{ 
                      backgroundColor: recurring.type === 'income' ? '#10b981' : '#ef4444',
                      color: 'white',
                      fontSize: '11px'
                    }}
                  >
                    {recurring.type}
                  </Badge>
                  <Badge 
                    style={{ 
                      backgroundColor: recurring.category_color || '#6b7280',
                      color: 'white',
                      fontSize: '11px'
                    }}
                  >
                    {recurring.category_name}
                  </Badge>
                  <Badge 
                    style={{ 
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontSize: '11px'
                    }}
                  >
                    {recurring.frequency}
                  </Badge>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRecurringTransaction(recurring.id, recurring.is_active)}
                  style={{ padding: '4px' }}
                >
                  {recurring.is_active ? (
                    <Pause style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                  ) : (
                    <Play style={{ width: '14px', height: '14px', color: '#10b981' }} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRecurringTransaction(recurring.id)}
                  style={{ padding: '4px', color: '#ef4444' }}
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </Button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Amount:</span>
                <span style={{ 
                  color: recurring.type === 'income' ? '#10b981' : '#ef4444', 
                  fontSize: '16px', 
                  fontWeight: '600' 
                }}>
                  ${parseFloat(recurring.amount).toLocaleString()}
                </span>
              </div>
              {recurring.description && (
                <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>
                  {recurring.description}
                </div>
              )}
            </div>

            <div style={{ 
              backgroundColor: '#1a1a1a', 
              borderRadius: '6px', 
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>Next Occurrence:</span>
                <span style={{ 
                  color: isDue(recurring.next_occurrence) ? '#f59e0b' : '#e5e7eb', 
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {format(new Date(recurring.next_occurrence), 'MMM dd, yyyy')}
                </span>
              </div>
              <div style={{ 
                color: isDue(recurring.next_occurrence) ? '#f59e0b' : '#6b7280', 
                fontSize: '11px',
                textAlign: 'right',
                marginTop: '4px'
              }}>
                {formatNextOccurrence(recurring.next_occurrence)}
              </div>
            </div>

            {recurring.is_active && isDue(recurring.next_occurrence) && (
              <Button
                onClick={() => processRecurringTransaction(recurring.id)}
                disabled={processingTransaction === recurring.id}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  width: '100%',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                {processingTransaction === recurring.id ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Play style={{ width: '14px', height: '14px' }} />
                    Process Now
                  </>
                )}
              </Button>
            )}
          </div>
        ))}
      </div>

      {recurringTransactions.length === 0 && !loading && (
        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #3a3a3a'
        }}>
          <Repeat style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No Recurring Transactions
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            Set up recurring transactions for your regular income and expenses
          </p>
        </div>
      )}
    </div>
  );
};

export default RecurringTransactionManager;
