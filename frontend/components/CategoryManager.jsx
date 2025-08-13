"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Palette, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from '../lib/apiConfig';

const CategoryManager = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense',
    color: '#3b82f6',
    icon: 'tag'
  });

  const API_BASE = getApiUrl();

  const iconOptions = [
    { value: 'tag', label: '🏷️ Tag' },
    { value: 'briefcase', label: '💼 Briefcase' },
    { value: 'laptop', label: '💻 Laptop' },
    { value: 'trending-up', label: '📈 Trending Up' },
    { value: 'gift', label: '🎁 Gift' },
    { value: 'utensils', label: '🍽️ Utensils' },
    { value: 'car', label: '🚗 Car' },
    { value: 'film', label: '🎬 Film' },
    { value: 'shopping-bag', label: '🛍️ Shopping Bag' },
    { value: 'file-text', label: '📄 File Text' },
    { value: 'heart', label: '❤️ Heart' },
    { value: 'home', label: '🏠 Home' },
    { value: 'zap', label: '⚡ Zap' },
  ];

  const colorOptions = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
    '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/categories/by_type/`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (onCategoryChange) {
          onCategoryChange(data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        await fetchCategories();
        setNewCategory({ name: '', type: 'expense', color: '#3b82f6', icon: 'tag' });
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_BASE}/categories/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        await fetchCategories();
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`${API_BASE}/categories/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const CategoryItem = ({ category, type }) => (
    <div 
      key={category.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        border: '1px solid #3a3a3a'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div 
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: category.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Tag style={{ width: '12px', height: '12px', color: 'white' }} />
        </div>
        <div>
          <div style={{ color: '#e5e7eb', fontWeight: '500', textTransform: 'capitalize' }}>
            {category.name}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '12px' }}>
            {category.is_custom ? 'Custom' : 'Default'}
          </div>
        </div>
      </div>
      {category.is_custom && (
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingCategory(category)}
            style={{ padding: '4px' }}
          >
            <Edit style={{ width: '14px', height: '14px' }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteCategory(category.id)}
            style={{ padding: '4px', color: '#ef4444' }}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#e5e7eb', fontSize: '24px', fontWeight: '600' }}>
          Category Management
        </h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#3b82f6', display: 'flex', gap: '8px' }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}>
            <DialogHeader>
              <DialogTitle style={{ color: '#e5e7eb' }}>Add New Category</DialogTitle>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <Input
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}
              />
              <Select 
                value={newCategory.type} 
                onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}
              >
                <SelectTrigger style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: color,
                      border: newCategory.color === color ? '3px solid white' : '1px solid #3a3a3a',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowAddDialog(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={createCategory} style={{ backgroundColor: '#3b82f6' }}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Income Categories */}
        <div>
          <h3 style={{ color: '#10b981', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Income Categories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.income.map(category => (
              <CategoryItem key={category.id} category={category} type="income" />
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <h3 style={{ color: '#ef4444', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Expense Categories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.expense.map(category => (
              <CategoryItem key={category.id} category={category} type="expense" />
            ))}
          </div>
        </div>
      </div>

      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}>
            <DialogHeader>
              <DialogTitle style={{ color: '#e5e7eb' }}>Edit Category</DialogTitle>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <Input
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}
              />
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditingCategory({ ...editingCategory, color })}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: color,
                      border: editingCategory.color === color ? '3px solid white' : '1px solid #3a3a3a',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setEditingCategory(null)} variant="outline">
                Cancel
              </Button>
              <Button 
                onClick={() => updateCategory(editingCategory.id, editingCategory)}
                style={{ backgroundColor: '#3b82f6' }}
              >
                Update Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CategoryManager;
