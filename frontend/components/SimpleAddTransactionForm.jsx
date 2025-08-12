"use client"
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import apiService from '../lib/api';
import { 
  Plus, 
  DollarSign, 
  Tag, 
  FileText, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react';

const SimpleAddTransactionForm = ({ onTransactionAdded, trigger, categories = [] }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Filter categories by transaction type
  const getFilteredCategories = (type) => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.filter(category => category.type === type);
  };
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    notes: ''
  });

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category || formData.category === 'no-categories') {
      newErrors.category = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: parseInt(formData.category),
        date: formData.date,
        notes: formData.notes
      };
      
      const createdTransaction = await apiService.createTransaction(transactionData);
      
      // Call parent callback
      if (onTransactionAdded) {
        onTransactionAdded(createdTransaction);
      }
      
      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      setErrors({});
      setOpen(false);
      
      toast.success('Transaction added successfully!', {
        description: `${formData.type === 'income' ? 'Income' : 'Expense'} of $${formData.amount} recorded`,
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button style={{
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
          }}>
            <Plus style={{ width: 16, height: 16 }} />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent 
        showCloseButton={false}
        style={{
          backgroundColor: '#171717',
          border: '1px solid #262626',
          borderRadius: '16px',
          color: '#f5f5f5',
          maxWidth: '500px',
          width: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '0'
        }}
      >
        {/* Custom close button */}
        <button
          onClick={() => {
            setOpen(false);
            setErrors({});
          }}
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'rgba(115, 115, 115, 0.1)',
            color: '#737373',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(115, 115, 115, 0.2)';
            e.currentTarget.style.color = '#e5e5e5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(115, 115, 115, 0.1)';
            e.currentTarget.style.color = '#737373';
          }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>

        <div style={{ padding: '24px' }}>
          <DialogHeader style={{ marginBottom: '24px' }}>
            <DialogTitle style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#f5f5f5',
              paddingRight: '40px' // Make room for close button
            }}>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: formData.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
              }}>
                {formData.type === 'income' ? (
                  <TrendingUp style={{ width: 20, height: 20, color: '#10b981' }} />
                ) : (
                  <TrendingDown style={{ width: 20, height: 20, color: '#ef4444' }} />
                )}
              </div>
              Add {formData.type === 'income' ? 'Income' : 'Expense'}
            </DialogTitle>
            <DialogDescription style={{ color: '#737373', fontSize: '14px' }}>
              Record a new {formData.type === 'income' ? 'income' : 'expense'} transaction
            </DialogDescription>
          </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Transaction Type Toggle */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0a0a0a', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => {
                handleInputChange('type', 'expense');
                handleInputChange('category', '');
              }}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: formData.type === 'expense' ? '#ef4444' : 'transparent',
                color: formData.type === 'expense' ? '#ffffff' : '#737373'
              }}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                handleInputChange('type', 'income');
                handleInputChange('category', '');
              }}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: formData.type === 'income' ? '#10b981' : 'transparent',
                color: formData.type === 'income' ? '#ffffff' : '#737373'
              }}
            >
              Income
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <Label style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#e5e5e5', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              Amount *
            </Label>
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
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                style={{
                  paddingLeft: '40px',
                  backgroundColor: '#262626',
                  border: `1px solid ${errors.amount ? '#ef4444' : '#404040'}`,
                  borderRadius: '8px',
                  color: '#f5f5f5',
                  fontSize: '16px',
                  padding: '12px 12px 12px 40px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {errors.amount && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                color: '#ef4444', 
                fontSize: '12px', 
                marginTop: '4px' 
              }}>
                <AlertCircle style={{ width: 12, height: 12 }} />
                {errors.amount}
              </div>
            )}
          </div>

          {/* Description Field */}
          <div>
            <Label style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#e5e5e5', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              Description *
            </Label>
            <Input
              placeholder={formData.type === 'income' ? 'e.g., Salary payment' : 'e.g., Grocery shopping'}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              style={{
                backgroundColor: '#262626',
                border: `1px solid ${errors.description ? '#ef4444' : '#404040'}`,
                borderRadius: '8px',
                color: '#f5f5f5',
                fontSize: '14px',
                padding: '12px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
            {errors.description && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                color: '#ef4444', 
                fontSize: '12px', 
                marginTop: '4px' 
              }}>
                <AlertCircle style={{ width: 12, height: 12 }} />
                {errors.description}
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <Label style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#e5e5e5', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger style={{
                backgroundColor: '#262626',
                border: `1px solid ${errors.category ? '#ef4444' : '#404040'}`,
                borderRadius: '8px',
                color: '#f5f5f5',
                padding: '12px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                borderRadius: '8px'
              }}>
                {getFilteredCategories(formData.type).length > 0 ? (
                  getFilteredCategories(formData.type).map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id.toString()}
                      style={{ color: '#f5f5f5' }}
                    >
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem 
                    value="no-categories" 
                    disabled
                    style={{ color: '#737373' }}
                  >
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.category && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                color: '#ef4444', 
                fontSize: '12px', 
                marginTop: '4px' 
              }}>
                <AlertCircle style={{ width: 12, height: 12 }} />
                {errors.category}
              </div>
            )}
          </div>

          {/* Date Field */}
          <div>
            <Label style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#e5e5e5', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              Date
            </Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                borderRadius: '8px',
                color: '#f5f5f5',
                fontSize: '14px',
                padding: '12px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Notes Field */}
          <div>
            <Label style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#e5e5e5', 
              marginBottom: '8px', 
              display: 'block' 
            }}>
              Notes (Optional)
            </Label>
            <Textarea
              placeholder="Additional notes or details..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              style={{
                backgroundColor: '#262626',
                border: '1px solid #404040',
                borderRadius: '8px',
                color: '#f5f5f5',
                fontSize: '14px',
                padding: '12px',
                resize: 'none',
                minHeight: '80px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Form Actions */}
          <DialogFooter style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                setErrors({});
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #404040',
                borderRadius: '8px',
                color: '#737373',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: formData.type === 'income' ? '#10b981' : '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 style={{ width: 16, height: 16 }} />
                  Add {formData.type === 'income' ? 'Income' : 'Expense'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleAddTransactionForm;
