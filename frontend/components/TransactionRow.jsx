"use client"
import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Tag,
  MoreHorizontal,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { toast } from 'sonner';
import ConfirmationDialog from './ConfirmationDialog';

// Category icons mapping
const categoryIcons = {
  'salary': '💼',
  'freelance': '💻',
  'investment': '📈',
  'business': '🏢',
  'bonus': '🎉',
  'gift': '🎁',
  'rent': '🏠',
  'utilities': '⚡',
  'groceries': '🛒',
  'restaurant': '🍽️',
  'transportation': '🚗',
  'gas': '⛽',
  'shopping': '🛍️',
  'entertainment': '🎬',
  'healthcare': '🏥',
  'education': '📚',
  'travel': '✈️',
  'phone': '📱',
  'insurance': '🛡️',
  'savings': '🐷',
  'other_income': '💰',
  'other_expense': '💸'
};

const TransactionRow = ({ 
  transaction, 
  onEdit, 
  onDelete, 
  onDuplicate,
  className = "",
  showDate = true,
  compact = false 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString) => {
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      
      if (isToday(date)) {
        return 'Today';
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      return dateString;
    }
  };

  const formatAmount = (amount, type) => {
    const absAmount = Math.abs(amount);
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(absAmount);

    return type === 'income' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const getCategoryIcon = (categoryId, categoryName) => {
    // Try to get icon from category ID first, then fallback to category name
    const iconFromId = categoryIcons[categoryId];
    if (iconFromId) return iconFromId;
    
    const iconFromName = categoryIcons[categoryName?.toLowerCase()];
    if (iconFromName) return iconFromName;
    
    // Default icons based on transaction type
    return transaction.type === 'income' ? '💰' : '💸';
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onDelete?.(transaction.id);
      toast.success('Transaction deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete transaction');
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = () => {
    const duplicatedTransaction = {
      ...transaction,
      id: Date.now(), // Generate new ID
      date: new Date().toISOString().split('T')[0], // Set to today
      description: `${transaction.description} (Copy)`,
      createdAt: new Date().toISOString()
    };
    
    onDuplicate?.(duplicatedTransaction);
    toast.success('Transaction duplicated successfully');
  };

  const handleCopyDetails = () => {
    const details = `${transaction.description} - ${formatAmount(transaction.amount, transaction.type)} (${transaction.category}) - ${formatDate(transaction.date)}`;
    navigator.clipboard.writeText(details);
    toast.success('Transaction details copied to clipboard');
  };

  return (
    <>
      <div 
        className={`group flex items-center justify-between p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-all duration-200 ${className}`}
      >
        {/* Left side - Transaction info */}
        <div className="flex items-center gap-4 flex-1">
          {/* Category Icon */}
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center text-lg
            ${transaction.type === 'income' 
              ? 'bg-emerald-500/20 border border-emerald-500/30' 
              : 'bg-red-500/20 border border-red-500/30'
            }
          `}>
            {getCategoryIcon(transaction.categoryId, transaction.category)}
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-white truncate">
                {transaction.description}
              </h3>
              {transaction.isRecurring && (
                <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                  Recurring
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>{transaction.category}</span>
              </div>
              
              {showDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(transaction.date)}</span>
                </div>
              )}
              
              {transaction.notes && (
                <div className="flex items-center gap-1">
                  <span className="truncate max-w-32">
                    "{transaction.notes}"
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Amount and actions */}
        <div className="flex items-center gap-4">
          {/* Amount */}
          <div className="text-right">
            <div className={`text-lg font-semibold ${
              transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {formatAmount(transaction.amount, transaction.type)}
            </div>
            {transaction.type === 'income' && (
              <ArrowDownRight className="h-4 w-4 text-emerald-400 ml-auto" />
            )}
            {transaction.type === 'expense' && (
              <ArrowUpRight className="h-4 w-4 text-red-400 ml-auto" />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Quick Edit */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(transaction)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <Edit className="h-4 w-4" />
            </Button>

            {/* More Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-gray-800 border-gray-700 text-white w-48"
              >
                <DropdownMenuItem 
                  onClick={() => onEdit?.(transaction)}
                  className="hover:bg-gray-700 focus:bg-gray-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Transaction
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleDuplicate}
                  className="hover:bg-gray-700 focus:bg-gray-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleCopyDetails}
                  className="hover:bg-gray-700 focus:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Details
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-700" />
                
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="hover:bg-red-500/20 focus:bg-red-500/20 text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Transaction"
        description={`Are you sure you want to delete "${transaction.description}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={deleting}
      />
    </>
  );
};

export default TransactionRow;
