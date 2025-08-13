"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from '../lib/apiConfig';

const BudgetPeriodManager = ({ onPeriodChange }) => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    name: '',
    period_type: 'monthly',
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1))
  });

  const API_BASE = getApiUrl();

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/budget-periods/`);
      if (response.ok) {
        const data = await response.json();
        setPeriods(data.results || data);
        if (onPeriodChange) {
          onPeriodChange(data.results || data);
        }
      }
    } catch (error) {
      console.error('Error fetching budget periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPeriod = async () => {
    if (!newPeriod.name.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/budget-periods/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPeriod,
          start_date: format(newPeriod.start_date, 'yyyy-MM-dd'),
          end_date: format(newPeriod.end_date, 'yyyy-MM-dd'),
        }),
      });

      if (response.ok) {
        await fetchPeriods();
        setNewPeriod({
          name: '',
          period_type: 'monthly',
          start_date: new Date(),
          end_date: new Date(),
          is_active: true
        });
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error creating period:', error);
    }
  };

  const togglePeriodStatus = async (id, isActive) => {
    try {
      const period = periods.find(p => p.id === id);
      const response = await fetch(`${API_BASE}/budget-periods/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...period, is_active: !isActive }),
      });

      if (response.ok) {
        await fetchPeriods();
      }
    } catch (error) {
      console.error('Error updating period:', error);
    }
  };

  const deletePeriod = async (id) => {
    if (!confirm('Are you sure you want to delete this budget period?')) return;

    try {
      const response = await fetch(`${API_BASE}/budget-periods/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPeriods();
      }
    } catch (error) {
      console.error('Error deleting period:', error);
    }
  };

  const generatePeriodName = (type, startDate) => {
    const date = new Date(startDate);
    switch (type) {
      case 'monthly':
        return `Monthly Budget - ${format(date, 'MMMM yyyy')}`;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} Budget - ${date.getFullYear()}`;
      case 'yearly':
        return `Annual Budget - ${date.getFullYear()}`;
      default:
        return 'Custom Budget Period';
    }
  };

  const calculateEndDate = (type, startDate) => {
    const date = new Date(startDate);
    switch (type) {
      case 'monthly':
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
      case 'quarterly':
        return new Date(date.getFullYear(), date.getMonth() + 3, 0);
      case 'yearly':
        return new Date(date.getFullYear(), 11, 31);
      default:
        return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  };

  useEffect(() => {
    if (newPeriod.period_type && newPeriod.start_date) {
      const generatedName = generatePeriodName(newPeriod.period_type, newPeriod.start_date);
      const generatedEndDate = calculateEndDate(newPeriod.period_type, newPeriod.start_date);
      setNewPeriod(prev => ({
        ...prev,
        name: generatedName,
        end_date: generatedEndDate
      }));
    }
  }, [newPeriod.period_type, newPeriod.start_date]);

  const isCurrentPeriod = (period) => {
    const today = new Date();
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);
    return today >= startDate && today <= endDate && period.is_active;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#e5e7eb', fontSize: '24px', fontWeight: '600' }}>
          Budget Periods
        </h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#3b82f6', display: 'flex', gap: '8px' }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Add Period
            </Button>
          </DialogTrigger>
          <DialogContent style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', maxWidth: '500px' }}>
            <DialogHeader>
              <DialogTitle style={{ color: '#e5e7eb' }}>Create Budget Period</DialogTitle>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <Select 
                value={newPeriod.period_type} 
                onValueChange={(value) => setNewPeriod({ ...newPeriod, period_type: value })}
              >
                <SelectTrigger style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}>
                  <SelectValue placeholder="Select period type" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>

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
                    {format(newPeriod.start_date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}>
                  <CalendarComponent
                    mode="single"
                    selected={newPeriod.start_date}
                    onSelect={(date) => setNewPeriod({ ...newPeriod, start_date: date })}
                  />
                </PopoverContent>
              </Popover>

              <Input
                placeholder="Period name (auto-generated)"
                value={newPeriod.name}
                onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
                style={{ backgroundColor: '#1a1a1a', borderColor: '#3a3a3a', color: '#e5e7eb' }}
              />

              <div style={{ 
                padding: '12px', 
                backgroundColor: '#1a1a1a', 
                borderRadius: '6px',
                border: '1px solid #3a3a3a'
              }}>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>End Date</div>
                <div style={{ color: '#e5e7eb', fontWeight: '500' }}>
                  {format(newPeriod.end_date, "PPP")}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowAddDialog(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={createPeriod} style={{ backgroundColor: '#3b82f6' }}>
                Create Period
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Periods Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {periods.map(period => (
          <div 
            key={period.id}
            style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${isCurrentPeriod(period) ? '#10b981' : '#3a3a3a'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  {period.name}
                </h3>
                <Badge 
                  style={{ 
                    backgroundColor: period.period_type === 'monthly' ? '#3b82f6' : 
                                   period.period_type === 'quarterly' ? '#8b5cf6' : '#10b981',
                    color: 'white',
                    fontSize: '11px'
                  }}
                >
                  {period.period_type}
                </Badge>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePeriodStatus(period.id, period.is_active)}
                  style={{ padding: '4px' }}
                >
                  {period.is_active ? (
                    <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
                  ) : (
                    <Clock style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePeriod(period.id)}
                  style={{ padding: '4px', color: '#ef4444' }}
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Start Date:</span>
                <span style={{ color: '#e5e7eb', fontSize: '14px' }}>
                  {format(new Date(period.start_date), 'MMM dd, yyyy')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>End Date:</span>
                <span style={{ color: '#e5e7eb', fontSize: '14px' }}>
                  {format(new Date(period.end_date), 'MMM dd, yyyy')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Status:</span>
                <Badge 
                  style={{ 
                    backgroundColor: isCurrentPeriod(period) ? '#10b981' : 
                                   period.is_active ? '#3b82f6' : '#6b7280',
                    color: 'white',
                    fontSize: '11px'
                  }}
                >
                  {isCurrentPeriod(period) ? 'Current' : period.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {periods.length === 0 && !loading && (
        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #3a3a3a'
        }}>
          <Calendar style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            No Budget Periods
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            Create your first budget period to start organizing your finances
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetPeriodManager;
